const express = require('express');
const router = express.Router();
const AIAssistant = require('../services/aiAssistant');
const auth = require('../middleware/auth');

// Get code hints
router.post('/hints', auth, async (req, res) => {
  try {
    const { code, language, context } = req.body;
    const hints = await AIAssistant.getCodeHints(code, language, context);
    res.json({ hints });
  } catch (error) {
    console.error('Code Hints Error:', error);
    res.status(500).json({ error: 'Failed to generate hints' });
  }
});

// Get code review
router.post('/review', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const review = await AIAssistant.reviewCode(code, language);
    res.json({ review });
  } catch (error) {
    console.error('Code Review Error:', error);
    res.status(500).json({ error: 'Failed to review code' });
  }
});

// Get job matches
router.get('/job-match', auth, async (req, res) => {
  try {
    const userSkills = req.user.profile.skills;
    const matches = await AIAssistant.matchJobProfile(userSkills);
    res.json({ matches });
  } catch (error) {
    console.error('Job Match Error:', error);
    res.status(500).json({ error: 'Failed to generate job matches' });
  }
});

module.exports = router;