const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { ethers } = require('ethers');
const { CONTRACT_ABI } = require('../utils/contractABI');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

router.post('/start/:questId', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    const user = await User.findOne({ walletAddress: req.walletAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingProgress = await Progress.findOne({
      userId: user._id,
      questId: parseInt(questId)
    });

    if (existingProgress) {
      return res.json(existingProgress);
    }

    const progress = await Progress.create({
      userId: user._id,
      questId: parseInt(questId),
      status: 'started'
    });

    res.json(progress);
  } catch (error) {
    console.error('Start quest error:', error);
    res.status(500).json({ error: 'Failed to start quest' });
  }
});

router.put('/update/:questId', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    const { stepId, completed } = req.body;
    
    const user = await User.findOne({ walletAddress: req.walletAddress });
    
    const progress = await Progress.findOneAndUpdate(
      { userId: user._id, questId: parseInt(questId) },
      {
        $push: {
          steps: {
            stepId,
            completed,
            completedAt: completed ? new Date() : undefined
          }
        },
        status: 'in_progress'
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

router.post('/complete/:questId', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    const { transactionHash } = req.body;
    
    const user = await User.findOne({ walletAddress: req.walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const questRewards = {
      1: 100,
      2: 150,
      3: 200,
      4: 250,
      5: 300
    };

    const xpReward = questRewards[questId] || 100;

    const progress = await Progress.findOneAndUpdate(
      { userId: user._id, questId: parseInt(questId) },
      {
        status: 'completed',
        completedAt: new Date(),
        transactionHash
      },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    await user.addQuestCompletion(parseInt(questId), xpReward);

    const achievementThresholds = [
      { xp: 100, id: 1 },
      { xp: 500, id: 2 },
      { xp: 1000, id: 3 },
      { xp: 2000, id: 4 }
    ];

    for (const threshold of achievementThresholds) {
      if (user.totalXP >= threshold.xp) {
        await user.addAchievement(threshold.id);
      }
    }

    res.json({
      progress,
      user: {
        totalXP: user.totalXP,
        newAchievements: user.achievements
      }
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progressList = await Progress.find({ userId: user._id });

    res.json({
      completedQuests: user.completedQuests,
      activeProgress: progressList.filter(p => p.status !== 'completed'),
      totalXP: user.totalXP,
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.get('/verify/:questId', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    
    if (!CONTRACT_ADDRESS) {
      return res.json({ 
        onChain: false, 
        inDatabase: false,
        message: 'Contract not deployed yet' 
      });
    }

    const provider = new ethers.JsonRpcProvider('https://api-unstable.shardeum.org/');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const onChainCompleted = await contract.hasCompletedQuest(req.walletAddress, questId);
    
    const user = await User.findOne({ walletAddress: req.walletAddress });
    const dbCompleted = user?.completedQuests.some(q => q.questId === parseInt(questId)) || false;

    res.json({
      onChain: onChainCompleted,
      inDatabase: dbCompleted,
      synced: onChainCompleted === dbCompleted
    });
  } catch (error) {
    console.error('Verify progress error:', error);
    res.status(500).json({ error: 'Failed to verify progress' });
  }
});

module.exports = router;