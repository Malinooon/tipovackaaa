// Placeholder file for config
// This file would contain database connection configuration in a real application
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/hockey-prediction',
  jwtSecret: process.env.JWT_SECRET || 'tajny_klic_pro_jwt_tokeny',
  jwtExpire: '24h'
};
