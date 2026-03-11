import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { formatPrice } from '../utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const subtotal = cart.reduce((acc, item) => acc + (item.markup_price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-black border-l-4 border-accent z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-white">
              <div className="flex items-center gap-4">
                <ShoppingBag size={24} className="text-accent" />
                <h2 className="font-display text-2xl uppercase tracking-widest">BAG</h2>
                <span className="bg-accent text-black px-3 py-1 font-mono text-xs font-bold">{cartCount}</span>
              </div>
              <button
                onClick={onClose}
                className="p-3 border-2 border-white/20 hover:border-accent hover:bg-accent/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={64} className="text-white/10 mb-6" />
                  <p className="font-display text-xl uppercase mb-2">EMPTY BAG</p>
                  <p className="font-mono text-xs text-white/30 uppercase tracking-wider">YOUR DROPS AWAIT</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                    layout
                    className="flex gap-4 p-4 border-2 border-white/10 hover:border-accent/30 transition-colors"
                  >
                    <div className="w-20 h-24 bg-zinc-900 border border-white/10 overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_variants?.[0]?.image_url || item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm uppercase truncate">{item.name}</h4>
                      <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mt-1">
                        {item.selectedColor} / {item.selectedSize}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-white/20">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-xs"
                          ><Minus size={12} /></button>
                          <span className="w-7 h-7 flex items-center justify-center font-mono text-xs border-x border-white/20">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-xs"
                          ><Plus size={12} /></button>
                        </div>
                        <span className="font-display text-accent">{formatPrice(item.markup_price * item.quantity)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                      className="self-start p-1 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t-4 border-white space-y-4">
                <div className="flex justify-between font-display text-lg uppercase">
                  <span>SUBTOTAL</span>
                  <span className="text-accent">{formatPrice(subtotal)}</span>
                </div>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                  SHIPPING CALCULATED AT CHECKOUT
                </p>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="w-full h-16 bg-white text-black font-display text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-accent transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
                >
                  <ArrowRight size={20} /> CHECKOUT
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
