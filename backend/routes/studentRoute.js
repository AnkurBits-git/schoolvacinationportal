const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { check } = require('express-validator');
const multer = require('multer');
const authMiddleware = require('../middlewears/authMiddlewear');

const upload = multer({ dest: 'uploads/' });

// Apply auth middleware to all routes
router.use(authMiddleware);

// Student routes
router.post('/', [
  check('studentId').not().isEmpty(),
  check('firstName').not().isEmpty(),
  check('lastName').not().isEmpty(),
  check('grade').not().isEmpty(),
  check('section').not().isEmpty(),
  check('dateOfBirth').isISO8601().toDate(),
  check('gender').isIn(['Male', 'Female', 'Other'])
], studentController.createStudent);

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Mark student as vaccinated
router.post('/:id/vaccinate', [
  check('vaccineName').not().isEmpty(),
  check('dateAdministered').isISO8601().toDate(),
  check('driveId').not().isEmpty()
], studentController.markAsVaccinated);

// Bulk import students
router.post('/bulk-import', upload.single('file'), studentController.bulkImportStudents);

module.exports = router;