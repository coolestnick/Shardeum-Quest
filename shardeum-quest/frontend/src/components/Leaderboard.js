import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLeaderboard();
  }, [page]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/users/leaderboard');
      
      // The API returns an array directly, not an object with users/total
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setTotal(response.data.length);
      } else {
        // Fallback for object format
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
      }
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
            {users.map((user) => (
              <tr key={user.walletAddress}>
                <td>
                  {user.rank <= 3 ? (
                    <span className="rank-badge">#{user.rank}</span>
                  ) : (
                    `#${user.rank}`
                  )}
                </td>
                <td>
                  {user.username || formatAddress(user.walletAddress)}
                </td>
                <td>{user.totalXP}</td>
                <td>-</td>
                <td>-</td>
              </tr>
            ))}
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