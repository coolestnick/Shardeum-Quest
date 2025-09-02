const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins for now
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// MongoDB connection with serverless optimization
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    cachedConnection = connection;
    console.log('✅ MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  totalXP: { type: Number, default: 0 },
  completedQuests: [{ type: Number }],
  lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Quest data
const quests = [
  {
    id: 1,
    title: "Understanding Shardeum's Architecture",
    description: "Learn about Shardeum's innovative sharding technology and how it achieves linear scalability.",
    xpReward: 100,
    content: `# Understanding Shardeum's Architecture

Shardeum is an EVM-based Layer 1 blockchain that uses dynamic state sharding to achieve linear scalability.

## Key Features:
- **Dynamic State Sharding**: Unlike traditional sharding, Shardeum can process transactions across multiple shards
- **Linear Scalability**: More nodes = more TPS (transactions per second)
- **Low and Predictable Fees**: Maintaining low gas fees even with high network usage

## Learn More:
[Read the full article on Shardeum's Architecture](https://shardeum.org/blog/what-is-shardeum-architecture/)

## Why It Matters:
This architecture solves the blockchain trilemma by maintaining decentralization, security, and scalability simultaneously.`,
    link: "https://shardeum.org/blog/what-is-shardeum-architecture/"
  },
  {
    id: 2,
    title: "Exploring Shardeum's Consensus Mechanism",
    description: "Dive deep into how Shardeum achieves consensus across shards using innovative algorithms.",
    xpReward: 150,
    content: `# Exploring Shardeum's Consensus Mechanism

Shardeum uses a unique consensus mechanism that combines the best of both worlds: speed and security.

## How It Works:
- **Proof of Quorum (PoQ)**: Ensures rapid finality
- **Proof of Stake (PoS)**: Maintains network security
- **Cross-shard Communication**: Enables atomic transactions across shards

## Learn More:
[Discover Shardeum's Consensus Details](https://shardeum.org/blog/consensus-mechanism-proof-of-quorum/)

## Benefits:
- Instant finality
- High throughput
- Energy efficient`,
    link: "https://shardeum.org/blog/consensus-mechanism-proof-of-quorum/"
  },
  {
    id: 3,
    title: "Building on Shardeum: Developer Guide",
    description: "Learn how to deploy smart contracts and build dApps on Shardeum network.",
    xpReward: 200,
    content: `# Building on Shardeum: Developer Guide

Ready to build the next generation of dApps? Shardeum provides a familiar EVM environment with enhanced capabilities.

## Getting Started:
- **EVM Compatibility**: Use familiar tools like Hardhat, Remix, and MetaMask
- **Network Configuration**: Connect to Shardeum Testnet
- **Deploy Contracts**: Same as Ethereum, but with lower fees

## Learn More:
[Complete Developer Documentation](https://docs.shardeum.org/developers/getting-started)

## What You Can Build:
- DeFi protocols
- NFT marketplaces
- Gaming applications
- Social platforms`,
    link: "https://docs.shardeum.org/developers/getting-started"
  },
  {
    id: 4,
    title: "Shardeum Tokenomics and SHM",
    description: "Understand the economics behind Shardeum and the SHM token utility.",
    xpReward: 120,
    content: `# Shardeum Tokenomics and SHM

The SHM token powers the Shardeum ecosystem and incentivizes network participants.

## Token Utility:
- **Gas Fees**: Pay for transaction costs
- **Staking**: Secure the network and earn rewards
- **Governance**: Vote on network upgrades

## Learn More:
[Explore SHM Tokenomics](https://shardeum.org/blog/shardeum-tokenomics/)

## Distribution:
- Community rewards
- Developer incentives
- Network validators`,
    link: "https://shardeum.org/blog/shardeum-tokenomics/"
  },
  {
    id: 5,
    title: "The Future of Web3 with Shardeum",
    description: "Explore how Shardeum is shaping the future of decentralized applications and Web3.",
    xpReward: 180,
    content: `# The Future of Web3 with Shardeum

Shardeum is not just another blockchain - it's the foundation for the next generation of Web3 applications.

## Vision:
- **Mass Adoption**: Making blockchain accessible to everyone
- **Developer Friendly**: Familiar tools, enhanced capabilities  
- **Sustainable Growth**: Linear scalability without compromising decentralization

## Learn More:
[Shardeum's Vision for Web3](https://shardeum.org/blog/web3-future-with-shardeum/)

## Impact Areas:
- Financial inclusion
- Digital identity
- Supply chain transparency
- Creator economies`,
    link: "https://shardeum.org/blog/web3-future-with-shardeum/"
  }
];

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'Vercel Serverless'
  });
});

app.get('/api/quests', (req, res) => {
  res.json(quests);
});

app.get('/api/quests/:id', (req, res) => {
  const quest = quests.find(q => q.id === parseInt(req.params.id));
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }
  res.json(quest);
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        username: '',
        totalXP: 0,
        completedQuests: []
      });
      await user.save();
    }

    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { walletAddress: user.walletAddress, userId: user._id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        totalXP: user.totalXP,
        completedQuests: user.completedQuests
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      walletAddress: user.walletAddress,
      username: user.username,
      totalXP: user.totalXP,
      completedQuests: user.completedQuests
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    const { username } = req.body;
    
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username !== undefined) {
      user.username = username;
    }
    
    await user.save();

    res.json({
      walletAddress: user.walletAddress,
      username: user.username,
      totalXP: user.totalXP,
      completedQuests: user.completedQuests
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/leaderboard', async (req, res) => {
  try {
    await connectToDatabase();
    
    const users = await User.find({})
      .sort({ totalXP: -1 })
      .limit(10)
      .select('walletAddress username totalXP');

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      username: user.username || 'Anonymous',
      totalXP: user.totalXP
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/progress/user', authenticateToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      totalXP: user.totalXP,
      completedQuests: user.completedQuests
    });
  } catch (error) {
    console.error('User progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/progress/complete', authenticateToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    const { questId, txHash } = req.body;
    
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const quest = quests.find(q => q.id === parseInt(questId));
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if quest already completed
    if (user.completedQuests.includes(parseInt(questId))) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Add quest to completed and update XP
    user.completedQuests.push(parseInt(questId));
    user.totalXP += quest.xpReward;
    await user.save();

    res.json({
      success: true,
      newXP: user.totalXP,
      questReward: quest.xpReward,
      completedQuests: user.completedQuests
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// For serverless functions, export the app
module.exports = app;