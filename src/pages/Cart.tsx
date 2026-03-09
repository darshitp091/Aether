import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../utils';

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useStore();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 250 ? 0 : 25;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
        <div className="relative mb-12">
          <ShoppingBag size={120} className="text-accent opacity-20" />
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4 bg-white text-black px-4 py-2 font-display text-xl border-2 border-black rotate-12"
          >
            EMPTY!
          </motion.div>
        </div>
        <h2 className="text-6xl md:text-8xl font-display uppercase mb-8 text-center leading-none">Your bag is<br/>ghosting you</h2>
        <p className="font-mono text-white/40 mb-12 text-center max-w-md uppercase tracking-widest text-sm">
          [ DON'T LET THE DRIP SLIP AWAY. EXPLORE THE LATEST DROPS NOW. ]
        </p>
        <Link 
          to="/category/men"
          className="brutal-btn px-16 py-6"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
      <div className="flex items-end gap-12 mb-24 border-b-[8px] border-white pb-16">
        <h1 className="text-8xl md:text-[15vw] font-display leading-[0.7] uppercase tracking-tighter">
          <span className="outline-text">B</span>AG
        </h1>
        <span className="font-mono text-accent text-3xl mb-4 bg-white text-black px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,255,102,1)]">[ {cart.length}_ITEMS ]</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-32">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-16">
          {cart.map((item) => (
            <motion.div 
              key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
              layout
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col md:flex-row gap-12 p-10 bg-zinc-900 border-4 border-white relative group hover:border-accent transition-all shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,255,102,1)]"
            >
              <div className="w-full md:w-64 aspect-[3/4] bg-black overflow-hidden flex-shrink-0 border-4 border-white/10 group-hover:border-accent transition-all">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-4">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-5xl font-display uppercase group-hover:text-accent transition-colors leading-none tracking-tighter">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                      className="text-white/20 hover:text-accent transition-all p-3 border-4 border-transparent hover:border-accent hover:bg-accent/10"
                    >
                      <Trash2 size={32} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-12 font-mono text-sm uppercase tracking-[0.3em] text-white/40">
                    <div className="flex items-center gap-4">
                      <span>COLOR:</span>
                      <div className="w-6 h-6 border-2 border-white/20" style={{ backgroundColor: item.selectedColor }} />
                      <span className="text-white font-bold">{item.selectedColor}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>SIZE:</span>
                      <span className="text-white px-3 py-1 border-2 border-white/20 font-bold">{item.selectedSize}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-16">
                  <div className="flex items-center gap-8 font-mono text-lg">
                    <span className="text-white/40 uppercase tracking-[0.5em]">QTY:</span>
                    <span className="text-4xl text-accent font-bold bg-white text-black px-4 py-1 border-4 border-black">{item.quantity}</span>
                  </div>
                  <span className="text-5xl font-display text-accent">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
              
              {/* Decorative Accent */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-accent border-2 border-black" />
            </motion.div>
          ))}
          
          <button 
            onClick={clearCart}
            className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/20 hover:text-accent transition-colors"
          >
            [ CLEAR_ALL_ITEMS ]
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border-4 border-white p-10 sticky top-32 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase tracking-widest mb-12 border-b-2 border-white/10 pb-6">Summary</h2>
            <div className="space-y-6 mb-12 font-mono text-sm uppercase tracking-wider">
              <div className="flex justify-between">
                <span className="text-white/40">SUBTOTAL</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">SHIPPING</span>
                <span className="text-accent">{shipping === 0 ? '[ FREE ]' : formatPrice(shipping)}</span>
              </div>
              <div className="pt-8 border-t-2 border-white/10 flex justify-between items-end">
                <span className="font-display text-2xl">TOTAL</span>
                <span className="text-5xl font-display text-accent">{formatPrice(total)}</span>
              </div>
            </div>
            <button 
              className="brutal-btn w-full flex items-center justify-center gap-4 py-8"
            >
              CHECKOUT
              <ArrowRight size={24} />
            </button>
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <p className="font-mono text-[10px] text-white/20 text-center leading-relaxed uppercase tracking-widest">
                TAXES CALCULATED AT CHECKOUT. FREE SHIPPING ON ORDERS OVER $250.
              </p>
              <div className="flex justify-center gap-4 opacity-20 grayscale">
                <div className="w-8 h-5 bg-white rounded-sm" />
                <div className="w-8 h-5 bg-white rounded-sm" />
                <div className="w-8 h-5 bg-white rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
