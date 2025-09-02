const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  // Connect to Shardeum Unstable testnet
  const provider = new ethers.JsonRpcProvider('https://hackathon.shardeum.org/');
  
  // Create wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log('Deploying from address:', wallet.address);
  
  // Get balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'SHM');
  
  // Read the contract source
  const contractSource = fs.readFileSync(path.join(__dirname, 'contracts/ShardeumQuest.sol'), 'utf8');
  
  // For now, let's check the connection
  const network = await provider.getNetwork();
  console.log('Connected to network:', network.name, 'chainId:', network.chainId);
  
  console.log('\nTo deploy the contract:');
  console.log('1. Use Remix IDE (https://remix.ethereum.org)');
  console.log('2. Copy the contract from contracts/ShardeumQuest.sol');
  console.log('3. Connect MetaMask to Shardeum Unstable testnet');
  console.log('4. Deploy using Remix');
  console.log('\nOr use the provided frontend to interact with the dApp once deployed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });