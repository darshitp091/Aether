import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b-4 border-white">
        <div className="absolute inset-0 bg-accent opacity-10" />
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <span className="font-mono text-sm tracking-[1em] text-accent mb-6 block">[ MANIFESTO_V1.0 ]</span>
          <h1 className="text-8xl md:text-[14vw] font-display leading-[0.7] uppercase tracking-tighter">
            <span className="outline-text">AE</span>THER
          </h1>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <span className="text-accent font-mono text-sm mb-8 block tracking-[0.5em]">[ 01 // THE_ORIGIN ]</span>
          <h2 className="text-6xl md:text-8xl font-display uppercase mb-16 leading-[0.8] tracking-tighter">
            WE ARE <span className="outline-text">NOT</span><br />A BRAND
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <p className="text-lg font-mono uppercase tracking-wider leading-relaxed text-white/60">
              AETHER IS A GLITCH IN THE SYSTEM. BORN FROM THE INTERSECTION OF DIGITAL CULTURE AND PHYSICAL CRAFT, WE CREATE GARMENTS THAT EXIST BETWEEN REALITIES.
            </p>
            <p className="text-lg font-mono uppercase tracking-wider leading-relaxed text-white/60">
              EVERY PIECE IS ENGINEERED WITH INTENTION. NO WASTE. NO OVERPRODUCTION. EACH GARMENT IS MADE-TO-ORDER, REDUCING OUR CARBON FOOTPRINT TO NEAR ZERO.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-32 px-6 md:px-12 bg-zinc-900 border-y-4 border-white">
        <div className="max-w-5xl mx-auto">
          <span className="text-accent font-mono text-sm mb-8 block tracking-[0.5em]">[ 02 // CORE_VALUES ]</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: 'ZERO WASTE', desc: 'Made-to-order production. No excess inventory. No landfill contributions.' },
              { title: 'PREMIUM CRAFT', desc: 'Heavyweight cotton, reinforced stitching, and carbon-washed textures on every piece.' },
              { title: 'DIGITAL FIRST', desc: 'Born online. Designed for the generation that lives between screens and streets.' }
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border-4 border-white p-8 hover:border-accent transition-colors group shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]"
              >
                <h3 className="text-3xl font-display mb-6 group-hover:text-accent transition-colors">{v.title}</h3>
                <p className="font-mono text-sm uppercase tracking-wider text-white/40 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-6xl md:text-8xl font-display uppercase mb-12 tracking-tighter">JOIN THE<br /><span className="text-accent">COLLECTIVE</span></h2>
        <Link to="/category/men" className="brutal-btn px-16 py-6 text-xl">EXPLORE_DROPS</Link>
      </section>
    </div>
  );
}
