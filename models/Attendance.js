const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: {
      type: Date,
      default: Date.now
    },
    note: String,
    lateMinutes: Number,
    excused: {
      type: Boolean,
      default: false
    },
    excuseReason: String,
    excuseDocument: String
  }],
  type: {
    type: String,
    enum: ['regular', 'extra', 'makeup'],
    default: 'regular'
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  topic: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to calculate attendance percentage for a student
attendanceSchema.methods.getStudentAttendance = function(studentId) {
  const studentRecords = this.students.filter(
    record => record.student.toString() === studentId.toString()
  );
  
  if (!studentRecords.length) return 0;
  
  const present = studentRecords.filter(
    record => record.status === 'present' || record.status === 'late'
  ).length;
  
  return (present / studentRecords.length) * 100;
};

// Method to get daily attendance report
attendanceSchema.statics.getDailyReport = async function(courseId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    course: courseId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('students.student', 'profile.firstName profile.lastName');
};

module.exports = mongoose.model('Attendance', attendanceSchema);