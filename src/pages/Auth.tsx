import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;

        // If sign up is successful, we might want to sync the user to our public.users table
        // This is often handled by a DB trigger, but we can do a quick check/upsert if needed
        if (data.user) {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
          });
        }
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative 3D-like elements */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-xl relative z-10">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-6 block"
          >
            Aether Membership
          </motion.span>
          <h1 className="text-6xl md:text-7xl font-light tracking-tighter mb-6">
            {isLogin ? 'WELCOME BACK' : 'JOIN THE ELITE'}
          </h1>
          <p className="text-white/40 text-lg font-light max-w-md mx-auto leading-relaxed">
            {isLogin
              ? 'Enter your credentials to access your curated wardrobe and exclusive collections.'
              : 'Create an account to experience the future of luxury e-commerce and personalized style.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a1a1a]/80 p-12 md:p-16 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl shadow-2xl relative group overflow-hidden"
        >
          {/* Subtle light sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-xs uppercase tracking-widest text-center rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleAuth}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alexander Aether"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@aether.com"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-white text-black h-20 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all rounded-2xl mt-12 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'AUTHENTICATE' : 'ESTABLISH ACCOUNT'}
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-white/5 flex flex-col items-center gap-8">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              {isLogin ? "NEW TO AETHER? CREATE ACCOUNT" : "ALREADY A MEMBER? SIGN IN"}
            </button>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20">
              <ShieldCheck size={14} />
              Secure Encrypted Authentication
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
