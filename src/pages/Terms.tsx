import React from 'react';
import { motion } from 'motion/react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ LEGAL ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-16 leading-[0.8] tracking-tighter">
            TER<span className="outline-text">MS</span>
          </h1>
        </motion.div>

        <div className="space-y-12 font-mono text-sm uppercase tracking-wider text-white/60 leading-relaxed">
          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">1. General</h2>
            <p>BY ACCESSING AND USING STORE.AETHER (THE "SITE"), YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE, PLEASE DO NOT USE THE SITE.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">2. Products</h2>
            <p>ALL PRODUCTS ARE MADE-TO-ORDER AND CUSTOM-PRINTED. COLORS MAY VARY SLIGHTLY FROM WHAT IS DISPLAYED ON SCREEN DUE TO MONITOR SETTINGS AND PRINTING PROCESSES.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">3. Pricing</h2>
            <p>ALL PRICES ARE LISTED IN USD. WE RESERVE THE RIGHT TO CHANGE PRICES AT ANY TIME WITHOUT PRIOR NOTICE. SHIPPING COSTS ARE CALCULATED AT CHECKOUT BASED ON DESTINATION.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">4. Payment</h2>
            <p>WE ACCEPT PAYMENTS THROUGH RAZORPAY. ALL TRANSACTIONS ARE ENCRYPTED AND SECURE. BY PLACING AN ORDER, YOU CONFIRM THAT THE PAYMENT METHOD IS YOURS OR THAT YOU ARE AUTHORIZED TO USE IT.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">5. Intellectual Property</h2>
            <p>ALL DESIGNS, GRAPHICS, TEXT, AND OTHER CONTENT ON THIS SITE ARE THE PROPERTY OF AETHER AND MAY NOT BE REPRODUCED, DISTRIBUTED, OR USED WITHOUT PRIOR WRITTEN CONSENT.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">6. Limitation of Liability</h2>
            <p>AETHER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OF THIS SITE OR THE PURCHASE OF PRODUCTS.</p>
          </section>

          <p className="text-center text-white/20 text-xs">LAST UPDATED: MARCH 2026 // AETHER WORLDWIDE</p>
        </div>
      </div>
    </div>
  );
}
