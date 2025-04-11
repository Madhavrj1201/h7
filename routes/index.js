const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Campus Bridge',
    user: req.user 
  });
});

// Add mock tests routes
router.use('/mock-tests', require('./mockTests'));

module.exports = router;