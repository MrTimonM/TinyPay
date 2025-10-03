import React from 'react';
import { motion } from 'framer-motion';

interface FlowArrowProps {
  direction: 'horizontal' | 'vertical';
  label?: string;
  animated?: boolean;
}

const FlowArrow: React.FC<FlowArrowProps> = ({ direction, label, animated = false }) => {
  if (direction === 'horizontal') {
    return (
      <div className="relative flex flex-col items-center justify-center mx-4">
        {/* Arrow */}
        <div className="relative w-24 h-1 bg-purple-500/50">
          {animated && (
            <motion.div
              className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
          
          {/* Arrowhead */}
          <motion.div
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-purple-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"
            animate={animated ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{
              duration: 0.5,
              repeat: animated ? Infinity : 0,
            }}
          />
        </div>

        {/* Label */}
        {label && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs text-purple-300 font-mono"
          >
            {label}
          </motion.span>
        )}
      </div>
    );
  }

  // Vertical arrow (for mobile/responsive)
  return (
    <div className="relative flex flex-row items-center justify-center my-4">
      {/* Arrow */}
      <div className="relative h-24 w-1 bg-purple-500/50">
        {animated && (
          <motion.div
            className="absolute left-0 top-0 w-full h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent"
            animate={{
              y: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
        
        {/* Arrowhead */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-t-8 border-t-purple-500 border-l-4 border-l-transparent border-r-4 border-r-transparent"
          animate={animated ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: animated ? Infinity : 0,
          }}
        />
      </div>

      {/* Label */}
      {label && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-2 text-xs text-purple-300 font-mono"
        >
          {label}
        </motion.span>
      )}
    </div>
  );
};

export default FlowArrow;


