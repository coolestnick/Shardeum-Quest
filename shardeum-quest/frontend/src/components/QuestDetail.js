import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import { CONTRACT_ABI } from '../utils/contractABI';

function QuestDetail() {
  const { id } = useParams();
  const { account, token, signer, isRestoring } = useWallet();
  const { startTransaction, updateTransaction, completeTransaction } = useTransaction();
  
  const [quest, setQuest] = useState(null);
  const [content, setContent] = useState(null);
  const [progress, setProgress] = useState(null);
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
      } else if (line.includes('[') && line.includes('](') && line.includes(')')) {
        // Handle markdown links: [Link Text](URL)
        const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
        
        if (linkMatch) {
          const [fullMatch, linkText, url] = linkMatch;
          const beforeLink = line.substring(0, linkMatch.index);
          const afterLink = line.substring(linkMatch.index + fullMatch.length);
          
          elements.push(
            <div key={i} style={{ marginBottom: '1rem', textAlign: 'center' }}>
              {beforeLink && <span style={{ marginBottom: '0.5rem', display: 'block' }}>{beforeLink}</span>}
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 210, 255, 0.5)',
                  display: 'inline-block',
                  margin: '8px',
                  boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #00d2ff 0%, #4a8ce7 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 210, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 210, 255, 0.3)';
                }}
              >
                📖 {linkText} →
              </a>
              {afterLink && <span style={{ marginTop: '0.5rem', display: 'block' }}>{afterLink}</span>}
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
      const questRes = await axios.get(`/api/quests/${id}`);
      setQuest(questRes.data);
      setContent(questRes.data.content); // Content is included in the quest response
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
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };



  const completeQuest = async () => {
    if (!signer || !account) {
      alert('Please connect your wallet');
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
          `/api/progress/complete`,
          { 
            questId: id,
            txHash: receipt.transactionHash
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
            `/api/progress/complete`,
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
        
        {content && (
          <div className="quest-content-formatted">
            {renderQuestContent(content)}
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
        ) : progress?.completedQuests?.includes(parseInt(id)) ? (
          <div className="success" style={{ marginTop: '2rem' }}>
            ✅ Quest Completed! You earned {quest.xpReward} XP
          </div>
        ) : (
          <button 
            className="cta-button" 
            onClick={completeQuest}
            style={{ marginTop: '2rem' }}
          >
            Complete Quest ({quest.xpReward} XP)
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestDetail;