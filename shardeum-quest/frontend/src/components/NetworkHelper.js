import React, { useState, useEffect } from 'react';

function NetworkHelper() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (!window.ethereum) {
        setIsVisible(true);
        return;
      }

      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        // Only show if not on correct network
        if (chainId.toLowerCase() !== '0x1f90') {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking network:', error);
        setIsVisible(true);
      }
    };

    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      };
    }
  }, []);

  if (!isVisible) return null;

  const addNetworkManually = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask first');
      return;
    }

    try {
      // First try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1F90' }]
      });
      setIsVisible(false);
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
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
          alert('✅ Network added successfully! You can now connect your wallet.');
          setIsVisible(false);
        } catch (addError) {
          console.error('Failed to add network:', addError);
          alert('❌ Failed to add network. Please add it manually in MetaMask.');
        }
      } else {
        console.error('Failed to switch network:', switchError);
        alert('❌ Failed to switch network. Please try again.');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      background: 'rgba(255, 76, 76, 0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '5px',
          right: '10px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
      
      <h4>⚠️ Network Issue Detected</h4>
      <p style={{ fontSize: '0.9rem', margin: '10px 0' }}>
        Having trouble connecting? Try adding the network manually:
      </p>
      
      <div style={{ fontSize: '0.8rem', marginBottom: '10px' }}>
        <strong>Network:</strong> Shardeum Unstablenet<br/>
        <strong>RPC:</strong> https://api-unstable.shardeum.org/<br/>
        <strong>Chain ID:</strong> 8080<br/>
        <strong>Symbol:</strong> SHM
      </div>
      
      <button 
        onClick={addNetworkManually}
        style={{
          background: 'white',
          color: '#ff4c4c',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginRight: '10px'
        }}
      >
        Add Network
      </button>
    </div>
  );
}

export default NetworkHelper;