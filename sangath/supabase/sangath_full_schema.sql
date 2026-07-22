-- Sangath full import schema for Supabase
-- One file: tables + triggers + baseline data
-- Import this into the Supabase SQL editor on a blank database.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Core Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'editor',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  ip_whitelist JSONB DEFAULT '[]'::jsonb,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  password_changed_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  meta_description VARCHAR(160),
  meta_keywords VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_slug VARCHAR(100),
  category_name VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(500),
  image TEXT GENERATED ALWAYS AS (image_url) STORED,
  details JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  icon_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  replied_by UUID REFERENCES admin_users(id),
  reply_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  user_agent VARCHAR(1000),
  ip_address VARCHAR(45),
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  permissions JSONB DEFAULT '[]'::jsonb,
  last_used TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_admin_id ON api_keys(admin_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media(platform);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin_id ON refresh_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================================
-- Triggers / Helper Functions
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_product_category_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.category_name := NULL;
  NEW.category_slug := NULL;

  IF NEW.category_id IS NOT NULL THEN
    SELECT name, slug
      INTO NEW.category_name, NEW.category_slug
    FROM categories
    WHERE id = NEW.category_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_category_updates_to_products()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
     SET category_name = NEW.name,
         category_slug = NEW.slug,
         updated_at = CURRENT_TIMESTAMP
   WHERE category_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_users_timestamp ON admin_users;
DROP TRIGGER IF EXISTS update_pages_timestamp ON pages;
DROP TRIGGER IF EXISTS update_products_timestamp ON products;
DROP TRIGGER IF EXISTS update_site_settings_timestamp ON site_settings;
DROP TRIGGER IF EXISTS update_contact_submissions_timestamp ON contact_submissions;
DROP TRIGGER IF EXISTS update_social_media_timestamp ON social_media;
DROP TRIGGER IF EXISTS update_media_assets_timestamp ON media_assets;
DROP TRIGGER IF EXISTS sync_product_category_fields_trigger ON products;
DROP TRIGGER IF EXISTS sync_category_updates_to_products_trigger ON categories;

CREATE TRIGGER update_admin_users_timestamp BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_pages_timestamp BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_site_settings_timestamp BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_contact_submissions_timestamp BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_social_media_timestamp BEFORE UPDATE ON social_media FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_media_assets_timestamp BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER sync_product_category_fields_trigger BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION sync_product_category_fields();
CREATE TRIGGER sync_category_updates_to_products_trigger AFTER UPDATE OF name, slug ON categories FOR EACH ROW EXECUTE FUNCTION sync_category_updates_to_products();

-- ============================================================
-- Seed Data
-- ============================================================

-- Initial admin user
INSERT INTO admin_users (
  id, email, password_hash, role, status, password_changed_at, created_at, updated_at
) VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'export.sangath@gmail.com',
  '$2a$10$09cv4Sj9.qklRDy5p1t/dO8U3/T4TP/CRHHSQYcNyc7YjibmiTbke',
  'super_admin',
  'active',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = 'active',
  password_changed_at = EXCLUDED.password_changed_at,
  updated_at = NOW();

-- Categories
INSERT INTO categories (id, slug, name, description, display_order, created_at, updated_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Premium spice products from India', 1, NOW(), NOW()),
  ('22222222-2222-4222-8222-222222222222', 'sugar', 'Sugar', 'Refined and raw sugar products', 2, NOW(), NOW()),
  ('33333333-3333-4333-8333-333333333333', 'food-grains', 'Food Grains', 'Rice, wheat, maize, and grain exports', 3, NOW(), NOW()),
  ('44444444-4444-4444-8444-444444444444', 'pulses', 'Pulses', 'Protein-rich pulses and lentils', 4, NOW(), NOW()),
  ('55555555-5555-4555-8555-555555555555', 'ghee', 'Ghee', 'Pure cow ghee products', 5, NOW(), NOW()),
  ('66666666-6666-4666-8666-666666666666', 'tea', 'Tea', 'Indian tea exports', 6, NOW(), NOW()),
  ('77777777-7777-4777-8777-777777777777', 'agro-feed', 'Agro Feed', 'High-protein animal feed ingredients', 7, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Pages
INSERT INTO pages (slug, title, content, meta_description, meta_keywords, is_published, created_at, updated_at) VALUES
  ('home', 'Home', $$<h1>Welcome to Sangath Global Exim</h1><p>Premium agricultural products for global markets.</p>$$, 'Sangath Global Exim home page', 'agriculture, export, products', TRUE, NOW(), NOW()),
  ('about', 'About Us', $$<h1>About Sangath Global Exim</h1><p>We connect markets with premium quality agricultural products.</p>$$, 'About Sangath Global Exim', 'about, export company, agriculture', TRUE, NOW(), NOW()),
  ('contact', 'Contact Us', $$<h1>Contact Us</h1><p>Get in touch with our export team.</p>$$, 'Contact Sangath Global Exim', 'contact, inquiry, export', TRUE, NOW(), NOW()),
  ('products', 'Products', $$<h1>Our Products</h1><p>Browse our agricultural export catalog.</p>$$, 'Products by Sangath Global Exim', 'products, grains, spices, pulses', TRUE, NOW(), NOW()),
  ('exports-imports', 'Exports / Imports', $$<h1>Exports and Imports</h1><p>Trusted sourcing and international trade solutions.</p>$$, 'Exports and imports page', 'exports, imports, trade', TRUE, NOW(), NOW()),
  ('quality', 'Quality', $$<h1>Quality Assurance</h1><p>We maintain strict quality control and packaging standards.</p>$$, 'Quality standards', 'quality, assurance, packaging', TRUE, NOW(), NOW()),
  ('blog', 'Blog', $$<h1>Blog</h1><p>News, insights, and updates from Sangath Global Exim.</p>$$, 'Blog page', 'blog, news, updates', TRUE, NOW(), NOW()),
  ('careers', 'Careers', $$<h1>Careers</h1><p>Join our growing team.</p>$$, 'Careers page', 'careers, jobs, team', TRUE, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- Site settings
INSERT INTO site_settings (key, value, description, updated_at) VALUES
  ('platform_name', to_jsonb('Sangath Global Exim'::text), 'Brand name', NOW()),
  ('platform_tagline', to_jsonb('Premium Agricultural Products'::text), 'Homepage tagline', NOW()),
  ('contact_email', to_jsonb('export.sangath@gmail.com'::text), 'Primary contact email', NOW()),
  ('contact_phone', to_jsonb('+91 93137 88416'::text), 'Primary contact phone', NOW()),
  ('address', to_jsonb('RK Prime, Rajkot, Gujarat, India'::text), 'Office address', NOW()),
  ('social_facebook', to_jsonb('https://facebook.com/sangath'::text), 'Facebook page', NOW()),
  ('social_instagram', to_jsonb('https://instagram.com/sangath'::text), 'Instagram page', NOW()),
  ('social_linkedin', to_jsonb('https://linkedin.com/company/sangath'::text), 'LinkedIn page', NOW()),
  ('social_twitter', to_jsonb('https://twitter.com/sangath'::text), 'Twitter/X page', NOW()),
  ('about_us', to_jsonb('Leading provider of premium agricultural products'::text), 'About section text', NOW()),
  ('privacy_policy', to_jsonb('Your privacy is important to us.'::text), 'Privacy policy text', NOW()),
  ('terms_conditions', to_jsonb('Terms and conditions apply.'::text), 'Terms and conditions text', NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Social media links
INSERT INTO social_media (id, platform, url, icon_url, display_order, is_active, created_at, updated_at) VALUES
  ('88888888-8888-4888-8888-888888888881', 'facebook', 'https://facebook.com/sangath', NULL, 1, TRUE, NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888882', 'instagram', 'https://instagram.com/sangath', NULL, 2, TRUE, NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888883', 'linkedin', 'https://linkedin.com/company/sangath', NULL, 3, TRUE, NOW(), NOW()),
  ('88888888-8888-4888-8888-888888888884', 'twitter', 'https://twitter.com/sangath', NULL, 4, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  platform = EXCLUDED.platform,
  url = EXCLUDED.url,
  icon_url = EXCLUDED.icon_url,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Products
INSERT INTO products (
  id, category_id, category_slug, category_name, name, description, image_url,
  details, specifications, featured, is_active, display_order, created_at, updated_at
) VALUES
  -- Spices
  ('11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Cumin Powder', 'Sangath Global Exim manufactures and exports high-quality Cumin Powder (Jeera Powder) made from premium cumin seeds. Processed as per US FDA and ASTA quality standards, including Roasted Cumin Powder and ETO treated variants. Widely used to enhance the flavour of rice, stuffed vegetables, and a variety of dishes.', '/images/Cumin_Powder.webp', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 1, NOW(), NOW()),
  ('11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Turmeric Powder', 'A bright yellow spice made from dried turmeric rhizomes with a warm, slightly peppery flavour. Widely used in cooking for its colour, taste, and health benefits. Rich in curcumin, it is also valued in cosmetic and medicinal applications.', '/images/turmeric_powder.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 2, NOW(), NOW()),
  ('11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Red Chilli', 'Originating from South America, Sangath Global Exim offers the best quality red chilli powder, ideal for preparing a wide variety of cuisines such as curry, sausages, and more. Processed and packed under strict quality norms.', '/images/red_chilli.jpeg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 3, NOW(), NOW()),
  ('11111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Coriander Powder', 'Sangath Global Exim manufactures and exports high-quality Coriander Powder (Dhaniya Powder), produced by grinding premium coriander seeds and processed per US FDA and ASTA quality standards including ETO treatment. It has a warm, slightly citrusy flavour.', '/images/Coriander_powder.webp', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 4, NOW(), NOW()),
  ('11111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Fenugreek Powder', 'Fenugreek (Methi) is native to South Eastern Europe and West Asia. Known for its medicinal properties, the seeds are 6-8 mm long, oblong or square, with a strong aroma and slight bitterness. Used extensively as a spice and condiment.', '/images/Fenugreek_Powder.webp',
   $$[{"type":"text","content":"Fenugreek (Trigonella foenum-graecum) is a clover-like herb native to the Mediterranean region, southern Europe, and western Asia. The seeds are used in cooking and as medicine. They smell and taste like maple syrup.","title":null},{"type":"list","title":"Fenugreek seeds contain:","items":["45-60% carbohydrates","20-30% proteins high in tryptophan and lysine","5-10% fixed oils (lipids)","Pyridine alkaloids: choline (0.5%), trigonelline (0.2-0.38%), gentianine, and carpaine","Flavonoids: apigenin, orientin, and luteolin"]},{"type":"text","content":"Fenugreek seeds are used as a spice and condiment to improve the flavour and nutritive value of foods. They are also used in spice blends and as a flavouring agent in beverages.","title":null}]$$::jsonb,
   $$[{"variety":"Whole Fenugreek Seeds","origin":"India","specification":"Moisture: 6-7%, Admixture: <1%, Purity: 97% / 98% / 99%","packaging":"20, 50 Kg Gunny Bags or PP Bags","fcl":"24 MT"}]$$::jsonb,
   FALSE, TRUE, 5, NOW(), NOW()),
  ('11111111-1111-4111-8111-000000000006', '11111111-1111-4111-8111-111111111111', 'spices', 'Spices', 'Cumin Seeds', 'Premium quality whole cumin seeds sourced from the best growing regions of Gujarat and Rajasthan. Our cumin seeds are cleaned, graded, and processed under strict hygienic conditions to meet international food safety standards.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 6, NOW(), NOW()),

  -- Sugar
  ('22222222-2222-4222-8222-000000000001', '22222222-2222-4222-8222-222222222222', 'sugar', 'Sugar', 'Refined Sugar (S-30 / M-30)', 'High-quality refined white sugar conforming to IS-1443 standards. Available in S-30 and M-30 grades, suitable for direct consumption, food processing, and industrial use. Exported in 50 kg HDPE bags or as per buyer specifications.', '/images/turmeric_powder.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 1, NOW(), NOW()),
  ('22222222-2222-4222-8222-000000000002', '22222222-2222-4222-8222-222222222222', 'sugar', 'Sugar', 'Raw Sugar (ICUMSA 600-1200)', 'Raw cane sugar with ICUMSA values between 600 and 1200, sourced from leading Indian sugar mills. Suitable for refining into white sugar. Available in bulk or bagged form as per importer requirements.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 2, NOW(), NOW()),

  -- Food Grains
  ('33333333-3333-4333-8333-000000000001', '33333333-3333-4333-8333-333333333333', 'food-grains', 'Food Grains', 'Basmati Rice', 'Long-grain, aromatic Basmati rice sourced from the foothills of the Himalayas. Known for its distinctive fragrance, fluffy texture, and elongated grains upon cooking. Available in aged and non-aged varieties.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 1, NOW(), NOW()),
  ('33333333-3333-4333-8333-000000000002', '33333333-3333-4333-8333-333333333333', 'food-grains', 'Food Grains', 'Non-Basmati Rice (IR-64 / Parboiled)', 'Premium IR-64, Swarna, and Parboiled rice for bulk export. Suitable for markets in Africa, the Middle East, and Southeast Asia. Exported in 25 kg, 50 kg, and 1 MT big bags.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 2, NOW(), NOW()),
  ('33333333-3333-4333-8333-000000000003', '33333333-3333-4333-8333-333333333333', 'food-grains', 'Food Grains', 'Wheat', 'High-protein Indian wheat with excellent milling quality. Suitable for flour mills, bread production, and food manufacturing. Exported in bulk vessels or 50 kg jute/PP bags.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 3, NOW(), NOW()),
  ('33333333-3333-4333-8333-000000000004', '33333333-3333-4333-8333-333333333333', 'food-grains', 'Food Grains', 'Maize (Corn)', 'Yellow and white maize suitable for human consumption, animal feed, and starch production. Sourced from major growing regions in India, meeting international quality and moisture standards.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 4, NOW(), NOW()),

  -- Pulses
  ('44444444-4444-4444-8444-000000000001', '44444444-4444-4444-8444-444444444444', 'pulses', 'Pulses', 'Chickpeas (Kabuli & Desi)', 'Both Kabuli (white) and Desi (brown) chickpeas, cleaned and sorted for export. High in protein and widely used in Middle Eastern, Mediterranean, and South Asian cuisines. Available in various sizes.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 1, NOW(), NOW()),
  ('44444444-4444-4444-8444-000000000002', '44444444-4444-4444-8444-444444444444', 'pulses', 'Pulses', 'Red Lentils (Masoor Dal)', 'Split red lentils with high protein content, uniform colour, and low impurity. A staple in many diets worldwide. Available in 25 kg PP bags or as bulk.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 2, NOW(), NOW()),
  ('44444444-4444-4444-8444-000000000003', '44444444-4444-4444-8444-444444444444', 'pulses', 'Pulses', 'Green Moong Dal', 'Whole and split green moong bean of superior quality. Rich in protein and fibre, widely consumed in Indian, Southeast Asian, and African markets.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 3, NOW(), NOW()),
  ('44444444-4444-4444-8444-000000000004', '44444444-4444-4444-8444-444444444444', 'pulses', 'Pulses', 'Kidney Beans (Rajma)', 'Dark red kidney beans of premium quality, rich in protein and minerals. Exported in 25-50 kg bags and widely demanded in North America, Europe, and the Middle East.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 4, NOW(), NOW()),

  -- Ghee
  ('55555555-5555-4555-8555-000000000001', '55555555-5555-4555-8555-555555555555', 'ghee', 'Ghee', 'Pure Cow Ghee', 'Traditionally prepared pure cow ghee with a rich aroma, golden colour, and authentic taste. Made from fresh cow milk and processed under hygienic conditions. Available in 500 ml, 1 L, and bulk (tin) packaging.', '/images/turmeric_powder.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 1, NOW(), NOW()),

  -- Tea
  ('66666666-6666-4666-8666-000000000001', '66666666-6666-4666-8666-666666666666', 'tea', 'Tea', 'CTC Tea', 'Crush, Tear, Curl (CTC) tea from the premier tea gardens of Assam and West Bengal. Known for its strong brew, bright liquor, and bold flavour. Suitable for direct consumption and tea bag production.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, TRUE, TRUE, 1, NOW(), NOW()),
  ('66666666-6666-4666-8666-000000000002', '66666666-6666-4666-8666-666666666666', 'tea', 'Tea', 'Orthodox Tea', 'Whole-leaf orthodox tea from Darjeeling and Nilgiri regions. Prized for its muscatel aroma, delicate flavour, and golden-tipped appearance. Available in various grades.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 2, NOW(), NOW()),

  -- Agro Feed
  ('77777777-7777-4777-8777-000000000001', '77777777-7777-4777-8777-777777777777', 'agro-feed', 'Agro Feed', 'De-Oiled Rice Bran (DORB)', 'High-quality de-oiled rice bran used as a nutrient-rich ingredient in animal and poultry feed. Rich in protein, fibre, and micronutrients. Exported in 50 kg bags or bulk containers.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 1, NOW(), NOW()),
  ('77777777-7777-4777-8777-000000000002', '77777777-7777-4777-8777-777777777777', 'agro-feed', 'Agro Feed', 'Soybean Meal', 'High-protein soybean meal, a by-product of soybean oil extraction. Used widely in poultry, aquaculture, and livestock feed. Available in both 46% and 48% protein variants.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 2, NOW(), NOW()),
  ('77777777-7777-4777-8777-000000000003', '77777777-7777-4777-8777-777777777777', 'agro-feed', 'Agro Feed', 'Groundnut Extraction', 'Protein-rich groundnut extraction suitable as a high-energy supplement in animal and poultry feed. Sourced from expeller-pressed groundnuts with low aflatoxin levels.', '/images/Cumin_Seeds.jpg', '[]'::jsonb, '[]'::jsonb, FALSE, TRUE, 3, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  category_slug = EXCLUDED.category_slug,
  category_name = EXCLUDED.category_name,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  details = EXCLUDED.details,
  specifications = EXCLUDED.specifications,
  featured = EXCLUDED.featured,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

COMMIT;
