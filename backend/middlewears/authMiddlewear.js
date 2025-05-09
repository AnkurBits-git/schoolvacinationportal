const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  jwt.verify(token.split(' ')[1], config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to authenticate token' 
      });
    }
    
    // Add user to request
    req.user = decoded;
    next();
  });
};