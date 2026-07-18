#!/bin/bash

# ============================================
# SANGATH PRODUCTION DEPLOYMENT - ONE COMMAND
# Run this ONCE on your server
# ============================================

set -e

# Configuration
REPO="https://github.com/Haik11kashiyani/Sangath2026.git"
APP_DIR="/opt/sangath"
DB_PASS="jiuxib7ysr"
ADMIN_EMAIL="export.sangath@gmail.com"
ADMIN_PASS="Ekantik@1008"
JWT_SECRET="d42348bd776ea1feb08b88e6d8ffc8e9b6bf58ed1f5a611e1a2ced3fa66a3adb"
JWT_REFRESH="d53b97b1171d8ae79ae146db37efaaa3c2a5188be7cd39a7b9012cafec2bf153"

echo "🚀 SANGATH DEPLOYMENT STARTING..."

# 1. System setup
echo "[1/6] Installing dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq docker.io docker-compose curl git wget > /dev/null 2>&1
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $(whoami)
echo "✅ Docker ready"

# 2. App directory
echo "[2/6] Setting up application..."
sudo mkdir -p $APP_DIR
sudo chown $(whoami):$(whoami) $APP_DIR
cd $APP_DIR
echo "✅ Directory: $APP_DIR"

# 3. Clone
echo "[3/6] Cloning repository..."
if [ ! -d ".git" ]; then
    git clone $REPO . > /dev/null 2>&1
else
    git pull origin main > /dev/null 2>&1
fi
echo "✅ Code ready"

# 4. Environment
echo "[4/6] Configuring environment..."
cat > .env << EOF
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sangath_ie_prod
DB_USER=sangath_user
DB_PASSWORD=$DB_PASS
NODE_ENV=production
API_PORT=5000
FRONTEND_URL=http://3.110.237.216
ADMIN_URL=http://3.110.237.216/admin
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASS
LOG_LEVEL=info
EOF
echo "✅ Environment configured"

# 5. Build
echo "[5/6] Building applications..."
npm ci -q > /dev/null 2>&1
npm run build > /dev/null 2>&1
cd src/admin && npm ci -q > /dev/null 2>&1 && npm run build > /dev/null 2>&1 && cd ../..
echo "✅ Build complete"

# 6. Deploy
echo "[6/6] Starting services..."
docker-compose -f docker-compose.prod.yml build > /dev/null 2>&1
docker-compose -f docker-compose.prod.yml down > /dev/null 2>&1
docker-compose -f docker-compose.prod.yml up -d > /dev/null 2>&1
sleep 20
echo "✅ Services started"

# Verify
echo ""
echo "╔════════════════════════════════════════╗"
echo "║     ✨ DEPLOYMENT COMPLETE ✨         ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📍 Access:"
echo "   • Main:  http://3.110.237.216"
echo "   • Admin: http://3.110.237.216/admin"
echo "   • API:   http://3.110.237.216/api"
echo ""
echo "🔑 Login:"
echo "   • Email:    $ADMIN_EMAIL"
echo "   • Password: $ADMIN_PASS"
echo ""
echo "📊 Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🎉 Live! Monitor logs with:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
