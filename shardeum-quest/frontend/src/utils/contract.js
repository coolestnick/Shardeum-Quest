import { ethers } from 'ethers';
import { CONTRACT_ABI } from './contractABI';

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const getContract = (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not set. Please deploy the contract first.');
  }
  
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
};

export const getContractWithProvider = () => {
  const provider = new ethers.JsonRpcProvider('https://hackathon.shardeum.org/');
  return getContract(provider);
};

export const getContractWithSigner = (signer) => {
  return getContract(signer);
};