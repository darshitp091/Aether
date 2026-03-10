import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../utils';
import { loadScript } from '../utils/scriptLoader';
import { supabase } from '../lib/supabase';

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    full_name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country_code: 'IN',
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.markup_price * item.quantity), 0);
  const shipping = subtotal > 250 ? 0 : 25;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!address.full_name || !address.email || !address.line1 || !address.city || !address.postal_code) {
      alert('Please fill in all required shipping details.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) throw new Error('Razorpay SDK failed to load');

      const orderRes = await fetch('/api/payment/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR', receipt: `rcpt_${Date.now()}` }),
      });
      const orderData = await orderRes.json();

      if (!orderData.id) throw new Error('Failed to create Razorpay order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AETHER',
        description: 'Elite Streetwear Purchase',
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const completionRes = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                items: cart.map(item => ({
                  id: item.id,
                  variant_id: item.product_variants?.[0]?.id || null,
                  printify_variant_id: item.product_variants?.[0]?.printify_variant_id || item.printify_variant_id,
                  quantity: item.quantity,
                  markup_price: item.markup_price
                })),
                address,
                total_amount: total,
                shipping_cost: shipping
              }),
            });

            const completionData = await completionRes.json();
            if (completionData.success) {
              clearCart();
              alert('Order Placed Successfully! Your Aether drop is on the way.');
              navigate('/');
            } else {
              throw new Error(completionData.error || 'Order completion failed');
            }
          } catch (error: any) {
            console.error('Order verification failed:', error);
            alert('Order processing error. Please contact support.');
          }
        },
        prefill: {
          name: address.full_name,
          email: address.email,
          contact: address.phone,
        },
        theme: { color: '#00FF66' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
        <h2 className="text-6xl md:text-8xl font-display uppercase mb-8 text-center leading-none">Your bag is<br />ghosting you</h2>
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
                  src={item.product_variants?.[0]?.image_url || item.image_url}
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
                  <span className="text-5xl font-display text-accent">{formatPrice(item.markup_price * item.quantity)}</span>
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

        {/* Summary & Address */}
        <div className="lg:col-span-1 space-y-12">
          {/* Shipping Address Form */}
          <div className="bg-zinc-900 border-4 border-white p-10 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase tracking-widest mb-12 border-b-2 border-white/10 pb-6">Shipping</h2>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="FULL NAME"
                className="w-full bg-black border-2 border-white/20 p-4 font-mono text-sm focus:border-accent outline-none transition-colors"
                value={address.full_name}
                onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="EMAIL"
                  className="w-full bg-black border-2 border-white/20 p-4 font-mono text-sm focus:border-accent outline-none transition-colors"
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="PHONE"
                  className="w-full bg-black border-2 border-white/20 p-4 font-mono text-sm focus:border-accent outline-none transition-colors"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="ADDRESS LINE 1"
                className="w-full bg-black border-2 border-white/20 p-4 font-mono text-sm focus:border-accent outline-none transition-colors"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="CITY"
                  className="w-full bg-black border-2 border-white/20 p-4 font-mono text-sm focus:border-accent outline-none transition-colors"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="POSTAL CODE"
                  className="w-full bg-black border-2 border-white/20 p-4 font-mono text-sm focus:border-accent outline-none transition-colors"
                  value={address.postal_code}
                  onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                />
              </div>
            </div>
          </div>

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
              onClick={handleCheckout}
              disabled={isProcessing}
              className="brutal-btn w-full flex items-center justify-center gap-4 py-8 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  CHECKOUT
                  <ArrowRight size={24} />
                </>
              )}
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
