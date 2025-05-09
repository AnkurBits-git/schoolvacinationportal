const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const { check } = require('express-validator');
const authMiddleware = require('../middlewears/authMiddlewear');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Drive routes
router.post('/', [
  check('vaccineName').not().isEmpty(),
  check('date').isISO8601().toDate(),
  check('availableDoses').isInt({ min: 1 }),
  check('applicableGrades').isArray({ min: 1 })
], driveController.createDrive);

router.get('/', driveController.getAllDrives);
router.get('/:id', driveController.getDriveById);
router.put('/:id', driveController.updateDrive);
router.delete('/:id', driveController.deleteDrive);

module.exports = router;