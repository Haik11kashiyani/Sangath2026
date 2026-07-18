# 🚀 Sangath Quick Deployment Guide

## Your Server Info
```
IP: 3.110.237.216
SSH User: developer (not devloper)
Password: eternal@123
```

## Step-by-Step Deployment (5 minutes)

### 1️⃣ SSH into your server
```bash
ssh developer@3.110.237.216
# Password: eternal@123
```

### 2️⃣ Download deployment script
```bash
cd ~
wget https://raw.githubusercontent.com/YOUR-REPO/main/DEPLOYMENT_GUIDE.md
chmod +x DEPLOYMENT_GUIDE.md
```

**OR manually copy the deployment commands:**

```bash
# Clone repository
mkdir -p /opt/sangath
cd /opt/sangath
git clone https://github.com/YOUR-USERNAME/sangath.git .

# Copy environment file
cp .env.production .env
nano .env  # Edit with your values

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git npm
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker

# Build and start
npm ci
npm run build
cd src/admin && npm ci && npm run build && cd ..
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 3️⃣ Configure .env on server
**Edit important values:**
```bash
nano .env

# Generate secure secrets:
openssl rand -hex 32
openssl rand -hex 32

# Set these:
DB_PASSWORD=strong_password_here
JWT_SECRET=<generated-hex-string>
JWT_REFRESH_SECRET=<generated-hex-string>
ADMIN_PASSWORD=secure_admin_password
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

### 4️⃣ Start services
```bash
docker-compose -f docker-compose.prod.yml up -d
sleep 15  # Wait for database to initialize

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 5️⃣ Verify deployment
```bash
# Database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U sangath_user

# Backend API
curl http://localhost:5000/api/health

# Frontend
curl http://localhost/health
```

## 📋 What Gets Deployed

| Service | Port | Location |
|---------|------|----------|
| PostgreSQL | 5432 | postgres service |
| Node API | 5000 | backend service |
| Nginx | 80/443 | frontend service |

## 🎯 Key Files Created

```
sangath/
├── docker-compose.prod.yml    ← Main deployment config
├── nginx.conf                  ← Web server config
├── Dockerfile.backend          ← Backend container
├── Dockerfile.frontend         ← Frontend container
├── .env.production             ← Environment template
├── DEPLOYMENT_GUIDE.md         ← Full deployment script
└── server/scripts/seed.js      ← Database initialization
```

## 🔑 Access After Deployment

```
Admin Dashboard: https://yourdomain.com/admin
Main Site: https://yourdomain.com
API: https://yourdomain.com/api

Login Email: admin@sangath.com (or custom from .env)
Password: (from ADMIN_PASSWORD in .env)
```

## 📊 Monitor Deployment

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs backend -f
docker-compose -f docker-compose.prod.yml logs postgres -f
docker-compose -f docker-compose.prod.yml logs frontend -f

# Check running containers
docker-compose -f docker-compose.prod.yml ps

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 🛡️ SSL/HTTPS Setup (After Deployment)

```bash
# Install Certbot
sudo apt-get install -y certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com

# Update nginx.conf with SSL paths
# Or use Docker volumes to mount certificates
```

## 🆘 Troubleshooting

### Port already in use
```bash
sudo lsof -i :5000
kill -9 <PID>
```

### Database won't start
```bash
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml down
docker volume rm sangath_postgres_data
docker-compose -f docker-compose.prod.yml up postgres -d
```

### Backend crashes
```bash
docker-compose -f docker-compose.prod.yml logs backend
# Check .env values, JWT secrets, DB connection
```

### Frontend not loading
```bash
docker-compose -f docker-compose.prod.yml logs frontend
# Check nginx.conf, ensure backend is running
```

## 📦 Database Seeding

Auto-runs on start, but to manually seed:
```bash
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## ✅ Production Checklist

- [ ] SSH access working
- [ ] Docker installed and running
- [ ] Repository cloned to /opt/sangath
- [ ] .env file configured with production values
- [ ] JWT secrets generated (32+ chars)
- [ ] Database password strong
- [ ] Containers building without errors
- [ ] All services starting (green status)
- [ ] Database health check passing
- [ ] Backend health check passing
- [ ] Frontend accessible on port 80
- [ ] Admin login working
- [ ] SSL/HTTPS configured
- [ ] Domain DNS pointing to server

## 🎉 You're Live!

Once all services are running and healthy:
1. Point your domain DNS to `3.110.237.216`
2. Set up SSL/HTTPS
3. Test login at `/admin`
4. Monitor logs regularly

---

**Need help?** Check logs first:
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```
