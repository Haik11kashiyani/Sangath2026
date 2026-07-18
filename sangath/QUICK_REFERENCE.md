# 🚀 SANGATH DEPLOYMENT - QUICK REFERENCE CARD

## 🎯 DEPLOYMENT IN 3 STEPS

### Step 1: SSH to Server
```
ssh developer@3.110.237.216
Password: eternal@123
```

### Step 2: Run Deploy
```
curl -fsSL https://raw.githubusercontent.com/Haik11kashiyani/Sangath2026/main/sangath/deploy-now.sh | bash
```

### Step 3: Wait 2-3 Minutes
⏳ Script will:
- Install Docker
- Clone code
- Build frontend
- Start containers
- Seed database

---

## 📊 AFTER DEPLOYMENT

### Access Points
| Service | URL |
|---------|-----|
| Main Site | http://3.110.237.216 |
| Admin | http://3.110.237.216/admin |
| API | http://3.110.237.216/api |

### Default Login
- **Email:** export.sangath@gmail.com
- **Password:** Ekantik@1008

---

## ✅ VERIFY DEPLOYMENT

```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Test API
curl http://3.110.237.216/api/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Run full verification
bash verify-deployment.sh
```

---

## 🆘 QUICK FIXES

| Problem | Command |
|---------|---------|
| Services not starting | `docker-compose -f docker-compose.prod.yml restart` |
| Database error | `docker-compose -f docker-compose.prod.yml logs postgres` |
| Backend error | `docker-compose -f docker-compose.prod.yml logs backend` |
| Frontend error | `docker-compose -f docker-compose.prod.yml logs frontend` |
| Connection refused | `sleep 30 && curl http://localhost:5000/api/health` |

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `deploy-now.sh` | 🚀 Main deployment script |
| `docker-compose.prod.yml` | 🐳 Container config |
| `.env` | 🔐 Environment variables |
| `verify-deployment.sh` | ✅ Verification script |
| `server/scripts/seed.js` | 🌱 Database seeding |

---

## 🔐 CREDENTIALS

### Server SSH
```
Host: 3.110.237.216
User: developer
Pass: eternal@123
```

### Admin Login
```
Email: export.sangath@gmail.com
Pass: Ekantik@1008
```

### Database
```
Host: postgres (internal)
User: sangath_user
Pass: jiuxib7ysr
DB: sangath_ie_prod
```

---

## 🎯 COMMANDS TO REMEMBER

```bash
# Start services
docker-compose -f /opt/sangath/docker-compose.prod.yml up -d

# Stop services
docker-compose -f /opt/sangath/docker-compose.prod.yml down

# Restart all
docker-compose -f /opt/sangath/docker-compose.prod.yml restart

# View logs (live)
docker-compose -f /opt/sangath/docker-compose.prod.yml logs -f

# Backup database
docker-compose -f /opt/sangath/docker-compose.prod.yml exec postgres \
  pg_dump -U sangath_user sangath_ie_prod > backup.sql

# Execute database query
docker-compose -f /opt/sangath/docker-compose.prod.yml exec postgres \
  psql -U sangath_user -d sangath_ie_prod -c "SELECT * FROM admin_users;"
```

---

## 🔄 DAILY OPERATIONS

### Morning Check
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml ps
# All should show "Up"
```

### Check for Errors
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml logs | grep -i error
# Should return nothing
```

### Weekly Backup
```bash
docker-compose -f /opt/sangath/docker-compose.prod.yml exec postgres \
  pg_dump -U sangath_user sangath_ie_prod > \
  /opt/sangath/backups/backup-$(date +%Y%m%d).sql
```

---

## 📈 MONITORING

### Check Resource Usage
```bash
docker stats
# Shows CPU, memory, network for all containers
```

### Check Disk Space
```bash
df -h /
# Should have > 10GB free
```

### Check Docker Logs Size
```bash
du -sh /var/lib/docker/containers
# Should be < 50GB
```

---

## 🎉 SUCCESS INDICATORS

✅ All containers running (green in `docker ps`)
✅ API responds to health check
✅ Admin login works
✅ No errors in logs
✅ Database has admin user
✅ Frontend loads without 502 errors

---

## ⚠️ COMMON ISSUES

| Issue | Cause | Fix |
|-------|-------|-----|
| 502 Bad Gateway | Backend down | `docker-compose restart backend` |
| Connection refused | Services not started | Wait 30s, check `docker ps` |
| Admin login fails | No seed user | `docker-compose exec backend npm run seed` |
| High memory | Logs too large | `docker system prune` |

---

## 📞 NEED HELP?

1. **Check GitHub:** https://github.com/Haik11kashiyani/Sangath2026
2. **Check Logs:** `docker-compose logs -f`
3. **Restart Services:** `docker-compose restart`
4. **View Full Guide:** `cat DEPLOYMENT_MASTER.md`

---

## 🎯 NEXT STEPS

- [ ] Run deployment script
- [ ] Verify all services up
- [ ] Test admin login
- [ ] Monitor logs (no errors)
- [ ] Setup SSL (optional)
- [ ] Setup custom domain (optional)
- [ ] Schedule backups (optional)

---

**STATUS: READY FOR DEPLOYMENT! 🚀**

**Last Updated:** 2026-07-18
**Git Repo:** https://github.com/Haik11kashiyani/Sangath2026
**Environment:** Production (3.110.237.216)

