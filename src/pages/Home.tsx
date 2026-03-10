import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { Product, formatPrice, cn } from '../utils';
import { ProductSkeleton } from '../components/Skeleton';
import { useStore } from '../store';
import HeroSlider from '../components/HeroSlider';
import Tilt from '../components/Tilt';
import ThreeDImage from '../components/ThreeDImage';

const Sticker = ({ children, className, rotate = 0 }: { children: React.ReactNode, className?: string, rotate?: number }) => (
  <motion.div
    drag
    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
    whileHover={{ scale: 1.1, rotate: rotate + 5 }}
    whileTap={{ scale: 0.9 }}
    className={cn(
      "absolute z-40 cursor-grab active:cursor-grabbing bg-white text-black px-4 py-2 border-2 border-black font-display text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
      className
    )}
    style={{ rotate }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const addToCart = useStore((state) => state.addToCart);

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const immersiveY = useTransform(smoothProgress, [0.4, 0.7], [100, -100]);
  const immersiveScale = useTransform(smoothProgress, [0.4, 0.7], [0.8, 1.1]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 6));
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="h-screen relative overflow-hidden">
        <HeroSlider />
      </section>

      {/* Marquee Banner */}
      <div className="marquee-container z-30 relative border-y-4 border-white bg-accent text-black py-4">
        <div className="marquee-content font-display text-4xl uppercase">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-12">
              NEW DROP LIVE • LIMITED EDITION • FUTURE WEAR • AETHER WORLD •
            </span>
          ))}
        </div>
      </div>

      {/* Featured Grid */}
      <section className="py-48 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32 gap-12"
        >
          <div className="max-w-2xl">
            <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ 01 // THE_DROP ]</span>
            <h2 className="text-8xl md:text-[10vw] leading-[0.8] font-display uppercase">
              LATEST <br /> <span className="italic">PIECES</span>
            </h2>
          </div>
          <Link to="/category/men" className="brutal-btn bg-white text-black hover:bg-accent py-4 px-8 text-sm">
            VIEW_ALL_DROPS
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {loading ? (
            [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            featuredProducts.map((product, index) => {
              const displayImage = product.product_variants?.[0]?.image_url || product.image_url || (product as any).metadata?.all_images?.[0];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Link to={`/product/${product.slug}`}>
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-8 relative border-4 border-white group-hover:border-accent transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,255,0,1)]">
                      <img
                        src={displayImage}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      />

                      {/* Badge */}
                      <div className="absolute top-0 right-0 bg-accent text-black px-4 py-2 text-xs font-bold uppercase tracking-widest z-10 border-l-2 border-b-2 border-black">
                        {product.type}
                      </div>

                      {/* Quick Add Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/40 backdrop-blur-sm">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const variants = product.product_variants || [];
                            const color = variants[0]?.color || "Default";
                            const size = variants[0]?.size || "One Size";
                            addToCart(product, color, size);
                          }}
                          className="brutal-btn bg-accent text-black scale-90 group-hover:scale-100 transition-transform"
                        >
                          ADD TO BAG +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-start px-2">
                      <div>
                        <h3 className="text-4xl font-display mb-2 group-hover:text-accent transition-colors uppercase leading-none tracking-tight">{product.name}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{product.gender} // {product.type}</p>
                      </div>
                      <span className="text-3xl font-display text-accent">{formatPrice(product.markup_price)}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* AETHER LAB Section */}
      <section className="py-48 px-6 md:px-12 bg-black overflow-hidden relative border-y-4 border-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24 items-center relative z-10">
          <div className="lg:col-span-7 relative group">
            <Tilt>
              <div className="relative aspect-square w-full max-w-2xl mx-auto">
                {/* Technical Blueprint Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 opacity-30" viewBox="0 0 100 100">
                  <line x1="20" y1="20" x2="40" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="80" y1="20" x2="60" y2="40" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="40" cy="40" r="1" fill="#00FF66" />
                  <circle cx="60" cy="40" r="1" fill="#00FF66" />
                </svg>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative h-full w-full border-2 border-white/20 p-8 bg-zinc-900/50 backdrop-blur-sm"
                >
                  <ThreeDImage
                    src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-1000"
                  />

                  {/* Hotspots */}
                  {[
                    { top: '25%', left: '40%', label: 'HEAVY_COTTON_450GSM' },
                    { top: '60%', left: '70%', label: 'REINFORCED_STITCHING' },
                    { top: '80%', left: '30%', label: 'OVERSIZED_FIT_V2' }
                  ].map((point, i) => (
                    <motion.div
                      key={i}
                      style={{ top: point.top, left: point.left }}
                      className="absolute z-40"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5 + (i * 0.2) }}
                    >
                      <div className="relative group/point">
                        <div className="w-4 h-4 bg-accent rounded-full animate-ping absolute inset-0" />
                        <div className="w-4 h-4 bg-accent rounded-full relative border-2 border-black" />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-1 text-[10px] font-mono whitespace-nowrap opacity-0 group-hover/point:opacity-100 transition-opacity border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {point.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </Tilt>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ 02 // AETHER_LAB_V1 ]</span>
              <h2 className="text-7xl md:text-9xl font-display leading-[0.8] uppercase tracking-tighter mb-8">
                PRODUCT <br /> <span className="outline-text-white">ARCHIVE</span>
              </h2>
              <p className="font-mono text-white/40 text-lg uppercase tracking-widest leading-relaxed mb-12">
                EXPLORE THE TECHNICAL SPECIFICATIONS OF OUR CORE PIECES. EVERY GARMENT IS ENGINEERED FOR DURABILITY, COMFORT, AND DIGITAL INTEGRATION.
              </p>

              <div className="space-y-6">
                {[
                  { title: 'MATERIAL', value: 'PREMIUM_HEAVYWEIGHT_COTTON' },
                  { title: 'CONSTRUCTION', value: 'DOUBLE_NEEDLE_STITCH' },
                  { title: 'FINISH', value: 'CARBON_WASHED_TEXTURE' }
                ].map((spec) => (
                  <div key={spec.title} className="border-b border-white/10 pb-4 group cursor-help">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-accent">{spec.title}</span>
                      <span className="font-display text-xl group-hover:text-accent transition-colors">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12">
                <Link to="/collections" className="brutal-btn bg-white text-black hover:bg-accent w-full text-center py-6 text-xl">
                  EXPLORE_FULL_COLLECTION
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gen Z Fashion Video Section */}
      <section className="py-24 px-6 md:px-12 bg-black overflow-hidden relative border-t-4 border-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[21/9] w-full border-4 border-white overflow-hidden group shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)]"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-all duration-1000 transform group-hover:scale-105"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-diverse-group-of-friends-walking-together-in-the-city-33880-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />

            {/* HUD Overlay */}
            <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">COLLECTION_FILM_V2</span>
              </div>
              <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
                FEATURING: ALL_AGES_OVERSIZE_CORE
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-20">
              <div className="font-display text-4xl md:text-6xl text-white uppercase tracking-tighter leading-none text-right">
                STREET <br /> <span className="outline-text-white">CULTURE</span>
              </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%]" />
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden bg-accent text-black py-32">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="grid grid-cols-4 gap-4 rotate-12 scale-150">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="aspect-square bg-black" />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <span className="font-mono text-sm tracking-[1em] mb-12 block">[ MANIFESTO_V1.0 ]</span>
          <h2 className="text-7xl md:text-[12vw] leading-[0.75] font-display mb-16 uppercase tracking-tighter">
            WE ARE <br /> THE <span className="outline-text-black">FUTURE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
            <p className="text-2xl md:text-4xl font-display leading-none uppercase">
              AETHER IS NOT A BRAND. <br /> IT'S A GLITCH IN THE <br /> SYSTEM.
            </p>
            <div className="space-y-8">
              <p className="text-lg font-mono uppercase tracking-wider leading-relaxed">
                WE DEFINE THE BOUNDARIES BETWEEN THE PHYSICAL AND THE VIRTUAL. OUR PIECES ARE DIGITAL ASSETS FOR THE REAL WORLD.
              </p>
              <Link
                to="/about"
                className="brutal-btn bg-black text-white hover:bg-white hover:text-black inline-block"
              >
                JOIN_THE_COLLECTIVE
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-12 bottom-12 font-mono text-[10px] uppercase tracking-[0.5em] text-black/40 text-right">
          AETHER WORLDWIDE <br /> ALL RIGHTS RESERVED <br /> © 2025
        </div>
      </section>

      {/* Categories Split */}
      <section className="grid grid-cols-1 md:grid-cols-2 h-screen border-t-4 border-white">
        <Link to="/category/men" className="relative group overflow-hidden border-r-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1000&q=80"
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/70 group-hover:bg-accent/60 transition-colors z-10" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <h3 className="text-8xl md:text-[14vw] font-display group-hover:scale-110 transition-transform">MEN</h3>
          </div>
        </Link>
        <Link to="/category/women" className="relative group overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/70 group-hover:bg-accent/60 transition-colors z-10" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <h3 className="text-8xl md:text-[14vw] font-display group-hover:scale-110 transition-transform">WOMEN</h3>
          </div>
        </Link>
      </section>
    </div>
  );
}
