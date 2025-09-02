import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        totalUsers: 0,
        totalXPEarned: 0,
        topUser: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to ShardeumQuest</h1>
        <p>Learn DeFi concepts, complete quests, and earn achievements on Shardeum</p>
        <Link to="/quests" className="cta-button">Start Your Journey</Link>
      </div>

      {loading ? (
        <div className="loading">Loading stats...</div>
      ) : stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Active Learners</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalXPEarned || 0}</h3>
            <p>Total XP Earned</p>
          </div>
          <div className="stat-card">
            <h3>5</h3>
            <p>Available Quests</p>
          </div>
        </div>
      )}

      <section style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>How It Works</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3 style={{ fontSize: '1.5rem' }}>1. Connect</h3>
            <p>Connect your wallet to start learning</p>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '1.5rem' }}>2. Learn</h3>
            <p>Complete educational quests about DeFi</p>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '1.5rem' }}>3. Earn</h3>
            <p>Earn XP and unlock achievements</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;