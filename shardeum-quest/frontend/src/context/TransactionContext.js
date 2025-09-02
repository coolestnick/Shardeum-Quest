import React, { createContext, useState, useContext } from 'react';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState('');
  const [transactionStep, setTransactionStep] = useState('');

  const startTransaction = (message = 'Processing transaction...', step = '') => {
    setIsTransacting(true);
    setTransactionMessage(message);
    setTransactionStep(step);
  };

  const updateTransaction = (message, step = '') => {
    setTransactionMessage(message);
    setTransactionStep(step);
  };

  const completeTransaction = () => {
    setIsTransacting(false);
    setTransactionMessage('');
    setTransactionStep('');
  };

  const value = {
    isTransacting,
    transactionMessage,
    transactionStep,
    startTransaction,
    updateTransaction,
    completeTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};