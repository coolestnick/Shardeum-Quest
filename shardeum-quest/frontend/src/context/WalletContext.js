import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    
    // Safety timeout to prevent infinite restoration
    const timeoutId = setTimeout(() => {
      console.log('Restoration timeout, stopping...');
      setIsRestoring(false);
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
    // eslint-disable-next-line 
  }, []);

  // Separate useEffect for checking connection when provider is ready
  useEffect(() => {
    if (provider) {
      console.log('Provider ready, checking connection...');
      setTimeout(checkConnection, 500);
    } else if (!window.ethereum) {
      // No MetaMask installed, stop restoration immediately
      console.log('No wallet detected, stopping restoration');
      setIsRestoring(false);
    }
    // eslint-disable-next-line 
  }, [provider]);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      const newAccount = accounts[0];
      if (account && newAccount.toLowerCase() !== account.toLowerCase()) {
        console.log('Account switched from', account, 'to', newAccount);
        // Clear old user data when switching accounts
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
      }
      setAccount(newAccount);
      
      // If we have provider and the account changed, try to re-authenticate
      if (provider && newAccount.toLowerCase() !== account?.toLowerCase()) {
        try {
          const signer = await provider.getSigner();
          setSigner(signer);
          await authenticate(newAccount, signer);
        } catch (error) {
          console.warn('Failed to authenticate new account:', error);
        }
      }
    }
  };

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0 && provider) {
        console.log('Restoring wallet connection for:', accounts[0]);
        setAccount(accounts[0]);
        
        try {
          const signer = await provider.getSigner();
          setSigner(signer);
          
          // If we have a token, restore the user session
          if (token) {
            console.log('Restoring user session with existing token');
            // Set axios default auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Try to fetch user profile
            await restoreUserData();
          }
        } catch (signerError) {
          console.warn('Could not get signer:', signerError);
        }
      } else {
        // If no accounts but we have connection data, something's wrong - clear it
        if ((token || localStorage.getItem('walletConnected')) && accounts.length === 0) {
          console.log('No wallet accounts found, clearing stored data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('walletConnected');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      // Always set restoration complete after attempting connection check
      setIsRestoring(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      // First request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const account = accounts[0];
      setAccount(account);
      
      // Check and switch network if needed
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId, '(Expected: 0x1f90 for Chain ID 8080)');
      
      // Check for both uppercase and lowercase hex
      if (chainId.toLowerCase() !== '0x1f90') { // 8080 in hex
        console.log('Switching to Shardeum Unstablenet...');
        await switchToShardeum();
      } else {
        console.log('✅ Already on correct network (Shardeum Unstablenet)');
      }
      
      // Get provider and signer after network switch
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      
      const signer = await browserProvider.getSigner();
      setSigner(signer);
      
      // Authenticate with backend
      try {
        await authenticate(account, signer);
      } catch (authError) {
        console.warn('Authentication failed, but wallet connected:', authError);
        // Don't fail the connection if auth fails
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // More specific error messages
      if (error.code === 4001) {
        alert('Connection rejected by user');
      } else if (error.code === -32002) {
        alert('Connection request already pending. Please check MetaMask.');
      } else {
        alert(`Failed to connect wallet: ${error.message || error}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToShardeum = async () => {
    try {
      console.log('Attempting to switch to Shardeum Unstablenet...');
      
      // First try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1F90' }] // 8080 in hex
      });
      
      console.log('Successfully switched to Shardeum Unstablenet');
      
    } catch (switchError) {
      console.log('Switch error:', switchError);
      
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        console.log('Network not found, adding Shardeum Unstablenet...');
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x1F90', // 8080 in hex
            chainName: 'Shardeum Unstablenet',
            nativeCurrency: {
              name: 'Shardeum',
              symbol: 'SHM',
              decimals: 18
            },
            rpcUrls: ['https://api-unstable.shardeum.org/'],
            blockExplorerUrls: ['https://explorer-unstable.shardeum.org/']
          }]
        });
        
        console.log('Successfully added Shardeum Unstablenet');
        
      } else if (switchError.code === 4001) {
        throw new Error('User rejected network switch');
      } else {
        throw switchError;
      }
    }
  };

  const authenticate = async (address, signer) => {
    try {
      const message = `Sign this message to authenticate with ShardeumQuest\\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        message,
        signature,
        address
      });
      
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('walletConnected', 'true');
      setToken(token);
      setUser(user);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const restoreUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/public/users/profile/${account}`);
      
      setUser({
        walletAddress: response.data.walletAddress,
        username: response.data.username,
        totalXP: response.data.totalXP,
        completedQuests: response.data.completedQuests.length,
        achievements: response.data.achievements.length
      });
      
      console.log('User data restored:', response.data.walletAddress);
    } catch (error) {
      console.warn('Failed to restore user data:', error);
      // If profile fetch fails, the token might be invalid or backend was restarted
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.log('Token invalid or user not found (backend may have restarted), clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('walletConnected');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        
        // If we have a connected account, try to re-authenticate
        if (account && signer) {
          console.log('Re-authenticating with connected wallet...');
          try {
            await authenticate(account, signer);
          } catch (authError) {
            console.warn('Re-authentication failed:', authError);
          }
        }
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('walletConnected');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUserData = async () => {
    if (account) {
      try {
        console.log('Refreshing user data for account:', account);
        const response = await axios.get(`${API_URL}/api/public/users/profile/${account}`);
        
        const updatedUser = {
          walletAddress: response.data.walletAddress,
          username: response.data.username,
          totalXP: response.data.totalXP,
          completedQuests: response.data.completedQuests.length,
          achievements: response.data.achievements.length
        };
        
        console.log('Setting updated user data:', updatedUser);
        setUser(updatedUser);
        
        return updatedUser;
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        throw error;
      }
    }
  };

  const value = {
    account,
    provider,
    signer,
    isConnecting,
    isRestoring,
    user,
    token,
    connectWallet,
    disconnect,
    switchToShardeum,
    refreshUserData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};