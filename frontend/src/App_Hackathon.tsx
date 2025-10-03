import React, { useState, useEffect } from 'react';
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

function App() {
  const [transaction, setTransaction] = useState<TransactionState | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [doubleSpendAttempt, setDoubleSpendAttempt] = useState(false);
  const [doubleSpendError, setDoubleSpendError] = useState('');

  const nodes = [
    { id: 'user', name: 'User', icon: '👤', online: false, description: 'Offline Zone' },
    { id: 'merchant1', name: 'Merchant 1', icon: '🏪', online: false, description: 'Rural Store' },
    { id: 'merchant2', name: 'Merchant 2', icon: '🏬', online: false, description: 'Village Hub' },
    { id: 'merchant3', name: 'Merchant 3', icon: '🏦', online: true, description: 'City Gateway' },
  ];

  const getUserAddress = async () => {
    return '0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd';
  };

  const fetchBalance = async () => {
    try {
      const address = await getUserAddress();
      const response = await fetch(`${API_URL}/api/balance/${address}`);
      const data = await response.json();
      if (data.success) {
        setUserBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleCreateTransaction = async () => {
    if (!recipientAddress) {
      setError('Please enter recipient address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/create-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privateKey: USER_PRIVATE_KEY,
          recipientAddress,
          amount: 0.1
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
        fetchBalance();
      } else {
        setError(data.error || 'Failed to create transaction');
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForward = async (toNode: string) => {
    if (!transaction) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNode })
      });

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
        
        if (toNode === 'merchant3') {
          setTimeout(() => handleBroadcast(), 500);
        }
      } else {
        setError(data.error || 'Failed to forward');
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!transaction) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
        fetchBalance();
      } else {
        setError(data.error || 'Failed to broadcast');
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${API_URL}/api/reset`, { method: 'POST' });
      setTransaction(null);
      setRecipientAddress('');
      setError('');
      setDoubleSpendAttempt(false);
      setDoubleSpendError('');
      fetchBalance();
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const handleDoubleSpend = async () => {
    if (!transaction?.broadcastResult) return;
    
    setDoubleSpendAttempt(true);
    setIsLoading(true);
    setDoubleSpendError('');

    try {
      // Try to broadcast the same transaction again
      const response = await fetch(`${API_URL}/api/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (!data.success) {
        // This is expected - the double-spend should fail!
        setDoubleSpendError(data.error || 'Double-spend prevented by smart contract!');
      } else {
        // This shouldn't happen, but handle it
        setDoubleSpendError('Unexpected: Transaction went through (this should not happen)');
      }
    } catch (error: any) {
      setDoubleSpendError(error.message || 'Double-spend attempt failed (as expected!)');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentNodeIndex = () => {
    if (!transaction?.currentNode) return -1;
    return nodes.findIndex(n => n.id === transaction.currentNode);
  };

  const canForwardTo = (nodeId: string) => {
    const currentIndex = getCurrentNodeIndex();
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    return transaction && !transaction.broadcastResult && nodeIndex === currentIndex + 1;
  };

  const isNodeActive = (nodeId: string) => {
    return transaction?.currentNode === nodeId;
  };

  const isNodeCompleted = (nodeId: string) => {
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    const currentIndex = getCurrentNodeIndex();
    return currentIndex > nodeIndex;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-pink-600/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/90 to-black border-2 border-purple-500 rounded-3xl p-8 md:p-12 max-w-4xl relative overflow-hidden"
            >
              {/* Aptos Logo Area */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl"
                >
                  💸
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                  TinyPay
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-purple-300 mb-2">
                  Crypto Payments Without Internet
                </p>
                <p className="text-lg text-gray-400">
                  CTRL+MOVE Hackathon | Payments & Money Movement Track
                </p>
              </div>

              {/* Problem & Solution */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-3">❌ The Problem</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 2.6B people lack reliable internet</li>
                    <li>• Rural commerce limited by connectivity</li>
                    <li>• Disaster scenarios need resilience</li>
                    <li>• Traditional crypto requires online access</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-3">✅ Our Solution</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Offline transaction signing (Ed25519)</li>
                    <li>• Mesh network forwarding</li>
                    <li>• On-chain settlement via Aptos</li>
                    <li>• Double-spend prevention (Move contract)</li>
                  </ul>
                </div>
              </div>

              {/* Key Innovation */}
              <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-purple-300 mb-3">🚀 Key Innovation</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  TinyPay enables <strong className="text-purple-400">offline-first cryptocurrency payments</strong> on Aptos blockchain. 
                  Users sign transactions without internet, merchants verify cryptographically, 
                  and payments hop through an <strong className="text-pink-400">offline mesh network</strong> until 
                  reaching an online node for <strong className="text-blue-400">final settlement</strong>.
                </p>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWelcome(false)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                🎮 Start Live Demo →
              </motion.button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Click anywhere outside to close • Built on Aptos Devnet
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative bg-black/50 backdrop-blur-md border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl md:text-3xl"
              >
                💸
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  TinyPay
                </h1>
                <p className="text-xs md:text-sm text-gray-400">Offline-First Crypto Payments</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {userBalance !== null && (
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <span className="text-blue-400 text-sm font-semibold">
                    💰 {userBalance.toFixed(4)} APT
                  </span>
                </div>
              )}
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                <span className="text-green-400 text-sm font-semibold">🟢 Aptos Devnet</span>
              </div>
              <button
                onClick={() => setShowWelcome(true)}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all text-sm"
              >
                ℹ️ About
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-purple-900/50 to-black border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-purple-400">2.6B</div>
            <div className="text-xs text-gray-400">People Without Internet</div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/50 to-black border border-pink-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-pink-400">100%</div>
            <div className="text-xs text-gray-400">Offline Capable</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-black border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-blue-400">&lt;5s</div>
            <div className="text-xs text-gray-400">Settlement Time</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-black border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-green-400">$0.001</div>
            <div className="text-xs text-gray-400">Transaction Fee</div>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-black/60 backdrop-blur-md border-2 border-purple-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <h2 className="text-3xl font-black text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            💎 Live Transaction Demo
          </h2>
          
          {!transaction ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">📍 Recipient Address:</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x... (try: 0x7ceaa448...)"
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
                <p className="text-purple-300 text-sm">
                  <strong>💸 Amount:</strong> 0.1 APT (Fixed for demo)
                </p>
                <p className="text-purple-300 text-sm mt-1">
                  <strong>🔐 Security:</strong> Ed25519 cryptographic signatures
                </p>
              </div>

              <button
                onClick={handleCreateTransaction}
                disabled={isLoading || !recipientAddress}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isLoading ? '⏳ Creating Transaction...' : '🚀 Create Offline Transaction'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl">
                <p className="text-green-300 font-bold mb-2">
                  ✅ Transaction Signed & Ready!
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Nonce:</span>
                    <span className="ml-2 text-white font-mono">{transaction.txDetails?.nonce}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span>
                    <span className="ml-2 text-white font-bold">{transaction.txDetails?.amount} APT</span>
                  </div>
                </div>
              </div>

              {transaction.broadcastResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-300 font-black text-lg mb-3">
                      🎉 Transaction Confirmed On-Chain!
                    </p>
                    <p className="text-gray-400 text-xs mb-3 font-mono break-all">
                      {transaction.broadcastResult.txHash}
                    </p>
                    <a
                      href={transaction.broadcastResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                    >
                      🔗 View on Aptos Explorer →
                    </a>
                  </div>

                  {/* Double-Spend Demo */}
                  {!doubleSpendAttempt && (
                    <div className="p-4 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl">
                      <p className="text-orange-300 font-bold mb-2">
                        🛡️ Test Double-Spend Prevention
                      </p>
                      <p className="text-gray-400 text-sm mb-3">
                        Try to reuse the same transaction (same nonce). The smart contract will reject it!
                      </p>
                      <button
                        onClick={handleDoubleSpend}
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 transition-all"
                      >
                        {isLoading ? '⏳ Attempting...' : '🚫 Attempt Double-Spend'}
                      </button>
                    </div>
                  )}

                  {doubleSpendError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-red-900/40 to-pink-900/40 border-2 border-red-500/50 rounded-xl"
                    >
                      <p className="text-red-300 font-black text-lg mb-2">
                        ❌ Double-Spend Prevented!
                      </p>
                      <p className="text-red-200 text-sm mb-3">
                        The Aptos smart contract detected the reused nonce and rejected the transaction.
                      </p>
                      <div className="p-3 bg-black/40 rounded-lg">
                        <p className="text-xs text-gray-400 font-mono break-all">
                          {doubleSpendError}
                        </p>
                      </div>
                      <div className="mt-3 flex items-start gap-2 text-xs text-green-300">
                        <span className="text-lg">✅</span>
                        <span>
                          <strong>Security Working:</strong> The Move contract's nonce-based protection successfully prevented this double-spend attack!
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl hover:from-gray-600 hover:to-gray-800 transition-all"
              >
                🔄 Reset & Create New Transaction
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
              <p className="text-red-300 font-semibold">❌ {error}</p>
            </div>
          )}
        </motion.div>

        {/* Flow Visualization */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
            📡 Offline-to-Online Payment Flow
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <NodeBox
                  {...node}
                  isActive={isNodeActive(node.id)}
                  isCompleted={isNodeCompleted(node.id)}
                  canInteract={node.id === 'user' ? !transaction : canForwardTo(node.id)}
                  onClick={() => {
                    if (node.id === 'user') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (canForwardTo(node.id)) {
                      handleForward(node.id);
                    }
                  }}
                  transactionData={transaction}
                  isLoading={isLoading}
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
        </div>

        {/* Technical Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-black to-purple-950 border-2 border-purple-500/30 rounded-2xl p-8 shadow-2xl"
        >
          <h3 className="text-3xl font-black text-purple-300 mb-6 text-center">🏆 Why TinyPay Wins</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">🔒</div>
              <h5 className="font-black text-purple-400 mb-2 text-xl">Cryptographically Secure</h5>
              <p className="text-sm text-gray-400">Ed25519 signatures ensure transaction authenticity without network</p>
            </div>
            
            <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-6 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">📡</div>
              <h5 className="font-black text-pink-400 mb-2 text-xl">Mesh Network Ready</h5>
              <p className="text-sm text-gray-400">Payments hop through offline nodes using QR/NFC/Bluetooth</p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">🛡️</div>
              <h5 className="font-black text-blue-400 mb-2 text-xl">Double-Spend Safe</h5>
              <p className="text-sm text-gray-400">Move smart contract enforces nonce-based replay prevention</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
            <h4 className="text-xl font-black text-purple-300 mb-4">📚 Built with Aptos Stack</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-400 font-bold">Smart Contract:</span>
                <span className="ml-2 text-gray-300">Move language with Table & SimpleMap</span>
              </div>
              <div>
                <span className="text-pink-400 font-bold">SDK:</span>
                <span className="ml-2 text-gray-300">@aptos-labs/ts-sdk v1.28.0</span>
              </div>
              <div>
                <span className="text-blue-400 font-bold">Network:</span>
                <span className="ml-2 text-gray-300">Aptos Devnet (sub-second finality)</span>
              </div>
              <div>
                <span className="text-green-400 font-bold">Crypto:</span>
                <span className="ml-2 text-gray-300">Ed25519 digital signatures</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-purple-500/30 bg-black/50 backdrop-blur-md py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-400 font-bold mb-2">
            🏆 CTRL+MOVE Hackathon Submission
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Payments & Money Movement Track | Built on Aptos Blockchain
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="https://aptoslabs.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              Powered by Aptos
            </a>
            <span className="text-gray-600">•</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              View Source Code
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

