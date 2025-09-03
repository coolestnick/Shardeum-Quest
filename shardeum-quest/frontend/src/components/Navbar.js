import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

function Navbar() {
  const { account, user, connectWallet, disconnect, isConnecting, isRestoring } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDisplayName = () => {
    if (!account) return '';
    if (user && user.username) {
      return user.username;
    }
    if (isRestoring) {
      return 'Loading...';
    }
    return 'Anonymous';
  };

  const switchAccount = async () => {
    try {
      // Request account access to trigger MetaMask account selection
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      
      // After permission granted, connect to the selected account
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        // The connectWallet function will handle the new account
        await connectWallet();
      }
      setShowWalletMenu(false);
    } catch (error) {
      console.error('Error switching account:', error);
      if (error.code !== 4001) { // Don't show error if user cancelled
        alert('Failed to switch account. Please try again.');
      }
      setShowWalletMenu(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">ShardeumQuest</Link>
      
      <div className="nav-links">
        <Link to="/quests">Quests</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        {account && <Link to="/profile">Profile</Link>}
        
        {account ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              {getDisplayName()}
            </span>
            {user && user.totalXP !== undefined && (
              <span style={{ color: '#00d2ff', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                {user.totalXP} XP
              </span>
            )}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button 
                className="connect-btn" 
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {formatAddress(account)}
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </button>
              
              {showWalletMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '0.5rem',
                  background: 'rgba(20, 20, 30, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  minWidth: '200px',
                  zIndex: 1000,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                      Connected Account
                    </div>
                    <div style={{ marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {account}
                    </div>
                    
                    <button
                      onClick={switchAccount}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        background: 'rgba(0, 210, 255, 0.1)',
                        border: '1px solid rgba(0, 210, 255, 0.3)',
                        color: '#00d2ff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(0, 210, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 210, 255, 0.1)';
                      }}
                    >
                      Switch Account
                    </button>
                    
                    <button
                      onClick={handleDisconnect}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 0, 0, 0.3)',
                        color: '#ff4444',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 0, 0, 0.1)';
                      }}
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button 
            className="connect-btn" 
            onClick={connectWallet}
            disabled={isConnecting || isRestoring}
          >
            {isRestoring ? 'Restoring...' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;