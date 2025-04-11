const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login - Campus Bridge',
    user: req.user 
  });
});

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'Register - Campus Bridge',
    user: req.user 
  });
});

// Handle login
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/auth/login',
  failureFlash: true
}),(req,res)=>{
  res.redirect("/dashboard");
});

// Handle register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      req.flash("error", "User already exists.");
      return res.redirect('/auth/register');
    }

    // Use passport-local-mongoose's .register()
    const newUser = new User({ username, email, role });
    const registeredUser = await User.register(newUser, password);

    console.log("Registered user:", registeredUser);
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash("error", "Registration failed. Try again.");
    res.redirect('/auth/register');
  }
});


// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;