# ShardeumQuest - DeFi Learning Platform

A gamified DeFi learning platform built on Shardeum Unstable testnet where users complete educational quests and earn achievement NFTs.

## Features

- 🎮 Interactive quest-based learning system
- 🏆 Achievement NFTs for completing milestones
- 📊 Progress tracking and leaderboard
- 💰 XP rewards for quest completion
- 🔐 Wallet-based authentication
- 📱 Responsive design

## Tech Stack

- **Smart Contract**: Solidity, Hardhat
- **Frontend**: React, Ethers.js
- **Backend**: Node.js, Express, MongoDB
- **Blockchain**: Shardeum Unstable Testnet

## Prerequisites

- Node.js (v16+)
- MongoDB
- MetaMask wallet
- Shardeum testnet SHM tokens

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd shardeum-quest
```

### 2. Install dependencies
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment
Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=
REACT_APP_CONTRACT_ADDRESS=
BACKEND_URL=http://localhost:3001
MONGODB_URI=mongodb://localhost:27017/shardeumquest
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Deploy smart contract
```bash
# From root directory
npx hardhat compile
npx hardhat run scripts/deploy.js --network shardeumUnstable
```

Update `.env` with the deployed contract address.

### 5. Start services

#### Backend:
```bash
cd backend
npm start
```

#### Frontend:
```bash
cd frontend
npm start
```

## Deployment Guide

### Backend Deployment (PM2)

1. Install PM2:
```bash
npm install -g pm2
```

2. Create ecosystem config:
```bash
cd backend
pm2 init simple
```

3. Update `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'shardeum-quest-backend',
    script: './src/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

4. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy to Vercel:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard:
- `REACT_APP_CONTRACT_ADDRESS`
- `REACT_APP_BACKEND_URL`

## Usage

1. Connect your MetaMask wallet to Shardeum Unstable testnet
2. Visit the platform and connect your wallet
3. Browse available quests
4. Complete quest steps to earn XP
5. Track your progress and compete on the leaderboard

## Smart Contract Functions

- `registerUser()`: Register a new user
- `completeQuest(questId)`: Complete a quest and earn XP
- `getUserStats(address)`: Get user statistics
- `getActiveQuests()`: View all active quests

## 📋 Complete API Documentation

### Base URL
- **Local Development**: `http://localhost:3001`
- **Frontend Proxy**: `http://localhost:3000` (auto-proxied to backend)

---

## 🔐 Authentication APIs

### POST `/api/auth/login`
Authenticate user with wallet signature.

**Request Body:**
```json
{
  "message": "Sign this message to authenticate with ShardeumQuest\\nTimestamp: 1693574400000",
  "signature": "0x...",
  "address": "0x..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f1...",
    "walletAddress": "0x...",
    "totalXP": 0,
    "completedQuests": 0,
    "achievements": 0
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Sign this message...",
    "signature": "0x...",
    "address": "0x..."
  }'
```

### POST `/api/auth/verify`
Verify JWT token validity.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "64f1...",
    "walletAddress": "0x...",
    "totalXP": 100
  }
}
```

---

## 🎯 Quest APIs

### GET `/api/quests`
Get all available quests.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Welcome to DeFi on Shardeum",
    "description": "Learn DeFi basics and understand Shardeum's role in decentralized finance",
    "xpReward": 100,
    "steps": [
      {
        "id": "defi-basics",
        "title": "Read: What Is Decentralized Finance? The Basics of DeFi"
      },
      {
        "id": "shardeum-intro",
        "title": "Read: What is Shardeum?"
      },
      {
        "id": "complete",
        "title": "Complete the welcome quest"
      }
    ]
  }
]
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/quests | jq '.'
```

**Browser URL:** `http://localhost:3001/api/quests`

### GET `/api/quests/:id`
Get specific quest details.

**Parameters:**
- `id` (path): Quest ID (1-5)

**Response:**
```json
{
  "id": 1,
  "title": "Welcome to DeFi on Shardeum",
  "description": "Learn DeFi basics and understand Shardeum's role in decentralized finance",
  "xpReward": 100,
  "steps": [...]
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/quests/1 | jq '.'
```

