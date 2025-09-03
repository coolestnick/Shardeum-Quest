import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useWallet } from '../context/WalletContext';

function Leaderboard() {
  const { account } = useWallet();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line 
  }, [page]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/leaderboard`, {
        params: { limit, offset: page * limit }
      });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserDisplayName = (user) => {
    const isCurrentUser = account && user.walletAddress.toLowerCase() === account.toLowerCase();
    const displayName = user.username || formatAddress(user.walletAddress);
    
    if (isCurrentUser) {
      return (
        <span>
          {displayName}
          <span style={{ 
            color: '#00d2ff', 
            marginLeft: '0.5rem', 
            fontSize: '0.8rem', 
            fontWeight: 'bold' 
          }}>
            (ME)
          </span>
        </span>
      );
    }
    
    return displayName;
  };

  if (loading) {
    return <div className="container loading">Loading leaderboard...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Leaderboard</h1>
      
      <div className="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Total XP</th>
              <th>Quests</th>
              <th>Achievements</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = account && user.walletAddress.toLowerCase() === account.toLowerCase();
              return (
                <tr 
                  key={user.walletAddress}
                  style={isCurrentUser ? {
                    backgroundColor: 'rgba(0, 210, 255, 0.1)',
                    border: '1px solid rgba(0, 210, 255, 0.3)'
                  } : {}}
                >
                  <td>
                    {user.rank <= 3 ? (
                      <span className="rank-badge">#{user.rank}</span>
                    ) : (
                      `#${user.rank}`
                    )}
                  </td>
                  <td>
                    {getUserDisplayName(user)}
                  </td>
                  <td>{user.totalXP}</td>
                  <td>{user.completedQuests}</td>
                  <td>{user.achievements}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="connect-btn" 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <button 
            className="connect-btn" 
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * limit >= total}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;