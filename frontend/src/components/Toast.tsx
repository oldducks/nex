"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-10 left-1/2 z-[100] min-w-[320px] max-w-md"
        >
          <div className={`
            flex items-center gap-4 px-6 py-4 rounded-[24px] shadow-2xl backdrop-blur-xl border
            ${type === 'success' ? 'bg-emerald-500/90 border-emerald-400/20 text-white' : ''}
            ${type === 'error' ? 'bg-rose-500/90 border-rose-400/20 text-white' : ''}
            ${type === 'info' ? 'bg-primary/90 border-primary/20 text-white' : ''}
          `}>
            {type === 'success' && <CheckCircle className="shrink-0" size={20} />}
            {type === 'error' && <AlertCircle className="shrink-0" size={20} />}
            
            <p className="flex-1 text-sm font-black tracking-tight">{message}</p>
            
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
