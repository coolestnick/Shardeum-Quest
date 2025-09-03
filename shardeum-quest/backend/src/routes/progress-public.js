const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');

// Get user progress by wallet address
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activeProgress = await Progress.find({
      userId: user._id,
      status: { $in: ['not_started', 'in_progress'] }
    }).select('questId status steps createdAt updatedAt');

    res.json({
      walletAddress: user.walletAddress,
      totalXP: user.totalXP,
      completedQuests: user.completedQuests,
      activeProgress: activeProgress
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get quest completion status
router.get('/quest/:questId/status', async (req, res) => {
  try {
    const { questId } = req.params;
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return res.json({
        completed: false,
        walletAddress: walletAddress.toLowerCase(),
        questId: parseInt(questId)
      });
    }

    const isCompleted = user.completedQuests.some(q => 
      q.questId === parseInt(questId)
    );

    res.json({
      completed: isCompleted,
      walletAddress: user.walletAddress,
      questId: parseInt(questId),
      xpEarned: isCompleted ? user.completedQuests.find(q => q.questId === parseInt(questId))?.xpEarned || 0 : 0
    });
  } catch (error) {
    console.error('Quest status error:', error);
    res.status(500).json({ error: 'Failed to check quest status' });
  }
});

// Get recent completions
router.get('/recent-completions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentCompletions = await User.aggregate([
      { $unwind: '$completedQuests' },
      { $sort: { 'completedQuests.completedAt': -1 } },
      { $limit: limit },
      {
        $project: {
          walletAddress: 1,
          username: 1,
          questId: '$completedQuests.questId',
          xpEarned: '$completedQuests.xpEarned',
          completedAt: '$completedQuests.completedAt'
        }
      }
    ]);

    res.json(recentCompletions);
  } catch (error) {
    console.error('Recent completions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent completions' });
  }
});

// Start quest with wallet address
router.post('/start/:questId', async (req, res) => {
  try {
    const { questId } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Get or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({ 
        walletAddress: walletAddress.toLowerCase(),
        totalXP: 0,
        completedQuests: []
      });
      await user.save();
    }

    // For now, we'll create a basic quest structure
    // In a full implementation, you'd fetch from a Quest model or external API
    const questSteps = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 }
    ]; // Default quest structure

    // Check if already started or completed
    const existingProgress = await Progress.findOne({
      userId: user._id,
      questId: parseInt(questId)
    });

    if (existingProgress) {
      return res.json(existingProgress);
    }

    // Check if quest is already completed
    const isCompleted = user.completedQuests.some(q => q.questId === parseInt(questId));
    if (isCompleted) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Create progress
    const progress = new Progress({
      userId: user._id,
      questId: parseInt(questId),
      status: 'in_progress',
      steps: questSteps.map(step => ({
        stepId: step.id,
        completed: false
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Start quest error:', error);
    res.status(500).json({ error: 'Failed to start quest' });
  }
});

// Update quest progress with wallet address
router.put('/update/:questId', async (req, res) => {
  try {
    const { questId } = req.params;
    const { walletAddress, stepId, completed } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = await Progress.findOne({
      userId: user._id,
      questId: parseInt(questId)
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Update step
    const step = progress.steps.find(s => s.stepId === stepId);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    step.completed = completed;
    progress.updatedAt = new Date();

    // Check if all steps are completed
    const allCompleted = progress.steps.every(s => s.completed);
    if (allCompleted) {
      progress.status = 'ready_for_completion';
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Complete quest with wallet address and blockchain verification
router.post('/complete/:questId', async (req, res) => {
  try {
    const { questId } = req.params;
    const { walletAddress, transactionHash, blockchainVerified } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if quest is already completed
    const isAlreadyCompleted = user.completedQuests.some(q => q.questId === parseInt(questId));
    if (isAlreadyCompleted) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Find and update progress
    const progress = await Progress.findOne({
      userId: user._id,
      questId: parseInt(questId)
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found. Please start the quest first.' });
    }

    // Mark progress as completed
    progress.status = 'completed';
    progress.completedAt = new Date();
    progress.transactionHash = transactionHash;
    progress.updatedAt = new Date();
    await progress.save();

    // Get the actual quest XP reward from quests data
    const questsData = [
      { id: 1, xpReward: 100 },
      { id: 2, xpReward: 150 },
      { id: 3, xpReward: 200 },
      { id: 4, xpReward: 250 },
      { id: 5, xpReward: 300 }
    ];
    
    const quest = questsData.find(q => q.id === parseInt(questId));
    const xpReward = quest ? quest.xpReward : 100; // Use actual quest XP or default to 100
    
    user.completedQuests.push({
      questId: parseInt(questId),
      completedAt: new Date(),
      xpEarned: xpReward,
      transactionHash: transactionHash
    });
    
    user.totalXP += xpReward;
    await user.save();

    res.json({
      message: 'Quest completed successfully',
      xpEarned: xpReward,
      totalXP: user.totalXP,
      transactionHash: transactionHash,
      completedAt: progress.completedAt
    });

  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

module.exports = router;