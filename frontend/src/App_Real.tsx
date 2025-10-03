import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NodeBox from './components/NodeBox';
import './App.css';

const API_URL = 'http://localhost:3001';

// Your private key
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

  // Node configurations
  const nodes = [
    { id: 'user', name: 'User', icon: '👤', online: false, description: 'Create Transaction' },
    { id: 'merchant1', name: 'Merchant 1', icon: '🏪', online: false, description: 'Offline Node' },
    { id: 'merchant2', name: 'Merchant 2', icon: '🏬', online: false, description: 'Offline Node' },
    { id: 'merchant3', name: 'Merchant 3', icon: '🏦', online: true, description: 'Online Node' },
  ];

  // Get user address from private key
  const getUserAddress = async () => {
    try {
      // This is a placeholder - in real app you'd derive from private key
      return '0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd';
    } catch (error) {
      console.error('Error getting user address:', error);
      return '';
    }
  };

  // Fetch balance
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

  // Create transaction
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
          amount: 0.1 // 0.1 APT as requested
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.transaction);
        fetchBalance(); // Update balance
      } else {
        setError(data.error || 'Failed to create transaction');
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Forward transaction to next node
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
        
        // If forwarded to merchant3 (online node), automatically broadcast!
        if (toNode === 'merchant3') {
          console.log('Transaction reached online node - auto-broadcasting...');
          setTimeout(() => handleBroadcast(), 500); // Small delay for UI update
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

  // Broadcast transaction
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
        fetchBalance(); // Update balance after successful broadcast
      } else {
        setError(data.error || 'Failed to broadcast');
      }
    } catch (error: any) {
      setError(error.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset
  const handleReset = async () => {
    try {
      await fetch(`${API_URL}/api/reset`, { method: 'POST' });
      setTransaction(null);
      setRecipientAddress('');
      setError('');
      fetchBalance();
    } catch (error) {
      console.error('Error resetting:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <span className="text-2xl">💸</span>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">TinyPay - REAL MODE</h1>
                <p className="text-sm text-gray-400">Live Offline-to-Online Payments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {userBalance !== null && (
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <span className="text-blue-400 text-sm font-semibold">
                    💰 Balance: {userBalance.toFixed(4)} APT
                  </span>
                </div>
              )}
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                <span className="text-green-400 text-sm font-semibold">🟢 Aptos Devnet</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Transaction Control</h2>
          
          {!transaction ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Recipient Address:</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-sm">
                  <strong>Amount:</strong> 0.1 APT (fixed as requested)
                </p>
                <p className="text-purple-300 text-sm mt-1">
                  <strong>Your Key:</strong> Using your provided private key
                </p>
              </div>

              <button
                onClick={handleCreateTransaction}
                disabled={isLoading || !recipientAddress}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? '⏳ Creating...' : '🔐 Create Signed Transaction'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm">
                  ✅ Transaction signed and ready!
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Nonce: {transaction.txDetails?.nonce}
                </p>
                <p className="text-gray-400 text-xs">
                  Amount: {transaction.txDetails?.amount} APT
                </p>
                <p className="text-gray-400 text-xs">
                  To: {transaction.txDetails?.recipient}
                </p>
              </div>

              {transaction.broadcastResult && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 font-bold mb-2">
                    🎉 Transaction Confirmed On-Chain!
                  </p>
                  <p className="text-gray-400 text-xs mb-2">
                    TX Hash: {transaction.broadcastResult.txHash}
                  </p>
                  <a
                    href={transaction.broadcastResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm hover:bg-blue-500/30 transition-all"
                  >
                    🔗 View on Explorer →
                  </a>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
              >
                🔄 Reset & Create New Transaction
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300">❌ {error}</p>
            </div>
          )}
        </motion.div>

        {/* Nodes Flow */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Click Nodes to Forward Transaction →
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
                      // User node - scroll to control panel
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (canForwardTo(node.id)) {
                      // Forward to this node (will auto-broadcast if it's merchant3)
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
                      initial={{ opacity: 0.3 }}
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

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-purple-300 mb-4">📖 How to Use (REAL MODE)</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">1.</span>
              <span>Enter recipient address and click <strong>"Create Signed Transaction"</strong> to sign a real 0.1 APT payment.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">2.</span>
              <span>Click <strong>Merchant 1</strong> box to forward the signed transaction (simulates offline transfer).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">3.</span>
              <span>Click <strong>Merchant 2</strong> to continue forwarding the transaction.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">4.</span>
              <span>Click <strong>Merchant 3</strong> (online node) to <strong>BROADCAST TO APTOS BLOCKCHAIN</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">5.</span>
              <span>Wait for confirmation and click the Explorer link to see your transaction on-chain!</span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>WARNING:</strong> This uses REAL transactions on Aptos Devnet. Make sure you have enough APT in your account!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;

