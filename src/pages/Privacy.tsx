import React from 'react';
import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ LEGAL ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-16 leading-[0.8] tracking-tighter">
            PRI<span className="outline-text">VACY</span>
          </h1>
        </motion.div>

        <div className="space-y-12 font-mono text-sm uppercase tracking-wider text-white/60 leading-relaxed">
          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">1. Information We Collect</h2>
            <p>WE COLLECT INFORMATION YOU PROVIDE WHEN PLACING AN ORDER: NAME, EMAIL, PHONE NUMBER, AND SHIPPING ADDRESS. WE ALSO COLLECT PAYMENT INFORMATION THROUGH OUR PAYMENT PROCESSOR (RAZORPAY).</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">2. How We Use It</h2>
            <p>YOUR INFORMATION IS USED SOLELY TO: PROCESS AND FULFILL YOUR ORDERS, COMMUNICATE ORDER UPDATES, RESPOND TO YOUR INQUIRIES, AND IMPROVE OUR SERVICES.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">3. Third-Party Sharing</h2>
            <p>WE SHARE YOUR INFORMATION ONLY WITH: PRINTIFY (OUR PRINT-ON-DEMAND PARTNER) FOR ORDER FULFILLMENT, RAZORPAY FOR PAYMENT PROCESSING, AND SHIPPING CARRIERS FOR DELIVERY. WE DO NOT SELL YOUR DATA.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">4. Data Security</h2>
            <p>WE USE SSL ENCRYPTION AND INDUSTRY-STANDARD SECURITY MEASURES TO PROTECT YOUR PERSONAL INFORMATION. HOWEVER, NO METHOD OF TRANSMISSION OVER THE INTERNET IS 100% SECURE.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">5. Cookies</h2>
            <p>WE USE ESSENTIAL COOKIES TO MAINTAIN YOUR CART AND SESSION. WE DO NOT USE TRACKING COOKIES FOR ADVERTISING PURPOSES.</p>
          </section>

          <section className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-2xl uppercase mb-4 tracking-widest text-white">6. Your Rights</h2>
            <p>YOU MAY REQUEST ACCESS TO, CORRECTION OF, OR DELETION OF YOUR PERSONAL DATA AT ANY TIME BY CONTACTING US AT SUPPORT@AETHER.STORE.</p>
          </section>

          <p className="text-center text-white/20 text-xs">LAST UPDATED: MARCH 2026 // AETHER WORLDWIDE</p>
        </div>
      </div>
    </div>
  );
}
