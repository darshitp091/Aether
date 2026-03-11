import React from 'react';
import { motion } from 'motion/react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ LOGISTICS ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-16 leading-[0.8] tracking-tighter">
            SHIP<span className="outline-text">PING</span>
          </h1>
        </motion.div>

        <div className="space-y-16">
          {/* Rates Table */}
          <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase mb-8 tracking-widest">Shipping Rates</h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm uppercase tracking-wider">
                <thead>
                  <tr className="border-b-4 border-accent">
                    <th className="text-left py-4 text-accent">DESTINATION</th>
                    <th className="text-left py-4 text-accent">FIRST ITEM</th>
                    <th className="text-left py-4 text-accent">ADDITIONAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr><td className="py-4">🇺🇸 United States</td><td className="py-4">$4.99</td><td className="py-4">$2.09</td></tr>
                  <tr><td className="py-4">🇨🇦 Canada</td><td className="py-4">$9.99</td><td className="py-4">$4.39</td></tr>
                  <tr><td className="py-4">🇦🇺 Australia</td><td className="py-4">$12.49</td><td className="py-4">$4.99</td></tr>
                  <tr><td className="py-4">🌍 Rest of World</td><td className="py-4">$9.99</td><td className="py-4">$4.00</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6 font-mono text-xs text-accent uppercase tracking-wider">
              ★ FREE SHIPPING on orders over $100
            </p>
          </div>

          {/* Delivery Times */}
          <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase mb-8 tracking-widest">Delivery Times</h2>
            <div className="space-y-6 font-mono text-sm uppercase tracking-wider text-white/60">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span>🇺🇸 UNITED STATES</span>
                <span className="text-white">3-7 BUSINESS DAYS</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span>🇨🇦 CANADA</span>
                <span className="text-white">5-12 BUSINESS DAYS</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span>🌍 INTERNATIONAL</span>
                <span className="text-white">7-20 BUSINESS DAYS</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8 font-mono text-sm uppercase tracking-wider text-white/40 leading-relaxed">
            <p>ALL ORDERS ARE MADE-TO-ORDER AND PRINTED UPON RECEIPT. PRODUCTION TYPICALLY TAKES 2-5 BUSINESS DAYS BEFORE SHIPPING.</p>
            <p>TRACKING INFORMATION WILL BE SENT TO YOUR EMAIL ONCE YOUR ORDER HAS SHIPPED.</p>
            <p>CUSTOMS, DUTIES, AND TAXES MAY APPLY FOR INTERNATIONAL ORDERS AND ARE THE RESPONSIBILITY OF THE BUYER.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
