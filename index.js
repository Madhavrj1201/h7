const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const User = require("./models/User.js");
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const StreakTracker = require('./services/streakTracker');
const flash = require('connect-flash'); // ✅ You need to require this *before* using it
require('dotenv').config();
const LocalStrategy = require("passport-local");


const app = express(); // ❌ You used `app.use(...)` before declaring `app`, moved it below
const server = http.createServer(app);
const io = socketIO(server);

const MONGO_URL = "mongodb+srv://madhavvelu:Madhav1201@cluster0.jrmvp4q.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
async function main() {
  await mongoose.connect(MONGO_URL);
}
main().then(() => {
  console.log("Connected to DB");
}).catch(err => console.log(err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URL }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Socket.IO for Code Rooms
io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('codeChange', (data) => {
    socket.to(data.roomId).emit('codeUpdate', data.code);
  });

  socket.on('chatMessage', (data) => {
    io.to(data.roomId).emit('message', {
      user: data.user,
      message: data.message,
      timestamp: new Date()
    });
  });
});

// Activity tracking middleware
app.use(async (req, res, next) => {
  if (req.user) {
    await StreakTracker.updateStreak(req.user._id);
  }
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/student', require('./routes/student'));
app.use('/faculty', require('./routes/faculty'));
app.use('/admin', require('./routes/admin'));
app.use('/ai', require('./routes/ai'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
