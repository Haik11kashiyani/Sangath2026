# Sangath CMS - Setup Instructions

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+ (or use Docker)
- npm or yarn

### Option 1: Using Docker (Recommended)

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start all services
docker-compose up

# The app will be available at:
# - Frontend: http://localhost:3000
# - Admin: http://localhost:3001
# - API: http://localhost:5000/api
```

### Option 2: Manual Setup

#### 1. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

#### 2. Setup PostgreSQL Database
```bash
# Create database and user
createdb -U postgres sangath_db
psql -U postgres sangath_db < server/migrations/schema.sql
```

#### 3. Configure Environment
```bash
# Copy and edit environment variables
cp server/.env.example server/.env

# Edit server/.env with your settings:
# - DB credentials
# - JWT secrets (use strong random values)
# - Email settings (optional, for contact form replies)
```

#### 4. Install Frontend Dependencies
```bash
npm install
```

#### 5. Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Admin Dashboard:**
```bash
npm run dev:admin
```

### Access Applications
- **User Frontend:** http://localhost:5173
- **Admin Panel:** http://localhost:3001
- **API Documentation:** http://localhost:5000/api

---

## Database Setup

### Manual Schema Setup
If docker-compose doesn't auto-initialize:

```bash
psql -U sangath_user -d sangath_db -f server/migrations/schema.sql
```

### Create First Admin User

```bash
cd server
npm run create-admin
```

Then import the generated `admin-user.json` file into PostgreSQL, or use the JSON data to create a user manually.

Or manually:
```sql
INSERT INTO admin_users (email, password_hash, role, status) 
VALUES ('admin@example.com', 'hashed_password', 'super_admin', 'active');
```

---

## Production Deployment

### 1. Build Frontend & Admin
```bash
npm run build
npm run build:admin
```

### 2. Prepare for VPS
```bash
# Copy to VPS
scp -r ./dist devloper@3.110.237.216:/var/www/sangath
scp -r ./server devloper@3.110.237.216:/var/www/sangath-api
```

### 3. VPS Setup
See DEPLOYMENT.md for complete VPS setup instructions.

---

## Environment Variables

### Backend (server/.env)

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | sangath_db | Database name |
| DB_USER | sangath_user | Database user |
| DB_PASSWORD | - | Database password (CHANGE THIS) |
| API_PORT | 5000 | API server port |
| JWT_SECRET | - | JWT signing key (min 32 chars, CHANGE THIS) |
| JWT_EXPIRY | 24h | JWT expiration time |
| FRONTEND_URL | http://localhost:3000 | Frontend origin |
| ADMIN_URL | http://localhost:3001 | Admin origin |
| EMAIL_HOST | smtp.gmail.com | SMTP server |
| EMAIL_USER | - | Email sender |
| EMAIL_PASSWORD | - | Email password |
| EMAIL_FROM | noreply@sangath.com | From address |

---

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
API_PORT=5001 npm run dev
```

### "Database connection refused"
- Ensure PostgreSQL is running
- Check DB credentials in .env
- Verify database exists: `psql -l`

### "Module not found"
```bash
# Reinstall all dependencies
rm -rf node_modules server/node_modules
npm install
cd server && npm install && cd ..
```

---

## API Endpoints

### Public (No Auth)
- `GET /api/pages/:slug` - Get page content
- `GET /api/products` - List products
- `GET /api/social-media` - Get social links
- `GET /api/settings` - Get settings
- `POST /api/contact` - Submit contact form

### Authentication
- `POST /api/auth/login` - Admin login

### Admin (Requires JWT Token)
- `GET /api/admin/pages` - List pages
- `PUT /api/admin/pages/:slug` - Update page
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/social-media` - List social media
- `PUT /api/admin/social-media/:id` - Update social media
- `GET /api/admin/settings` - Get all settings
- `PUT /api/admin/settings/:key` - Update setting
- `GET /api/admin/contact-submissions` - List contact submissions
- `PUT /api/admin/contact-submissions/:id/reply` - Reply to contact

---

## Next Steps

1. ✅ Start local development servers
2. ✅ Create first admin user
3. ✅ Add initial products/pages in admin panel
4. ✅ Test frontend with API
5. ⏭️ Deploy to VPS (see DEPLOYMENT.md)
6. ⏭️ Configure email integration
7. ⏭️ Set up SSL certificates (Let's Encrypt)
8. ⏭️ Configure backups

---

## Support

For issues or questions, check:
- Backend logs: `server/npm-debug.log`
- Frontend console: Browser DevTools (F12)
- Database: `psql -U sangath_user -d sangath_db`
