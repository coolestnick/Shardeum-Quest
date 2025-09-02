const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage for demo
const users = new Map();
const userProgress = new Map();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Sample quests data with real Shardeum blog links
const quests = [
  {
    id: 1,
    title: "Welcome to DeFi on Shardeum",
    description: "Learn DeFi basics and understand Shardeum's role in decentralized finance",
    xpReward: 100,
    steps: [
      { id: "defi-basics", title: "Read: What Is Decentralized Finance? The Basics of DeFi" },
      { id: "shardeum-intro", title: "Read: What is Shardeum?" },
      { id: "complete", title: "Complete the welcome quest" }
    ]
  },
  {
    id: 2,
    title: "ERC-20 Token Expert",
    description: "Master ERC-20 tokens and learn to deploy them on Shardeum",
    xpReward: 150,
    steps: [
      { id: "erc20-docs", title: "Read: ERC-20 Token Standard Documentation" },
      { id: "token-deployment", title: "Read: How to Deploy ERC-20 Smart Contracts using Truffle" },
      { id: "mint-crypto", title: "Read: How to Mint Your Cryptocurrency on Shardeum Testnet" }
    ]
  },
  {
    id: 3,
    title: "DeFi Vault Builder",
    description: "Learn to build and deploy DeFi vaults for token staking",
    xpReward: 200,
    steps: [
      { id: "vault-tutorial", title: "Read: Build and Deploy an ERC20 Vault on Shardeum" },
      { id: "bank-contract", title: "Read: How to Deploy a Bank Smart Contract Using Solidity" },
      { id: "defi-protocols", title: "Understand DeFi lending and borrowing protocols" }
    ]
  },
  {
    id: 4,
    title: "Multi-Token Standards Master",
    description: "Explore advanced token standards beyond ERC-20",
    xpReward: 250,
    steps: [
      { id: "erc721-docs", title: "Read: ERC-721 Token Standard Documentation" },
      { id: "erc1155-guide", title: "Read: What is ERC-1155?" },
      { id: "nft-contracts", title: "Explore NFT smart contract deployment" }
    ]
  },
  {
    id: 5,
    title: "Web3 Career Strategist",
    description: "Understand career opportunities in the Web3 and DeFi space",
    xpReward: 300,
    steps: [
      { id: "web3-careers", title: "Read: Career Opportunities in Web3 - A Detailed Guide" },
      { id: "developer-path", title: "Explore blockchain developer career paths" },
      { id: "portfolio", title: "Plan your Web3 learning portfolio" }
    ]
  }
];

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { message, signature, address } = req.body;
    
    if (!message || !signature || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Create or get user
    let user = users.get(address.toLowerCase()) || {
      walletAddress: address.toLowerCase(),
      totalXP: 0,
      completedQuests: [],
      achievements: [],
      registeredAt: new Date()
    };
    
    users.set(address.toLowerCase(), user);

    const token = 'demo-token-' + address.toLowerCase();
    
    res.json({
      token,
      user: {
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

// Quest endpoints
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

app.get('/api/quests/:id/content', (req, res) => {
  const questContent = {
    1: {
      content: `# Welcome to DeFi on Shardeum!

## 📖 Reading Materials

### Step 1: Learn DeFi Basics
**[What Is Decentralized Finance? The Basics of DeFi](https://shardeum.org/blog/basics-of-defi/)**
- Understand what DeFi is and how it works
- Learn about decentralized financial products and services
- Explore the benefits of blockchain-based finance

### Step 2: Discover Shardeum
**[What is Shardeum?](https://shardeum.org/blog/what-is-shardeum/)**
- Learn about Shardeum's unique sharding technology
- Understand EVM compatibility and scalability
- Discover why Shardeum is ideal for DeFi applications

## 🎯 Quest Objectives
✅ Read both blog posts thoroughly  
✅ Understand DeFi fundamentals  
✅ Learn about Shardeum's advantages for DeFi  
✅ Complete all reading steps to earn 100 XP!`,
    },
    2: {
      content: `# Master ERC-20 Tokens on Shardeum

## 📖 Reading Materials

### Step 1: ERC-20 Standard Documentation
**[ERC-20 Token Standard](https://docs.shardeum.org/docs/developer/smart-contracts/tokens/erc-20)**
- Learn the ERC-20 token standard specifications
- Understand token functions and implementation
- Explore smart contract best practices

### Step 2: Deploy ERC-20 Contracts
**[How to Deploy ERC-20 Smart Contracts using Truffle](https://shardeum.org/blog/how-to-deploy-erc20-smart-contracts-on-shardeum-using-truffle/)**
- Step-by-step deployment guide
- Learn to use Truffle development framework
- Connect with Shardeum testnet

### Step 3: Create Your Own Token
**[How to Mint Your Cryptocurrency on Shardeum Testnet](https://shardeum.org/blog/how-to-mint-your-cryptocurrency-on-shardeum-testnet/)**
- Create and deploy your own ERC-20 token
- Use Remix IDE for development
- Test on Shardeum testnet

## 🎯 Quest Objectives
✅ Master ERC-20 token concepts  
✅ Learn deployment tools and processes  
✅ Understand token creation workflow  
✅ Complete all reading steps to earn 150 XP!`,
    },
    3: {
      content: `# Build DeFi Vaults and Banking Protocols

## 📖 Reading Materials

### Step 1: DeFi Vault Development
**[Build and Deploy an ERC20 Vault on Shardeum](https://shardeum.org/blog/build-and-deploy-an-erc20-vault-on-shardeum/)**
- Learn to create decentralized staking vaults
- Understand yield generation strategies
- Implement profit distribution mechanisms

### Step 2: Banking Smart Contracts
**[How to Deploy a Bank Smart Contract Using Solidity](https://shardeum.org/blog/how-to-deploy-bank-smart-contracts-using-solidity/)**
- Build lending and borrowing protocols
- Implement deposit and withdrawal functions
- Create DeFi banking applications

### Step 3: DeFi Protocol Concepts
**Understanding DeFi Protocols**
- Learn about lending and borrowing mechanisms
- Explore yield farming strategies
- Understand liquidity provision

## 🎯 Quest Objectives
✅ Master DeFi vault architecture  
✅ Learn banking smart contract development  
✅ Understand lending/borrowing protocols  
✅ Complete all reading steps to earn 200 XP!`,
    },
    4: {
      content: `# Explore Advanced Token Standards

## 📖 Reading Materials

### Step 1: NFT Standard (ERC-721)
**[ERC-721 Token Standard](https://docs.shardeum.org/docs/developer/smart-contracts/tokens/erc-721)**
- Learn about Non-Fungible Token standards
- Understand unique token properties
- Explore NFT use cases and applications

### Step 2: Multi-Token Standard (ERC-1155)
**[What is ERC-1155?](https://shardeum.org/blog/what-is-erc-1155/)**
- Discover the multi-token standard
- Learn about batch operations
- Understand fungible and non-fungible token mixing

### Step 3: Advanced Implementation
**NFT Smart Contract Deployment**
- Explore advanced token contract patterns
- Learn about token metadata and storage
- Understand marketplace integration

## 🎯 Quest Objectives
✅ Master ERC-721 NFT standards  
✅ Learn ERC-1155 multi-token concepts  
✅ Understand advanced token implementations  
✅ Complete all reading steps to earn 250 XP!`,
    },
    5: {
      content: `# Plan Your Web3 Career Journey

## 📖 Reading Materials

### Step 1: Web3 Career Guide
**[Career Opportunities in Web3 - A Detailed Guide](https://shardeum.org/blog/career-in-web3/)**
- Explore various Web3 career paths
- Understand required skills and qualifications
- Learn about blockchain industry opportunities

### Step 2: Developer Path Planning
**Blockchain Developer Career Paths**
- Smart contract development roles
- DeFi protocol engineering
- Frontend dApp development
- DevOps and infrastructure roles

### Step 3: Build Your Portfolio
**Web3 Learning Portfolio**
- Plan your skill development roadmap
- Identify key technologies to master
- Create projects to showcase your abilities

## 🎯 Quest Objectives
✅ Understand Web3 career landscape  
✅ Plan your development path  
✅ Design your learning portfolio  
✅ Complete all reading steps to earn 300 XP!`,
    }
  };

  const content = questContent[req.params.id] || { content: 'Content not available for this quest yet.' };
  res.json(content);
});

// Progress endpoints
app.post('/api/progress/start/:questId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const address = token.replace('demo-token-', '');
  const questId = parseInt(req.params.questId);
  
  const progressKey = `${address}-${questId}`;
  const progress = {
    questId,
    status: 'started',
    steps: [],
    startedAt: new Date()
  };
  
  userProgress.set(progressKey, progress);
  res.json(progress);
});

app.put('/api/progress/update/:questId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const address = token.replace('demo-token-', '');
  const questId = parseInt(req.params.questId);
  const { stepId, completed } = req.body;
  
  const progressKey = `${address}-${questId}`;
  let progress = userProgress.get(progressKey) || { questId, status: 'in_progress', steps: [] };
  
  progress.steps.push({ stepId, completed, completedAt: completed ? new Date() : undefined });
  userProgress.set(progressKey, progress);
  
  res.json(progress);
});

app.post('/api/progress/complete/:questId', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const address = token.replace('demo-token-', '');
  const questId = parseInt(req.params.questId);
  const { transactionHash, blockchainVerified } = req.body;
  
  const user = users.get(address);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const quest = quests.find(q => q.id === questId);
  if (!quest) return res.status(404).json({ error: 'Quest not found' });
  
  // Check if quest already completed
  const alreadyCompleted = user.completedQuests.find(cq => cq.questId === questId);
  if (alreadyCompleted) {
    return res.status(400).json({ error: 'Quest already completed' });
  }
  
  // Handle blockchain transaction data
  let blockchainData = null;
  if (transactionHash) {
    try {
      blockchainData = {
        transactionHash,
        verified: blockchainVerified || false,
        verifiedAt: new Date(),
        network: 'shardeum-unstable'
      };
      console.log(`Quest ${questId} completed by ${address} with tx: ${transactionHash} (verified: ${blockchainVerified})`);
    } catch (error) {
      console.error('Blockchain data processing failed:', error);
    }
  }
  
  // Add quest completion
  const questCompletion = { 
    questId, 
    xpEarned: quest.xpReward, 
    completedAt: new Date(),
    blockchain: blockchainData
  };
  
  user.completedQuests.push(questCompletion);
  user.totalXP += quest.xpReward;
  
  // Check achievements
  if (user.totalXP >= 100 && !user.achievements.includes(1)) user.achievements.push(1);
  if (user.totalXP >= 500 && !user.achievements.includes(2)) user.achievements.push(2);
  if (user.totalXP >= 1000 && !user.achievements.includes(3)) user.achievements.push(3);
  if (user.completedQuests.length >= 5 && !user.achievements.includes(4)) user.achievements.push(4);
  
  users.set(address, user);
  
  res.json({
    user: {
      totalXP: user.totalXP,
      achievements: user.achievements
    },
    questCompletion
  });
});

app.get('/api/progress/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const address = token.replace('demo-token-', '');
  const user = users.get(address);
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({
    completedQuests: user.completedQuests,
    activeProgress: [],
    totalXP: user.totalXP,
    achievements: user.achievements
  });
});

