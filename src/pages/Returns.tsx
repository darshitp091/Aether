import React from 'react';
import { motion } from 'motion/react';

export default function Returns() {
  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ POLICY ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-16 leading-[0.8] tracking-tighter">
            RE<span className="outline-text">TURNS</span>
          </h1>
        </motion.div>

        <div className="space-y-12">
          <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase mb-6 tracking-widest text-accent">Made-To-Order Policy</h2>
            <p className="font-mono text-sm uppercase tracking-wider text-white/60 leading-relaxed">
              ALL AETHER PRODUCTS ARE MADE-TO-ORDER. BECAUSE EACH ITEM IS CUSTOM-PRINTED SPECIFICALLY FOR YOU, WE DO NOT ACCEPT RETURNS OR EXCHANGES FOR CHANGE OF MIND.
            </p>
          </div>

          <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase mb-6 tracking-widest text-accent">Defective Items</h2>
            <p className="font-mono text-sm uppercase tracking-wider text-white/60 leading-relaxed mb-4">
              IF YOUR ITEM ARRIVES DAMAGED, DEFECTIVE, OR IS THE WRONG PRODUCT, WE WILL ISSUE A FULL REPLACEMENT OR REFUND. YOU MUST CONTACT US WITHIN 14 DAYS OF DELIVERY.
            </p>
            <p className="font-mono text-sm uppercase tracking-wider text-white/60 leading-relaxed">
              PLEASE INCLUDE PHOTOS OF THE DEFECT AND YOUR ORDER NUMBER IN YOUR MESSAGE.
            </p>
          </div>

          <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="font-display text-3xl uppercase mb-6 tracking-widest text-accent">Refund Timeline</h2>
            <div className="space-y-4 font-mono text-sm uppercase tracking-wider text-white/60">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>REPORT DEFECT</span>
                <span className="text-white">WITHIN 14 DAYS</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>REVIEW PERIOD</span>
                <span className="text-white">2-3 BUSINESS DAYS</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>REFUND PROCESSING</span>
                <span className="text-white">5-10 BUSINESS DAYS</span>
              </div>
            </div>
          </div>

          <p className="font-mono text-xs uppercase tracking-wider text-white/20 text-center">
            FOR ALL RETURN INQUIRIES, CONTACT US AT SUPPORT@AETHER.STORE
          </p>
        </div>
      </div>
    </div>
  );
}
