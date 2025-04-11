const moment = require('moment');
const User = require('../models/User');
const CronJob = require('cron').CronJob;

class StreakTracker {
  static async updateStreak(userId) {
    try {
      const user = await User.findById(userId);
      const today = moment().startOf('day');
      const lastActive = moment(user.profile.streaks.lastActive).startOf('day');
      
      if (lastActive.isSame(today)) {
        return; // Already updated today
      }

      if (lastActive.add(1, 'days').isSame(today)) {
        // Consecutive day
        user.profile.streaks.current += 1;
        user.profile.streaks.longest = Math.max(
          user.profile.streaks.current,
          user.profile.streaks.longest
        );
      } else {
        // Streak broken
        user.profile.streaks.current = 1;
      }

      user.profile.streaks.lastActive = today.toDate();
      await user.save();
    } catch (error) {
      console.error('Streak Update Error:', error);
    }
  }

  static initializeStreakReset() {
    // Reset streaks at midnight if user wasn't active
    new CronJob('0 0 * * *', async () => {
      try {
        const yesterday = moment().subtract(1, 'days').endOf('day');
        const users = await User.find({
          'profile.streaks.lastActive': { $lt: yesterday.toDate() }
        });

        for (const user of users) {
          user.profile.streaks.current = 0;
          await user.save();
        }
      } catch (error) {
        console.error('Streak Reset Error:', error);
      }
    }, null, true);
  }
}

module.exports = StreakTracker;