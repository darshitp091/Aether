import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("ecommerce.db");

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

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    printify_id TEXT UNIQUE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category_id INTEGER,
    type TEXT CHECK(type IN ('tshirt', 'hoodie', 'sweatshirt')),
    gender TEXT CHECK(gender IN ('men', 'women', 'kids', 'unisex')),
    colors TEXT, -- JSON array of color hex codes
    sizes TEXT, -- JSON array of sizes
    image_url TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER,
    product_id INTEGER,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Migration: Add printify_id if it doesn't exist (for existing tables)
try {
  db.prepare("ALTER TABLE products ADD COLUMN printify_id TEXT UNIQUE").run();
} catch (e) {
  // Column already exists or other error
}

// Seed initial data if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCat = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
  insertCat.run("Men", "men");
  insertCat.run("Women", "women");
  insertCat.run("Kids", "kids");

  const insertProd = db.prepare("INSERT INTO products (printify_id, name, slug, description, price, category_id, type, gender, colors, sizes, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  
  const products = [
    // Men
    [null, "AETHER Signature Tee", "aether-signature-tee", "Premium heavyweight cotton with a structured drape.", 95.00, 1, "tshirt", "men", ["#000000", "#FFFFFF", "#333333"], ["S", "M", "L", "XL"], "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"],
    [null, "Onyx Tech Hoodie", "onyx-tech-hoodie", "Water-repellent technical fleece with bonded seams.", 220.00, 1, "hoodie", "men", ["#1A1A1A", "#000000"], ["M", "L", "XL"], "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"],
    [null, "Urban Nomad Sweatshirt", "urban-nomad-sweatshirt", "Relaxed fit with reinforced elbows and hidden pockets.", 165.00, 1, "sweatshirt", "men", ["#4B5563", "#1F2937"], ["S", "M", "L"], "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"],
    [null, "Midnight Cargo Tee", "midnight-cargo-tee", "Utility-inspired tee with a subtle chest pocket.", 110.00, 1, "tshirt", "men", ["#000000", "#2D3748"], ["M", "L", "XL"], "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"],
    [null, "Summit Thermal Hoodie", "summit-thermal-hoodie", "High-loft thermal lining for extreme comfort.", 245.00, 1, "hoodie", "men", ["#FFFFFF", "#E2E8F0"], ["L", "XL"], "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"],
    [null, "Core Fleece Sweatshirt", "core-fleece-sweatshirt", "The essential everyday layer in brushed fleece.", 130.00, 1, "sweatshirt", "men", ["#000000", "#4A5568"], ["S", "M", "L", "XL"], "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"],
    
    // Women
    [null, "Silk-Cotton Blend Tee", "silk-cotton-tee", "Luxurious blend with a subtle sheen and soft hand.", 125.00, 2, "tshirt", "women", ["#F7FAFC", "#EDF2F7"], ["XS", "S", "M"], "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80"],
    [null, "Ethereal Oversized Hoodie", "ethereal-hoodie", "Voluminous silhouette with extra-long drawstrings.", 210.00, 2, "hoodie", "women", ["#000000", "#2D3748"], ["S", "M", "L"], "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"],
    [null, "Zenith Cropped Sweatshirt", "zenith-cropped-sweat", "Modern crop length with wide ribbed cuffs.", 155.00, 2, "sweatshirt", "women", ["#CBD5E0", "#A0AEC0"], ["XS", "S", "M"], "https://images.unsplash.com/photo-1529139513477-323b63bc2d53?auto=format&fit=crop&w=800&q=80"],
    [null, "Minimalist V-Neck Tee", "minimalist-v-neck", "Deep V-neck in fine-gauge organic cotton.", 85.00, 2, "tshirt", "women", ["#FFFFFF", "#000000"], ["S", "M", "L"], "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"],
    [null, "Velvet-Touch Hoodie", "velvet-touch-hoodie", "Plush velvet finish for ultimate luxury lounging.", 280.00, 2, "hoodie", "women", ["#1A202C", "#2D3748"], ["M", "L"], "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"],
    [null, "Sculpted Fit Sweatshirt", "sculpted-fit-sweat", "Tailored fit that contours to the body.", 175.00, 2, "sweatshirt", "women", ["#000000", "#4A5568"], ["XS", "S", "M"], "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"],

    // Kids
    [null, "Mini Aether Tee", "mini-aether-tee", "Durable and soft for the next generation.", 55.00, 3, "tshirt", "kids", ["#FFFFFF", "#000000"], ["2T", "4T", "6T"], "https://images.unsplash.com/photo-1519233073524-d8a057a5a1bb?auto=format&fit=crop&w=800&q=80"],
    [null, "Junior Cloud Hoodie", "junior-cloud-hoodie", "Lightweight and breathable for active play.", 95.00, 3, "hoodie", "kids", ["#E2E8F0", "#CBD5E0"], ["4T", "6T", "8"], "https://images.unsplash.com/photo-1519233073524-d8a057a5a1bb?auto=format&fit=crop&w=800&q=80"],
    [null, "Little Legend Sweatshirt", "little-legend-sweat", "Classic crewneck with a playful twist.", 75.00, 3, "sweatshirt", "kids", ["#000000", "#2D3748"], ["6", "8", "10"], "https://images.unsplash.com/photo-1519233073524-d8a057a5a1bb?auto=format&fit=crop&w=800&q=80"],
    [null, "Playground Essential Tee", "playground-tee", "Stain-resistant finish for worry-free wear.", 45.00, 3, "tshirt", "kids", ["#FFFFFF", "#A0AEC0"], ["2T", "4T"], "https://images.unsplash.com/photo-1519233073524-d8a057a5a1bb?auto=format&fit=crop&w=800&q=80"],
    [null, "Cozy Cub Hoodie", "cozy-cub-hoodie", "Extra soft lining for chilly mornings.", 110.00, 3, "hoodie", "kids", ["#1A202C", "#4A5568"], ["4T", "6T", "8"], "https://images.unsplash.com/photo-1519233073524-d8a057a5a1bb?auto=format&fit=crop&w=800&q=80"],
    [null, "Active Kid Sweatshirt", "active-kid-sweat", "Moisture-wicking fabric for all-day comfort.", 85.00, 3, "sweatshirt", "kids", ["#000000", "#FFFFFF"], ["8", "10", "12"], "https://images.unsplash.com/photo-1519233073524-d8a057a5a1bb?auto=format&fit=crop&w=800&q=80"],

    // Unisex / More
    [null, "Universal Oversized Tee", "universal-tee", "A truly unisex fit for everyone.", 100.00, 1, "tshirt", "unisex", ["#000000", "#FFFFFF"], ["S", "M", "L", "XL"], "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
    [null, "Infinity Loop Hoodie", "infinity-hoodie", "Seamless construction for a sleek look.", 260.00, 1, "hoodie", "unisex", ["#1A1A1A", "#FFFFFF"], ["M", "L"], "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80"],
    [null, "Future Classic Sweatshirt", "future-classic-sweat", "Timeless design with modern fabric tech.", 190.00, 1, "sweatshirt", "unisex", ["#000000", "#E2E8F0"], ["S", "M", "L"], "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80"]
  ];

  for (const p of products) {
    insertProd.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], JSON.stringify(p[8]), JSON.stringify(p[9]), p[10]);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  app.post("/api/printify/sync/:shopId", async (req, res) => {
    try {
      const { data: products } = await printifyFetch(`/shops/${req.params.shopId}/products.json`);
      
      const insertProd = db.prepare(`
        INSERT INTO products (printify_id, name, slug, description, price, category_id, type, gender, colors, sizes, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(printify_id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          price = excluded.price,
          image_url = excluded.image_url
      `);

      for (const p of products) {
        // Only sync products that are visible or have images
        if (!p.images || p.images.length === 0) continue;

        // Simple mapping for demo purposes
        const slug = p.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") + "-" + p.id.slice(-4);
        const price = p.variants[0]?.price / 100 || 0; // Printify prices are in cents
        const imageUrl = p.images[0]?.src || "";
        
        // Default values for category, type, gender (can be refined based on tags)
        const type = p.tags.includes("T-Shirt") ? "tshirt" : (p.tags.includes("Hoodie") ? "hoodie" : "sweatshirt");
        const gender = p.tags.includes("Women") ? "women" : (p.tags.includes("Kids") ? "kids" : "men");
        const categoryId = gender === "men" ? 1 : (gender === "women" ? 2 : 3);
        
        // Extract unique colors and sizes from variants
        const colorSet = new Set<string>();
        const sizeSet = new Set<string>();
        
        p.variants.forEach((v: any) => {
          if (v.options) {
            // Printify options are usually [color_id, size_id]
            // We'd need to map these to actual names if we had the blueprint, 
            // but for now let's try to find them in the variant title or options
            // This is a bit tricky without the full Printify catalog mapping
          }
        });

        // Fallback for demo: use standard sizes if none found
        const colors = JSON.stringify(["#000000", "#FFFFFF"]); 
        const sizes = JSON.stringify(["S", "M", "L", "XL"]);

        insertProd.run(p.id, p.title, slug, p.description, price, categoryId, type, gender, colors, sizes, imageUrl);
      }

      res.json({ message: "Sync complete", count: products.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/clear-products", (req, res) => {
    try {
      db.prepare("DELETE FROM products").run();
      res.json({ message: "All products cleared" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", (req, res) => {
    const { category, type, gender } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category) {
      query += " AND category_id = (SELECT id FROM categories WHERE slug = ?)";
      params.push(category);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (gender) {
      query += " AND gender = ?";
      params.push(gender);
    }

    const products = db.prepare(query).all(...params);
    res.json(products.map((p: any) => ({
      ...p,
      colors: JSON.parse(p.colors),
      sizes: JSON.parse(p.sizes)
    })));
  });

  app.get("/api/products/:slug", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE slug = ?").get(req.params.slug) as any;
    if (product) {
      res.json({
        ...product,
        colors: JSON.parse(product.colors),
        sizes: JSON.parse(product.sizes)
      });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