// User endpoints
app.get('/api/users/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const address = token.replace('demo-token-', '');
  const user = users.get(address);
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({
    walletAddress: user.walletAddress,
    username: user.username || null,
    totalXP: user.totalXP,
    completedQuests: user.completedQuests,
    achievements: user.achievements,
    registeredAt: user.registeredAt,
    lastActiveAt: user.lastActiveAt || user.registeredAt
  });
});

app.put('/api/users/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  const address = token.replace('demo-token-', '');
  const user = users.get(address);
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { username } = req.body;
  
  if (username && username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  
  // Check if username is already taken
  if (username) {
    const existingUser = Array.from(users.values()).find(u => 
      u.username === username && u.walletAddress !== address
    );
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
  }
  
  user.username = username;
  user.lastActiveAt = new Date();
  users.set(address, user);
  
  res.json({
    walletAddress: user.walletAddress,
    username: user.username
  });
});

app.get('/api/users/leaderboard', (req, res) => {
  const userArray = Array.from(users.values())
    .sort((a, b) => b.totalXP - a.totalXP)
    .slice(0, 20)
    .map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      username: user.username || 'Anonymous',
      totalXP: user.totalXP,
      completedQuests: user.completedQuests.length,
      achievements: user.achievements.length
    }));
    
  res.json({
    users: userArray,
    total: users.size
  });
});

app.get('/api/users/stats', (req, res) => {
  const totalUsers = users.size;
  const totalXP = Array.from(users.values()).reduce((sum, user) => sum + user.totalXP, 0);
  const topUser = Array.from(users.values()).sort((a, b) => b.totalXP - a.totalXP)[0];
  
  res.json({
    totalUsers,
    totalXPEarned: totalXP,
    topUser: topUser ? {
      walletAddress: topUser.walletAddress,
      username: topUser.username || 'Anonymous',
      totalXP: topUser.totalXP
    } : null
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    contract: process.env.CONTRACT_ADDRESS || '0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14',
    totalUsers: users.size,
    availableQuests: quests.length
  });
});

// Debug endpoint to see all users (remove in production)
app.get('/api/debug/users', (req, res) => {
  const userArray = Array.from(users.entries()).map(([address, user]) => ({
    address,
    username: user.username,
    totalXP: user.totalXP,
    completedQuests: user.completedQuests.length,
    achievements: user.achievements.length
  }));
  
  res.json({
    totalUsers: users.size,
    users: userArray
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ShardeumQuest Demo Backend running on port ${PORT}`);
  console.log(`📄 Contract Address: ${process.env.CONTRACT_ADDRESS || '0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14'}`);
  console.log(`🌐 Frontend URL: http://localhost:3000`);
});