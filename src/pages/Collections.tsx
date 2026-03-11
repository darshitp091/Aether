import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { formatPrice } from '../utils';

export default function Collections() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-accent" />
      </div>
    );
  }

  // Split products into featured (first 2) and grid (rest)
  const featured = products.slice(0, 2);
  const grid = products.slice(2);

  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ LATEST_DROPS ]</span>
          <h1 className="text-7xl md:text-[12vw] font-display uppercase mb-6 leading-[0.8] tracking-tighter">
            COLL<span className="outline-text">ECT</span>ION
          </h1>
          <p className="font-mono text-sm uppercase tracking-wider text-white/40 mb-20 max-w-lg">
            CURATED PIECES FROM THE AETHER ARCHIVE. PREMIUM STREETWEAR FOR THE CULTURE.
          </p>
        </motion.div>

        {/* Featured Duo */}
        {featured.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Link to={`/product/${p.slug}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden border-4 border-white group-hover:border-accent transition-all shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,255,102,1)]">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-display text-3xl uppercase group-hover:text-accent transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-display text-xl text-accent">{formatPrice(p.markup_price)}</span>
                      {p.gender && <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest border border-white/10 px-2 py-1">{p.gender}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {grid.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/product/${p.slug}`} className="group block">
                <div className="aspect-square overflow-hidden border-2 border-white/20 group-hover:border-accent transition-all">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="font-display text-sm uppercase truncate group-hover:text-accent transition-colors">{p.name}</h4>
                  <span className="font-mono text-xs text-accent">{formatPrice(p.markup_price)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-24">
            <p className="font-mono text-sm text-white/30 uppercase tracking-wider">NO DROPS YET. CHECK BACK SOON.</p>
          </div>
        )}
      </div>
    </div>
  );
}
