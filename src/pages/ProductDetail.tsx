import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, ChevronRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice, cn, Product } from '../utils';
import ProductConfigurator3D from '../components/ProductConfigurator3D';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'reviews'>('details');
  
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      });
  }, [slug]);

  if (!product) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const isWishlisted = wishlist.some(p => p.id === product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left: 3D View */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative bg-[#111] border-4 border-white overflow-hidden min-h-[600px] shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]"
        >
          <div className="absolute top-8 left-8 z-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-accent block mb-2">[ 3D_CONFIGURATOR ]</span>
            <h2 className="text-2xl font-display uppercase tracking-widest">INTERACTIVE</h2>
          </div>
          <ProductConfigurator3D type={product.type} color={selectedColor} />
          
          {/* Decorative Corner */}
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent flex items-center justify-center rotate-45 translate-x-12 translate-y-12">
            <ShoppingBag className="-rotate-45 text-black" size={24} />
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-12">
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-white/40 mb-8">
              <Link to="/" className="hover:text-accent transition-colors">HOME</Link>
              <span>//</span>
              <Link to={`/category/${product.gender}`} className="hover:text-accent transition-colors">{product.gender}</Link>
              <span>//</span>
              <span className="text-white">{product.name}</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-display leading-[0.75] mb-8 uppercase tracking-tighter">
              {product.name.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? "outline-text" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            
            <div className="flex items-center gap-10 mb-12">
              <span className="text-5xl font-display text-accent bg-white text-black px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,255,102,1)]">{formatPrice(product.price)}</span>
              <div className="flex items-center gap-2 text-accent">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < 4 ? "currentColor" : "none"} />)}
                <span className="text-sm font-mono text-white/40 ml-6 uppercase tracking-widest">[ 128_VERIFIED_REVIEWS ]</span>
              </div>
            </div>
            
            <p className="text-white/70 leading-relaxed font-light text-xl max-w-xl">
              {product.description}
            </p>
          </div>

          {/* Color Selection */}
          <div className="mb-10">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] mb-6 text-white/40">SELECT_COLOR: <span className="text-accent">{selectedColor}</span></h3>
            <div className="flex gap-4">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-12 h-12 rounded-none border-2 transition-all p-1",
                    selectedColor === color ? "border-accent scale-110" : "border-white/20 hover:border-white"
                  )}
                >
                  <div className="w-full h-full" style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">SELECT_SIZE</h3>
              <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline underline-offset-4">SIZE_GUIDE</button>
            </div>
            <div className="flex flex-wrap gap-4">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[80px] h-14 flex items-center justify-center border-2 font-display text-xl uppercase tracking-widest transition-all",
                    selectedSize === size ? "bg-accent text-black border-accent" : "border-white/10 hover:border-white"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-6 mb-16">
            <button 
              onClick={() => addToCart(product, selectedColor, selectedSize)}
              className="brutal-btn flex-1 flex items-center justify-center gap-4"
            >
              <ShoppingBag size={24} />
              ADD TO BAG
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className={cn(
                "w-20 h-20 border-2 flex items-center justify-center transition-all",
                isWishlisted ? "bg-white text-black border-white" : "border-white/10 hover:border-accent hover:text-accent"
              )}
            >
              <Heart size={28} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-t-2 border-white/10">
            <div className="flex gap-12 mb-8">
              {['details', 'shipping', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "py-8 font-display text-2xl uppercase tracking-widest transition-all relative",
                    activeTab === tab ? "text-accent" : "text-white/40 hover:text-white"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
                  )}
                </button>
              ))}
            </div>
            <div className="text-lg text-white/60 leading-relaxed font-light min-h-[150px]">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <ul className="space-y-6 font-mono text-sm uppercase tracking-wider">
                      <li className="flex items-center gap-4"><ShieldCheck className="text-accent" size={20} /> [ ETHICALLY SOURCED PREMIUM MATERIALS ]</li>
                      <li className="flex items-center gap-4"><ChevronRight className="text-accent" size={20} /> [ REINFORCED SEAMS FOR DURABILITY ]</li>
                      <li className="flex items-center gap-4"><ChevronRight className="text-accent" size={20} /> [ SIGNATURE MINIMALIST BRANDING ]</li>
                    </ul>
                  </motion.div>
                )}
                {activeTab === 'shipping' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <ul className="space-y-6 font-mono text-sm uppercase tracking-wider">
                      <li className="flex items-center gap-4"><Truck className="text-accent" size={20} /> [ FREE EXPRESS SHIPPING OVER $250 ]</li>
                      <li className="flex items-center gap-4"><RotateCcw className="text-accent" size={20} /> [ 30-DAY COMPLIMENTARY RETURNS ]</li>
                    </ul>
                  </motion.div>
                )}
                {activeTab === 'reviews' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <p className="font-mono text-sm uppercase tracking-wider opacity-50">NO REVIEWS YET FOR THIS SPECIFIC COLORWAY. BE THE FIRST TO SHARE YOUR EXPERIENCE.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


