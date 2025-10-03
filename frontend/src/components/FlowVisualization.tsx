import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionState } from '../App';
import ParticipantBox from './ParticipantBox';
import FlowArrow from './FlowArrow';

interface FlowVisualizationProps {
  txState: TransactionState;
}

const FlowVisualization: React.FC<FlowVisualizationProps> = ({ txState }) => {
  const getParticipantStatus = (participant: 'user' | 'merchant1' | 'merchant2' | 'merchant3') => {
    switch (txState.stage) {
      case 'user-signing':
        return participant === 'user' ? 'active' : 'idle';
      case 'merchant1-verify':
        return participant === 'merchant1' ? 'active' : participant === 'user' ? 'complete' : 'idle';
      case 'merchant2-forward':
        return participant === 'merchant2' ? 'active' : ['user', 'merchant1'].includes(participant) ? 'complete' : 'idle';
      case 'merchant3-broadcast':
        return participant === 'merchant3' ? 'active' : ['user', 'merchant1', 'merchant2'].includes(participant) ? 'complete' : 'idle';
      case 'confirmed':
        return 'complete';
      case 'double-spend-attempt':
      case 'double-spend-rejected':
        return participant === 'merchant3' ? 'error' : 'complete';
      default:
        return 'idle';
    }
  };

  const getMessage = (participant: 'user' | 'merchant1' | 'merchant2' | 'merchant3') => {
    const status = getParticipantStatus(participant);
    
    if (txState.stage === 'double-spend-rejected' && participant === 'merchant3') {
      return '❌ Double-spend blocked!';
    }
    
    if (status === 'idle') return 'Waiting...';
    
    switch (participant) {
      case 'user':
        return status === 'active' ? '📱 Creating signed TX...' : '✅ TX signed (offline)';
      case 'merchant1':
        return status === 'active' ? '🔍 Verifying signature...' : '✅ Verified & accepted';
      case 'merchant2':
        return status === 'active' ? '📦 Forwarding TX...' : '✅ TX forwarded';
      case 'merchant3':
        return status === 'active' ? '🌐 Broadcasting to chain...' : status === 'error' ? '❌ TX rejected' : '✅ TX confirmed on-chain';
      default:
        return '';
    }
  };

  const showArrow = (from: 'user' | 'merchant1' | 'merchant2', to: 'merchant1' | 'merchant2' | 'merchant3') => {
    const stageOrder: Record<string, number> = {
      'idle': 0,
      'user-signing': 1,
      'merchant1-verify': 2,
      'merchant2-forward': 3,
      'merchant3-broadcast': 4,
      'confirmed': 5,
      'double-spend-attempt': 4,
      'double-spend-rejected': 5,
    };

    const arrowOrder: Record<string, number> = {
      'user-merchant1': 2,
      'merchant1-merchant2': 3,
      'merchant2-merchant3': 4,
    };

    const currentStage = stageOrder[txState.stage] || 0;
    const arrowStage = arrowOrder[`${from}-${to}`];

    return currentStage >= arrowStage;
  };

  return (
    <div className="relative py-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Offline-to-Online Payment Flow
        </h2>
        <p className="text-gray-400 text-lg">
          Watch how a payment travels from offline user through merchants to on-chain settlement
        </p>
      </motion.div>

      {/* Flow Boxes */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 relative">
        {/* User */}
        <ParticipantBox
          name="User"
          icon="👤"
          status={getParticipantStatus('user')}
          message={getMessage('user')}
          isOnline={false}
          nonce={txState.nonce}
          amount={txState.amount}
        />

        {/* Arrow 1 */}
        {showArrow('user', 'merchant1') && (
          <FlowArrow 
            direction="horizontal" 
            label="QR / Bluetooth"
            animated={txState.stage === 'merchant1-verify'}
          />
        )}

        {/* Merchant 1 */}
        <ParticipantBox
          name="Merchant 1"
          icon="🏪"
          status={getParticipantStatus('merchant1')}
          message={getMessage('merchant1')}
          isOnline={false}
        />

        {/* Arrow 2 */}
        {showArrow('merchant1', 'merchant2') && (
          <FlowArrow 
            direction="horizontal" 
            label="TX Blob"
            animated={txState.stage === 'merchant2-forward'}
          />
        )}

        {/* Merchant 2 */}
        <ParticipantBox
          name="Merchant 2"
          icon="🏬"
          status={getParticipantStatus('merchant2')}
          message={getMessage('merchant2')}
          isOnline={false}
        />

        {/* Arrow 3 */}
        {showArrow('merchant2', 'merchant3') && (
          <FlowArrow 
            direction="horizontal" 
            label="TX Blob"
            animated={txState.stage === 'merchant3-broadcast'}
          />
        )}

        {/* Merchant 3 */}
        <ParticipantBox
          name="Merchant 3"
          icon="🏦"
          status={getParticipantStatus('merchant3')}
          message={getMessage('merchant3')}
          isOnline={true}
          explorerUrl={txState.explorerUrl}
          error={txState.stage === 'double-spend-rejected' ? txState.error : undefined}
        />
      </div>

      {/* Transaction Info */}
      <AnimatePresence>
        {txState.stage !== 'idle' && txState.nonce && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-12 max-w-2xl mx-auto bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Amount:</span>
                <span className="ml-2 text-white font-semibold">{txState.amount} APT</span>
              </div>
              <div>
                <span className="text-gray-400">Nonce:</span>
                <span className="ml-2 text-white font-mono">{txState.nonce}</span>
              </div>
              {txState.txHash && (
                <div className="col-span-2">
                  <span className="text-gray-400">TX Hash:</span>
                  <span className="ml-2 text-white font-mono text-xs">{txState.txHash}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlowVisualization;


