const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean,
    explanation: String,
    timeLimit: {
      type: Number,
      default: 1000 // milliseconds
    },
    memoryLimit: {
      type: Number,
      default: 256 // MB
    }
  }],
  solutions: [{
    language: String,
    code: String,
    isOfficial: Boolean,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performance: {
      runtime: Number,
      memory: Number
    },
    explanation: String,
    votes: {
      upvotes: [mongoose.Schema.Types.ObjectId],
      downvotes: [mongoose.Schema.Types.ObjectId]
    }
  }],
  hints: [{
    content: String,
    cost: Number // skill points required to unlock
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    code: String,
    language: String,
    status: {
      type: String,
      enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error']
    },
    runtime: Number,
    memory: Number,
    testCasesPassed: Number,
    score: Number,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  relatedProblems: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    relationship: String // e.g., 'similar', 'prerequisite', 'follow-up'
  }],
  statistics: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    averageRuntime: {
      type: Number,
      default: 0
    },
    averageMemory: {
      type: Number,
      default: 0
    },
    difficulty_rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  constraints: {
    timeLimit: {
      type: Number,
      default: 1000 // milliseconds
    },
    memoryLimit: {
      type: Number,
      default: 256 // MB
    },
    inputFormat: String,
    outputFormat: String,
    sampleInput: String,
    sampleOutput: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update statistics when a new submission is added
problemSchema.pre('save', function(next) {
  if (this.isModified('submissions')) {
    const totalSubs = this.submissions.length;
    const acceptedSubs = this.submissions.filter(s => s.status === 'accepted').length;
    
    this.statistics.totalSubmissions = totalSubs;
    this.statistics.acceptedSubmissions = acceptedSubs;
    
    // Update average runtime and memory for accepted submissions
    const acceptedSubmissions = this.submissions.filter(s => s.status === 'accepted');
    if (acceptedSubmissions.length > 0) {
      this.statistics.averageRuntime = acceptedSubmissions.reduce(
        (sum, sub) => sum + sub.runtime, 0
      ) / acceptedSubmissions.length;
      
      this.statistics.averageMemory = acceptedSubmissions.reduce(
        (sum, sub) => sum + sub.memory, 0
      ) / acceptedSubmissions.length;
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to check if a solution is correct
problemSchema.methods.checkSolution = function(code, language) {
  // This would integrate with the code execution service
  return {
    status: 'accepted',
    runtime: 100,
    memory: 50,
    testCasesPassed: this.testCases.length,
    score: 100
  };
};

// Method to get problem statistics for a student
problemSchema.methods.getStudentStats = function(studentId) {
  const studentSubmissions = this.submissions.filter(
    s => s.student.toString() === studentId.toString()
  );
  
  return {
    attempts: studentSubmissions.length,
    solved: studentSubmissions.some(s => s.status === 'accepted'),
    bestRuntime: Math.min(...studentSubmissions.map(s => s.runtime)),
    bestMemory: Math.min(...studentSubmissions.map(s => s.memory)),
    lastSubmission: studentSubmissions[studentSubmissions.length - 1]
  };
};

module.exports = mongoose.model('Problem', problemSchema);