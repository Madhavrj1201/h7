const mongoose = require('mongoose');

const skillHeatmapSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [{
    category: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    experience: {
      problemsSolved: Number,
      projectsCompleted: Number,
      hoursSpent: Number
    },
    lastPracticed: Date,
    growth: [{
      date: Date,
      level: Number,
      change: Number
    }],
    badges: [{
      name: String,
      description: String,
      earnedAt: Date,
      icon: String
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  weeklyActivity: [{
    week: Date,
    problemsSolved: Number,
    hoursSpent: Number,
    skillsImproved: [String],
    streakMaintained: Boolean,
    challengesCompleted: Number
  }],
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActive: Date,
    history: [{
      startDate: Date,
      endDate: Date,
      duration: Number
    }]
  },
  achievements: [{
    title: String,
    description: String,
    category: String,
    earnedAt: Date,
    icon: String,
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary']
    }
  }],
  recommendations: [{
    skill: String,
    level: String,
    suggestedProblems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    }],
    resources: [{
      title: String,
      type: String,
      url: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    totalProblemsSolved: {
      type: Number,
      default: 0
    },
    averageSkillLevel: {
      type: Number,
      default: 0
    },
    mostPracticedSkill: String,
    weakestSkill: String,
    learningRate: Number,
    lastUpdated: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update analytics when skills are modified
skillHeatmapSchema.pre('save', function(next) {
  if (this.isModified('skills')) {
    // Update average skill level
    const totalLevel = this.skills.reduce((sum, skill) => sum + skill.level, 0);
    this.analytics.averageSkillLevel = this.skills.length > 0 
      ? totalLevel / this.skills.length 
      : 0;
    
    // Find most practiced and weakest skills
    let mostPracticed = { problemsSolved: 0 };
    let weakest = { level: 100 };
    
    this.skills.forEach(skill => {
      if (skill.experience.problemsSolved > mostPracticed.problemsSolved) {
        mostPracticed = skill;
      }
      if (skill.level < weakest.level) {
        weakest = skill;
      }
    });
    
    this.analytics.mostPracticedSkill = mostPracticed.name;
    this.analytics.weakestSkill = weakest.name;
    this.analytics.lastUpdated = new Date();
  }
  next();
});

// Method to update streak
skillHeatmapSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = this.streaks.lastActive;
  
  if (!lastActive) {
    this.streaks.current = 1;
  } else {
    const daysSinceLastActive = Math.floor(
      (today - lastActive) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastActive <= 1) {
      this.streaks.current += 1;
      this.streaks.longest = Math.max(this.streaks.current, this.streaks.longest);
    } else {
      // Streak broken, record it in history
      if (this.streaks.current > 0) {
        this.streaks.history.push({
          startDate: new Date(lastActive.getTime() - (this.streaks.current - 1) * 24 * 60 * 60 * 1000),
          endDate: lastActive,
          duration: this.streaks.current
        });
      }
      this.streaks.current = 1;
    }
  }
  
  this.streaks.lastActive = today;
};

// Method to get skill recommendations
skillHeatmapSchema.methods.getRecommendations = async function() {
  const Problem = mongoose.model('Problem');
  const recommendations = [];
  
  for (const skill of this.skills) {
    if (skill.level < 70) { // Focus on skills below 70%
      const suggestedProblems = await Problem.find({
        category: skill.category,
        difficulty: skill.level < 30 ? 'easy' : 'medium',
        _id: { $nin: skill.experience.problemsSolved }
      }).limit(3);
      
      recommendations.push({
        skill: skill.name,
        level: skill.level,
        suggestedProblems,
        resources: [
          {
            title: `${skill.name} Fundamentals`,
            type: 'course',
            url: `/tracks/${skill.category.toLowerCase()}`
          }
        ]
      });
    }
  }
  
  this.recommendations = recommendations;
  return recommendations;
};

module.exports = mongoose.model('SkillHeatmap', skillHeatmapSchema);