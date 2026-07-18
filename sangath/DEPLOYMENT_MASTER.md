# 🎯 SANGATH FINAL DEPLOYMENT - MASTER GUIDE

## ⚡ QUICK START (Copy & Paste)

### Step 1: SSH to Your Server
```bash
ssh developer@3.110.237.216
```
**Enter password when prompted:** `eternal@123`

---

### Step 2: Deploy (ONE LINE)
```bash
curl -fsSL https://raw.githubusercontent.com/Haik11kashiyani/Sangath2026/main/sangath/deploy-now.sh | bash
```

**That's it! Wait 2-3 minutes...**

---

## 📋 What Gets Deployed

| Component | Details |
|-----------|---------|
| **Database** | PostgreSQL 16 Alpine with sangath_ie_prod database |
| **Backend** | Node.js 20 Alpine with Express API, JWT auth, RBAC |
| **Frontend** | Nginx Alpine serving React SPA + Admin dashboard |
| **Admin User** | export.sangath@gmail.com / Ekantik@1008 |
| **Domain** | http://3.110.237.216 |

---

## ✅ Verification Steps (After Deployment Completes)

### 1. Check Services Running
```bash
cd /opt/sangath
docker-compose -f docker-compose.prod.yml ps
```
**Expected output:**
```
postgres    Running (healthy)
backend     Running
frontend    Running
```

### 2. Test API Health
```bash
curl http://3.110.237.216/api/health
```
**Expected:** `{"status":"ok","timestamp":"2026-07-18T...Z"}`

### 3. Test Main Site
Open in browser: `http://3.110.237.216`
**Expected:** Sangath main site loads

### 4. Test Admin Dashboard
Open in browser: `http://3.110.237.216/admin`
**Expected:** Admin login page appears

### 5. Test Admin Login
- **Email:** export.sangath@gmail.com
- **Password:** Ekantik@1008
**Expected:** Redirects to admin dashboard with sidebar

### 6. Check Database
```bash
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U sangath_user -d sangath_ie_prod -c "SELECT COUNT(*) FROM admin_users;"
```
**Expected:** Returns `1` (admin user seeded)

### 7. Check Logs (no errors)
```bash
docker-compose -f docker-compose.prod.yml logs --tail=50
```
**Expected:** No ERROR messages, only INFO

---

## 🆘 Troubleshooting

### Problem: "Connection refused on port 5000"
**Solution:**
```bash
# Wait longer for database to initialize
sleep 30
curl http://3.110.237.216/api/health
```

### Problem: "Frontend returns 502 Bad Gateway"
**Solution:**
```bash
# Check if backend is running
docker-compose -f docker-compose.prod.yml logs backend | tail -20

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend
```

### Problem: "Admin login fails"
**Solution:**
```bash
# Check if seed ran
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U sangath_user -d sangath_ie_prod -c "SELECT email FROM admin_users;"

# If no admin, reseed manually
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

### Problem: "Port 3306 already in use"
**Solution:**
```bash
# Kill old container
docker-compose -f docker-compose.prod.yml down -v

# Start fresh
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Production Checklist

### Pre-Deployment
- [ ] Git code pushed to GitHub
- [ ] Server IP: 3.110.237.216
- [ ] SSH credentials saved
- [ ] All security vulnerabilities reviewed

### During Deployment
- [ ] SSH connection successful
- [ ] Deploy command starts
- [ ] Building frontend... completes
- [ ] Starting services... completes
- [ ] "✨ DEPLOYMENT COMPLETE ✨" shown

### Post-Deployment (Next 1 Hour)
- [ ] All 3 services running (postgres, backend, frontend)
- [ ] API health check passing
- [ ] Admin login works
- [ ] Main site loads
- [ ] Database seeded (admin user created)
- [ ] Logs show no errors
- [ ] Can upload files (if applicable)
- [ ] Database backups scheduled

### Long-Term Monitoring
- [ ] Monitor Docker logs daily
- [ ] Check disk space weekly
- [ ] Update dependencies monthly
- [ ] Review security alerts on GitHub

---

## 🔐 Environment Variables Deployed

