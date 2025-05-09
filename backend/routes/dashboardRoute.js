const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewears/authMiddlewear');

// // Apply auth middleware to all routes
router.use(authMiddleware);

// Dashboard routes
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;