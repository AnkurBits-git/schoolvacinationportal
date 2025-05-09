const Drive = require('../models/Drive');
const { validationResult } = require('express-validator');

// Create a new vaccination drive
exports.createDrive = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if date is at least 15 days in the future
    const driveDate = new Date(req.body.date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);

    if (driveDate < minDate) {
      return res.status(400).json({ 
        message: 'Vaccination drive must be scheduled at least 15 days in advance' 
      });
    }

    // Check for scheduling conflicts
    const existingDrives = await Drive.find({
      date: { 
        $gte: new Date(driveDate.setHours(0, 0, 0, 0)),
        $lte: new Date(driveDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingDrives.length > 0) {
      return res.status(400).json({ 
        message: 'Another vaccination drive is already scheduled on this date' 
      });
    }

    const drive = new Drive(req.body);
    await drive.save();
    res.status(201).json(drive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all drives (upcoming by default)
exports.getAllDrives = async (req, res) => {
  try {
    const { past } = req.query;
    let query = {};

    if (!past || past === 'false') {
      query.date = { $gte: new Date() };
    } else {
      query.date = { $lt: new Date() };
    }

    const drives = await Drive.find(query).sort({ date: 1 });
    res.json(drives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single drive by ID
exports.getDriveById = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Vaccination drive not found' });
    }
    res.json(drive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a drive
exports.updateDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Vaccination drive not found' });
    }

    // Prevent editing of past drives
    if (new Date(drive.date) < new Date()) {
      return res.status(400).json({ 
        message: 'Cannot edit past vaccination drives' 
      });
    }

    // Check if date is being updated
    if (req.body.date && new Date(req.body.date) !== new Date(drive.date)) {
      const newDate = new Date(req.body.date);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 15);

      if (newDate < minDate) {
        return res.status(400).json({ 
          message: 'Vaccination drive must be scheduled at least 15 days in advance' 
        });
      }

      // Check for scheduling conflicts
      const existingDrives = await Drive.find({
        date: { 
          $gte: new Date(newDate.setHours(0, 0, 0, 0)),
          $lte: new Date(newDate.setHours(23, 59, 59, 999))
        },
        _id: { $ne: drive._id }
      });

      if (existingDrives.length > 0) {
        return res.status(400).json({ 
          message: 'Another vaccination drive is already scheduled on this date' 
        });
      }
    }

    const updatedDrive = await Drive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedDrive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a drive
exports.deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Vaccination drive not found' });
    }
    res.json({ message: 'Vaccination drive deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};