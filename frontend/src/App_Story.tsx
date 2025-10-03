import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NodeBox from './components/NodeBox';
import './App.css';

const API_URL = 'http://localhost:3001';
const USER_PRIVATE_KEY = '0x7e76b51ec4a5ad62a4957f605c97e1d4a1cb6f5b602723f04bcf19f33776b978';

interface TransactionState {
  signedTxHex?: string;
  txDetails?: any;
  currentNode?: string;
  forwardingChain?: Array<{ node: string; timestamp: string }>;
  broadcastResult?: any;
}

type Scenario = 'honest' | 'double-spend' | null;

interface Node {
  id: string;
  name: string;
  icon: string;
  online: boolean;
  description: string;
  storyLabel: string;
}

function App() {
  const [transaction, setTransaction] = useState<TransactionState | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentScenario, setCurrentScenario] = useState<Scenario>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [goodsReleased, setGoodsReleased] = useState(false);
  const [sellerConfirmed, setSellerConfirmed] = useState(false);
  const [doubleSpendAttempted, setDoubleSpendAttempted] = useState(false);
  const [welcomePage, setWelcomePage] = useState(1);

  // Story states for visualization
  const [buyerAction, setBuyerAction] = useState('');
  const [sellerAction, setSellerAction] = useState('');
  const [networkStatus, setNetworkStatus] = useState('');
  
  const nodes: Node[] = [
    { 
      id: 'user', 
      name: 'Buyer', 
      icon: '👤', 
      online: false, 
      description: 'Wants to buy a phone',
      storyLabel: currentScenario === 'honest' ? 'Creating Payment' : 'Trying to Reuse Payment'
    },
    { 
      id: 'merchant1', 
      name: 'Seller', 
      icon: '🏪', 
      online: false, 
      description: 'Rural Store',
      storyLabel: goodsReleased ? 'Goods Released ✅' : 'Verifying Payment'
    },
    { 
      id: 'merchant2', 
      name: 'Village Hub', 
      icon: '🏬', 
      online: false, 
      description: 'Offline Network',
      storyLabel: 'Forwarding Payment'
    },
    { 
      id: 'merchant3', 
      name: 'City Gateway', 
      icon: '🏦', 
      online: true, 
      description: 'Has Internet',
      storyLabel: sellerConfirmed ? 'Confirmed ✅' : doubleSpendAttempted ? 'Rejected 🚫' : 'Broadcasting'
    },
  ];

  const startHonestPurchase = async () => {
    setCurrentScenario('honest');
    setError('');
    setNetworkStatus('💬 Buyer: "I want to buy this phone for 0.1 APT"');
    setSellerAction('💬 Seller: "Show me a signed payment first"');
    
    // Don't auto-create, wait for user to click
  };

  const createTransaction = async () => {
    if (!recipientAddress) {
      setRecipientAddress('0x7ceaa448cbb1258bf8cf43e9c2d916500471c51fbd419baabdc5bb6e6be399dc');
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/create-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privateKey: USER_PRIVATE_KEY,
          recipientAddress: recipientAddress || '0x7ceaa448cbb1258bf8cf43e9c2d916500471c51fbd419baabdc5bb6e6be399dc',
          amount: 0.1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
        setBuyerAction('✅ Payment created! Click Seller to show proof →');
        setNetworkStatus('📱 Signed transaction ready! Click Seller to verify →');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForward = async (toNode: string) => {
    if (!transaction) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNode })
      });

      const data = await response.json();
      if (data.success) {
        setTransaction(data.transaction);
        
        // Update story based on which node
        if (toNode === 'merchant1') {
          setNetworkStatus('🔍 Seller verifying signature (OFFLINE)...');
          await new Promise(r => setTimeout(r, 1500));
          setSellerAction('✅ Signature valid! Waiting for blockchain confirmation...');
          setBuyerAction('⏳ Buyer waiting for seller to release phone...');
          setNetworkStatus('📡 Seller forwards payment to network for confirmation. Click next →');
        } else if (toNode === 'merchant2') {
          setNetworkStatus('📡 Village Hub received payment, forwarding...');
          await new Promise(r => setTimeout(r, 1000));
          setNetworkStatus('✅ Payment queued for city gateway. Click to broadcast →');
        } else if (toNode === 'merchant3') {
          setNetworkStatus('⛓️ Broadcasting to Aptos blockchain...');
          await new Promise(r => setTimeout(r, 500));
          await broadcastTransaction();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentNodeIndex = () => {
    if (!transaction?.currentNode) return -1;
    return nodes.findIndex(n => n.id === transaction.currentNode);
  };

  const canForwardTo = (nodeId: string): boolean => {
    const currentIndex = getCurrentNodeIndex();
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    return !!(transaction && !transaction.broadcastResult && nodeIndex === currentIndex + 1);
  };

  const isNodeActive = (nodeId: string) => {
    return transaction?.currentNode === nodeId;
  };

  const isNodeCompleted = (nodeId: string) => {
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    const currentIndex = getCurrentNodeIndex();
    return currentIndex > nodeIndex;
  };

  const broadcastTransaction = async () => {
    setIsLoading(true);
    setNetworkStatus('⛓️ Broadcasting to Aptos blockchain...');

    try {
      const response = await fetch(`${API_URL}/api/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
        setNetworkStatus('✅ Payment confirmed on-chain! Seller releasing goods...');
        setSellerConfirmed(true);
        
        // Release goods AFTER blockchain confirmation
        await new Promise(r => setTimeout(r, 1000));
        setGoodsReleased(true);
        setBuyerAction('📦 Buyer receives phone safely!');
        setSellerAction('💰 Seller confirmed payment & released goods!');
      } else {
        setError(data.error || 'Broadcast failed');
        setNetworkStatus('❌ Broadcast failed');
      }
    } catch (error: any) {
      setError(error.message);
      setNetworkStatus('❌ Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const startDoubleSpendAttempt = async () => {
    if (!transaction?.broadcastResult) {
      setError('⚠️ Please run Scenario 1 first to create a transaction!');
      return;
    }
    
    setCurrentScenario('double-spend');
    setError('');
    setDoubleSpendAttempted(false);
    setGoodsReleased(false);
    setSellerConfirmed(false);
    
    setNetworkStatus('😈 Dishonest buyer tries to REUSE the same payment with a new seller!');
    setSellerAction('💬 New Seller: "Show me payment proof"');
    
    // Reset transaction to user node to show the flow again
    const resetTx = { ...transaction, currentNode: 'user', broadcastResult: undefined };
    setTransaction(resetTx);
  };

  const handleDoubleSpendForward = async (toNode: string) => {
    setIsLoading(true);

    try {
      if (toNode === 'merchant1') {
        setNetworkStatus('🔍 New seller verifying signature...');
        await new Promise(r => setTimeout(r, 1500));
        setSellerAction('⚠️ Signature looks valid! Waiting for confirmation...');
        setBuyerAction('😈 Buyer waiting to grab goods and run...');
        setNetworkStatus('📡 Seller forwards to network for confirmation. Click next →');
        setTransaction({ ...transaction!, currentNode: 'merchant1' });
      } else if (toNode === 'merchant2') {
        setNetworkStatus('📡 Forwarding to network...');
        await new Promise(r => setTimeout(r, 1000));
        setNetworkStatus('🏬 Village hub queuing for broadcast. Click to try broadcast →');
        setTransaction({ ...transaction!, currentNode: 'merchant2' });
      } else if (toNode === 'merchant3') {
        setNetworkStatus('⛓️ Attempting to broadcast to blockchain...');
        await new Promise(r => setTimeout(r, 1000));
        
        // Try to broadcast - will fail
        const response = await fetch(`${API_URL}/api/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        
        if (!data.success) {
          setNetworkStatus('🚫 BLOCKCHAIN REJECTED! NO GOODS RELEASED!');
          setSellerAction('🛡️ Seller saved! No confirmation = No goods!');
          setBuyerAction('❌ Caught! Can\'t cheat the blockchain!');
          setDoubleSpendAttempted(true);
          setError(data.error || 'Double-spend prevented by smart contract!');
          setGoodsReleased(false);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async () => {
    await fetch(`${API_URL}/api/reset`, { method: 'POST' });
    setTransaction(null);
    setCurrentScenario(null);
    setGoodsReleased(false);
    setSellerConfirmed(false);
    setDoubleSpendAttempted(false);
    setBuyerAction('');
    setSellerAction('');
    setNetworkStatus('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-pink-600/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (welcomePage === 2) {
                setShowWelcome(false);
                setWelcomePage(1);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/95 to-black border-2 border-purple-500 rounded-3xl p-6 md:p-10 max-w-5xl max-h-[90vh] overflow-y-auto relative w-full"
            >
              {/* Page Indicator */}
              <div className="absolute top-6 right-6 flex gap-2">
                <div className={`w-3 h-3 rounded-full transition-all ${welcomePage === 1 ? 'bg-purple-500' : 'bg-gray-600'}`} />
                <div className={`w-3 h-3 rounded-full transition-all ${welcomePage === 2 ? 'bg-purple-500' : 'bg-gray-600'}`} />
              </div>

              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl"
                >
                  💸
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                  TinyPay
                </h1>
                <p className="text-xl font-bold text-purple-300 mb-2">
                  Offline-First Crypto Payments
                </p>
                <p className="text-base text-gray-400">
                  CTRL+MOVE Hackathon | Real-World Commerce Demo
                </p>
              </div>

              <AnimatePresence mode="wait">
                {welcomePage === 1 && (
                  <motion.div
                    key="page1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-5 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-xl text-center"
                      >
                        <div className="text-3xl font-black text-green-400 mb-1">2.6B</div>
                        <div className="text-xs text-gray-300">Without internet</div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-5 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/50 rounded-xl text-center"
                      >
                        <div className="text-3xl font-black text-blue-400 mb-1">&lt;5s</div>
                        <div className="text-xs text-gray-300">Settlement</div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="p-5 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-xl text-center"
                      >
                        <div className="text-3xl font-black text-purple-400 mb-1">100%</div>
                        <div className="text-xs text-gray-300">Offline</div>
                      </motion.div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="p-5 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                        <h3 className="text-xl font-bold text-blue-400 mb-3">🎯 The Problem</h3>
                        <ul className="text-gray-300 text-base space-y-2">
                          <li>🌍 <strong>2.6 billion people</strong> live in areas with unreliable or no internet access</li>
                          <li>🚫 <strong>Government internet shutdowns</strong> during protests, conflicts, or censorship</li>
                          <li>⚡ <strong>Natural disasters</strong> destroying communication infrastructure</li>
                          <li>💔 Traditional crypto payments <strong>require constant connectivity</strong>, leaving billions behind</li>
                        </ul>
                      </div>

                      <div className="p-5 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                        <h3 className="text-xl font-bold text-purple-400 mb-3">💡 The Solution</h3>
                        <p className="text-gray-300 text-base mb-3">
                          TinyPay enables <strong className="text-purple-300">offline-first crypto payments</strong> on Aptos:
                        </p>
                        <ul className="text-gray-300 text-base space-y-2">
                          <li>📱 Sign transactions <strong>completely offline</strong></li>
                          <li>🔍 Verify signatures <strong>locally without internet</strong></li>
                          <li>📡 Forward through <strong>mesh networks</strong></li>
                          <li>⛓️ Settle on-chain with <strong>bulletproof security</strong></li>
                        </ul>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWelcomePage(2)}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                    >
                      Next: See the Demo Scenarios →
                    </motion.button>
                  </motion.div>
                )}

                {welcomePage === 2 && (
                  <motion.div
                    key="page2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="space-y-4 mb-6">
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold text-purple-400">📖 Two Interactive Scenarios</h3>
                        <p className="text-gray-400 text-sm mt-2">Click through real transactions step-by-step</p>
                      </div>

                      <div className="p-5 bg-green-900/20 border border-green-500/30 rounded-xl">
                        <h3 className="text-xl font-bold text-green-400 mb-3">✅ Scenario 1: Honest Purchase</h3>
                        <p className="text-gray-300 text-base mb-3">
                          Watch a realistic commerce transaction:
                        </p>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>🛍️ Buyer wants to buy a phone for 0.1 APT</li>
                          <li>📱 Creates signed payment <strong>OFFLINE</strong> (no internet)</li>
                          <li>🔍 Seller verifies signature locally</li>
                          <li>⏳ Seller waits for blockchain confirmation (smart!)</li>
                          <li>📡 Payment forwards through offline network</li>
                          <li>⛓️ Final node broadcasts to Aptos blockchain</li>
                          <li>💰 Confirmation received → 📦 Goods released safely!</li>
                        </ul>
                      </div>

                      <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-xl">
                        <h3 className="text-xl font-bold text-red-400 mb-3">🚫 Scenario 2: Double-Spend Attempt</h3>
                        <p className="text-gray-300 text-base mb-3">
                          Watch security in action:
                        </p>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>😈 Dishonest buyer tries to reuse same payment</li>
                          <li>🏪 New seller sees signature (looks valid!)</li>
                          <li>⏳ Smart seller waits for confirmation before releasing</li>
                          <li>📡 Payment forwards to network...</li>
                          <li>⛓️ Tries to broadcast to blockchain...</li>
                          <li>🚫 <strong>SMART CONTRACT REJECTS IT!</strong></li>
                          <li>🛡️ No confirmation = No goods! Seller protected!</li>
                        </ul>
                        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                          <p className="text-red-300 text-xs">
                            ⚠️ <strong>Note:</strong> Run Scenario 1 first to create a transaction to reuse!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setWelcomePage(1)}
                        className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowWelcome(false);
                          setWelcomePage(1);
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                      >
                        ▶️ Start Demo - Begin with Scenario 1 →
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative bg-black/50 backdrop-blur-md border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                💸
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  TinyPay
                </h1>
                <p className="text-xs text-gray-400">Real-World Commerce Demo</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowWelcome(true)}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all text-sm"
            >
              ℹ️ About
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Scenario Selection */}
        {!currentScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Choose a Scenario
            </h2>

            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={startHonestPurchase}
              className="p-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl cursor-pointer hover:border-green-400 transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="text-6xl">✅</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-green-400 mb-3">Scenario 1: Honest Purchase</h3>
                  <p className="text-gray-300 text-lg mb-4">
                    Watch a realistic commerce transaction:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li>🛍️ Buyer wants to buy a phone for 0.1 APT</li>
                    <li>📱 Creates signed payment OFFLINE (no internet)</li>
                    <li>🔍 Seller verifies signature locally</li>
                    <li>⏳ Seller waits for blockchain confirmation (smart!)</li>
                    <li>📡 Payment forwards through offline network</li>
                    <li>⛓️ Final node broadcasts to Aptos blockchain</li>
                    <li>💰 Confirmation → 📦 Goods released safely!</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={startDoubleSpendAttempt}
              className="p-8 bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-2xl cursor-pointer hover:border-red-400 transition-all"
            >
              <div className="flex items-start gap-6">
                <div className="text-6xl">🚫</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-red-400 mb-3">Scenario 2: Double-Spend Attempt</h3>
                  <p className="text-gray-300 text-lg mb-4">
                    Watch security in action:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li>😈 Dishonest buyer tries to reuse same payment</li>
                    <li>🏪 New seller sees signature (looks valid!)</li>
                    <li>⏳ Smart seller waits for confirmation before releasing</li>
                    <li>📡 Payment forwards to network...</li>
                    <li>⛓️ Tries to broadcast to blockchain...</li>
                    <li>🚫 SMART CONTRACT REJECTS IT!</li>
                    <li>🛡️ No confirmation = No goods! Seller protected!</li>
                  </ul>
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">
                      ⚠️ <strong>Note:</strong> Run Scenario 1 first to create a transaction to reuse!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Interactive Story Visualization */}
        {currentScenario && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Story Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black mb-2">
                {currentScenario === 'honest' ? (
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                    ✅ Honest Purchase Scenario
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-red-400 to-orange-400 text-transparent bg-clip-text">
                    🚫 Double-Spend Attempt
                  </span>
                )}
              </h2>
            </div>

            {/* Story Context */}
            <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl mb-6">
              <AnimatePresence mode="wait">
                {networkStatus && (
                  <motion.p
                    key={networkStatus}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl font-bold text-center text-purple-200"
                  >
                    {networkStatus}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Node Boxes */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 mb-8">
              {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <NodeBox
                    {...node}
                    description={node.storyLabel}
                    isActive={isNodeActive(node.id)}
                    isCompleted={isNodeCompleted(node.id)}
                    canInteract={
                      (node.id === 'user' && !transaction) ? true : canForwardTo(node.id)
                    }
                    onClick={() => {
                      if (node.id === 'user' && !transaction) {
                        // Create transaction
                        setNetworkStatus('📱 Creating signed payment (OFFLINE)...');
                        createTransaction();
                      } else if (canForwardTo(node.id)) {
                        // Forward to this node
                        if (currentScenario === 'double-spend') {
                          handleDoubleSpendForward(node.id);
                        } else {
                          handleForward(node.id);
                        }
                      }
                    }}
                    transactionData={transaction}
                    isLoading={isLoading && isNodeActive(node.id)}
                  />
                  
                  {index < nodes.length - 1 && (
                    <div className="relative flex items-center justify-center mx-2">
                      <motion.div
                        className="w-16 h-1 bg-purple-500/50 rounded"
                        animate={{
                          opacity: isNodeCompleted(nodes[index + 1].id) ? 1 : 0.3,
                        }}
                      >
                        {isNodeActive(node.id) && !transaction?.broadcastResult && (
                          <motion.div
                            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      <div className="absolute -right-2 w-0 h-0 border-l-8 border-l-purple-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Story Outcome Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Buyer Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">👤</div>
                  <div>
                    <h3 className="text-2xl font-black text-blue-400">Buyer</h3>
                    <p className="text-sm text-gray-400">Wants to buy a phone</p>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {buyerAction && (
                    <motion.div
                      key={buyerAction}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-black/40 rounded-xl border border-blue-500/30"
                    >
                      <p className="text-blue-200 font-semibold">{buyerAction}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {goodsReleased && currentScenario === 'honest' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-center"
                  >
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-green-400 font-bold">Phone Received!</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Seller Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/50 rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">🏪</div>
                  <div>
                    <h3 className="text-2xl font-black text-orange-400">Seller</h3>
                    <p className="text-sm text-gray-400">Selling goods</p>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {sellerAction && (
                    <motion.div
                      key={sellerAction}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-black/40 rounded-xl border border-orange-500/30"
                    >
                      <p className="text-orange-200 font-semibold">{sellerAction}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {sellerConfirmed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-center"
                  >
                    <div className="text-4xl mb-2">💰</div>
                    <p className="text-green-400 font-bold">Payment Confirmed!</p>
                  </motion.div>
                )}

                {doubleSpendAttempted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 p-4 bg-red-900/40 border-2 border-red-500/50 rounded-xl text-center"
                  >
                    <div className="text-4xl mb-2">🚫</div>
                    <p className="text-red-400 font-bold">Fraud Detected!</p>
                    <p className="text-red-300 text-sm mt-2">Goods NOT released</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Network Status */}
            <AnimatePresence>
              {networkStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl text-center"
                >
                  <p className="text-2xl font-black text-purple-300">{networkStatus}</p>
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 mx-auto mt-4 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transaction Result */}
            {transaction?.broadcastResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl"
              >
                <h3 className="text-3xl font-black text-green-400 mb-4 text-center">
                  ✅ Transaction Confirmed On-Chain!
                </h3>
                <p className="text-gray-400 text-sm mb-4 font-mono break-all text-center">
                  {transaction.broadcastResult.txHash}
                </p>
                <div className="text-center">
                  <a
                    href={transaction.broadcastResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    🔗 View on Aptos Explorer →
                  </a>
                </div>
              </motion.div>
            )}

            {/* Double-Spend Error */}
            {doubleSpendAttempted && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-red-500/50 rounded-2xl"
              >
                <h3 className="text-3xl font-black text-red-400 mb-4 text-center">
                  🚫 Double-Spend BLOCKED by Smart Contract!
                </h3>
                <div className="p-4 bg-black/40 rounded-xl mb-4">
                  <p className="text-red-300 text-sm font-mono break-all">
                    {error}
                  </p>
                </div>
                <div className="p-6 bg-green-900/30 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-bold text-lg mb-2">
                    ✅ Security Working Perfectly!
                  </p>
                  <p className="text-gray-300">
                    The Move smart contract detected the reused nonce and rejected the transaction. 
                    The seller is protected from fraud!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              {/* Next Scenario Button */}
              {currentScenario === 'honest' && transaction?.broadcastResult && sellerConfirmed && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentScenario(null);
                    setTimeout(() => startDoubleSpendAttempt(), 100);
                  }}
                  className="px-12 py-6 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white font-black text-xl rounded-2xl hover:shadow-2xl hover:shadow-red-500/50 transition-all mb-4 block mx-auto"
                >
                  ▶️ Next: Scenario 2 - Double-Spend Attempt
                </motion.button>
              )}

              {/* Back to Scenarios or Reset */}
              <button
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold text-lg rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all"
              >
                {currentScenario === 'double-spend' && doubleSpendAttempted ? '🏁 Demo Complete - Start Over' : '🔄 Reset & Try Another Scenario'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

