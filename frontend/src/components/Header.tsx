import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/30 backdrop-blur-md border-b border-purple-500/30"
    >
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
              <h1 className="text-3xl font-bold text-white">TinyPay</h1>
              <p className="text-sm text-gray-400">Crypto Payments Without Internet</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <span className="text-green-400 text-sm font-semibold">🟢 Aptos Devnet</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;


