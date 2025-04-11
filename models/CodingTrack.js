const mongoose = require('mongoose');

const codingTrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['DSA', 'Web Dev', 'Python', 'Java'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  modules: [{
    title: String,
    description: String,
    content: String,
    order: Number,
    estimatedHours: Number,
    prerequisites: [String],
    learningObjectives: [String],
    resources: [{
      title: String,
      type: String,
      url: String
    }],
    problems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    }],
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    projectIdea: {
      title: String,
      description: String,
      requirements: [String],
      difficulty: String
    }
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      completedModules: [Number],
      completedProblems: [mongoose.Schema.Types.ObjectId],
      quizScores: [{
        moduleIndex: Number,
        score: Number,
        attempts: Number
      }],
      skillScore: Number,
      lastAccessed: Date,
      certificateEarned: Boolean,
      certificateUrl: String
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    }
  }],
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    averageCompletion: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalEnrollments: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  requirements: {
    prerequisites: [String],
    recommendedSkills: [String],
    technicalRequirements: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
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

// Update statistics when a new review is added
codingTrackSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    const totalRatings = this.reviews.length;
    const sumRatings = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.statistics.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
  }
  
  if (this.isModified('enrolledStudents')) {
    this.statistics.totalEnrollments = this.enrolledStudents.length;
    const completedStudents = this.enrolledStudents.filter(
      student => student.progress.certificateEarned
    ).length;
    this.statistics.completionRate = this.enrolledStudents.length > 0 
      ? (completedStudents / this.enrolledStudents.length) * 100 
      : 0;
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to get student progress
codingTrackSchema.methods.getStudentProgress = function(studentId) {
  const enrollment = this.enrolledStudents.find(
    e => e.student.toString() === studentId.toString()
  );
  
  if (!enrollment) return null;
  
  const totalModules = this.modules.length;
  const completedModules = enrollment.progress.completedModules.length;
  
  return {
    percentComplete: (completedModules / totalModules) * 100,
    completedModules,
    totalModules,
    quizScores: enrollment.progress.quizScores,
    skillScore: enrollment.progress.skillScore,
    certificateEarned: enrollment.progress.certificateEarned
  };
};

// Method to check if a student can access a module
codingTrackSchema.methods.canAccessModule = function(studentId, moduleIndex) {
  const enrollment = this.enrolledStudents.find(
    e => e.student.toString() === studentId.toString()
  );
  
  if (!enrollment) return false;
  
  // First module is always accessible
  if (moduleIndex === 0) return true;
  
  // Check if previous module is completed
  return enrollment.progress.completedModules.includes(moduleIndex - 1);
};

module.exports = mongoose.model('CodingTrack', codingTrackSchema);