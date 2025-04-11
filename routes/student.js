const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Problem = require('../models/Problem');
const axios = require('axios');

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  res.redirect('/auth/login');
};

router.get('/courses',async (req,res)=>{
  res.render("student/courses.ejs");
})
// Student dashboard
router.get('/dashboard', isStudent, async (req, res) => {
  try {
    const enrolledCourses = await Course.find({
      students: req.user._id
    }).populate('instructor', 'profile.firstName profile.lastName');

    res.render('student/dashboard', {
      title: 'Student Dashboard - Campus Bridge',
      user: req.user,
      courses: enrolledCourses
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// View coding problems
router.get('/problems', isStudent, async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    let query = {};

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const problems = await Problem.find(query);
    res.render('student/problems', { problems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Open code editor for a problem
router.get('/problems/:id/solve', isStudent, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).send('Problem not found');
    }
    res.render('student/code-editor', { problem });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Run code
router.post('/code/run', isStudent, async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const problem = await Problem.findById(problemId);
    
    // Run code against test cases using Judge0 API
    const results = await Promise.all(problem.testCases.map(async testCase => {
      const submission = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', {
        source_code: code,
        language_id: getLanguageId(language),
        stdin: testCase.input
      }, {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      // Get submission result
      const result = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${submission.data.token}`, {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      return {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.data.stdout,
        passed: result.data.stdout.trim() === testCase.expectedOutput.trim()
      };
    }));

    res.json({ testCases: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

// Submit solution
router.post('/code/submit', isStudent, async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const problem = await Problem.findById(problemId);
    
    // Run against all test cases
    const results = await Promise.all(problem.testCases.map(async testCase => {
      const submission = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', {
        source_code: code,
        language_id: getLanguageId(language),
        stdin: testCase.input
      }, {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      return submission.data;
    }));

    // Save submission
    problem.submissions.push({
      student: req.user._id,
      code,
      language,
      status: allTestsPassed(results) ? 'Accepted' : 'Failed',
      submittedAt: new Date()
    });
    await problem.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

function getLanguageId(language) {
  const languageMap = {
    'javascript': 63,  // Node.js
    'python': 71,      // Python 3
    'java': 62,        // Java
    'cpp': 54         // C++
  };
  return languageMap[language] || 63;
}

function allTestsPassed(results) {
  return results.every(result => result.status.id === 3); // 3 = Accepted
}

module.exports = router;