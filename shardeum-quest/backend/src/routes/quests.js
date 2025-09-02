const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

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

router.get('/', (req, res) => {
  res.json(quests);
});

router.get('/:id', (req, res) => {
  const quest = quests.find(q => q.id === parseInt(req.params.id));
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }
  res.json(quest);
});

router.get('/:id/content', (req, res) => {
  const questContent = {
    1: {
      content: `
# Welcome to DeFi on Shardeum!

## What is DeFi?
Decentralized Finance (DeFi) represents a shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on blockchain.

**[What Is Decentralized Finance? The Basics of DeFi](https://shardeum.org/blog/what-is-defi-decentralized-finance/)**

## Why Shardeum?
Shardeum is an EVM-compatible layer 1 blockchain that uses dynamic state sharding to achieve linear scalability while maintaining decentralization and security.

**[What is Shardeum?](https://shardeum.org/blog/what-is-shardeum/)**

### Key Features:
- **Linear Scalability**: Network capacity increases by adding more nodes
- **Low Gas Fees**: Consistently low transaction costs
- **EVM Compatible**: Deploy existing Ethereum dApps easily
- **Fast Finality**: Quick transaction confirmations

✅ Read both articles above to understand DeFi and Shardeum fundamentals
✅ Complete this quest to begin your DeFi journey on Shardeum!
      `,
      quiz: [
        {
          question: "What does DeFi stand for?",
          options: ["Digital Finance", "Decentralized Finance", "Direct Finance", "Distributed Finance"],
          correct: 1
        },
        {
          question: "What makes Shardeum unique?",
          options: ["Proof of Work", "Dynamic State Sharding", "High Gas Fees", "Slow Transactions"],
          correct: 1
        }
      ]
    },
    2: {
      content: `
# Understanding ERC-20 Tokens

## What are ERC-20 Tokens?
ERC-20 is a technical standard for fungible tokens on Ethereum and EVM-compatible blockchains like Shardeum.

**[How to Deploy ERC-20 Smart Contracts using Truffle](https://shardeum.org/blog/deploy-erc20-smart-contracts-using-truffle/)**

### Key Functions:
- **totalSupply()**: Get the total token supply
- **balanceOf()**: Check an address balance
- **transfer()**: Send tokens to another address
- **approve()**: Allow another address to spend tokens
- **transferFrom()**: Transfer tokens on behalf of another address

**[How to Mint Your Cryptocurrency on Shardeum Testnet](https://shardeum.org/blog/mint-cryptocurrency-shardeum-testnet/)**

### Use Cases:
1. **Governance Tokens**: Vote on protocol decisions
2. **Utility Tokens**: Access platform features
3. **Stablecoins**: Maintain stable value
4. **Wrapped Tokens**: Represent other assets

✅ Read the Truffle deployment tutorial
✅ Learn how to mint your own cryptocurrency
✅ Understanding tokens is crucial for DeFi participation!
      `,
      quiz: [
        {
          question: "What does ERC in ERC-20 stand for?",
          options: ["Ethereum Request for Comments", "Electronic Resource Code", "Enhanced Registry Contract", "External Resource Compiler"],
          correct: 0
        },
        {
          question: "Which is NOT a standard ERC-20 function?",
          options: ["transfer()", "mint()", "balanceOf()", "approve()"],
          correct: 1
        }
      ]
    },
    3: {
      content: `
# DeFi Vault Builder

## Build Advanced DeFi Protocols
Learn to create sophisticated DeFi vaults and staking mechanisms on Shardeum.

**[Build and Deploy an ERC20 Vault on Shardeum](https://shardeum.org/blog/build-deploy-erc20-vault-shardeum/)**

### Vault Concepts:
- **Token Staking**: Lock tokens to earn rewards
- **Liquidity Provision**: Provide capital to protocols
- **Yield Farming**: Earn returns on crypto holdings
- **Risk Management**: Understand smart contract risks

**[How to Deploy a Bank Smart Contract Using Solidity](https://shardeum.org/blog/deploy-bank-smart-contract-solidity/)**

### Advanced Features:
1. **Multi-token Support**: Handle various token types
2. **Time-locked Deposits**: Implement withdrawal delays
3. **Reward Distribution**: Automated yield payouts
4. **Governance Integration**: Community-controlled parameters

✅ Follow the ERC20 vault tutorial step by step
✅ Deploy your own bank smart contract
✅ Understand DeFi lending and borrowing mechanics
      `,
      quiz: [
        {
          question: "What is a DeFi vault primarily used for?",
          options: ["Storing private keys", "Token staking and yield farming", "Smart contract compilation", "Network validation"],
          correct: 1
        },
        {
          question: "What does time-locked deposits prevent?",
          options: ["Smart contract bugs", "Immediate withdrawals", "Token minting", "Gas fees"],
          correct: 1
        }
      ]
    },
    4: {
      content: `
# Multi-Token Standards Master

## Beyond ERC-20: Advanced Token Standards
Explore NFTs, multi-token standards, and their applications in the Shardeum ecosystem.

### ERC-721 (Non-Fungible Tokens)
Each token is unique and represents ownership of distinct assets like digital art, collectibles, or real estate.

**[What is ERC-1155?](https://shardeum.org/blog/what-is-erc-1155/)**

### ERC-1155 (Multi-Token Standard)
A revolutionary standard that combines fungible and non-fungible tokens in a single contract, reducing gas costs and complexity.

### Key Differences:
- **ERC-20**: Fungible tokens (identical, divisible)
- **ERC-721**: Non-fungible tokens (unique, indivisible)
- **ERC-1155**: Both fungible and non-fungible in one contract

### Use Cases:
1. **Gaming**: In-game items, currencies, and collectibles
2. **Digital Art**: NFT collections with utility tokens
3. **Supply Chain**: Track both quantity and unique items
4. **Real Estate**: Fractionalized ownership tokens

✅ Read the comprehensive ERC-1155 guide
✅ Understand the benefits of multi-token standards
✅ Explore NFT smart contract deployment possibilities
      `,
      quiz: [
        {
          question: "What makes ERC-1155 special?",
          options: ["Only for NFTs", "Combines fungible and non-fungible tokens", "Higher gas costs", "Simpler than ERC-20"],
          correct: 1
        },
        {
          question: "Which standard is best for unique collectibles?",
          options: ["ERC-20", "ERC-721", "ERC-1155", "Both ERC-721 and ERC-1155"],
          correct: 3
        }
      ]
    },
    5: {
      content: `
# Web3 Career Strategist

## Build Your Future in Blockchain
Discover the vast career opportunities in Web3, DeFi, and blockchain technology.

**[Career Opportunities in Web3 - A Detailed Guide](https://shardeum.org/blog/career-opportunities-web3/)**

### Career Paths:
1. **Blockchain Developer**: Build dApps and smart contracts
2. **DeFi Analyst**: Research protocols and yield strategies  
3. **Tokenomics Designer**: Create sustainable token economies
4. **Security Auditor**: Protect protocols from vulnerabilities
5. **Community Manager**: Build and engage blockchain communities

### Skills Development:
- **Technical Skills**: Solidity, Web3.js, React, Node.js
- **Blockchain Knowledge**: Consensus, cryptography, tokenomics
- **DeFi Understanding**: AMMs, lending, yield farming
- **Security Awareness**: Smart contract vulnerabilities

### Getting Started:
- **Learn by Building**: Create your own DeFi projects
- **Join Communities**: Contribute to open source projects
- **Stay Updated**: Follow blockchain news and developments
- **Network**: Connect with Web3 professionals

✅ Read the detailed Web3 career guide
✅ Identify your preferred blockchain career path
✅ Plan your Web3 learning and development portfolio
      `,
      quiz: [
        {
          question: "Which skill is most important for a DeFi analyst?",
          options: ["Graphic design", "Protocol research and analysis", "Video editing", "Social media marketing"],
          correct: 1
        },
        {
          question: "What's the best way to start a Web3 career?",
          options: ["Wait for perfect conditions", "Learn by building projects", "Only read documentation", "Avoid communities"],
          correct: 1
        }
      ]
    }
  };

  const content = questContent[req.params.id];
  if (!content) {
    return res.status(404).json({ error: 'Quest content not found' });
  }
  res.json(content);
});

module.exports = router;