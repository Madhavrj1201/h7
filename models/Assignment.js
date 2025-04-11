const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['academic', 'coding'],
    required: true
  },
  description: String,
  dueDate: Date,
  totalPoints: Number,
  testCases: [{
    input: String,
    expectedOutput: String,
    points: Number
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    code: String,
    language: String,
    testResults: [{
      passed: Boolean,
      output: String,
      points: Number
    }],
    totalScore: Number,
    feedback: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);