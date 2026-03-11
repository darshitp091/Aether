import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Package, Loader2, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      setEmail(session.user.email);

      try {
        const res = await fetch(`/api/orders/history/${encodeURIComponent(session.user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      paid: 'bg-blue-500', processing: 'bg-yellow-500',
      shipped: 'bg-accent', delivered: 'bg-green-500',
      cancelled: 'bg-red-500', pending: 'bg-white/40'
    };
    return map[s] || 'bg-white/40';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        <Package size={80} className="text-accent opacity-20 mb-8" />
        <h2 className="text-5xl font-display uppercase mb-6">SIGN IN<br />TO VIEW ORDERS</h2>
        <p className="font-mono text-sm text-white/40 uppercase tracking-wider mb-12">
          LOG IN TO YOUR AETHER ACCOUNT TO SEE YOUR ORDER HISTORY.
        </p>
        <Link to="/auth" className="brutal-btn px-12 py-5">SIGN_IN</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        <ShoppingBag size={80} className="text-accent opacity-20 mb-8" />
        <h2 className="text-5xl font-display uppercase mb-6">NO ORDERS YET</h2>
        <p className="font-mono text-sm text-white/40 uppercase tracking-wider mb-12">
          YOUR AETHER COLLECTION AWAITS. START SHOPPING.
        </p>
        <Link to="/category/men" className="brutal-btn px-12 py-5">EXPLORE_DROPS</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ ARCHIVE ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-16 leading-[0.8] tracking-tighter">
            ORD<span className="outline-text">ERS</span>
          </h1>
        </motion.div>

        <div className="space-y-8">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border-4 border-white p-8 hover:border-accent transition-colors shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-1">ORDER ID</p>
                  <p className="font-mono text-sm text-accent">{order.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${statusColor(order.status)}`} />
                  <span className="font-mono text-sm uppercase tracking-wider">{order.status}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                  {order.order_items?.map((item: any, j: number) => (
                    <div key={j} className="flex items-center gap-3">
                      {item.products?.image_url && (
                        <img src={item.products.image_url} alt="" className="w-10 h-10 object-cover border border-white/20" referrerPolicy="no-referrer" />
                      )}
                      <span className="font-mono text-xs uppercase text-white/60">
                        {item.products?.name} × {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-display text-accent">${Number(order.total_amount).toFixed(2)}</p>
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
