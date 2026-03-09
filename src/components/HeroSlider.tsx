import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../utils';
import ThreeDImage from './ThreeDImage';

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1475139441338-693e7dbe20b6?auto=format&fit=crop&w=1920&q=80",
    title: "FUTURE",
    subtitle: "AETHER",
    description: "DIGITAL ASSETS FOR THE REAL WORLD.",
    accent: "#00FF66"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=80",
    title: "NEO",
    subtitle: "CORE",
    description: "REDEFINING THE BOUNDARIES OF STYLE.",
    accent: "#FFFF00"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=80",
    title: "STREET",
    subtitle: "VIBES",
    description: "URBAN ARMOR FOR THE NEW GENERATION.",
    accent: "#FF00FF"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[calc(100vh-96px)] min-h-[600px] w-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full"
        >
          {/* Background Image - Using high-quality Unsplash matches for perfect loading */}
          <div className="relative h-full w-full group overflow-hidden">
            <motion.img
              src={slides[current].image}
              alt={slides[current].title}
              className="h-full w-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
              <motion.div
                initial={{ y: 100, opacity: 0, skewY: 10 }}
                animate={{ y: 0, opacity: 1, skewY: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-7xl"
              >
                <motion.h1 
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{ 
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="text-[18vw] md:text-[14vw] font-display leading-[0.75] mb-8 tracking-tighter uppercase relative drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  {slides[current].title} <br /> 
                  <span className="outline-text-white">{slides[current].subtitle}</span>
                </motion.h1>
                
                <motion.p 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="font-mono text-xl md:text-2xl mb-12 tracking-[0.3em] uppercase max-w-2xl mx-auto"
                >
                  [ {slides[current].description} ]
                </motion.p>

                <div className="flex flex-wrap justify-center gap-8">
                  <Link to="/category/men" className="brutal-btn text-2xl px-12 py-6 bg-white text-black hover:bg-accent">
                    SHOP_MEN
                  </Link>
                  <Link to="/category/women" className="brutal-btn bg-accent text-black hover:bg-white text-2xl px-12 py-6">
                    SHOP_WOMEN
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 right-12 z-30 flex gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2 transition-all duration-300 border border-white",
              current === i ? "w-12 bg-accent" : "w-4 bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-12 flex flex-col items-start gap-4 z-30"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-mono text-accent">EXPLORE_AETHER</span>
        <div className="w-24 h-[2px] bg-accent" />
      </motion.div>
    </div>
  );
}
