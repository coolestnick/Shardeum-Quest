const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      walletAddress: user.walletAddress,
      username: user.username,
      totalXP: user.totalXP,
      completedQuests: user.completedQuests,
      achievements: user.achievements,
      registeredAt: user.registeredAt,
      lastActiveAt: user.lastActiveAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (username && username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: req.walletAddress },
      { 
        username,
        lastActiveAt: new Date()
      },
      { new: true }
    );

    res.json({
      id: user._id,
      walletAddress: user.walletAddress,
      username: user.username
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const users = await User.find()
      .sort({ totalXP: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('walletAddress username totalXP completedQuests achievements');

    const total = await User.countDocuments();

    res.json({
      users: users.map((user, index) => ({
        rank: parseInt(offset) + index + 1,
        walletAddress: user.walletAddress,
        username: user.username || 'Anonymous',
        totalXP: user.totalXP,
        completedQuests: user.completedQuests.length,
        achievements: user.achievements.length
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalXP = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalXP' } } }
    ]);
    const topUser = await User.findOne().sort({ totalXP: -1 }).select('walletAddress username totalXP');

    res.json({
      totalUsers,
      totalXPEarned: totalXP[0]?.total || 0,
      topUser: topUser ? {
        walletAddress: topUser.walletAddress,
        username: topUser.username || 'Anonymous',
        totalXP: topUser.totalXP
      } : null
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;