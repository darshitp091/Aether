import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../utils';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
        <div className="relative mb-12">
          <Heart size={120} className="text-accent opacity-20" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-4 -right-4 bg-white text-black px-4 py-2 font-display text-xl border-2 border-black -rotate-12"
          >
            LONELY!
          </motion.div>
        </div>
        <h2 className="text-6xl md:text-8xl font-display uppercase mb-8 text-center leading-none">Your wishlist<br/>is crying</h2>
        <p className="font-mono text-white/40 mb-12 text-center max-w-md uppercase tracking-widest text-sm">
          [ DON'T LEAVE YOUR FAVORITES HANGING. BRING THEM HOME. ]
        </p>
        <Link 
          to="/category/men"
          className="brutal-btn px-16 py-6"
        >
          EXPLORE COLLECTION
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
      <div className="flex items-end gap-12 mb-24 border-b-[8px] border-white pb-16">
        <h1 className="text-8xl md:text-[15vw] font-display leading-[0.7] uppercase tracking-tighter">
          SAV<span className="outline-text">E</span>D
        </h1>
        <span className="font-mono text-accent text-3xl mb-4 bg-white text-black px-4 py-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,255,102,1)]">[ {wishlist.length}_PIECES ]</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
        {wishlist.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <button 
              onClick={() => toggleWishlist(product)}
              className="absolute top-6 right-6 z-20 p-4 bg-black border-4 border-white text-white hover:bg-accent hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <Trash2 size={24} />
            </button>
            <Link to={`/product/${product.slug}`}>
              <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-8 relative border-4 border-white group-hover:border-accent transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-6 left-6 bg-accent text-black px-4 py-2 text-xs font-bold uppercase tracking-widest z-10 border-2 border-black">
                  {product.type}
                </div>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <h3 className="text-4xl font-display mb-2 group-hover:text-accent transition-colors uppercase leading-none tracking-tighter">{product.name}</h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/40">{product.gender} // {product.type}</p>
                </div>
                <span className="text-3xl font-display text-accent">{formatPrice(product.price)}</span>
              </div>
            </Link>
            <button 
              onClick={() => addToCart(product, product.colors[0], product.sizes[0])}
              className="brutal-btn w-full mt-10 flex items-center justify-center gap-4 py-6 text-sm"
            >
              <ShoppingBag size={24} />
              ADD TO BAG
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
