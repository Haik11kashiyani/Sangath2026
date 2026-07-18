#!/bin/bash

# === SANGATH PRODUCTION DEPLOYMENT ===
# Run this on your Ubuntu/Debian server after SSH login
# This script automates the entire deployment process

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🚀 SANGATH PRODUCTION DEPLOYMENT    ║"
echo "╚════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# STEP 1: System Prerequisites
# ============================================
echo -e "\n${BLUE}[1/10] Installing system dependencies...${NC}"
sudo apt-get update
sudo apt-get install -y \
    docker.io \
    docker-compose \
    curl \
    git \
    wget \
    postgresql-client \
    htop

echo -e "${GREEN}✅ Dependencies installed${NC}"

# ============================================
# STEP 2: Start Docker
# ============================================
echo -e "\n${BLUE}[2/10] Starting Docker daemon...${NC}"
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

echo -e "${GREEN}✅ Docker started${NC}"

# ============================================
# STEP 3: Create app directory
# ============================================
echo -e "\n${BLUE}[3/10] Creating application directory...${NC}"
APP_DIR="/opt/sangath"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

echo -e "${GREEN}✅ Directory created: $APP_DIR${NC}"

# ============================================
# STEP 4: Clone repository
# ============================================
echo -e "\n${BLUE}[4/10] Cloning repository...${NC}"
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    # Update this URL with your actual repository
    git clone https://github.com/your-username/sangath.git .
fi

echo -e "${GREEN}✅ Repository cloned${NC}"

# ============================================
# STEP 5: Configure environment
# ============================================
echo -e "\n${BLUE}[5/10] Configuring environment variables...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.production .env
    
    echo -e "${RED}⚠️  IMPORTANT: Update .env with production values:${NC}"
    echo -e "   • DB_PASSWORD - Strong database password"
    echo -e "   • JWT_SECRET - Random 32+ char string (run: openssl rand -hex 32)"
    echo -e "   • JWT_REFRESH_SECRET - Random 32+ char string"
    echo -e "   • ADMIN_PASSWORD - Admin user password"
    echo -e "   • FRONTEND_URL - Your domain (https://yourdomain.com)"
    echo -e "   • ADMIN_URL - Admin domain (https://admin.yourdomain.com)"
    echo ""
    read -p "Press Enter to open .env editor (nano): " -n 1 -r
    nano .env
fi

echo -e "${GREEN}✅ Environment configured${NC}"

# ============================================
# STEP 6: Generate JWT Secrets
# ============================================
echo -e "\n${BLUE}[6/10] Verifying JWT secrets...${NC}"

if grep -q "change_me" .env; then
    echo -e "${YELLOW}Generating secure JWT secrets...${NC}"
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH=$(openssl rand -hex 32)
    
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH/" .env
    
    echo -e "${GREEN}✅ Secrets generated${NC}"
else
    echo -e "${GREEN}✅ Secrets already configured${NC}"
fi

# ============================================
# STEP 7: Build applications
# ============================================
echo -e "\n${BLUE}[7/10] Building applications...${NC}"

echo "Building frontend..."
npm ci
npm run build

echo "Building admin app..."
cd src/admin
npm ci
npm run build
cd /opt/sangath

echo -e "${GREEN}✅ Applications built${NC}"

# ============================================
# STEP 8: Build Docker images
# ============================================
echo -e "\n${BLUE}[8/10] Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${GREEN}✅ Docker images built${NC}"

# ============================================
# STEP 9: Start services
# ============================================
echo -e "\n${BLUE}[9/10] Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to initialize
echo "Waiting for database to be ready..."
sleep 15

echo -e "${GREEN}✅ Services started${NC}"

# ============================================
# STEP 10: Verify deployment
# ============================================
echo -e "\n${BLUE}[10/10] Verifying deployment...${NC}"

# Check database
echo -n "Database: "
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -q; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# Check backend
echo -n "Backend: "
if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

# Check frontend
echo -n "Frontend: "
if curl -s http://localhost/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⏳ Warming up...${NC}"
fi

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo ""
echo "╔════════════════════════════════════════╗"
echo "║       ✨ DEPLOYMENT SUCCESSFUL! ✨     ║"
echo "╚════════════════════════════════════════╝"

echo -e "\n${BLUE}📍 Service Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n${BLUE}🌐 Access Your Application:${NC}"
FRONTEND_URL=$(grep FRONTEND_URL .env | cut -d= -f2)
ADMIN_URL=$(grep ADMIN_URL .env | cut -d= -f2)
echo -e "   • Main Site:  ${FRONTEND_URL}"
echo -e "   • Admin Dashboard: ${ADMIN_URL}"
echo -e "   • API: ${FRONTEND_URL}/api"

echo -e "\n${BLUE}🔑 Login Credentials:${NC}"
ADMIN_EMAIL=$(grep ADMIN_EMAIL .env | cut -d= -f2)
echo -e "   • Email: ${ADMIN_EMAIL}"
echo -e "   • Password: [from .env ADMIN_PASSWORD]"

echo -e "\n${BLUE}📊 Useful Commands:${NC}"
echo "   # View all logs"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "   # View backend logs only"
echo "   docker-compose -f docker-compose.prod.yml logs backend -f"
echo ""
echo "   # Stop services"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
echo "   # Restart services"
echo "   docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "   # Check service status"
echo "   docker-compose -f docker-compose.prod.yml ps"

echo -e "\n${BLUE}🛡️ SSL/HTTPS Setup:${NC}"
echo "   1. Install Certbot: sudo apt-get install -y certbot python3-certbot-nginx"
echo "   2. Configure Nginx reverse proxy (optional, currently using Nginx container)"
echo "   3. Run: sudo certbot certonly --standalone -d yourdomain.com -d admin.yourdomain.com"
echo "   4. Add certificates to Nginx container volume"

echo -e "\n${GREEN}🚀 Deployment ready for production!${NC}\n"
