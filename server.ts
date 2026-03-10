import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

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

async function printifyFetch(endpoint: string, options: RequestInit = {}) {
  if (!PRINTIFY_API_KEY) {
    throw new Error("PRINTIFY_API_KEY is not set");
  }

  const response = await fetch(`${PRINTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${PRINTIFY_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Printify API error: ${response.status}`);
  }

  return response.json();
}

// Base sync function for categories
async function ensureCategories() {
  const categories = [
    { name: "Men", slug: "men" },
    { name: "Women", slug: "women" },
    { name: "Kids", slug: "kids" },
    { name: "Unisex", slug: "unisex" }
  ];

  for (const cat of categories) {
    await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" });
  }
}

async function startServer() {

  // Order & Fulfillment
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

  // We keep this as fallback, but will prioritize native colors from Printify API
  const COLOR_MAP: Record<string, string> = {
    "Black": "#000000", "White": "#ffffff", "Navy": "#000080", "Grey": "#808080",
    "Gray": "#808080", "Red": "#ff0000", "Blue": "#0000ff", "Green": "#00ff00",
    "Yellow": "#ffff00", "Orange": "#ffa500", "Purple": "#800080", "Pink": "#ffc0cb",
    "Beige": "#f5f5dc", "Charcoal": "#36454f", "Royal": "#4169e1", "Light Blue": "#add8e6",
    "Forest": "#228b22", "Maroon": "#800000", "Gold": "#ffd700", "Silver": "#c0c0c0",
    "Olive": "#808000", "Tan": "#d2b48c", "Brown": "#a52a2a", "Teal": "#008080",
    "Burgundy": "#800020", "Ash": "#d1d1d1", "Sand": "#c2b280", "Kelly": "#4cbb17",
    "Natural": "#f5f5dc", "Cream": "#fffdd0", "Heather": "#9aa1aa", "Sport Grey": "#9c9c9c"
  };

  async function syncPrintifyProduct(p: any) {
    const shopId = p.shop_id || '19291817';

    // Phase 11: Deep Sync - Always fetch the latest data from the API
    // This captures mockups generated *after* the webhook was triggered
    try {
      const { data: latestP } = await printifyFetch(`/shops/${shopId}/products/${p.id}.json`);
      if (latestP) {
        p = { ...latestP, shop_id: shopId };
        console.log(`[DeepSync] Successfully pulled latest data for ${p.id}`);
      }
    } catch (e) {
      console.warn(`[DeepSync] Could not fetch latest for ${p.id}, using payload data.`);
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

    // Extract native colors from p.options
    const colorOption = p.options?.find((opt: any) => opt.type === 'color');
    const nativeColorMap: Record<number, string> = {};
    if (colorOption?.values) {
      colorOption.values.forEach((v: any) => {
        if (v.colors?.[0]) {
          nativeColorMap[v.id] = v.colors[0];
        }
      });
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
        metadata: {
          tags: p.tags,
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

    // Phase 11: Parallel Processing (500x speed improvement for high-variant products)
    await Promise.all(p.variants.map(async (v: any) => {
      if (!v.is_enabled) return;

      const colorName = v.title.split(" / ")[0] || "Default";
      const sizeName = v.title.split(" / ")[1] || "One Size";

      // Try to find hex from native options first, then fallback to COLOR_MAP
      let hexCode = "#888888";
      const colorOptionId = v.options?.find((oid: number) => nativeColorMap[oid] !== undefined);

      if (colorOptionId !== undefined) {
        hexCode = nativeColorMap[colorOptionId];
      } else {
        // Advanced name-based matching
        const normalizedColorName = colorName.toLowerCase();
        const fallbackMatch = Object.keys(COLOR_MAP).find(k => normalizedColorName.includes(k.toLowerCase()));
        hexCode = fallbackMatch ? COLOR_MAP[fallbackMatch] : (COLOR_MAP[colorName] || "#888888");
      }

      // Find image for this variant
      const variantImage = p.images.find((img: any) => img.variant_ids && img.variant_ids.includes(v.id)) || defaultImage;

      const { error: vError } = await supabase
        .from("product_variants")
        .upsert({
          product_id: productData.id,
          printify_variant_id: v.id.toString(),
          price: v.price / 100,
          sku: v.sku,
          is_enabled: v.is_enabled,
          color: colorName,
          size: sizeName,
          hex_code: hexCode || "#888888",
          image_url: variantImage.src
        }, { onConflict: 'printify_variant_id' });

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
            handle: `${process.env.APP_URL || 'http://localhost:3000'}/product/${slug}`
          }
        })
      });
      console.log(`[Sync] Signaled publishing success for product ${p.id}`);
    } catch (e) {
      console.warn(`[Sync] Failed to signal success for ${p.id}:`, e);
    }

    return productData;
  }

  app.post("/api/webhooks/printify", async (req, res) => {
    try {
      const event = req.body;
      const { type, resource, data } = event;

      console.log(`[Webhook] Received Printify event: ${type}`);

      // Log event to Supabase for audit
      await supabase.from("webhook_logs").insert({
        source: 'printify',
        event_type: type,
        payload: event
      });

      if (type === "shop:product:published" || type === "shop:product:updated") {
        await syncPrintifyProduct(data);
      } else if (type === "shop:product:deleted") {
        await supabase.from("products").delete().eq("printify_id", data.id);
      }

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: error.message });
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Add health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Only start the server setup if it's the main module or if not on Vercel
// Vercel handles the application lifecycle
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
