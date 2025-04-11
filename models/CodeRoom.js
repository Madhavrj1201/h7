const mongoose = require('mongoose');

const codeRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    cursor: {
      line: Number,
      column: Number
    }
  }],
  code: {
    content: String,
    language: String,
    lastUpdated: Date,
    version: {
      type: Number,
      default: 1
    },
    history: [{
      content: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date
    }]
  },
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    type: {
      type: String,
      enum: ['text', 'code', 'system'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  aiAssistant: {
    enabled: {
      type: Boolean,
      default: true
    },
    suggestions: [{
      type: String,
      timestamp: Date,
      context: String,
      accepted: Boolean
    }]
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  settings: {
    maxParticipants: {
      type: Number,
      default: 5
    },
    allowViewers: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    saveInterval: {
      type: Number,
      default: 30
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if room is full
codeRoomSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.settings.maxParticipants;
});

// Method to add a code version to history
codeRoomSchema.methods.addToHistory = function(content, userId) {
  this.code.history.push({
    content,
    updatedBy: userId,
    timestamp: new Date()
  });
  this.code.version += 1;
  this.code.lastUpdated = new Date();
};

// Method to get active participants
codeRoomSchema.methods.getActiveParticipants = function() {
  return this.participants.filter(p => p.isActive);
};

module.exports = mongoose.model('CodeRoom', codeRoomSchema);