import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlowVisualization from './components/FlowVisualization';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import './App.css';

export interface TransactionState {
  stage: 'idle' | 'user-signing' | 'merchant1-verify' | 'merchant2-forward' | 'merchant3-broadcast' | 'confirmed' | 'double-spend-attempt' | 'double-spend-rejected';
  txHash?: string;
  explorerUrl?: string;
  nonce?: number;
  amount?: number;
  error?: string;
}

function App() {
  const [txState, setTxState] = useState<TransactionState>({ stage: 'idle' });
  const [isSimulating, setIsSimulating] = useState(false);

  const startDemo = async () => {
    setIsSimulating(true);
    
    // Stage 1: User creates offline payment
    setTxState({ stage: 'user-signing', nonce: Date.now(), amount: 2.5 });
    await sleep(2000);

    // Stage 2: Merchant1 verifies
    setTxState({ stage: 'merchant1-verify', nonce: Date.now(), amount: 2.5 });
    await sleep(2000);

    // Stage 3: Merchant2 forwards
    setTxState({ stage: 'merchant2-forward', nonce: Date.now(), amount: 2.5 });
    await sleep(2000);

    // Stage 4: Merchant3 broadcasts
    setTxState({ 
      stage: 'merchant3-broadcast', 
      nonce: Date.now(), 
      amount: 2.5,
      txHash: '0xabc123...',
      explorerUrl: 'https://explorer.aptoslabs.com/txn/0xabc123?network=devnet'
    });
    await sleep(3000);

    // Stage 5: Confirmed
    setTxState({ 
      stage: 'confirmed', 
      nonce: Date.now(), 
      amount: 2.5,
      txHash: '0xabc123...',
      explorerUrl: 'https://explorer.aptoslabs.com/txn/0xabc123?network=devnet'
    });
    
    setIsSimulating(false);
  };

  const attemptDoubleSpend = async () => {
    setIsSimulating(true);
    
    setTxState({ 
      stage: 'double-spend-attempt', 
      nonce: txState.nonce,
      amount: 2.5 
    });
    await sleep(2000);

    setTxState({ 
      stage: 'double-spend-rejected', 
      nonce: txState.nonce,
      amount: 2.5,
      error: 'Nonce already used - double spend prevented!'
    });
    
    await sleep(3000);
    setIsSimulating(false);
  };

  const reset = () => {
    setTxState({ stage: 'idle' });
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <FlowVisualization txState={txState} />
        
        <ControlPanel
          txState={txState}
          isSimulating={isSimulating}
          onStartDemo={startDemo}
          onAttemptDoubleSpend={attemptDoubleSpend}
          onReset={reset}
        />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400">
        <p className="text-sm">
          Built with ❤️ for Aptos Hackathon | 
          <a 
            href="https://github.com" 
            className="ml-2 text-purple-400 hover:text-purple-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default App;


