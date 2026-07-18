# ✅ Pre-Deployment Checklist

## 🔧 Backend Setup

- [x] **Database migration**: `server/migrations/004_refresh_tokens.sql`
  - ✅ Creates refresh_tokens table with hashed storage
  - ✅ Adds indexes for performance
  
- [x] **Authentication endpoints**:
  - ✅ POST `/api/auth/login` - Returns access + refresh tokens
  - ✅ POST `/api/auth/refresh` - Rotates tokens, revokes old ones
  - ✅ POST `/api/auth/logout` - Revokes refresh token
  
- [x] **Admin CRUD endpoints**:
  - ✅ GET `/api/admin/users` - List admin users
  - ✅ POST `/api/admin/users` - Create admin (bcrypt password hashing)
  - ✅ PUT `/api/admin/users/:id` - Update user email/role/status
  - ✅ PUT `/api/admin/users/:id/password` - Reset password
  - ✅ DELETE `/api/admin/users/:id` - Delete user (prevent self-delete)
  - ✅ GET `/api/admin/audit-logs` - View action logs
  
- [x] **Security & Middleware**:
  - ✅ RBAC (Role-Based Access Control) - super_admin, editor, viewer
  - ✅ Audit logging for all admin actions
  - ✅ Rate limiting on `/api/` routes
  - ✅ Login limiter (5 attempts/15min)
  - ✅ Helmet security headers
  - ✅ CORS configured with credentials
  - ✅ Cookie parser for httpOnly tokens
  
- [x] **Health Check**:
  - ✅ GET `/api/health` - For Docker monitoring
  
- [x] **Scripts**:
  - ✅ `server/scripts/seed.js` - Initialize database
  - ✅ `server/scripts/create-admin.js` - Create admin user
  
## 🎨 Frontend Setup

- [x] **Main Site**:
  - ✅ Vite config at `vite.config.js`
  - ✅ Build output: `dist/`
  - ✅ Environment: `VITE_API_URL` set in `.env`
  - ✅ Components: Header, Footer, Navbar, pages (About, Blog, Careers, Contact, etc.)
  
- [x] **Admin Dashboard**:
  - ✅ Separate Vite config at `src/admin/vite.config.js`
  - ✅ Build output: `src/admin/dist/`
  - ✅ Components: 
    - ✅ AdminLayout (with sidebar toggle & boxed styling)
    - ✅ AdminNavigation (sidebar menu)
    - ✅ AdminLogin (email + password)
    - ✅ UserManager (CRUD interface)
    - ✅ PageEditor, ProductManager, SocialMediaManager, SiteSettings
  - ✅ API Client with auto-token-refresh
  - ✅ Styling with admin.css (responsive, boxed layout)
  
## 🐳 Docker & Deployment

- [x] **Containerization**:
  - ✅ `Dockerfile.backend` - Node.js Alpine, multi-stage, health checks
  - ✅ `Dockerfile.frontend` - Nginx Alpine, gzip compression
  - ✅ `docker-compose.prod.yml` - PostgreSQL + Backend + Frontend
  
- [x] **Web Server**:
  - ✅ `nginx.conf` - Reverse proxy, rate limiting, static assets, security headers
  
- [x] **Configuration**:
  - ✅ `.env.production` - Template with all required variables
  - ✅ `DEPLOYMENT_GUIDE.md` - Automated setup script
  - ✅ `QUICK_DEPLOY.md` - Quick reference
  
## 📋 Environment Variables Required

Before deploying, you MUST set in `.env`:

```
# Database (required)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sangath_ie_prod
DB_USER=sangath_user
DB_PASSWORD=GENERATE_STRONG_PASSWORD  ← ⚠️ REQUIRED

# JWT Secrets (required) - Use: openssl rand -hex 32
JWT_SECRET=GENERATE_32_CHAR_HEX_STRING  ← ⚠️ REQUIRED
JWT_REFRESH_SECRET=GENERATE_32_CHAR_HEX_STRING  ← ⚠️ REQUIRED

# URLs (required for CORS)
FRONTEND_URL=https://yourdomain.com  ← ⚠️ UPDATE
ADMIN_URL=https://admin.yourdomain.com  ← ⚠️ UPDATE

# Admin Seeding (required)
ADMIN_EMAIL=admin@sangath.com
ADMIN_PASSWORD=SECURE_PASSWORD  ← ⚠️ UPDATE

# Node Environment (required)
NODE_ENV=production
API_PORT=5000
```

## 🔐 Security Checklist

- [x] **Password Hashing**: bcryptjs (10 rounds)
- [x] **Refresh Token Security**: SHA-256 hashed in DB
- [x] **Token Storage**: Access token in localStorage, Refresh token in httpOnly cookie
- [x] **CORS**: Restricted to FRONTEND_URL and ADMIN_URL
- [x] **Rate Limiting**: General (100/15min) + Login (5/15min)
- [x] **Security Headers**: Helmet + custom headers in Nginx
- [x] **HTTPS Ready**: Cookie set to secure flag (requires HTTPS in production)
- [ ] **SSL Certificate**: ⚠️ Still needed - Use Let's Encrypt after deployment

## 📊 Database

- [x] **Schema**: `server/migrations/schema.sql`
  - Tables: admin_users, refresh_tokens, pages, products, categories, site_settings, etc.
  
- [x] **Migrations**: 
  - `001` - schema.sql (main tables)
  - `004` - refresh_tokens.sql (token rotation)
  
- [x] **Seeding**: `server/scripts/seed.js`
  - Default admin user
  - Default categories (Fresh Produce, Grains, Spices, etc.)
  - Default pages (Home, About, Contact)
  - Site settings
  
## 🧪 Testing Before Deployment

### Local Testing ✅
1. Server starts without errors
2. Database migrations apply successfully
3. Admin login works
4. Token refresh works
5. Admin user CRUD works
6. Sidebar toggle works

### Docker Testing (on server)
1. PostgreSQL container starts
2. Backend container starts and health check passes
3. Frontend container builds and starts
4. All services accessible on correct ports
5. Admin login works through Nginx

## 🚨 Critical Issues to Address

**None identified** ✅

All code:
- ✅ No syntax errors
- ✅ No missing imports
- ✅ Properly typed/configured
- ✅ Error handling in place
- ✅ RBAC enforced
- ✅ Security headers set

## 📦 Ready for Deployment?

**YES! ✅ Everything is production-ready.**

### Final Steps Before Deploy:

1. **Configure .env** - Set strong passwords, JWT secrets, domains
2. **Push to Git** - Commit and push all files to repository
3. **SSH to server** - `ssh developer@3.110.237.216`
4. **Clone & Deploy** - Run docker-compose up -d
5. **Verify Services** - Check all containers running
6. **Setup SSL** - Install Let's Encrypt certificate
7. **Point DNS** - Update domain records to server IP
8. **Test** - Access admin dashboard and login
9. **Monitor Logs** - Watch for any errors

---

## 🎯 Deployment Command Summary

```bash
# On your server (3.110.237.216)
cd /opt/sangath

# 1. Configure
cp .env.production .env
nano .env  # Set strong passwords and URLs

# 2. Build
npm ci && npm run build
cd src/admin && npm ci && npm run build && cd ..

# 3. Deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

**Expected result:** All 3 services running (postgres, backend, frontend) ✅

