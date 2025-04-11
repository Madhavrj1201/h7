const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['coding', 'aptitude', 'technical'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  questions: [{
    type: {
      type: String,
      enum: ['mcq', 'coding', 'descriptive'],
      required: true
    },
    question: String,
    options: [String], // for MCQs
    correctAnswer: String,
    points: Number,
    // For coding questions
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean
    }]
  }],
  scheduledFor: {
    type: Date,
    required: true
  },
  eligibilityCriteria: {
    minCGPA: Number,
    requiredSkills: [String],
    semester: Number
  },
  participants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    answers: [{
      questionIndex: Number,
      answer: String,
      code: String, // for coding questions
      language: String,
      score: Number
    }],
    totalScore: Number
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MockTest', mockTestSchema);