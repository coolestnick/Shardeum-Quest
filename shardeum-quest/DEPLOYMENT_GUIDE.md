# ShardeumQuest Deployment Guide

## Project Overview
ShardeumQuest is a gamified DeFi learning platform with:
- Smart contract for tracking quest completion and achievements
- Backend API for user management and progress tracking
- React frontend with wallet integration

## Quick Start

### 1. Deploy Smart Contract using Remix

Since there are npm dependency conflicts, the easiest way to deploy is using Remix:

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file named `ShardeumQuest.sol`
3. Copy the contract code from `contracts/ShardeumQuest.sol`
4. Compile with Solidity 0.8.20
5. In MetaMask, connect to Shardeum Unstable testnet:
   - Network Name: Shardeum Unstable Testnet
   - RPC URL: https://hackathon.shardeum.org/
   - Chain ID: 8082
   - Currency Symbol: SHM
   - Explorer: https://explorer-hackathon.shardeum.org/
6. Deploy the contract using Remix
7. Copy the deployed contract address

### 2. Update Environment Variables

Update the `.env` file with your contract address:
```
CONTRACT_ADDRESS=<your-deployed-contract-address>
REACT_APP_CONTRACT_ADDRESS=<your-deployed-contract-address>
```

### 3. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend will run on http://localhost:3001

### 4. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

## Testing the DApp

1. Connect your MetaMask wallet to the app
2. Make sure you're on Shardeum Unstable testnet
3. Browse available quests
4. Complete quest steps
5. Earn XP and achievements

## Production Deployment

### Backend (using PM2)

```bash
cd backend
pm2 start ecosystem.config.js --env production
```

### Frontend (using Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

## API Endpoints

- POST `/api/auth/login` - Wallet authentication
- GET `/api/quests` - Get all quests
- GET `/api/users/profile` - Get user profile
- POST `/api/progress/complete/:questId` - Complete a quest
- GET `/api/users/leaderboard` - Get leaderboard

## Features

1. **Educational Quests**: 5 DeFi learning quests
2. **Progress Tracking**: Track completed steps and quests
3. **Achievement System**: Unlock achievements based on XP
4. **Leaderboard**: Compete with other learners
5. **Wallet Authentication**: Secure login with MetaMask

## Smart Contract Functions

- `registerUser()` - Register new user
- `completeQuest(uint256 questId)` - Complete a quest
- `getUserStats(address user)` - Get user statistics
- `getActiveQuests()` - Get all active quests

## Troubleshooting

1. **MetaMask Connection**: Make sure you're on the correct network
2. **CORS Issues**: Frontend proxy is configured for localhost:3001
3. **MongoDB**: Ensure MongoDB is running locally
4. **Private Key**: Never commit your private key

## Get Test SHM Tokens

Visit the [Shardeum Faucet](https://faucet-hackathon.shardeum.org/) to get test tokens.