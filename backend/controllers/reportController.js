const Student = require('../models/Student');
const Drive = require('../models/Drive');
const { Parser } = require('json2csv');

exports.generateVaccinationReport = async (req, res) => {
  try {
    const { format = 'json', vaccineName } = req.query;
    let query = {};

    if (vaccineName) {
      query['vaccinations.vaccineName'] = vaccineName;
    }

    // Get students with their vaccination details
    const students = await Student.find(query)
      .populate('vaccinations.driveId', 'vaccineName date')
      .sort({ lastName: 1, firstName: 1 });

    // Format the data for response
    const reportData = students.map(student => {
      const baseInfo = {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        section: student.section,
        vaccinated: student.vaccinations.length > 0
      };

      if (student.vaccinations.length > 0) {
        return student.vaccinations.map(vaccination => ({
          ...baseInfo,
          vaccineName: vaccination.vaccineName,
          dateAdministered: vaccination.dateAdministered,
          driveDate: vaccination.driveId ? vaccination.driveId.date : null
        }));
      } else {
        return [{
          ...baseInfo,
          vaccineName: null,
          dateAdministered: null,
          driveDate: null
        }];
      }
    }).flat();

    if (format === 'csv') {
      const fields = [
        'studentId', 'firstName', 'lastName', 'grade', 'section',
        'vaccinated', 'vaccineName', 'dateAdministered', 'driveDate'
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(reportData);

      res.header('Content-Type', 'text/csv');
      res.attachment('vaccination_report.csv');
      return res.send(csv);
    } else {
      res.json(reportData);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};