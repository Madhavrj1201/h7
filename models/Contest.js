const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  problems: [{
    title: String,
    description: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    testCases: [{
      input: String,
      expectedOutput: String
    }],
    points: Number
  }],
  participants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submissions: [{
      problemIndex: Number,
      code: String,
      language: String,
      status: String,
      score: Number,
      submittedAt: Date
    }],
    totalScore: Number
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contest', contestSchema);