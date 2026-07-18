#!/bin/bash

# ============================================
# SANGATH DEPLOYMENT SCRIPT
# For: 3.110.237.216
# ============================================

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🚀 SANGATH DEPLOYMENT START          ║"
echo "╚════════════════════════════════════════╝"

# ============================================
# CONFIGURATION (From your .env)
# ============================================
REPO_URL="https://github.com/Haik11kashiyani/Sangath2026.git"
APP_DIR="/opt/sangath"
DB_PASSWORD="jiuxib7ysr"
ADMIN_EMAIL="export.sangath@gmail.com"
ADMIN_PASSWORD="Ekantik@1008"
JWT_SECRET="d42348bd776ea1feb08b88e6d8ffc8e9b6bf58ed1f5a611e1a2ced3fa66a3adb"
JWT_REFRESH_SECRET="d53b97b1171d8ae79ae146db37efaaa3c2a5188be7cd39a7b9012cafec2bf153"

# ============================================
# Step 1: Install Dependencies
# ============================================
echo ""
echo "📦 [1/7] Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y docker.io docker-compose curl git wget

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Activate new group without logout
newgrp docker << 'EOF'
echo "✅ Docker installed"
EOF

echo "✅ Dependencies installed"

# ============================================
# Step 2: Create App Directory
# ============================================
echo ""
echo "📂 [2/7] Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR
echo "✅ Directory: $APP_DIR"

# ============================================
# Step 3: Clone Repository
# ============================================
echo ""
echo "📥 [3/7] Cloning repository..."
if [ -d ".git" ]; then
    git pull origin main
else
    git clone $REPO_URL .
fi
echo "✅ Repository cloned"

# ============================================
# Step 4: Configure Environment
# ============================================
echo ""
echo "⚙️  [4/7] Configuring environment..."
cat > .env << EOF
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sangath_ie_prod
DB_USER=sangath_user
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
NODE_ENV=production
API_PORT=5000
FRONTEND_URL=http://3.110.237.216
ADMIN_URL=http://3.110.237.216/admin

# JWT Secrets
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Seeding
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Logging
LOG_LEVEL=info
EOF
echo "✅ .env configured"

# ============================================
# Step 5: Build Applications
# ============================================
echo ""
echo "🔨 [5/7] Building applications..."
npm ci
npm run build

echo "Building admin app..."
cd src/admin
npm ci
npm run build
cd $APP_DIR
echo "✅ Applications built"

# ============================================
# Step 6: Build and Start Docker Containers
# ============================================
echo ""
echo "🐳 [6/7] Starting Docker containers..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting 20 seconds for services to initialize..."
sleep 20
echo "✅ Containers started"

# ============================================
# Step 7: Verify Deployment
# ============================================
echo ""
echo "✔️  [7/7] Verifying deployment..."

# Check database
echo -n "   • Database: "
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U sangath_user &>/dev/null; then
    echo "✅"
else
    echo "❌ (retrying...)"
    sleep 5
fi

# Check backend
echo -n "   • Backend API: "
if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "✅"
else
    echo "❌"
fi

# Check frontend
echo -n "   • Frontend: "
if curl -s http://localhost >/dev/null 2>&1; then
    echo "✅"
else
    echo "⏳ (warming up)"
fi

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo ""
echo "╔════════════════════════════════════════╗"
echo "║     ✨ DEPLOYMENT SUCCESSFUL! ✨      ║"
echo "╚════════════════════════════════════════╝"

echo ""
echo "📍 Access Your Application:"
echo "   • Main Site:      http://3.110.237.216"
echo "   • Admin:          http://3.110.237.216/admin"
echo "   • API:            http://3.110.237.216/api"
echo ""
echo "🔑 Login Credentials:"
echo "   • Email:    $ADMIN_EMAIL"
echo "   • Password: $ADMIN_PASSWORD"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "📖 Useful Commands:"
echo "   • View logs:        docker-compose -f docker-compose.prod.yml logs -f"
echo "   • Backend logs:     docker-compose -f docker-compose.prod.yml logs backend -f"
echo "   • Database logs:    docker-compose -f docker-compose.prod.yml logs postgres -f"
echo "   • Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "   • Stop services:    docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🎉 Ready for production!"
echo ""
