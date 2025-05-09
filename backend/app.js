const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoute');
const studentRoutes = require('./routes/studentRoute');
const driveRoutes = require('./routes/driveRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const reportRoutes = require('./routes/reportRoute');
const errorHandler = require('./middlewears/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;