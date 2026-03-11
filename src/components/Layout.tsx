import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Search, Menu, X, User, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils';
import GlobalBackground3D from './GlobalBackground3D';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-accent selection:text-black">
      <GlobalBackground3D />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-black border-b-4 border-white">
        <div className="flex items-center gap-6 md:gap-12">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-3 bg-white text-black hover:bg-accent transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,255,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="text-4xl md:text-6xl font-display tracking-tighter uppercase hover:text-accent transition-all hover:skew-x-[-10deg] inline-block">
            AETHER
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-10 font-display text-xl uppercase tracking-tighter">
          {['Men', 'Women', 'Kids', 'Unisex', 'Drops'].map((item) => (
            <Link
              key={item}
              to={item === 'Drops' ? '/collections' : `/category/${item.toLowerCase()}`}
              className="hover:text-accent transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-accent group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-3 hover:bg-accent hover:text-black transition-all border-2 border-transparent hover:border-black rounded-none"
          >
            <Search size={24} />
          </button>
          <Link to="/wishlist" className="relative p-3 hover:bg-accent hover:text-black transition-all border-2 border-transparent hover:border-black">
            <Heart size={24} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-accent text-black text-[10px] font-bold flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-3 bg-accent text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-black text-[10px] font-bold flex items-center justify-center border-2 border-black">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/auth" className="hidden md:block p-3 hover:bg-white hover:text-black transition-all border-2 border-transparent hover:border-black">
            <User size={24} />
          </Link>
        </div>
      </nav>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-3xl bg-white text-black z-[70] p-8 md:p-20 flex flex-col border-r-8 border-accent"
            >
              <div className="flex justify-between items-center mb-20">
                <span className="font-mono text-sm tracking-[0.5em] uppercase font-bold">[ AETHER_NAVIGATION_V2.5 ]</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-5 bg-black text-white hover:bg-accent hover:text-black transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,255,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {['Men', 'Women', 'Kids', 'Unisex', 'Drops', 'Manifesto'].map((item, i) => (
                  <Link
                    key={item}
                    to={item === 'Drops' ? '/collections' : item === 'Manifesto' ? '/about' : `/category/${item.toLowerCase()}`}
                    className="text-6xl md:text-[8vw] font-display leading-[0.9] hover:text-accent hover:translate-x-4 transition-all flex items-center gap-6 group uppercase tracking-tighter"
                  >
                    <span className="text-2xl font-mono text-black/10 group-hover:text-accent transition-colors">0{i + 1}</span>
                    {item}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-16 border-t-4 border-black/10 flex flex-col md:flex-row justify-between items-end gap-12">
                <div className="font-mono text-xs uppercase tracking-[0.3em] space-y-3 max-w-xs">
                  <p className="text-black/40">AETHER WORLDWIDE // EST 2025</p>
                  <p className="font-bold">WE DEFINE THE FUTURE OF DIGITAL CRAFTSMANSHIP THROUGH IMMERSIVE EXPERIENCES.</p>
                </div>
                <div className="flex gap-8 font-display text-3xl">
                  {['IG', 'TW', 'TK', 'FB'].map(social => (
                    <a key={social} href="#" className="hover:text-accent transition-all hover:-translate-y-2">{social}</a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 bg-accent text-black z-[100] p-8 md:p-32 flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-12 right-12 p-6 bg-black text-white hover:bg-white hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
            >
              <X size={40} />
            </button>
            <div className="w-full max-w-7xl">
              <span className="font-mono text-sm tracking-[1em] mb-12 block uppercase font-bold">[ SEARCH_THE_AETHER ]</span>
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="ENTER_QUERY..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setIsSearchOpen(false);
                      navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery('');
                    }
                  }}
                  className="w-full bg-transparent border-b-[12px] border-black py-12 text-7xl md:text-[8vw] font-display leading-none focus:outline-none placeholder:text-black/10 uppercase tracking-tighter"
                />
                <Search size={80} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20" />
              </div>
              <div className="mt-20 flex flex-wrap gap-12 text-2xl font-display uppercase tracking-widest">
                <span className="bg-black text-white px-4 py-1">LATEST:</span>
                {['MEN', 'WOMEN', 'KIDS', 'UNISEX'].map(cat => (
                  <Link
                    key={cat}
                    to={`/category/${cat.toLowerCase()}`}
                    className="hover:text-white transition-colors border-b-4 border-transparent hover:border-black"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-[96px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white text-black border-t-[12px] border-accent py-48 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-48">
            <div>
              <h2 className="text-[20vw] lg:text-[15vw] leading-[0.7] mb-16 tracking-tighter font-display">AETHER</h2>
              <p className="text-3xl md:text-5xl font-display leading-[0.9] max-w-2xl uppercase">
                REDEFINING THE FUTURE OF <span className="text-accent outline-text-black">DIGITAL DRIP</span> THROUGH IMMERSIVE CRAFTSMANSHIP.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div>
                <h3 className="font-mono text-sm tracking-[0.5em] mb-12 uppercase font-bold text-black/40">[ EXPLORE ]</h3>
                <ul className="space-y-8 text-3xl font-display uppercase">
                  <li><Link to="/category/men" className="hover:text-accent transition-all hover:translate-x-4 inline-block">MEN</Link></li>
                  <li><Link to="/category/women" className="hover:text-accent transition-all hover:translate-x-4 inline-block">WOMEN</Link></li>
                  <li><Link to="/category/kids" className="hover:text-accent transition-all hover:translate-x-4 inline-block">KIDS</Link></li>
                  <li><Link to="/category/unisex" className="hover:text-accent transition-all hover:translate-x-4 inline-block">UNISEX</Link></li>
                  <li><Link to="/collections" className="hover:text-accent transition-all hover:translate-x-4 inline-block">DROPS</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-sm tracking-[0.5em] mb-12 uppercase font-bold text-black/40">[ SUPPORT ]</h3>
                <ul className="space-y-8 text-3xl font-display uppercase">
                  <li><Link to="/shipping" className="hover:text-accent transition-all hover:translate-x-4 inline-block">SHIPPING</Link></li>
                  <li><Link to="/returns" className="hover:text-accent transition-all hover:translate-x-4 inline-block">RETURNS</Link></li>
                  <li><Link to="/size-guide" className="hover:text-accent transition-all hover:translate-x-4 inline-block">SIZING</Link></li>
                  <li><Link to="/contact" className="hover:text-accent transition-all hover:translate-x-4 inline-block">CONTACT</Link></li>
                  <li><Link to="/terms" className="hover:text-accent transition-all hover:translate-x-4 inline-block">TERMS</Link></li>
                  <li><Link to="/privacy" className="hover:text-accent transition-all hover:translate-x-4 inline-block">PRIVACY</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-20 border-t-8 border-black flex flex-col lg:flex-row justify-between items-center gap-16">
            <div className="font-mono text-sm uppercase tracking-[0.5em] font-bold text-center lg:text-left">
              © 2026 AETHER WORLDWIDE // ALL RIGHTS RESERVED <br />
              <span className="text-black/40">DESIGNED FOR THE NEW WORLD</span>
            </div>
            <div className="flex flex-wrap justify-center gap-12 font-display text-5xl md:text-7xl">
              {['INSTAGRAM', 'TWITTER', 'TIKTOK'].map(social => (
                <a key={social} href="#" className="hover:text-accent transition-all hover:-skew-x-12">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
