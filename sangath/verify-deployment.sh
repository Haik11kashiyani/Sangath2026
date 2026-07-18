#!/bin/bash

# ============================================
# POST-DEPLOYMENT VERIFICATION SCRIPT
# Run after deploy-now.sh completes
# ============================================

set -e

echo "╔════════════════════════════════════════╗"
echo "║   POST-DEPLOYMENT VERIFICATION        ║"
echo "╚════════════════════════════════════════╝"
echo ""

APP_DIR="/opt/sangath"
cd $APP_DIR

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✅${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# ============================================
# 1. Check Docker Services
# ============================================
echo "1️⃣  DOCKER SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker-compose -f docker-compose.prod.yml ps | grep -q "postgres.*Up"; then
    pass "PostgreSQL running"
else
    fail "PostgreSQL not running"
fi

if docker-compose -f docker-compose.prod.yml ps | grep -q "backend.*Up"; then
    pass "Backend API running"
else
    fail "Backend API not running"
fi

if docker-compose -f docker-compose.prod.yml ps | grep -q "frontend.*Up"; then
    pass "Frontend Nginx running"
else
    fail "Frontend Nginx not running"
fi

echo ""

# ============================================
# 2. Test API Endpoints
# ============================================
echo "2️⃣  API ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s http://localhost:5000/api/health | grep -q "ok"; then
    pass "Health check endpoint"
else
    fail "Health check endpoint"
fi

if curl -s http://localhost/health >/dev/null 2>&1; then
    pass "Frontend health check"
else
    fail "Frontend health check"
fi

echo ""

# ============================================
# 3. Database Checks
# ============================================
echo "3️⃣  DATABASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ADMIN_COUNT=$(docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U sangath_user -d sangath_ie_prod -t -c "SELECT COUNT(*) FROM admin_users;" 2>/dev/null || echo "0")

if [ "$ADMIN_COUNT" -ge "1" ]; then
    pass "Admin user seeded ($ADMIN_COUNT)"
else
    fail "Admin user not found"
fi

TABLES=$(docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U sangath_user -d sangath_ie_prod -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")

if [ "$TABLES" -ge "5" ]; then
    pass "Database tables created ($TABLES tables)"
else
    fail "Database tables incomplete"
fi

echo ""

# ============================================
# 4. Environment Configuration
# ============================================
echo "4️⃣  CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env" ]; then
    pass "Environment file exists"
    
    if grep -q "JWT_SECRET=" .env; then
        pass "JWT_SECRET configured"
    else
        fail "JWT_SECRET missing"
    fi
    
    if grep -q "DB_PASSWORD=" .env; then
        pass "Database password configured"
    else
        fail "Database password missing"
    fi
else
    fail "Environment file missing"
fi

echo ""

# ============================================
# 5. Docker Image Verification
# ============================================
echo "5️⃣  DOCKER IMAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker image ls | grep -q "sangath.*backend"; then
    pass "Backend image built"
else
    warn "Backend image not found"
fi

if docker image ls | grep -q "postgres.*16"; then
    pass "PostgreSQL image ready"
else
    warn "PostgreSQL image not found"
fi

if docker image ls | grep -q "nginx.*alpine"; then
    pass "Nginx image ready"
else
    warn "Nginx image not found"
fi

echo ""

# ============================================
# 6. Log Check
# ============================================
echo "6️⃣  LOGS (checking for errors)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=$(docker-compose -f docker-compose.prod.yml logs | grep -i "error" | wc -l)

if [ "$ERRORS" -eq "0" ]; then
    pass "No errors in logs"
else
    warn "Found $ERRORS error mentions (review with: docker-compose logs)"
fi

echo ""

# ============================================
# 7. SSL/HTTPS Status
# ============================================
echo "7️⃣  SECURITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s -I http://localhost | grep -q "X-Frame-Options"; then
    pass "Security headers present"
else
    warn "Security headers check inconclusive"
fi

if grep -q "gzip" docker-compose.prod.yml; then
    pass "Gzip compression configured"
else
    warn "Gzip not configured"
fi

echo ""

# ============================================
# 8. Disk Space & Resources
# ============================================
echo "8️⃣  SYSTEM RESOURCES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

if [ "$DISK_USAGE" -lt "80" ]; then
    pass "Disk space OK (${DISK_USAGE}%)"
else
    warn "Disk usage high (${DISK_USAGE}%)"
fi

MEMORY=$(free | awk 'NR==2 {printf("%.0f", $3/$2 * 100)}')

if [ "$MEMORY" -lt "80" ]; then
    pass "Memory usage OK (${MEMORY}%)"
else
    warn "Memory usage high (${MEMORY}%)"
fi

echo ""

# ============================================
# Summary
# ============================================
echo "╔════════════════════════════════════════╗"
TOTAL=$((PASSED + FAILED))
echo "║   VERIFICATION SUMMARY                 ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo -e "Tests Passed: ${GREEN}${PASSED}${NC}"
echo -e "Tests Failed: ${RED}${FAILED}${NC}"
echo "Total Tests:  $TOTAL"
echo ""

if [ "$FAILED" -eq "0" ]; then
    echo -e "${GREEN}✨ ALL CHECKS PASSED! ✨${NC}"
    echo ""
    echo "Your application is ready for production:"
    echo "  • Main Site:  http://3.110.237.216"
    echo "  • Admin:      http://3.110.237.216/admin"
    echo "  • API:        http://3.110.237.216/api"
    echo ""
    echo "Login Credentials:"
    echo "  • Email:    export.sangath@gmail.com"
    echo "  • Password: Ekantik@1008"
    echo ""
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "2. Restart:   docker-compose -f docker-compose.prod.yml restart"
    echo "3. Check:     docker-compose -f docker-compose.prod.yml ps"
    echo ""
fi

echo "Monitor logs with:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
