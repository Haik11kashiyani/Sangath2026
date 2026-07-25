-- ============================================================================
-- Master Migration for Production Readiness
-- ============================================================================
-- This script ensures the database is fully production-ready.
-- It is designed to be idempotent (safe to run multiple times), utilizing
-- IF NOT EXISTS, ON CONFLICT, OR REPLACE, and DO blocks where appropriate.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_perf ON products(category_id, is_active, featured, display_order);
CREATE INDEX IF NOT EXISTS idx_pages_perf ON pages(slug, is_published);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_perf ON contact_submissions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_perf ON audit_logs(admin_id, action, resource_type, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_perf ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_categories_perf ON categories(slug, display_order);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_perf ON refresh_tokens(token_hash, admin_id, is_revoked);
CREATE INDEX IF NOT EXISTS idx_social_media_perf ON social_media(is_active, display_order);

-- ============================================================================
-- 2. Input Validation Constraints
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_admin_users_email') THEN
        ALTER TABLE admin_users ADD CONSTRAINT chk_admin_users_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_admin_users_role') THEN
        ALTER TABLE admin_users ADD CONSTRAINT chk_admin_users_role CHECK (role IN ('super_admin', 'editor', 'viewer'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_admin_users_status') THEN
        ALTER TABLE admin_users ADD CONSTRAINT chk_admin_users_status CHECK (status IN ('active', 'locked'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_contact_submissions_status') THEN
        ALTER TABLE contact_submissions ADD CONSTRAINT chk_contact_submissions_status CHECK (status IN ('new', 'read', 'replied'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price') THEN
        ALTER TABLE products ADD CONSTRAINT chk_products_price CHECK (price >= 0);
    END IF;
END $$;

-- ============================================================================
-- 3. Security RLS Policies
-- ============================================================================
-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access, block anon (anon doesn't get policy)
DO $$
BEGIN
    DROP POLICY IF EXISTS service_role_all_admin_users ON admin_users;
    CREATE POLICY service_role_all_admin_users ON admin_users TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS service_role_all_audit_logs ON audit_logs;
    CREATE POLICY service_role_all_audit_logs ON audit_logs TO service_role USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS service_role_all_refresh_tokens ON refresh_tokens;
    CREATE POLICY service_role_all_refresh_tokens ON refresh_tokens TO service_role USING (true) WITH CHECK (true);
END $$;

-- ============================================================================
-- 4. Auto-cleanup for old data (functions)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_refresh_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Ensure update_timestamp trigger exists on ALL tables
-- ============================================================================
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_timestamp ON %I;
            CREATE TRIGGER update_%I_timestamp 
            BEFORE UPDATE ON %I 
            FOR EACH ROW 
            EXECUTE FUNCTION update_timestamp();
        ', t_name, t_name, t_name, t_name);
    END LOOP;
END $$;

-- ============================================================================
-- 6. Seed Default Admin
-- ============================================================================
INSERT INTO admin_users (id, email, password_hash, role, status)
SELECT gen_random_uuid(), 'export.sangath@gmail.com', 
       crypt('Ekantik@1008', gen_salt('bf', 10)), 'super_admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'export.sangath@gmail.com');

COMMIT;
