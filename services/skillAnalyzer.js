const User = require('../models/User');
const Problem = require('../models/Problem');
const Assignment = require('../models/Assignment');

class SkillAnalyzer {
  static async updateSkillHeatmap(userId, problemId = null, assignmentId = null) {
    try {
      const user = await User.findById(userId);
      let skillsToUpdate = new Set();

      if (problemId) {
        const problem = await Problem.findById(problemId);
        problem.tags.forEach(tag => skillsToUpdate.add(tag));
      }

      if (assignmentId) {
        const assignment = await Assignment.findById(assignmentId);
        if (assignment.type === 'coding') {
          assignment.testCases.forEach(test => {
            if (test.tags) {
              test.tags.forEach(tag => skillsToUpdate.add(tag));
            }
          });
        }
      }

      // Update skill levels
      for (const skill of user.profile.skills) {
        if (skillsToUpdate.has(skill.name)) {
          skill.level = Math.min(100, skill.level + 2);
          skill.lastUpdated = new Date();
        }
      }

      // Update weekly activity
      const currentWeek = new Date();
      currentWeek.setHours(0, 0, 0, 0);
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

      let weeklyActivity = user.profile.weeklyActivity.find(
        w => w.week.getTime() === currentWeek.getTime()
      );

      if (!weeklyActivity) {
        weeklyActivity = {
          week: currentWeek,
          problemsSolved: 0,
          hoursSpent: 0,
          skillsImproved: []
        };
        user.profile.weeklyActivity.push(weeklyActivity);
      }

      weeklyActivity.problemsSolved++;
      weeklyActivity.skillsImproved = [...new Set([...weeklyActivity.skillsImproved, ...skillsToUpdate])];

      await user.save();
      return user.profile.skills;
    } catch (error) {
      console.error('Skill Update Error:', error);
      throw error;
    }
  }

  static async generateSkillReport(userId) {
    try {
      const user = await User.findById(userId);
      const weeklyProgress = user.profile.weeklyActivity.slice(-4); // Last 4 weeks

      return {
        currentSkills: user.profile.skills,
        weeklyProgress,
        recommendations: await this.generateSkillRecommendations(user.profile.skills),
        badges: user.profile.badges,
        ranking: user.profile.codingStats.ranking
      };
    } catch (error) {
      console.error('Skill Report Error:', error);
      throw error;
    }
  }

  static async generateSkillRecommendations(skills) {
    // Sort skills by level to identify areas for improvement
    const sortedSkills = [...skills].sort((a, b) => a.level - b.level);
    const weakestSkills = sortedSkills.slice(0, 3);

    return weakestSkills.map(skill => ({
      skill: skill.name,
      currentLevel: skill.level,
      recommendedProblems: [], // Would be populated with actual problem recommendations
      suggestedResources: [], // Would be populated with learning resources
      targetLevel: Math.min(100, skill.level + 20)
    }));
  }
}

module.exports = SkillAnalyzer;