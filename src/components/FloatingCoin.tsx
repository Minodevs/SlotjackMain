'use client';

import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingCoinProps {
  amount: number;
  isVisible: boolean;
  onAnimationEnd: () => void;
}

export default function FloatingCoin({ amount, isVisible, onAnimationEnd }: FloatingCoinProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isVisible && isMounted) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationEnd, isMounted]);

  if (!isVisible || !isMounted) return null;

  return (
    <motion.div 
      className="fixed top-20 right-20 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: -30 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <div className={`flex items-center justify-center px-4 py-2 rounded-full backdrop-blur-md ${
        amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        <Coins className="w-6 h-6 mr-2" strokeWidth={2.5} />
        <span className="font-bold text-xl">{amount > 0 ? '+' : ''}{amount}</span>
      </div>
    </motion.div>
  );
} 