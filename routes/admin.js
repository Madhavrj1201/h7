const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Contest = require('../models/Contest');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
};

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const stats = {
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalFaculty: await User.countDocuments({ role: 'faculty' }),
      totalCourses: await Course.countDocuments(),
      activeContests: await Contest.countDocuments({ status: 'active' })
    };

    const topPerformers = await User.find({ role: 'student' })
      .sort('-profile.skillScore')
      .limit(10);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: stats,
      topPerformers: topPerformers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create coding contest
router.post('/contests/new', isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate, problems } = req.body;
    
    const contest = new Contest({
      title,
      description,
      startDate,
      endDate,
      problems: JSON.parse(problems)
    });

    await contest.save();
    res.redirect('/admin/contests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Generate performance reports
router.get('/reports/generate', isAdmin, async (req, res) => {
  try {
    const { type, dateRange } = req.query;
    
    let reportData;
    switch(type) {
      case 'academic':
        reportData = await generateAcademicReport(dateRange);
        break;
      case 'coding':
        reportData = await generateCodingReport(dateRange);
        break;
      case 'placement':
        reportData = await generatePlacementReport(dateRange);
        break;
      default:
        throw new Error('Invalid report type');
    }

    res.json(reportData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Report generation failed' });
  }
});

module.exports = router;