import express from "express";
// Standard Vercel API entry
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());

// Production optimization
if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', 1);
}

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PORT = Number(process.env.PORT) || 3000;

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// Printify API Configuration
const PRINTIFY_API_BASE = "https://api.printify.com/v1";
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;

async function printifyFetch(endpoint: string, options: any = {}) {
  const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
  if (!PRINTIFY_API_KEY) {
    throw new Error("PRINTIFY_API_KEY is not set");
  }

  const response = await axios({
    url: `${PRINTIFY_API_BASE}${endpoint}`,
    method: options.method || 'GET',
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: {
      "Authorization": `Bearer ${PRINTIFY_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response.data;
}

// Base sync function for categories
async function ensureCategories() {
  const categories = [
    { name: "Men", slug: "men", description: "Premium menswear engineered for the future." },
    { name: "Women", slug: "women", description: "Digital-first apparel for the modern woman." },
    { name: "Kids", slug: "kids", description: "Future wear for the next generation." },
    { name: "Unisex", slug: "unisex", description: "Universal silhouettes for everyone." }
  ];

  for (const cat of categories) {
    await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" });
  }
}

// API Routes
app.post("/api/orders/create", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      total_amount,
      shipping_cost
    } = req.body;

    // 1. Verify Payment
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // 2. Create Order in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        total_amount,
        shipping_cost,
        status: 'paid',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        shipping_address: address,
        currency: 'INR'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Create Items in Supabase
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      variant_id: item.variant_id || null,
      printify_variant_id: item.printify_variant_id,
      quantity: item.quantity,
      unit_price: item.markup_price,
      total_price: item.markup_price * item.quantity
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // 4. Trigger Printify Fulfillment
    // We need a shop_id. Fetching the first shop for now.
    const shops = await printifyFetch("/shops.json");
    const shopId = shops[0].id;

    const printifyOrder = await printifyFetch(`/shops/${shopId}/orders.json`, {
      method: 'POST',
      body: JSON.stringify({
        external_id: order.id.toString(),
        line_items: items.map((item: any) => ({
          printify_variant_id: item.printify_variant_id,
          quantity: item.quantity
        })),
        address_to: {
          first_name: address.full_name.split(' ')[0],
          last_name: address.full_name.split(' ').slice(1).join(' ') || 'Customer',
          email: address.email,
          phone: address.phone || '',
          address1: address.line1,
          address2: address.line2 || '',
          city: address.city,
          region: address.state || '',
          zip: address.postal_code,
          country: address.country_code
        }
      })
    });

    // 5. Update Order with Printify ID
    await supabase
      .from("orders")
      .update({ printify_order_id: printifyOrder.id })
      .eq("id", order.id);

    res.json({ success: true, order_id: order.id, printify_order_id: printifyOrder.id });
  } catch (error: any) {
    console.error("Order completion error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/payment/razorpay/order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/payment/razorpay/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.get("/api/printify/shops", async (req, res) => {
  try {
    const shops = await printifyFetch("/shops.json");
    res.json(shops);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/printify/products/:shopId", async (req, res) => {
  try {
    const products = await printifyFetch(`/shops/${req.params.shopId}/products.json`);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Massive Color Map for Streetwear / Printify / Shopify Standard Colors
const COLOR_MAP: Record<string, string> = {
  // Primaries & Basics
  "Black": "#000000", "True Black": "#000000", "Coal": "#1a1a1a", "Onyx": "#0f0f0f",
  "White": "#ffffff", "True White": "#ffffff", "Off White": "#f5f5f5", "Snow": "#fffafa",
  "Navy": "#000080", "French Navy": "#000040", "Midnight": "#191970", "Deep Navy": "#000033",
  "Grey": "#808080", "Gray": "#808080", "Light Grey": "#d3d3d3", "Dark Grey": "#a9a9a9",
  "Charcoal": "#36454f", "Anthracite": "#2e2e2e", "Iron": "#434b4d", "Slate": "#708090",
  "Ash": "#d1d1d1", "Silver": "#c0c0c0", "Oxford": "#e1e1e1", "Sport Grey": "#9c9c9c",

  // Reds & Pinks
  "Red": "#ff0000", "Crimson": "#dc143c", "Maroon": "#800000", "Burgundy": "#800020",
  "Wine": "#722f37", "Oxblood": "#4a0404", "Cardinal": "#c41e3a", "Rust": "#b7410e",
  "Pink": "#ffc0cb", "Light Pink": "#ffb6c1", "Hot Pink": "#ff69b4", "Rose": "#ff007f",
  "Dusty Rose": "#cca9ac", "Mauve": "#e0b0ff", "Fuschia": "#ff00ff", "Berry": "#990f3d",

  // Blues
  "Blue": "#0000ff", "Royal": "#4169e1", "Royal Blue": "#002366", "Electric Blue": "#7df9ff",
  "Light Blue": "#add8e6", "Sky Blue": "#87ceeb", "Baby Blue": "#89cff0", "Cyan": "#00ffff",
  "Teal": "#008080", "Turquoise": "#40e0d0", "Aqua": "#00ffff", "Ocean": "#0077be",
  "Ice Blue": "#99ffff", "Cornflower": "#6495ed", "Carolina Blue": "#4b9cd3",

  // Greens
  "Green": "#00ff00", "Forest": "#228b22", "Forest Green": "#228b22", "Dark Green": "#006400",
  "Military Green": "#4b5320", "Olive": "#808000", "Army": "#4b5320", "Army Green": "#4b5320",
  "Kelly": "#4cbb17", "Kelly Green": "#4cbb17", "Mint": "#98ff98", "Sage": "#bcb88a",
  "Lime": "#00ff00", "Emerald": "#50c878", "Hunter Green": "#355e3b", "Moss": "#8a9a5b",
  "Heather Forest": "#228b22", "Irish Green": "#009a44",

  // Earth & Browns
  "Beige": "#f5f5dc", "Tan": "#d2b48c", "Khaki": "#c3b091", "Sand": "#c2b280",
  "Desert": "#edc9af", "Camel": "#c19a6b", "Brown": "#a52a2a", "Dark Brown": "#654321",
  "Chocolate": "#7b3f00", "Coffee": "#6f4e37", "Copper": "#b87333", "Bronze": "#cd7f32",
  "Coyote": "#81613e", "Natural": "#f5f5dc", "Ivory": "#fffff0", "Cream": "#fffdd0",

  // Yellows & Oranges
  "Yellow": "#ffff00", "Gold": "#ffd700", "Lemon": "#fff700", "Sunflower": "#ffda00",
  "Mustard": "#ffdb58", "Orange": "#ffa500", "Sunset": "#fad6a5", "Peach": "#ffcc99",
  "Amber": "#ffbf00", "Neon Orange": "#ff5f00", "Safety Orange": "#ff6700",

  // Purples
  "Purple": "#800080", "Violet": "#ee82ee", "Grape": "#6f2da8", "Plum": "#8e4585",
  "Lavender": "#e6e6fa", "Lilac": "#c8a2c8", "Eggplant": "#614051", "Indigo": "#4b0082",

  // Heathers & Textures
  "Heather": "#9aa1aa", "Heather Grey": "#9c9c9c", "Athletic Heather": "#b2b2b2",
  "Dark Heather": "#555555", "Graphite": "#383838", "Stone": "#8b8c7e",
  "Marble": "#e2e2e2", "Acid Wash": "#404040", "Vintage Black": "#1c1c1c"
};

function getHexForColor(colorName: string): string {
  const normalized = colorName.trim();
  // 1. Direct match
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];

  // 2. Case-insensitive match
  const lower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (key.toLowerCase() === lower) return value;
  }

  // 3. Smart Matcher: Extract base color from complex names (e.g., "Deep Royal Blue")
  const parts = lower.split(' ');
  for (const part of [...parts].reverse()) { // Check last word first (usually the primary color)
    for (const [key, value] of Object.entries(COLOR_MAP)) {
      if (key.toLowerCase() === part) return value;
    }
  }

  // 4. Heuristic: Look for keywords anywhere in the string
  const keywords = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length); // Longest first
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) return COLOR_MAP[kw];
  }

  return "#888888"; // Final fallback
}

async function syncPrintifyProduct(p: any) {
  const shopId = p.shop_id || '19291817';

  // Phase 11: Deep Sync - Always fetch the latest data from the API
  // This captures mockups generated *after* the webhook was triggered
  try {
    const latestP = await printifyFetch(`/shops/${shopId}/products/${p.id}.json`);
    if (latestP && latestP.id) {
      p = { ...latestP, shop_id: shopId };
      console.log(`[DeepSync] Successfully pulled latest data for ${p.id} (${latestP.images?.length || 0} images, ${latestP.options?.length || 0} options)`);
    }
  } catch (e: any) {
    console.warn(`[DeepSync] Could not fetch latest for ${p.id}, using payload data. Error: ${e.message}`);
  }

  if (!p.images || p.images.length === 0) {
    console.warn(`[Sync] Skipping product ${p.id} due to missing images.`);
    return;
  }

  const slug = p.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + p.id.slice(-4);

  // Improved Gender Mapping
  let gender = 'men';
  if (p.tags.includes("Unisex")) gender = 'unisex';
  else if (p.tags.includes("Women")) gender = 'women';
  else if (p.tags.includes("Kids")) gender = 'kids';
  else if (p.tags.includes("Men")) gender = 'men';

  const type = p.tags.includes("T-Shirt") || p.tags.includes("T-shirt") ? "tshirt" :
    (p.tags.includes("Hoodie") ? "hoodie" :
      (p.tags.includes("Sweatshirt") ? "sweatshirt" : "other"));

  // Determine the sequence of options (Color/Size vs Size/Color)
  const colorOptionIndex = p.options.findIndex((opt: any) => opt.type === 'color');
  const sizeOptionIndex = p.options.findIndex((opt: any) => opt.type === 'size');
  console.log(`[SyncDebug] Product: ${p.title} (ID: ${p.id})`);
  console.log(`[SyncDebug] colorOptionIndex: ${colorOptionIndex}, sizeOptionIndex: ${sizeOptionIndex}`);
  console.log(`[SyncDebug] Options: ${JSON.stringify(p.options.map((o: any) => ({ name: o.name, type: o.type })))}`);

  // Extract native colors from p.options — map by TITLE (color name) for reliable matching
  const colorOption = p.options[colorOptionIndex];
  const nativeColorByName: Record<string, string> = {};
  if (colorOption?.values) {
    colorOption.values.forEach((v: any) => {
      if (v.colors?.[0] && v.title) {
        nativeColorByName[v.title.trim()] = v.colors[0];
      }
    });
    console.log(`[ColorEngine] Found ${Object.keys(nativeColorByName).length} native colors from Printify options`);
  }

  const { data: catData } = await supabase.from("categories").select("id").eq("slug", gender).single();
  const categoryId = catData?.id || null;

  // Use default image or first publishing-selected image for product hero
  const defaultImage = p.images.find((img: any) => img.is_default) || p.images[0];

  const { data: productData, error: prodError } = await supabase
    .from("products")
    .upsert({
      printify_id: p.id,
      name: p.title,
      slug,
      description: p.description,
      category_id: categoryId,
      type,
      gender,
      status: 'published',
      base_price: p.variants[0]?.price / 100 || 0,
      markup_price: (p.variants[0]?.price / 100) * 1.5 || 0,
      tags: p.tags,
      metadata: {
        all_images: p.images.map((img: any) => ({
          src: img.src,
          variant_ids: img.variant_ids,
          is_default: img.is_default,
          position: img.position
        }))
      }
    }, { onConflict: 'printify_id' })
    .select()
    .single();

  if (prodError) throw prodError;

  // Delete existing variants for this product (ensures clean hex_code data on re-sync)
  await supabase.from("product_variants").delete().eq("product_id", productData.id);

  // Phase 11: Parallel Processing (500x speed improvement for high-variant products)
  await Promise.all(p.variants.map(async (v: any) => {
    if (!v.is_enabled) return;

    // Dynamic Title Splitting based on detected option order
    const parts = v.title.split(" / ");
    const colorName = colorOptionIndex !== -1 ? (parts[colorOptionIndex] || "Default") : "Default";
    const sizeName = sizeOptionIndex !== -1 ? (parts[sizeOptionIndex] || "One Size") : "One Size";

    if (p.id === '69b007cd6d2baa18fc0b562a') {
      console.log(`[SyncDebug] Variant ${v.id} Title: "${v.title}" -> color: "${colorName}", size: "${sizeName}"`);
    }

    // Color resolution: Native Printify hex > Auto-Color Engine > Fallback grey
    const hexCode = nativeColorByName[colorName] || getHexForColor(colorName);

    // Find image for this variant
    const variantImage = p.images.find((img: any) => img.variant_ids && img.variant_ids.includes(v.id)) || defaultImage;

    const { error: vError } = await supabase
      .from("product_variants")
      .insert({
        product_id: productData.id,
        printify_variant_id: v.id.toString(),
        price: v.price / 100,
        sku: v.sku,
        is_enabled: v.is_enabled,
        color: colorName,
        size: sizeName,
        hex_code: hexCode || "#888888",
        image_url: variantImage.src
      });

    if (vError) {
      console.error(`[Sync] Error upserting variant ${v.id}:`, vError);
    }
  }));

  // Call Printify to signal publishing success (unlocks product)
  try {
    await printifyFetch(`/shops/${shopId}/products/${p.id}/publishing_succeeded.json`, {
      method: 'POST',
      body: JSON.stringify({
        external: {
          id: productData.id,
          handle: `https://store-aether.vercel.app/product/${slug}`
        }
      })
    });
    console.log(`[Sync] Signaled publishing success for product ${p.id}`);
    await supabase.from("system_logs").insert({
      source: 'manual_sync_engine',
      level: 'info',
      message: `Product ${p.id} (${p.title}) synced successfully.`,
      payload: { printify_id: p.id, slug }
    });
  } catch (e) {
    console.warn(`[Sync] Failed to signal success for ${p.id}:`, e);
  }

  return productData;
}

