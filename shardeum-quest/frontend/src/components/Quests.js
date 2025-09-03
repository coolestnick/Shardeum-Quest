import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useWallet } from '../context/WalletContext';

function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(null);
  const { account, token } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuests();
    if (account) {
      fetchUserProgress();
    }
    // eslint-disable-next-line 
  }, [account]);

  const fetchQuests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/quests`);
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests:', error);
      // Set default quests if API fails
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/public/progress/user/${account}`);
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setUserProgress(null);
    }
  };

  const isQuestCompleted = (questId) => {
    if (!userProgress) return false;
    return userProgress.completedQuests.some(q => q.questId === questId);
  };

  const handleQuestClick = (questId) => {
    if (!account) {
      alert('Please connect your wallet to start quests');
      return;
    }
    navigate(`/quest/${questId}`);
  };

  if (loading) {
    return <div className="container loading">Loading quests...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Available Quests</h1>
      
      {!account && (
        <div className="error">
          Connect your wallet to track progress and complete quests
        </div>
      )}

      <div className="quests-grid">
        {quests.map(quest => (
          <div 
            key={quest.id} 
            className="quest-card"
            onClick={() => handleQuestClick(quest.id)}
          >
            <h3>{quest.title}</h3>
            <p>{quest.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="xp-badge">{quest.xpReward} XP</span>
              {isQuestCompleted(quest.id) && (
                <span style={{ color: '#00d2ff' }}>✓ Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Quests;