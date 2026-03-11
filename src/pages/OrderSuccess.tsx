import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Copy, Check } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-24 bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-12"
        >
          <div className="w-32 h-32 mx-auto border-4 border-accent bg-accent/10 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]">
            <CheckCircle size={64} className="text-accent" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-accent font-mono text-sm mb-4 block tracking-[0.5em]">[ ORDER_CONFIRMED ]</span>
          <h1 className="text-6xl md:text-8xl font-display uppercase mb-6 leading-[0.8] tracking-tighter">
            YOUR DROP<br /><span className="text-accent">IS LOCKED</span>
          </h1>
          <p className="font-mono text-sm uppercase tracking-wider text-white/40 mb-12 max-w-md mx-auto">
            YOUR AETHER PIECE IS BEING CRAFTED. PRODUCTION BEGINS IMMEDIATELY.
          </p>
        </motion.div>

        {/* Order ID */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="border-4 border-white p-6 mb-12 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          >
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">ORDER ID</p>
            <div className="flex items-center justify-center gap-4">
              <code className="font-mono text-lg text-accent break-all">{orderId}</code>
              <button
                onClick={copyOrderId}
                className="p-2 border-2 border-white/20 hover:border-accent transition-colors"
              >
                {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="border-4 border-white/20 p-8 mb-12"
        >
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-accent border-2 border-black flex items-center justify-center">
                <Check size={14} className="text-black" />
              </div>
              <span className="text-accent">ORDERED</span>
            </div>
            <div className="flex-1 h-[2px] bg-white/20 mx-2" />
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-white/40 flex items-center justify-center animate-pulse">
                <Package size={14} />
              </div>
              <span className="text-white/60">PRODUCING</span>
            </div>
            <div className="flex-1 h-[2px] bg-white/10 mx-2" />
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-white/20 flex items-center justify-center">
                <ArrowRight size={14} className="text-white/20" />
              </div>
              <span className="text-white/20">SHIPPED</span>
            </div>
            <div className="flex-1 h-[2px] bg-white/10 mx-2" />
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-white/20 flex items-center justify-center">
                <CheckCircle size={14} className="text-white/20" />
              </div>
              <span className="text-white/20">DELIVERED</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/track-order" className="brutal-btn px-8 py-4">TRACK_ORDER</Link>
          <Link to="/category/men" className="brutal-btn bg-white text-black hover:bg-accent px-8 py-4">CONTINUE_SHOPPING</Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-12 font-mono text-[10px] text-white/20 uppercase tracking-wider"
        >
          A CONFIRMATION EMAIL HAS BEEN SENT TO YOUR ADDRESS. ESTIMATED DELIVERY: 5-15 BUSINESS DAYS.
        </motion.p>
      </motion.div>
    </div>
  );
}
