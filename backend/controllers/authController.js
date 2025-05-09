const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

exports.login = (req, res) => {
  const { username, password } = req.body;
  
  // Hardcoded admin credentials (for simulation)
  if (username === config.adminCredentials.username && 
      password === config.adminCredentials.password) {
    
    // Create token
    const token = jwt.sign(
      { username: username, role: 'admin' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    return res.json({
      success: true,
      token: token,
      user: { username: username, role: 'admin' }
    });
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid credentials' 
  });
};

exports.verifyToken = (req, res) => {
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
    
    return res.json({ 
      success: true, 
      user: decoded 
    });
  });
};