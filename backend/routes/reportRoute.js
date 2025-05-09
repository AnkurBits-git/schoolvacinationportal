const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewears/authMiddlewear');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Report routes
router.get('/vaccinations', reportController.generateVaccinationReport);

module.exports = router;