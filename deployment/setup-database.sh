#!/bin/bash

# Database setup script for Hockey Prediction App
# This script sets up the MongoDB database for the application

# Exit on error
set -e

# Configuration
APP_DIR="/var/www/hockey-prediction-app"
DB_NAME="hockey-prediction"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print section header
print_section() {
  echo -e "\n${YELLOW}==== $1 ====${NC}\n"
}

# Check if MongoDB is running
if ! systemctl is-active --quiet mongod; then
  echo -e "${RED}MongoDB is not running. Please start it with: sudo systemctl start mongod${NC}"
  exit 1
fi

# Create database if it doesn't exist
print_section "Setting up MongoDB database"
mongo --eval "if (db.getMongo().getDBNames().indexOf('$DB_NAME') < 0) { db.getSiblingDB('$DB_NAME'); print('Database $DB_NAME created'); } else { print('Database $DB_NAME already exists'); }"

# Create admin user if needed
print_section "Creating admin user"
cd $APP_DIR/backend
node << EOF
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/$DB_NAME');
    
    const User = require('./models/User');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ isAdmin: true });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      isAdmin: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('IMPORTANT: Change this password immediately after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
EOF

# Final message
print_section "Database Setup Complete"
echo -e "${GREEN}MongoDB database has been set up successfully!${NC}"
echo -e "\n${YELLOW}Default admin credentials:${NC}"
echo "Email: admin@example.com"
echo "Password: admin123"
echo -e "${RED}IMPORTANT: Change this password immediately after first login!${NC}"
