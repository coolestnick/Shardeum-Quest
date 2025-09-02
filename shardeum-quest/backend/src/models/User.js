const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  totalXP: {
    type: Number,
    default: 0
  },
  completedQuests: [{
    questId: Number,
    completedAt: {
      type: Date,
      default: Date.now
    },
    xpEarned: Number
  }],
  achievements: [{
    achievementId: Number,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    browser: String,
    referralSource: String
  }
}, {
  timestamps: true
});

userSchema.methods.addQuestCompletion = async function(questId, xpEarned) {
  this.completedQuests.push({ questId, xpEarned });
  this.totalXP += xpEarned;
  this.lastActiveAt = new Date();
  return this.save();
};

userSchema.methods.addAchievement = async function(achievementId) {
  const exists = this.achievements.some(a => a.achievementId === achievementId);
  if (!exists) {
    this.achievements.push({ achievementId });
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('User', userSchema);