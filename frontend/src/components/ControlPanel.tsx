import React from 'react';
import { motion } from 'framer-motion';
import { TransactionState } from '../App';

interface ControlPanelProps {
  txState: TransactionState;
  isSimulating: boolean;
  onStartDemo: () => void;
  onAttemptDoubleSpend: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  txState,
  isSimulating,
  onStartDemo,
  onAttemptDoubleSpend,
  onReset,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-4xl mx-auto mt-12"
    >
      <div className="bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Demo Controls
        </h3>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {/* Start Demo Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartDemo}
            disabled={isSimulating || txState.stage !== 'idle'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {txState.stage === 'idle' ? '▶️ Start Payment Flow' : '⏸️ Demo Running...'}
          </motion.button>

          {/* Double-Spend Attempt Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAttemptDoubleSpend}
            disabled={isSimulating || txState.stage !== 'confirmed'}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            🚫 Attempt Double-Spend
          </motion.button>

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            disabled={isSimulating || txState.stage === 'idle'}
            className="px-8 py-4 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            🔄 Reset
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <h4 className="text-lg font-bold text-purple-300 mb-3">How It Works</h4>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">1.</span>
              <span><strong>Offline User</strong> creates and signs a payment transaction without internet.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">2.</span>
              <span><strong>Merchant 1</strong> (offline) scans QR code and verifies the signature locally.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">3.</span>
              <span><strong>Merchant 2</strong> (offline) receives the transaction blob and forwards it.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">4.</span>
              <span><strong>Merchant 3</strong> (online) broadcasts the transaction to Aptos blockchain.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400 font-bold">5.</span>
              <span><strong>Smart Contract</strong> validates and prevents double-spending using nonces.</span>
            </li>
          </ol>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="text-2xl mb-2">🔒</div>
            <h5 className="font-bold text-green-400 mb-1">Secure Offline</h5>
            <p className="text-xs text-gray-400">Cryptographic signatures work without internet</p>
          </div>
          
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="text-2xl mb-2">📡</div>
            <h5 className="font-bold text-blue-400 mb-1">Mesh Network</h5>
            <p className="text-xs text-gray-400">Payments hop between merchants offline</p>
          </div>
          
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-2xl mb-2">🛡️</div>
            <h5 className="font-bold text-red-400 mb-1">Double-Spend Safe</h5>
            <p className="text-xs text-gray-400">Nonce-based protection on-chain</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;



