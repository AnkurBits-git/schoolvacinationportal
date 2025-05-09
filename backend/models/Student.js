const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  grade: { type: String, required: true },
  section: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  vaccinations: [{
    vaccineName: { type: String, required: true },
    dateAdministered: { type: Date, required: true },
    driveId: { type: Schema.Types.ObjectId, ref: 'Drive' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);