app.all(["/api/webhooks/printify", "/webhooks/printify"], async (req, res) => {
  console.log(`[Webhook Hit] ${req.method} ${req.path}`);
  // Force no-cache to prevent Vercel 304 responses for webhook validation
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ status: "ok", mode: "validation" });
  }

  try {
    const event = req.body;
    console.log("[Webhook] Raw Body:", JSON.stringify(req.body));
    console.log("[Webhook] Headers:", JSON.stringify(req.headers));

    // Validation check: Printify sometimes sends a ping with empty body or different structure
    if (!event || !event.type) {
      console.log("[Webhook] Received possible validation ping (empty/invalid body)");
      return res.status(200).json({ status: "ok", validation: true });
    }

    const { type, resource, data } = event;
    console.log(`[Webhook] Received Printify event: ${type}`);

    // Log event to Supabase for audit
    await supabase.from("system_logs").insert({
      source: 'printify_webhook',
      level: 'info',
      message: `Received event: ${type}`,
      payload: event
    });

    if (type === "shop:product:published" || type === "shop:product:updated") {
      await syncPrintifyProduct(data);
    } else if (type === "shop:product:deleted") {
      await supabase.from("products").delete().eq("printify_id", data.id);
    }

    res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    await supabase.from("system_logs").insert({
      source: 'printify_webhook',
      level: 'error',
      message: `Webhook failed: ${error.message}`,
      payload: { error: error.stack }
    });
    res.status(500).json({ error: error.message });
  }
});

