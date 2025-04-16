#!/bin/bash

# Deployment script for Hockey Prediction App
# This script deploys the application code to the server

# Exit on error
set -e

# Configuration
APP_DIR="/var/www/hockey-prediction-app"
DOMAIN="malinon.cyou"
REPO_URL="https://github.com/yourusername/hockey-prediction-app.git"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
print_section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Check if APP_DIR exists
if [ ! -d "$APP_DIR" ]; then
  echo -e "${RED}Application directory $APP_DIR does not exist. Run setup-server.sh first.${NC}"
  exit 1
fi

# Clone or pull repository
print_section "Updating code from repository"
if [ -d "$APP_DIR/.git" ]; then
  echo "Git repository exists, pulling latest changes..."
  cd $APP_DIR
  git pull
else
  echo "Cloning repository..."
  # Clear directory but keep .env if it exists
  if [ -f "$APP_DIR/.env" ]; then
    mv "$APP_DIR/.env" /tmp/.env.backup
  fi
  rm -rf $APP_DIR/*
  if [ -f "/tmp/.env.backup" ]; then
    mv /tmp/.env.backup "$APP_DIR/.env"
  fi
  
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Install backend dependencies
print_section "Installing backend dependencies"
cd $APP_DIR/backend
npm install --production

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  print_section "Creating .env file"
  cp .env.example .env
  echo -e "${YELLOW}Please edit the .env file with your configuration:${NC}"
  echo "nano $APP_DIR/backend/.env"
fi

# Build frontend
print_section "Building frontend"
cd $APP_DIR/frontend
npm install
npm run build

# Set up PM2 for process management
print_section "Setting up PM2 process"
cd $APP_DIR/backend
pm2 delete hockey-app 2>/dev/null || true
pm2 start server.js --name hockey-app
pm2 save

# Final message
print_section "Deployment Complete"
echo -e "${GREEN}Hockey Prediction App has been deployed successfully!${NC}"
echo -e "Your application is now running at: https://$DOMAIN"
echo -e "\n${YELLOW}If this is your first deployment:${NC}"
echo "1. Make sure to configure your .env file with correct settings"
echo "2. Set up your MongoDB database with initial data if needed"
echo -e "\n${YELLOW}To monitor your application:${NC}"
echo "pm2 status"
echo "pm2 logs hockey-app"
