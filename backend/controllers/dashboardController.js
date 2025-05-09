const Student = require('../models/Student');
const Drive = require('../models/Drive');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total students count
    const totalStudents = await Student.countDocuments();

    // Vaccinated students count and percentage
    const vaccinatedStudents = await Student.countDocuments({
      'vaccinations.0': { $exists: true }
    });
    const vaccinationPercentage = totalStudents > 0 
      ? Math.round((vaccinatedStudents / totalStudents) * 100) 
      : 0;

    // Upcoming drives (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDrives = await Drive.find({
      date: { 
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      }
    }).sort({ date: 1 }).limit(5);

    res.json({
      totalStudents,
      vaccinatedStudents,
      vaccinationPercentage,
      upcomingDrives
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};