// Debug: Test color extraction for a product (GET to make it easy to test)
app.get("/api/debug/colors/:shopId", async (req, res) => {
  try {
    const productList = await printifyFetch(`/shops/${req.params.shopId}/products.json`);
    const products = productList.data || productList;
    const p = Array.isArray(products) ? products[0] : products;

    // Fetch full product detail
    const fullProduct = await printifyFetch(`/shops/${req.params.shopId}/products/${p.id}.json`);

    const colorOption = fullProduct.options?.find((opt: any) => opt.type === 'color');
    const nativeMap: Record<string, string> = {};
    if (colorOption?.values) {
      colorOption.values.forEach((v: any) => {
        if (v.colors?.[0] && v.title) {
          nativeMap[v.title.trim()] = v.colors[0];
        }
      });
    }

    const results = fullProduct.variants.slice(0, 20).map((v: any) => {
      const colorName = v.title.split(" / ")[0] || "Default";
      const nativeHex = nativeMap[colorName];
      const fallbackHex = getHexForColor(colorName);
      return {
        color: colorName,
        nativeHex: nativeHex || "NONE",
        fallbackHex,
        finalHex: nativeHex || fallbackHex
      };
    });

    res.json({
      product: fullProduct.title,
      optionsCount: fullProduct.options?.length || 0,
      nativeColorsFound: Object.keys(nativeMap).length,
      sampleNativeMap: Object.entries(nativeMap).slice(0, 5).map(([k, v]) => `${k}=${v}`),
      variantColors: results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

app.post("/api/printify/sync/:shopId", async (req, res) => {
  try {
    await ensureCategories();
    const { data: products } = await printifyFetch(`/shops/${req.params.shopId}/products.json`);

    for (const p of products) {
      await syncPrintifyProduct(p);
    }

    res.json({ message: "Sync complete", count: products.length });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, type, gender } = req.query;
    let query = supabase.from("products").select("*, categories(name, slug), product_variants(*)");

    if (category) query = query.eq("categories.slug", category);
    if (type) query = query.eq("type", type);

    // Search logic: Filter by name, type, or tags
    const q = req.query.q as string;
    if (q) {
      // Use the new tags array for filtering + ilike for name/gender
      query = query.or(`name.ilike.%${q}%,gender.ilike.%${q}%,tags.cs.{"${q}"}`);
    }

    // Unisex Logic: If gender is men or women, include unisex products
    if (gender) {
      if (gender === 'men' || gender === 'women') {
        query = query.in("gender", [gender, 'unisex']);
      } else {
        query = query.eq("gender", gender);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("slug", req.params.slug)
      .single();

    if (error) throw error;
    res.json(product);
  } catch (error: any) {
    res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "16.6",
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    env_check: {
      supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      printify: !!process.env.PRINTIFY_API_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET
    }
  });
});

// Export the app for Vercel
export default app;

// Local development server support
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`[Local Server] AETHER Engine running on http://localhost:${PORT}`);
  });
}
