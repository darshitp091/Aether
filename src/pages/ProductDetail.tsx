import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, ChevronRight, Star, ShieldCheck, Truck, RotateCcw, Share2, Ruler } from 'lucide-react';
import { useStore } from '../store';
import { formatPrice, cn, Product } from '../utils';

// Helper to clean description while keeping some structure if needed
// However, since we now support HTML in the UI, we just export a cleaner for lines if we want plain text
const formatDescriptionLines = (desc: string) => {
  if (!desc) return null;
  // If it's HTML, we'll render it directly. If we want lines, we strip tags.
  return desc.replace(/<[^>]*>?/gm, '').split('\n').filter(line => line.trim() !== '');
};

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'reviews'>('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        const variants = (data.product_variants || []).filter((v: any) => v.is_enabled);
        const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color))).filter(Boolean) as string[];
        const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size))).filter(Boolean) as string[];

        if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);
        if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
      });
  }, [slug]);

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isWishlisted = wishlist.some(p => p.id === product.id);
  const variants = (product.product_variants || []).filter(v => v.is_enabled);

  // Get unique colors from enabled variants only
  const colors = Array.from(new Set(variants.map(v => v.color)))
    .map(colorName => {
      const v = variants.find(v => v.color === colorName);
      return { name: colorName, hex: v?.hex_code || "#888888" };
    });

  // Get unique sizes from enabled variants only
  const sizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean);

  // Gallery logic: merge primary variant images + metadata gallery
  const gallery = Array.from(new Set([
    ...(variants.map(v => v.image_url)),
    ...((product as any).metadata?.all_images || [])
  ])).filter(Boolean);

  const currentVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize) || variants[0];
  const mainImage = gallery[activeImageIndex] || currentVariant?.image_url;
  // Keep the breakdown but we might use dangerouslySetInnerHTML for better formatting
  const descriptionLines = formatDescriptionLines(product.description);

  // Auto-switch image when color changes
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Find the first image that belongs to this color's variants
    const colorVariants = variants.filter(v => v.color === color);
    const colorVariantIds = colorVariants.map(v => v.printify_variant_id);

    // Check metadata.all_images for a match
    const allImages = (product as any).metadata?.all_images || [];
    const matchIndex = allImages.findIndex((img: any) =>
      img.variant_ids && img.variant_ids.some((vid: any) => colorVariantIds.includes(vid.toString()))
    );

    if (matchIndex !== -1) {
      // Find where this image is in the 'gallery' array
      const galleryIndex = gallery.indexOf(allImages[matchIndex].src);
      if (galleryIndex !== -1) {
        setActiveImageIndex(galleryIndex);
      }
    } else {
      // Fallback: look for the variant's own image_url in the gallery
      const variantImage = colorVariants[0]?.image_url;
      if (variantImage) {
        const galleryIndex = gallery.indexOf(variantImage);
        if (galleryIndex !== -1) {
          setActiveImageIndex(galleryIndex);
        }
      }
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-24">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-white/40 mb-12">
          <Link to="/" className="hover:text-accent transition-colors">HOME</Link>
          <ChevronRight size={10} />
          <Link to={`/category/${product.gender}`} className="hover:text-accent transition-colors">{product.gender}</Link>
          <ChevronRight size={10} />
          <span className="text-white opacity-50 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left: Sticky Image Gallery */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6 sticky top-24">
            {/* Thumbnails */}
            <div className="md:col-span-2 flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-y-auto no-scrollbar max-h-[800px]">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={cn(
                    "aspect-square w-20 md:w-full border-2 transition-all p-1 bg-zinc-900 flex-shrink-0 group relative",
                    activeImageIndex === i ? "border-accent" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

            {/* Main Stage */}
            <div className="md:col-span-10 order-1 md:order-2">
              <motion.div
                key={mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-[4/5] bg-zinc-900 border-2 border-white/10 relative overflow-hidden group"
              >
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <div className="bg-accent text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                    NEW_DROP
                  </div>
                  <div className="bg-white text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                    {product.type}
                  </div>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    "absolute top-6 right-6 w-12 h-12 flex items-center justify-center border-2 transition-all z-10",
                    isWishlisted ? "bg-white text-black border-white" : "bg-black/40 border-white/20 hover:border-accent hover:text-accent backdrop-blur-md"
                  )}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </motion.div>
            </div>
          </div>

          {/* Right: Buy Box */}
          <div className="lg:col-span-5">
            <header className="mb-12">
              <h1 className="text-5xl md:text-6xl font-display uppercase tracking-tight leading-[1] mb-8 max-w-2xl">
                {product.name}
              </h1>

              <div className="flex items-center gap-8 mb-8">
                <span className="text-4xl font-display text-accent">{formatPrice(product.markup_price)}</span>
                <div className="h-4 w-px bg-white/20"></div>
                <div className="flex items-center gap-1 text-accent">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="none" />
                  <span className="text-[10px] font-mono text-white/40 ml-2 mt-1">4.8 (124)</span>
                </div>
              </div>

              <div
                className="prose prose-invert prose-xs space-y-4 text-white/60 font-mono text-xs uppercase tracking-wider leading-relaxed mb-12 max-w-xl product-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </header>

            {/* Selection Area */}
            <div className="space-y-12">
              {/* Colors */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">COLORway // {selectedColor}</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(c.name)}
                      title={c.name}
                      className={cn(
                        "w-10 h-10 border-2 transition-all p-1",
                        selectedColor === c.name ? "border-accent scale-110 shadow-[0_0_15px_rgba(0,255,102,0.3)]" : "border-white/10 hover:border-white/40"
                      )}
                    >
                      <div className="w-full h-full" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">SIZE_MATRIX</h3>
                  <button className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                    <Ruler size={12} /> SIZE_GUIDE
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "h-14 flex items-center justify-center border-2 font-display text-lg uppercase tracking-widest transition-all",
                        selectedSize === s ? "bg-accent text-black border-accent" : "border-white/10 hover:border-white text-white/60"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Action */}
              <div className="pt-6">
                <button
                  onClick={() => addToCart(product, selectedColor, selectedSize)}
                  className="w-full h-24 bg-white text-black font-display text-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-6 hover:bg-accent transition-all active:scale-95 group shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]"
                >
                  <ShoppingBag className="group-hover:translate-y-[-2px] transition-transform" />
                  ACQUIRE_PIECE
                </button>

                <p className="mt-8 font-mono text-[9px] text-center text-white/20 uppercase tracking-[0.3em]">
                  GUARANTEED SECURE_CHECKOUT via RAZORPAY // SSL_ENCRYPTED
                </p>
              </div>

              {/* Tabs / Info */}
              <div className="pt-16 border-t-2 border-white/5">
                <div className="space-y-6">
                  <div className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display text-xl uppercase tracking-widest text-white group-hover:text-accent transition-all">Materials & Care</h4>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                    <p className="text-sm text-white/40 font-mono uppercase leading-relaxed hidden group-hover:block">
                      100% Premium Cotton // Heavyweight 240GSM // Cold wash only // Do not bleach
                    </p>
                  </div>
                  <div className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display text-xl uppercase tracking-widest text-white group-hover:text-accent transition-all">Shipping & Origin</h4>
                      <ChevronRight size={16} className="text-white/20" />
                    </div>
                    <p className="text-sm text-white/40 font-mono uppercase leading-relaxed hidden group-hover:block">
                      Free Global Shipping // Shipped from AETHER Hub // 5-10 Business Days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