| Variable | Value |
|----------|-------|
| DB_HOST | postgres |
| DB_NAME | sangath_ie_prod |
| DB_USER | sangath_user |
| DB_PASSWORD | jiuxib7ysr |
| NODE_ENV | production |
| API_PORT | 5000 |
| FRONTEND_URL | http://3.110.237.216 |
| ADMIN_URL | http://3.110.237.216/admin |
| JWT_SECRET | d42348bd776ea1... (32 bytes) |
| JWT_REFRESH_SECRET | d53b97b1171d... (32 bytes) |

---

## 📁 Directory Structure After Deployment

```
/opt/sangath/
├── .env                          ← Loaded from .env.production
├── docker-compose.prod.yml       ← Multi-container orchestration
├── nginx.conf                    ← Web server config
├── Dockerfile.backend            ← Backend container
├── Dockerfile.frontend           ← Frontend container
├── dist/                         ← Built main site
├── src/admin/dist/               ← Built admin dashboard
├── server/                       ← Backend source
│   ├── index.js                  ← Express server
│   ├── package.json              ← Dependencies (patched)
│   ├── config/database.js        ← PostgreSQL connection
│   ├── routes/auth.js            ← Login, refresh, logout
│   ├── routes/admin.js           ← User management
│   ├── middleware/               ← Auth, RBAC, error handling
│   ├── migrations/               ← Database schema
│   └── scripts/seed.js           ← Auto-seed admin + data
└── package.json                  ← Root dependencies

Volumes (Persistent):
└── postgres_data/                ← Database storage (IMPORTANT!)
```

---

## 🎯 After Successful Deployment

### Access Your Application
- **Main Site:** http://3.110.237.216
- **Admin Dashboard:** http://3.110.237.216/admin
- **API:** http://3.110.237.216/api

### Common Commands

**View all logs:**
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml logs -f
```

**Restart services:**
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml restart
```

**Stop services (maintenance):**
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml down
```

**Start again:**
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml up -d
```

**Backup database:**
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml exec postgres \
  pg_dump -U sangath_user sangath_ie_prod > /opt/sangath/backup-$(date +%Y%m%d).sql
```

**Restore database:**
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml exec -T postgres \
  psql -U sangath_user sangath_ie_prod < /opt/sangath/backup-20260718.sql
```

---

## 🔐 Security Reminders

1. **Never share passwords** in logs or commit messages
2. **Rotate JWT secrets** regularly (update .env + restart)
3. **Enable HTTPS** - Get SSL certificate with Let's Encrypt:
   ```bash
   sudo certbot certonly --standalone -d 3.110.237.216
   ```
4. **Monitor logs** for failed login attempts
5. **Backup database** weekly
6. **Update dependencies** monthly (check GitHub security alerts)

---

## 📞 Support Reference

**If deployment fails:**
1. Check SSH connection: `ssh developer@3.110.237.216`
2. Check internet: `ping google.com`
3. Check Docker: `docker --version`
4. Read logs: `docker-compose logs -f`
5. Check disk space: `df -h`
6. Check memory: `free -h`

**Contact Info:**
- GitHub: https://github.com/Haik11kashiyani/Sangath2026
- API Status: curl http://3.110.237.216/api/health
- Docker Status: docker ps

---

## ✨ Final Checklist

- [ ] Code pushed to GitHub ✅
- [ ] All vulnerabilities fixed ✅
- [ ] Deployment script ready ✅
- [ ] Environment variables configured ✅
- [ ] Database migrations included ✅
- [ ] Admin user seeding automated ✅
- [ ] Docker containers configured ✅
- [ ] Security headers enabled ✅
- [ ] Rate limiting configured ✅
- [ ] Logs monitored ✅

**🎉 READY FOR PRODUCTION DEPLOYMENT! 🎉**

---

## 🚀 QUICK COMMAND (Copy This)

```bash
# SSH
ssh developer@3.110.237.216

# Then paste this:
curl -fsSL https://raw.githubusercontent.com/Haik11kashiyani/Sangath2026/main/sangath/deploy-now.sh | bash
```

**Wait 2-3 minutes for completion!**

