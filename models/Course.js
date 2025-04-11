const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['academic', 'coding'],
    required: true
  },
  content: [{
    title: String,
    type: {
      type: String,
      enum: ['lecture', 'assignment', 'quiz', 'resource', 'video'],
      required: true
    },
    content: String,
    attachments: [String],
    dueDate: Date,
    videoUrl: String,
    quizzes: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      points: Number
    }],
    isPublished: {
      type: Boolean,
      default: false
    },
    publishDate: Date
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attendance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  schedule: [{
    day: String,
    startTime: String,
    endTime: String,
    room: String,
    isOnline: {
      type: Boolean,
      default: false
    },
    meetingLink: String
  }],
  syllabus: {
    overview: String,
    objectives: [String],
    prerequisites: [String],
    gradingCriteria: [{
      component: String,
      weightage: Number
    }]
  },
  announcements: [{
    title: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  }],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link'],
      required: true
    },
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  semester: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  maxStudents: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'draft'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if course is full
courseSchema.virtual('isFull').get(function() {
  return this.students.length >= this.maxStudents;
});

// Method to calculate class average
courseSchema.methods.getClassAverage = async function() {
  const Assignment = mongoose.model('Assignment');
  const assignments = await Assignment.find({ _id: { $in: this.assignments } });
  
  let totalScore = 0;
  let totalPossible = 0;
  
  assignments.forEach(assignment => {
    assignment.submissions.forEach(submission => {
      totalScore += submission.totalScore || 0;
      totalPossible += assignment.totalPoints;
    });
  });
  
  return totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
};

// Method to get attendance statistics
courseSchema.methods.getAttendanceStats = async function() {
  const Attendance = mongoose.model('Attendance');
  const records = await Attendance.find({ _id: { $in: this.attendance } });
  
  const stats = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0
  };
  
  records.forEach(record => {
    record.students.forEach(student => {
      stats[student.status]++;
    });
  });
  
  return stats;
};

module.exports = mongoose.model('Course', courseSchema);