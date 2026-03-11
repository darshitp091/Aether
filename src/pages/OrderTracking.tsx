import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Package, CheckCircle, Truck, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STEPS = [
  { key: 'paid', label: 'ORDERED', icon: CheckCircle },
  { key: 'processing', label: 'PRODUCING', icon: Package },
  { key: 'shipped', label: 'SHIPPED', icon: Truck },
  { key: 'delivered', label: 'DELIVERED', icon: CheckCircle },
];

function getStepIndex(status: string) {
  const map: Record<string, number> = { paid: 0, processing: 1, shipped: 2, delivered: 3 };
  return map[status] ?? 0;
}

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('not_found');
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ LOGISTICS ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-6 leading-[0.8] tracking-tighter">
            TRA<span className="outline-text">CK</span>
          </h1>
          <p className="font-mono text-sm uppercase tracking-wider text-white/40 mb-16">
            ENTER YOUR ORDER ID AND EMAIL TO CHECK YOUR ORDER STATUS.
          </p>
        </motion.div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="space-y-6 mb-16">
          <input
            type="text"
            placeholder="ORDER ID"
            className="w-full bg-zinc-900 border-4 border-white p-5 font-mono text-sm uppercase focus:border-accent outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="w-full bg-zinc-900 border-4 border-white p-5 font-mono text-sm uppercase focus:border-accent outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,255,102,1)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="brutal-btn w-full flex items-center justify-center gap-4 py-6 disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 className="animate-spin" size={24} /> : <><Search size={20} /> TRACK_ORDER</>}
          </button>
        </form>

        {/* Not Found */}
        {status === 'not_found' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-4 border-red-500/50 p-8 text-center">
            <p className="font-mono text-sm uppercase tracking-wider text-red-400">ORDER NOT FOUND. PLEASE CHECK YOUR ORDER ID AND EMAIL.</p>
          </motion.div>
        )}

        {/* Order Found */}
        {status === 'found' && order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Timeline */}
            <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h2 className="font-display text-2xl uppercase mb-8 tracking-widest">Status</h2>
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  const isActive = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="text-center flex-shrink-0">
                        <div className={`w-10 h-10 mx-auto mb-2 border-2 flex items-center justify-center ${isActive ? 'bg-accent border-black' : 'border-white/20'} ${isCurrent ? 'animate-pulse' : ''}`}>
                          <StepIcon size={18} className={isActive ? 'text-black' : 'text-white/20'} />
                        </div>
                        <span className={`font-mono text-[10px] tracking-wider ${isActive ? 'text-accent' : 'text-white/20'}`}>{step.label}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-[2px] mx-1 ${i < currentStep ? 'bg-accent' : 'bg-white/10'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h2 className="font-display text-2xl uppercase mb-6 tracking-widest">Order Details</h2>
              <div className="space-y-4 font-mono text-sm uppercase tracking-wider">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/40">ORDER ID</span>
                  <span className="text-accent text-xs">{order.id}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/40">DATE</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/40">TOTAL</span>
                  <span className="text-accent">${Number(order.total_amount).toFixed(2)}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-white/40">TRACKING</span>
                    {order.tracking_url ? (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-accent flex items-center gap-2 hover:underline">
                        {order.tracking_number} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span>{order.tracking_number}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <h2 className="font-display text-2xl uppercase mb-6 tracking-widest">Items</h2>
                <div className="space-y-4">
                  {order.order_items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0">
                      {item.products?.image_url && (
                        <img src={item.products.image_url} alt="" className="w-16 h-16 object-cover border-2 border-white/20" referrerPolicy="no-referrer" />
                      )}
                      <div className="flex-1">
                        <p className="font-display text-lg uppercase">{item.products?.name || 'Product'}</p>
                        <p className="font-mono text-xs text-white/40">QTY: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                      </div>
                      <p className="font-display text-accent">${Number(item.total_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
