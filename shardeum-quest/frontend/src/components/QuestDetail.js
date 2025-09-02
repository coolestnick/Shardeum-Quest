import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import { CONTRACT_ABI } from '../utils/contractABI';

function QuestDetail() {
  const { id } = useParams();
  const { account, token, signer, isRestoring } = useWallet();
  const { startTransaction, updateTransaction, completeTransaction } = useTransaction();
  const navigate = useNavigate();
  
  const [quest, setQuest] = useState(null);
  const [content, setContent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const renderQuestContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} style={{ color: '#00d2ff', marginTop: '2rem', marginBottom: '1rem' }}>{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} style={{ color: '#ffffff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={{ color: '#00d2ff', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.substring(4)}</h3>);
      } else if (line.startsWith('**[') && line.includes('](') && line.includes(')**')) {
        // Handle markdown links: **[Link Text](URL)**
        const linkMatch = line.match(/\*\*\[(.*?)\]\((.*?)\)\*\*/);
        if (linkMatch) {
          const [, linkText, url] = linkMatch;
          const beforeLink = line.substring(0, linkMatch.index);
          const afterLink = line.substring(linkMatch.index + linkMatch[0].length);
          
          elements.push(
            <div key={i} style={{ marginBottom: '0.5rem' }}>
              {beforeLink}
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  color: '#00d2ff',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  background: 'rgba(0, 210, 255, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  display: 'inline-block',
                  margin: '2px 4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 210, 255, 0.2)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 210, 255, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                📖 {linkText} →
              </a>
              {afterLink}
            </div>
          );
        } else {
          elements.push(<p key={i} style={{ marginBottom: '0.5rem' }}>{line}</p>);
        }
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} style={{ 
            marginLeft: '1rem', 
            marginBottom: '0.3rem',
            listStyle: 'none',
            position: 'relative'
          }}>
            <span style={{ 
              position: 'absolute',
              left: '-1rem',
              color: '#00d2ff'
            }}>•</span>
            {line.substring(2)}
          </li>
        );
      } else if (line.startsWith('✅ ')) {
        elements.push(
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(0, 255, 0, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(0, 255, 0, 0.2)'
          }}>
            <span style={{ marginRight: '0.5rem', fontSize: '1.1em' }}>✅</span>
            {line.substring(2)}
          </div>
        );
      } else if (line === '') {
        elements.push(<br key={i} />);
      } else if (line.trim() !== '') {
        elements.push(<p key={i} style={{ marginBottom: '0.5rem' }}>{line}</p>);
      }
    }
    
    return elements;
  };

  useEffect(() => {
    fetchQuestDetails();
  }, [id]);

  useEffect(() => {
    if (account && token) {
      fetchProgress();
    }
  }, [account, token, id]);

  const fetchQuestDetails = async () => {
    try {
      const [questRes, contentRes] = await Promise.all([
        axios.get(`/api/quests/${id}`),
        axios.get(`/api/quests/${id}/content`)
      ]);
      setQuest(questRes.data);
      setContent(contentRes.data);
    } catch (error) {
      console.error('Error fetching quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/progress/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const questProgress = response.data.activeProgress.find(p => p.questId === parseInt(id));
      if (questProgress) {
        setProgress(questProgress);
        setCompletedSteps(questProgress.steps.filter(s => s.completed).map(s => s.stepId));
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const startQuest = async () => {
    try {
      const response = await axios.post(
        `/api/progress/start/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(response.data);
    } catch (error) {
      console.error('Error starting quest:', error);
    }
  };

  const toggleStep = async (stepId) => {
    if (!account || !token) {
      alert('Please connect your wallet');
      return;
    }

    const isCompleted = completedSteps.includes(stepId);
    const newCompletedSteps = isCompleted 
      ? completedSteps.filter(s => s !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newCompletedSteps);

    try {
      await axios.put(
        `/api/progress/update/${id}`,
        { stepId, completed: !isCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeQuest = async () => {
    if (!signer || !account) {
      alert('Please connect your wallet');
      return;
    }

    if (completedSteps.length !== quest.steps.length) {
      alert('Please complete all steps first');
      return;
    }

    // Start global transaction loader
    startTransaction(`Completing quest: ${quest.title}`, 'Preparing transaction...');

    try {
      // First complete on blockchain
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14';
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      updateTransaction(`Completing quest: ${quest.title}`, 'Sending transaction to blockchain...');
      console.log('Calling smart contract to complete quest...');
      const tx = await contract.completeQuest(parseInt(id));
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation with timeout
      try {
        updateTransaction(
          `Completing quest: ${quest.title}`, 
          `Waiting for confirmation... TX: ${tx.hash.slice(0,10)}...`
        );
        console.log('Waiting for transaction confirmation...');
        
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), 30000)
          )
        ]);
        console.log('Quest completed on blockchain:', receipt.transactionHash);

        updateTransaction(
          `Completing quest: ${quest.title}`, 
          'Transaction confirmed! Updating your progress...'
        );

        // Update backend with blockchain verification
        await axios.post(
          `/api/progress/complete/${id}`,
          { 
            transactionHash: receipt.transactionHash,
            blockchainVerified: true 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Complete the transaction loader
        completeTransaction();

        alert(`Quest completed! You earned ${quest.xpReward} XP!\nTransaction: ${receipt.transactionHash.slice(0,10)}...`);
        
        // Force refresh user progress
        window.location.href = '/quests';
      } catch (waitError) {
        console.warn('Transaction confirmation failed or timeout:', waitError);
        
        updateTransaction(
          `Completing quest: ${quest.title}`, 
          'Transaction pending... Updating progress with unconfirmed TX...'
        );
        
        // Even if tx.wait() fails, still try to update backend with tx hash
        try {
          await axios.post(
            `/api/progress/complete/${id}`,
            { 
              transactionHash: tx.hash,
              blockchainVerified: false // Mark as unverified since we couldn't wait
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Complete the transaction loader
          completeTransaction();
          
          alert(`Quest submitted! Transaction: ${tx.hash.slice(0,10)}...\nYou earned ${quest.xpReward} XP!`);
          
          // Force refresh user progress
          window.location.href = '/quests';
        } catch (backendError) {
          console.error('Backend update also failed:', backendError);
          
          // Complete the transaction loader
          completeTransaction();
          
          alert(`Transaction sent (${tx.hash.slice(0,10)}...) but backend update failed. Please refresh to see your progress.`);
          
          // Force refresh
          window.location.href = '/quests';
        }
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      
      // Complete the transaction loader
      completeTransaction();
      
      if (error.code === 4001) {
        alert('Transaction rejected by user');
      } else if (error.message.includes('Quest already completed')) {
        alert('Quest already completed on blockchain');
      } else {
        alert(`Failed to complete quest: ${error.message || error}`);
      }
    }
  };

  if (loading) {
    return <div className="container loading">Loading quest...</div>;
  }

  if (!quest) {
    return <div className="container error">Quest not found</div>;
  }

  return (
    <div className="container quest-detail">
      <div className="quest-content">
        <h1>{quest.title}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{quest.description}</p>
        
        {content && content.content && (
          <div className="quest-content-formatted">
            {renderQuestContent(content.content)}
          </div>
        )}

        {isRestoring ? (
          <div className="loading" style={{ marginTop: '2rem' }}>
            Checking wallet connection...
          </div>
        ) : !account ? (
          <div className="error" style={{ marginTop: '2rem' }}>
            Connect your wallet to track progress
          </div>
        ) : !progress ? (
          <button className="cta-button" onClick={startQuest} style={{ marginTop: '2rem' }}>
            Start Quest
          </button>
        ) : (
          <>
            <div className="quest-steps">
              <h2>Quest Steps</h2>
              {quest.steps.map(step => (
                <div 
                  key={step.id}
                  className={`step-item ${completedSteps.includes(step.id) ? 'completed' : ''}`}
                  onClick={() => toggleStep(step.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`step-checkbox ${completedSteps.includes(step.id) ? 'checked' : ''}`}>
                    {completedSteps.includes(step.id) && '✓'}
                  </div>
                  <span>{step.title}</span>
                </div>
              ))}
            </div>

            {completedSteps.length === quest.steps.length && (
              <button 
                className="cta-button" 
                onClick={completeQuest}
                style={{ marginTop: '2rem' }}
              >
                {`Complete Quest (${quest.xpReward} XP)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QuestDetail;