#!/bin/bash

# Sangath CMS - VPS Deployment Script
# Usage: bash deploy.sh <server_ip> <username>

SERVER_IP=$1
USERNAME=${2:-devloper}
REMOTE_PATH="/var/www/sangath"

if [ -z "$SERVER_IP" ]; then
    echo "Usage: bash deploy.sh <server_ip> [username]"
    echo "Example: bash deploy.sh 3.110.237.216 devloper"
    exit 1
fi

echo "🚀 Deploying Sangath CMS to $SERVER_IP..."

# Build frontend
echo "📦 Building frontend..."
npm run build
npm run build:admin

# Sync files to server
echo "📤 Uploading files..."
ssh $USERNAME@$SERVER_IP "mkdir -p $REMOTE_PATH"
rsync -avz --delete dist/ $USERNAME@$SERVER_IP:$REMOTE_PATH/frontend/
rsync -avz server/ $USERNAME@$SERVER_IP:$REMOTE_PATH/api/ --exclude node_modules
rsync -avz .env.example $USERNAME@$SERVER_IP:$REMOTE_PATH/.env.example

# Setup on server
echo "⚙️  Setting up on server..."
ssh $USERNAME@$SERVER_IP << 'EOF'
cd /var/www/sangath

# Install backend dependencies
cd api
npm install --production
cd ..

# Setup .env if not exists
if [ ! -f api/.env ]; then
    cp .env.example api/.env
    echo "⚠️  Please edit api/.env with your configuration"
fi

# Initialize database (if PostgreSQL already installed)
# psql -U sangath_user -d sangath_db < api/migrations/schema.sql

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. SSH into server: ssh $USERNAME@$SERVER_IP"
echo "2. Edit configuration: nano /var/www/sangath/api/.env"
echo "3. Set up PostgreSQL if not already done"
echo "4. Configure reverse proxy (Nginx)"
echo "5. Install SSL certificate (Let's Encrypt)"
echo "6. Start services with PM2 or systemd"
EOF

echo "✅ Deployment complete!"
