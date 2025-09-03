import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Quests from './components/Quests';
import QuestDetail from './components/QuestDetail';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Navbar from './components/Navbar';
import NetworkHelper from './components/NetworkHelper';
import TransactionLoader from './components/TransactionLoader';
import BackgroundParticles from './components/BackgroundParticles';
import { WalletProvider } from './context/WalletContext';
import { TransactionProvider } from './context/TransactionContext';

function App() {
  return (
    <WalletProvider>
      <TransactionProvider>
        <Router>
          <div className="App">
            <BackgroundParticles />
            <NetworkHelper />
            <Navbar />
            <TransactionLoader />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/quest/:id" element={<QuestDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </div>
        </Router>
      </TransactionProvider>
    </WalletProvider>
  );
}

export default App;