**Browser URL:** `http://localhost:3001/api/quests/1`

### GET `/api/quests/:id/content`
Get quest educational content with Shardeum blog links.

**Parameters:**
- `id` (path): Quest ID (1-5)

**Response:**
```json
{
  "content": "\\n# Welcome to DeFi on Shardeum!\\n\\n## What is DeFi?\\nDecentralized Finance...\\n\\n**[What Is Decentralized Finance? The Basics of DeFi](https://shardeum.org/blog/what-is-defi-decentralized-finance/)**\\n...",
  "quiz": [
    {
      "question": "What does DeFi stand for?",
      "options": ["Digital Finance", "Decentralized Finance", "Direct Finance", "Distributed Finance"],
      "correct": 1
    }
  ]
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/quests/1/content | jq '.content'
```

**Browser URL:** `http://localhost:3001/api/quests/1/content`

---

## 📊 Progress APIs (Authenticated)

All progress endpoints require `Authorization: Bearer <token>` header.

### POST `/api/progress/start/:questId`
Start a new quest.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Parameters:**
- `questId` (path): Quest ID to start

**Response:**
```json
{
  "_id": "64f1...",
  "userId": "64f1...",
  "questId": 1,
  "status": "started",
  "steps": [],
  "createdAt": "2023-09-01T...",
  "updatedAt": "2023-09-01T..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/progress/start/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### PUT `/api/progress/update/:questId`
Update quest step completion.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Parameters:**
- `questId` (path): Quest ID to update

**Request Body:**
```json
{
  "stepId": "defi-basics",
  "completed": true
}
```

**Response:**
```json
{
  "_id": "64f1...",
  "userId": "64f1...",
  "questId": 1,
  "status": "in_progress",
  "steps": [
    {
      "stepId": "defi-basics",
      "completed": true,
      "completedAt": "2023-09-01T..."
    }
  ]
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3001/api/progress/update/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"stepId": "defi-basics", "completed": true}'
```

### POST `/api/progress/complete/:questId`
Complete a quest (with blockchain verification).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Parameters:**
- `questId` (path): Quest ID to complete

**Request Body:**
```json
{
  "transactionHash": "0x...",
  "blockchainVerified": true
}
```

**Response:**
```json
{
  "progress": {
    "_id": "64f1...",
    "status": "completed",
    "completedAt": "2023-09-01T...",
    "transactionHash": "0x..."
  },
  "user": {
    "totalXP": 100,
    "newAchievements": [...]
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/progress/complete/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"transactionHash": "0x...", "blockchainVerified": true}'
```

### GET `/api/progress/user`
Get user's progress across all quests.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "completedQuests": [
    {
      "questId": 1,
      "xpEarned": 100,
      "completedAt": "2023-09-01T..."
    }
  ],
  "activeProgress": [
    {
      "_id": "64f1...",
      "questId": 2,
      "status": "in_progress",
      "steps": [...]
    }
  ],
  "totalXP": 100,
  "achievements": [
    {
      "achievementId": 1,
      "earnedAt": "2023-09-01T..."
    }
  ]
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/progress/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### GET `/api/progress/verify/:questId`
Verify quest completion on blockchain.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Parameters:**
- `questId` (path): Quest ID to verify

**Response:**
```json
{
  "onChain": true,
  "inDatabase": true,
  "synced": true
}
```

---

## 👤 User APIs

### GET `/api/users/profile` (Authenticated)
Get user profile information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "id": "64f1...",
  "walletAddress": "0x...",
  "username": "cooluser",
  "totalXP": 100,
  "completedQuests": [
    {
      "questId": 1,
      "xpEarned": 100,
      "completedAt": "2023-09-01T..."
    }
  ],
  "achievements": [
    {
      "achievementId": 1,
      "earnedAt": "2023-09-01T..."
    }
  ],
  "registeredAt": "2023-09-01T...",
  "lastActiveAt": "2023-09-01T..."
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### PUT `/api/users/profile` (Authenticated)
Update user profile (username).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request Body:**
```json
{
  "username": "newusername"
}
```

**Response:**
```json
{
  "id": "64f1...",
  "walletAddress": "0x...",
  "username": "newusername"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"username": "newusername"}'
```

### GET `/api/users/leaderboard`
Get platform leaderboard.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "users": [
    {
      "rank": 1,
      "walletAddress": "0x...",
      "username": "topuser",
      "totalXP": 1000,
      "completedQuests": 5,
      "achievements": 4
    }
  ],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/users/leaderboard | jq '.users'
```

**Browser URL:** `http://localhost:3001/api/users/leaderboard`

### GET `/api/users/stats`
Get platform statistics.

**Response:**
```json
{
  "totalUsers": 50,
  "totalXPEarned": 5000,
  "topUser": {
    "walletAddress": "0x...",
    "username": "topuser",
    "totalXP": 1000
  }
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/users/stats | jq '.'
```

**Browser URL:** `http://localhost:3001/api/users/stats`

---

## 🔧 Utility APIs

### GET `/api/health`
Server health check.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-09-01T12:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -s http://localhost:3001/api/health
```

**Browser URL:** `http://localhost:3001/api/health`

---

## 🎓 Available Quests

1. **Welcome to DeFi on Shardeum** (100 XP)
   - Learn DeFi basics with [What Is Decentralized Finance?](https://shardeum.org/blog/what-is-defi-decentralized-finance/)
   - Understand Shardeum with [What is Shardeum?](https://shardeum.org/blog/what-is-shardeum/)

2. **ERC-20 Token Expert** (150 XP)
   - Master token deployment with [Deploy ERC-20 Smart Contracts using Truffle](https://shardeum.org/blog/deploy-erc20-smart-contracts-using-truffle/)
   - Learn token creation with [Mint Your Cryptocurrency on Shardeum Testnet](https://shardeum.org/blog/mint-cryptocurrency-shardeum-testnet/)

3. **DeFi Vault Builder** (200 XP)
   - Build vaults with [Build and Deploy an ERC20 Vault on Shardeum](https://shardeum.org/blog/build-deploy-erc20-vault-shardeum/)
   - Deploy contracts with [Deploy a Bank Smart Contract Using Solidity](https://shardeum.org/blog/deploy-bank-smart-contract-solidity/)

4. **Multi-Token Standards Master** (250 XP)
   - Explore advanced standards with [What is ERC-1155?](https://shardeum.org/blog/what-is-erc-1155/)

5. **Web3 Career Strategist** (300 XP)
   - Plan your future with [Career Opportunities in Web3](https://shardeum.org/blog/career-opportunities-web3/)

---

## 🧪 Quick API Testing

### Test Commands:
```bash
# Test all quests
curl -s http://localhost:3001/api/quests | jq length

# Test specific quest content
curl -s http://localhost:3001/api/quests/1/content | jq '.content'

# Test leaderboard
curl -s http://localhost:3001/api/users/leaderboard | jq '.users[0]'

# Test server health
curl -s http://localhost:3001/api/health

# Test platform stats
curl -s http://localhost:3001/api/users/stats
```

### Browser Testing:
Open these URLs directly in your browser:
- http://localhost:3001/api/quests
- http://localhost:3001/api/quests/1/content
- http://localhost:3001/api/users/leaderboard
- http://localhost:3001/api/users/stats
- http://localhost:3001/api/health

### Frontend Network Tab:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Use the ShardeumQuest frontend
4. See all API calls in real-time

---

## 🔒 Authentication Flow

1. **Connect Wallet**: User connects MetaMask wallet
2. **Sign Message**: Frontend generates message with timestamp
3. **Submit Signature**: Send message, signature, and address to `/api/auth/login`
4. **Receive Token**: Backend verifies signature and returns JWT token
5. **Store Token**: Frontend stores token in localStorage
6. **Use Token**: Include `Authorization: Bearer <token>` header in subsequent requests

---

## 🛡️ Rate Limiting

The API implements tiered rate limiting:
- **General APIs**: 1000 requests per 15 minutes
- **Authentication**: 50 requests per 15 minutes  
- **Profile Updates**: 20 requests per 5 minutes

---

## 🔗 Smart Contract Integration

**Contract Address**: `0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14`  
**Network**: Shardeum Unstablenet (Chain ID: 8080)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT