import React from 'react';
import { motion } from 'framer-motion';

interface ParticipantBoxProps {
  name: string;
  icon: string;
  status: 'idle' | 'active' | 'complete' | 'error';
  message: string;
  isOnline: boolean;
  nonce?: number;
  amount?: number;
  explorerUrl?: string;
  error?: string;
}

const ParticipantBox: React.FC<ParticipantBoxProps> = ({
  name,
  icon,
  status,
  message,
  isOnline,
  explorerUrl,
  error,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'complete':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-600 bg-gray-800/30';
    }
  };

  const getIconAnimation = () => {
    if (status === 'active') {
      return {
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0],
      };
    }
    return {};
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-64 h-64 rounded-2xl border-2 ${getStatusColor()} backdrop-blur-md p-6 flex flex-col items-center justify-center transition-all duration-300`}
    >
      {/* Online/Offline Badge */}
      <div className="absolute top-3 right-3">
        {isOnline ? (
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
        animate={getIconAnimation()}
        transition={{
          duration: 1,
          repeat: status === 'active' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="text-6xl mb-4"
      >
        {icon}
      </motion.div>

      {/* Name */}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>

      {/* Status Message */}
      <p className={`text-sm text-center ${
        status === 'error' ? 'text-red-400' : 
        status === 'complete' ? 'text-green-400' : 
        status === 'active' ? 'text-yellow-400' : 
        'text-gray-400'
      }`}>
        {message}
      </p>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300 text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Explorer Link */}
      {explorerUrl && status === 'complete' && (
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-xs text-purple-300 hover:bg-purple-500/30 transition-all"
        >
          View on Explorer →
        </motion.a>
      )}

      {/* Activity Indicator */}
      {status === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-yellow-500"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
};

export default ParticipantBox;


