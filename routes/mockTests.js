const express = require('express');
const router = express.Router();
const MockTest = require('../models/MockTest');
const auth = require('../middleware/auth');

// Get all mock tests
router.get('/', auth, async (req, res) => {
  try {
    const mockTests = await MockTest.find({
      'eligibilityCriteria.semester': req.user.profile.semester
    });
    res.render('mockTests/index', { mockTests });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start mock test
router.post('/:id/start', auth, async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id);
    if (!mockTest) {
      return res.status(404).send('Mock test not found');
    }

    // Check eligibility
    if (mockTest.eligibilityCriteria.minCGPA > req.user.profile.cgpa) {
      return res.status(403).send('You do not meet the eligibility criteria');
    }

    // Add participant
    mockTest.participants.push({
      student: req.user._id,
      startTime: new Date()
    });
    await mockTest.save();

    res.redirect(`/mock-tests/${mockTest._id}/take`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Submit mock test
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const mockTest = await MockTest.findById(req.params.id);
    
    const participant = mockTest.participants.find(
      p => p.student.toString() === req.user._id.toString()
    );
    
    participant.answers = answers;
    participant.endTime = new Date();
    participant.totalScore = calculateScore(answers, mockTest.questions);
    
    await mockTest.save();
    res.redirect('/mock-tests/results');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;