import hre from "hardhat";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log("Deploying ShardeumQuest contract...");

  const ShardeumQuest = await hre.ethers.getContractFactory("ShardeumQuest");
  const shardeumQuest = await ShardeumQuest.deploy();

  await shardeumQuest.waitForDeployment();

  const address = await shardeumQuest.getAddress();
  console.log("ShardeumQuest deployed to:", address);
  
  console.log("\nContract deployment details:");
  console.log("Network:", hre.network.name);
  console.log("Owner:", await shardeumQuest.owner());
  
  console.log("\n⚠️  Important: Update your .env file with:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`REACT_APP_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });