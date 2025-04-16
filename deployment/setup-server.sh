#!/bin/bash

# Deployment script for Hockey Prediction App
# This script automates the deployment process on a Ubuntu server

# Exit on error
set -e

# Configuration
APP_DIR="/var/www/hockey-prediction-app"
DOMAIN="malinon.cyou"
NODE_VERSION="16"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
print_section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Update system
print_section "Updating system packages"
apt-get update
apt-get upgrade -y

# Install dependencies
print_section "Installing dependencies"
apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
  print_section "Installing Node.js"
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi

# Install MongoDB if not already installed
if ! command -v mongod &> /dev/null; then
  print_section "Installing MongoDB"
  apt-get install -y gnupg
  curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
  apt-get update
  apt-get install -y mongodb-org
  systemctl enable mongod
  systemctl start mongod
fi

# Create application directory
print_section "Setting up application directory"
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

# Configure Nginx
print_section "Configuring Nginx"
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Set up SSL with Certbot
print_section "Setting up SSL with Let's Encrypt"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up PM2 for process management
print_section "Setting up PM2"
npm install -g pm2
pm2 startup systemd

echo -e "\n${GREEN}Deployment environment setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone your repository to $APP_DIR"
echo "2. Set up your environment variables in .env file"
echo "3. Install dependencies and build the application"
echo "4. Start the application with PM2"
echo -e "\nSee DEPLOYMENT.md for detailed instructions."
