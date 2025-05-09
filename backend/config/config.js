require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/school_vaccination',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  adminCredentials: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
};