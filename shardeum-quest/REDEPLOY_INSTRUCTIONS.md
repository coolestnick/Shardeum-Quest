# 🔄 Contract Redeployment Required

## Why Redeploy?
Your contract was deployed to Chain ID 8082, but the official Shardeum Unstablenet uses Chain ID 8080. We need to redeploy to the correct network.

## Steps to Redeploy:

### 1. Get Test SHM Tokens
- Join Shardeum Discord: https://discord.gg/shardeum  
- Use the faucet channel to get test SHM for Chain ID 8080

### 2. Deploy Using Remix (Easiest)
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create `ShardeumQuest.sol` and paste the contract from `contracts/ShardeumQuest.sol`
3. Compile with Solidity 0.8.20
4. Add Shardeum Unstablenet to MetaMask:
   - **Network Name**: Shardeum Unstablenet
   - **RPC URL**: https://api-unstable.shardeum.org/
   - **Chain ID**: 8080
   - **Symbol**: SHM
   - **Explorer**: https://explorer-unstable.shardeum.org/
5. Deploy the contract
6. Copy the new contract address

### 3. Update Environment
Replace the contract address in `.env`:
```
CONTRACT_ADDRESS=NEW_CONTRACT_ADDRESS_HERE
REACT_APP_CONTRACT_ADDRESS=NEW_CONTRACT_ADDRESS_HERE
```

### 4. Restart the Application
```bash
./start-demo.sh
```

## Alternative: Hardhat Deployment
```bash
npx hardhat run scripts/deploy.js --network shardeumUnstable
```

The contract will work perfectly once deployed to the correct Chain ID 8080! 🚀