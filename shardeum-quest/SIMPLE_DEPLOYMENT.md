# Simple Deployment Steps for ShardeumQuest

## What You Need
✅ **Contract Address** - That's it! The ABI is already included in the project.

## Step 1: Deploy Contract via Remix
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create `ShardeumQuest.sol` and paste the contract code from `contracts/ShardeumQuest.sol`
3. Compile with Solidity 0.8.20
4. Connect MetaMask to Shardeum Unstable testnet:
   - Network: `https://hackathon.shardeum.org/`
   - Chain ID: `8082`
5. Deploy the contract
6. **Copy the contract address**

## Step 2: Update Environment Variables
In your `.env` file, add:
```
CONTRACT_ADDRESS=0x...your-contract-address
REACT_APP_CONTRACT_ADDRESS=0x...your-contract-address
```

## Step 3: Run the Application
```bash
# Start backend
cd backend && npm install && npm start

# Start frontend (in new terminal)
cd frontend && npm install && npm start
```

## That's It! 🎉

The project includes:
- ✅ Contract ABI in `contracts/ShardeumQuest.abi.json`
- ✅ Frontend utilities in `frontend/src/utils/contractABI.js`
- ✅ Backend contract integration in `backend/src/utils/contractABI.js`

**You only need the deployed contract address!**

## Test the DApp
1. Visit `http://localhost:3000`
2. Connect MetaMask (Shardeum Unstable network)
3. Browse quests and complete them
4. Earn XP and unlock achievements!

## Contract Functions Available
- `completeQuest(questId)` - Complete a quest on-chain
- `getUserStats(address)` - Get user XP and achievements  
- `hasCompletedQuest(user, questId)` - Check quest completion
- `getActiveQuests()` - Get all available quests
- `registerUser()` - Register new user

The frontend and backend will automatically interact with your deployed contract using just the address.