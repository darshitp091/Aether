import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ TRANSMISSION ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-6 leading-[0.8] tracking-tighter">
            CON<span className="outline-text">TACT</span>
          </h1>
          <p className="font-mono text-sm uppercase tracking-wider text-white/40 mb-16">
            REACH THE AETHER COMMAND CENTER. WE RESPOND WITHIN 24-48 HOURS.
          </p>
        </motion.div>

        {status === 'sent' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-4 border-accent p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]"
          >
            <h2 className="text-5xl font-display uppercase mb-6 text-accent">TRANSMITTED</h2>
            <p className="font-mono text-sm uppercase tracking-wider text-white/60">YOUR MESSAGE HAS BEEN RECEIVED. WE'LL RESPOND SOON.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="NAME *"
                required
                className="w-full bg-zinc-900 border-4 border-white p-5 font-mono text-sm uppercase focus:border-accent outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="EMAIL *"
                required
                className="w-full bg-zinc-900 border-4 border-white p-5 font-mono text-sm uppercase focus:border-accent outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="SUBJECT"
              className="w-full bg-zinc-900 border-4 border-white p-5 font-mono text-sm uppercase focus:border-accent outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              placeholder="MESSAGE *"
              required
              rows={6}
              className="w-full bg-zinc-900 border-4 border-white p-5 font-mono text-sm uppercase focus:border-accent outline-none transition-colors resize-none shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="brutal-btn w-full flex items-center justify-center gap-4 py-6 disabled:opacity-50"
            >
              {status === 'sending' ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> TRANSMIT_MESSAGE</>}
            </button>
            {status === 'error' && (
              <p className="font-mono text-xs text-red-500 uppercase tracking-wider text-center">
                TRANSMISSION FAILED. PLEASE TRY AGAIN.
              </p>
            )}
          </form>
        )}

        <div className="mt-24 border-t-4 border-white/10 pt-12 font-mono text-sm uppercase tracking-wider text-white/40 text-center">
          <p>DIRECT SIGNAL: support@aether.store</p>
          <p className="mt-2">RESPONSE TIME: 24-48 HOURS</p>
        </div>
      </div>
    </div>
  );
}
