import React from 'react';
import { useTransaction } from '../context/TransactionContext';

function TransactionLoader() {
  const { isTransacting, transactionMessage, transactionStep } = useTransaction();

  if (!isTransacting) return null;

  return (
    <div className="transaction-overlay">
      <div className="transaction-modal">
        <div className="transaction-spinner">
          <div className="spinner"></div>
        </div>
        
        <h2 className="transaction-title">Transaction in Progress</h2>
        
        <p className="transaction-message">{transactionMessage}</p>
        
        {transactionStep && (
          <p className="transaction-step">{transactionStep}</p>
        )}
        
        <div className="transaction-progress">
          <div className="progress-dots">
            <span className="dot active"></span>
            <span className="dot active"></span>
            <span className="dot active"></span>
            <span className="dot pulsing"></span>
          </div>
        </div>
        
        <p className="transaction-warning">
          ⚠️ Please don't close this window or refresh the page
        </p>
      </div>
    </div>
  );
}

export default TransactionLoader;