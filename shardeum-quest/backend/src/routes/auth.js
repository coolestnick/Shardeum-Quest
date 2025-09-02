const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifySignature, generateToken } = require('../middleware/auth');
const User = require('../models/User');

router.post('/login', verifySignature, async (req, res) => {
  try {
    const { walletAddress } = req;
    
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = await User.create({
        walletAddress,
        metadata: {
          browser: req.headers['user-agent'],
          referralSource: req.headers['referer']
        }
      });
    } else {
      user.lastActiveAt = new Date();
      await user.save();
    }

    const token = generateToken(walletAddress);
    
    res.json({
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        totalXP: user.totalXP,
        completedQuests: user.completedQuests.length,
        achievements: user.achievements.length
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/verify', async (req, res) => {
  const { token } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const user = await User.findOne({ walletAddress: decoded.walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        totalXP: user.totalXP
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;