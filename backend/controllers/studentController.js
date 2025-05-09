const Student = require('../models/Student');
const Drive = require('../models/Drive');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const { validationResult } = require('express-validator');

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all students with optional filters
exports.getAllStudents = async (req, res) => {
  try {
    const { name, grade, vaccinationStatus, vaccineName } = req.query;
    let query = {};

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    if (grade) {
      query.grade = grade;
    }

    if (vaccinationStatus === 'vaccinated') {
      query['vaccinations.0'] = { $exists: true };
    } else if (vaccinationStatus === 'not_vaccinated') {
      query.vaccinations = { $size: 0 };
    }

    if (vaccineName) {
      query['vaccinations.vaccineName'] = vaccineName;
    }

    const students = await Student.find(query).sort({ lastName: 1, firstName: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark student as vaccinated
exports.markAsVaccinated = async (req, res) => {
  try {
    const { vaccineName, dateAdministered, driveId } = req.body;
    
    // Check if drive exists
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: 'Vaccination drive not found' });
    }

    // Check if student is already vaccinated with the same vaccine
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const alreadyVaccinated = student.vaccinations.some(v => 
      v.vaccineName === vaccineName
    );

    if (alreadyVaccinated) {
      return res.status(400).json({ 
        message: 'Student already vaccinated with this vaccine' 
      });
    }

    // Add vaccination record
    student.vaccinations.push({
      vaccineName,
      dateAdministered: new Date(dateAdministered),
      driveId
    });

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import students from CSV
exports.bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const students = await Promise.all(
      records.map(async record => {
        const student = new Student({
          studentId: record.studentId,
          firstName: record.firstName,
          lastName: record.lastName,
          grade: record.grade,
          section: record.section,
          dateOfBirth: new Date(record.dateOfBirth),
          gender: record.gender
        });
        return await student.save();
      })
    );

    fs.unlinkSync(req.file.path); // Remove the temp file
    res.status(201).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};