import React from 'react';
import { motion } from 'framer-motion';

interface NodeBoxProps {
  id: string;
  name: string;
  icon: string;
  online: boolean;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canInteract: boolean;
  onClick: () => void;
  transactionData: any;
  isLoading: boolean;
}

const NodeBox: React.FC<NodeBoxProps> = ({
  id,
  name,
  icon,
  online,
  description,
  isActive,
  isCompleted,
  canInteract,
  onClick,
  transactionData,
  isLoading,
}) => {
  const getStatusColor = () => {
    if (isCompleted) return 'border-green-500 bg-green-500/10';
    if (isActive) return 'border-yellow-500 bg-yellow-500/10';
    if (canInteract) return 'border-purple-500 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20';
    return 'border-gray-600 bg-gray-800/30';
  };

  const getStatusText = () => {
    if (isLoading && isActive) return 'Processing...';
    if (transactionData?.broadcastResult && id === 'merchant3') return '✅ Broadcasted!';
    if (isCompleted) return '✅ Complete';
    if (isActive && id === 'user') return '📱 Transaction Ready';
    if (isActive && id === 'merchant3') return '🌐 Ready to Broadcast';
    if (isActive) return '📦 Transaction Here';
    if (canInteract && id === 'user') return '👆 Click to Create TX';
    if (canInteract) return '👆 Click to Receive';
    return 'Waiting...';
  };

  const getNodeInstruction = () => {
    if (id === 'user' && !transactionData) {
      return 'Start here: Create transaction';
    }
    if (id === 'merchant3' && isActive && !transactionData?.broadcastResult) {
      return 'Broadcasting to blockchain...';
    }
    if (id === 'merchant3' && canInteract) {
      return 'Click to forward & broadcast!';
    }
    if (canInteract && id !== 'user') {
      return 'Click to forward here';
    }
    return description;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={canInteract ? { scale: 1.05 } : {}}
      whileTap={canInteract ? { scale: 0.95 } : {}}
      onClick={canInteract && !isLoading ? onClick : undefined}
      className={`relative w-64 h-72 rounded-2xl border-2 ${getStatusColor()} backdrop-blur-md p-6 flex flex-col items-center justify-center transition-all duration-300`}
    >
      {/* Online/Offline Badge */}
      <div className="absolute top-3 right-3">
        {online ? (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full text-xs text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Offline
          </span>
        )}
      </div>

      {/* Icon */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{
          duration: 1,
          repeat: isActive ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="text-6xl mb-4"
      >
        {icon}
      </motion.div>

      {/* Name */}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>

      {/* Status */}
      <p className={`text-sm text-center mb-2 ${
        isCompleted ? 'text-green-400' : 
        isActive ? 'text-yellow-400' : 
        canInteract ? 'text-purple-400' : 
        'text-gray-400'
      }`}>
        {getStatusText()}
      </p>

      {/* Description */}
      <p className="text-xs text-gray-400 text-center">
        {getNodeInstruction()}
      </p>

      {/* Transaction Info */}
      {isActive && transactionData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-black/40 rounded-lg text-xs text-gray-300 w-full"
        >
          <div className="text-center">
            <div className="font-mono">
              {transactionData.txDetails?.amount} APT
            </div>
            <div className="text-gray-500">
              Nonce: {transactionData.txDetails?.nonce?.toString().slice(-6)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Broadcast Result */}
      {transactionData?.broadcastResult && id === 'merchant3' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2"
        >
          <a
            href={transactionData.broadcastResult.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-lg text-xs text-blue-300 hover:bg-blue-500/30 transition-all inline-block"
          >
            View on Explorer →
          </a>
        </motion.div>
      )}

      {/* Active Indicator */}
      {isActive && !isCompleted && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-yellow-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Click Indicator */}
      {canInteract && !isActive && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        >
          Click Me!
        </motion.div>
      )}

      {/* Loading Spinner */}
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
};

export default NodeBox;

