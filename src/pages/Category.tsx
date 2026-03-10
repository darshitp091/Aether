import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { Product, formatPrice, cn } from '../utils';
import { ProductSkeleton } from '../components/Skeleton';
import Tilt from '../components/Tilt';

export default function Category() {
  const { gender } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const type = searchParams.get('type');
  const color = searchParams.get('color');
  const size = searchParams.get('size');

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?gender=${gender}`;
    if (type) url += `&type=${type}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let filtered = data;
        if (color) filtered = filtered.filter((p: Product) => p.product_variants?.some(v => v.hex_code === color || v.color === color));
        if (size) filtered = filtered.filter((p: Product) => p.product_variants?.some(v => v.size === size));
        setProducts(filtered);
        setLoading(false);
      });
  }, [gender, type, color, size]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="px-6 md:px-12 py-24 max-w-7xl mx-auto min-h-screen">
      <header className="mb-24">
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-white/40 mb-8">
          <Link to="/" className="hover:text-accent transition-colors">HOME</Link>
          <span>//</span>
          <span className="text-white">{gender}</span>
        </div>
        <h1 className="text-8xl md:text-[15vw] leading-[0.7] mb-16 tracking-tighter font-display uppercase">
          {gender?.split('').map((char, i) => (
            <span key={i} className={i % 2 === 1 ? "outline-text" : ""}>
              {char}
            </span>
          ))}
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 pt-16 border-t-[8px] border-white">
          <div className="flex flex-wrap gap-10">
            {['All', 'T-Shirt', 'Hoodie', 'Sweatshirt'].map(t => (
              <button
                key={t}
                onClick={() => updateFilter('type', t === 'All' ? null : t.toLowerCase().replace('-', ''))}
                className={`font-display text-3xl uppercase tracking-tighter transition-all relative group ${(t === 'All' && !type) || (type === t.toLowerCase().replace('-', ''))
                  ? 'text-accent'
                  : 'text-white/40 hover:text-white'
                  }`}
              >
                {t}
                {((t === 'All' && !type) || (type === t.toLowerCase().replace('-', ''))) && (
                  <motion.div layoutId="type-underline" className="absolute -bottom-2 left-0 right-0 h-2 bg-accent" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-6 font-display text-2xl uppercase tracking-widest transition-all px-8 py-4 border-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
                isFilterOpen ? "bg-accent text-black border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]" : "bg-white text-black border-black hover:bg-accent hover:shadow-[6px_6px_0px_0px_rgba(0,255,102,1)]"
              )}
            >
              <SlidersHorizontal size={24} />
              FILTERS {(color || size) && "•"}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b-4 border-white"
            >
              <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-16 bg-zinc-900/50 px-8">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent mb-8">[ COLORS ]</h3>
                  <div className="flex flex-wrap gap-4">
                    {['#000000', '#FFFFFF', '#333333', '#4B5563', '#E2E8F0'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateFilter('color', color === c ? null : c)}
                        className={cn(
                          "w-10 h-10 rounded-none border-2 transition-all p-1",
                          color === c ? "border-accent scale-110" : "border-white/20 hover:border-white"
                        )}
                      >
                        <div className="w-full h-full border border-white/10" style={{ backgroundColor: c }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent mb-8">[ SIZES ]</h3>
                  <div className="flex flex-wrap gap-3">
                    {['XS', 'S', 'M', 'L', 'XL', '2T', '4T', '6T'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateFilter('size', size === s ? null : s)}
                        className={cn(
                          "px-6 py-3 border-2 font-display text-lg tracking-widest transition-all",
                          size === s ? "bg-accent text-black border-accent" : "border-white/10 hover:border-white"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchParams(new URLSearchParams());
                      setIsFilterOpen(false);
                    }}
                    className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-accent transition-colors flex items-center gap-3 border-b border-white/20 pb-1"
                  >
                    <X size={16} />
                    RESET_ALL_FILTERS
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {products.map((product, index) => {
            const displayImage = product.product_variants?.[0]?.image_url || product.image_url || (product as any).metadata?.all_images?.[0];
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Link to={`/product/${product.slug}`}>
                  <div className="aspect-[3/4] overflow-hidden bg-zinc-900 mb-8 relative border-2 border-white/10 group-hover:border-accent transition-all duration-500 shadow-2xl">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest z-10">
                      {product.type}
                    </div>
                    {product.gender === 'unisex' && (
                      <div className="absolute top-4 left-4 bg-accent text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest z-10">
                        UNISEX
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start px-2">
                    <div className="flex-1">
                      <h3 className="text-3xl font-display mb-2 group-hover:text-accent transition-colors uppercase leading-none tracking-tight">{product.name}</h3>
                      <div className="flex items-center gap-4">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">{product.type}</p>
                        <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-accent/40 transition-all"></div>
                      </div>
                    </div>
                    <span className="text-2xl font-display text-accent ml-6">{formatPrice(product.markup_price)}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="py-32 text-center border-4 border-dashed border-white/10">
          <p className="font-mono text-white/40 uppercase tracking-[0.5em] text-sm">[ NO_PIECES_FOUND_IN_AETHER ]</p>
        </div>
      )}
    </div>
  );
}
