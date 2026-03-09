import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { RefreshCw, Store, Package, CheckCircle2, AlertCircle } from "lucide-react";

interface Shop {
  id: number;
  title: string;
  sales_channel: string;
}

export default function Admin() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetchShops();
    fetchProductCount();
  }, []);

  const fetchProductCount = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProductCount(data.length);
    } catch (error) {
      console.error("Error fetching product count:", error);
    }
  };

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/printify/shops");
      const data = await response.json();
      if (Array.isArray(data)) {
        setShops(data);
      } else {
        setShops([]);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      setMessage({ type: "error", text: "Failed to fetch shops. Check your API key." });
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async (shopId: number) => {
    setSyncing(shopId);
    setMessage(null);
    try {
      const response = await fetch(`/api/printify/sync/${shopId}`, { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: `Successfully synced ${data.count} products!` });
        fetchProductCount();
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error: any) {
      console.error("Error syncing products:", error);
      setMessage({ type: "error", text: error.message || "Failed to sync products." });
    } finally {
      setSyncing(null);
    }
  };

  const syncAllShops = async () => {
    setLoading(true);
    setMessage(null);
    let totalSynced = 0;
    try {
      for (const shop of shops) {
        const response = await fetch(`/api/printify/sync/${shop.id}`, { method: "POST" });
        const data = await response.json();
        if (response.ok) {
          totalSynced += data.count;
        }
      }
      setMessage({ type: "success", text: `Successfully synced ${totalSynced} products across all shops!` });
      fetchProductCount();
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to sync all shops." });
    } finally {
      setLoading(false);
    }
  };

  const clearProducts = async () => {
    if (!confirm("Are you sure you want to clear all products? This will remove all synced and manual products.")) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/clear-products", { method: "POST" });
      if (response.ok) {
        setMessage({ type: "success", text: "All products cleared successfully." });
        fetchProductCount();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to clear products." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tighter mb-2">
              AETHER <span className="outline-text-white">CONTROL</span>
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
              Printify API Integration & Product Sync • {productCount} Products in Database
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={clearProducts}
              disabled={loading}
              className="px-6 py-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest font-bold"
            >
              Clear All
            </button>
            {shops.length > 0 && (
              <button 
                onClick={syncAllShops}
                disabled={loading}
                className="px-6 py-4 border border-accent text-accent hover:bg-accent hover:text-black transition-all font-mono text-[10px] uppercase tracking-widest font-bold"
              >
                Sync All
              </button>
            )}
            <button 
              onClick={fetchShops}
              disabled={loading}
              className="p-4 border border-white/10 hover:bg-white hover:text-black transition-all rounded-full"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 border flex items-center gap-3 ${
              message.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-mono text-sm uppercase tracking-wider">{message.text}</span>
          </motion.div>
        )}

        <div className="grid gap-6">
          {loading ? (
            <div className="py-12 text-center text-white/20 font-mono uppercase tracking-widest">
              Initializing connection...
            </div>
          ) : shops.length > 0 ? (
            shops.map((shop) => (
              <motion.div 
                key={shop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-white/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/30 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-xl">
                    <Package className="w-8 h-8 text-white/40" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl uppercase tracking-tight mb-1">{shop.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">ID: {shop.id}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span className="font-mono text-[10px] text-accent uppercase tracking-widest">{shop.sales_channel}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => syncProducts(shop.id)}
                  disabled={syncing === shop.id}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-accent hover:text-black transition-all disabled:opacity-50"
                >
                  {syncing === shop.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync Products
                    </>
                  )}
                </button>
              </motion.div>
            ))
          ) : (
            <div className="py-24 border border-dashed border-white/10 text-center rounded-2xl">
              <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-mono text-sm uppercase tracking-widest">
                No shops found. Ensure your API key is correct in the environment.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 p-8 border border-white/5 bg-white/[0.02] rounded-2xl">
          <h4 className="font-display text-lg uppercase tracking-tight mb-4">Technical Specs</h4>
          <ul className="space-y-3 font-mono text-[10px] text-white/40 uppercase tracking-widest">
            <li className="flex justify-between">
              <span>API Endpoint</span>
              <span className="text-white">api.printify.com/v1</span>
            </li>
            <li className="flex justify-between">
              <span>Auth Method</span>
              <span className="text-white">Bearer Token (JWT)</span>
            </li>
            <li className="flex justify-between">
              <span>Sync Logic</span>
              <span className="text-white">Upsert on printify_id</span>
            </li>
            <li className="flex justify-between">
              <span>Mapping</span>
              <span className="text-white">Tags → Category/Gender</span>
            </li>
            <li className="pt-4 border-t border-white/5 text-accent italic">
              Note: Products in "Publishing" status on Printify may skip sync until images are generated.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
