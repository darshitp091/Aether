-- Enable RLs (Row Level Security) and other extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products (Master Table)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  printify_id TEXT UNIQUE, -- The link to Printify Product ID
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  type TEXT CHECK (type IN ('tshirt', 'hoodie', 'sweatshirt', 'other')),
  gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden')),
  base_price DECIMAL(10, 2), -- Original price from Printify
  markup_price DECIMAL(10, 2), -- The price shown to customers
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Flexible storage for extra Printify data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Product Variants (Specific SKU level data)
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  printify_variant_id TEXT UNIQUE,
  color TEXT,
  size TEXT,
  hex_code TEXT, -- For UI color swatches
  price DECIMAL(10, 2),
  sku TEXT,
  image_url TEXT, -- Variant specific image if available
  is_enabled BOOLEAN DEFAULT true,
  inventory_count INTEGER DEFAULT -1, -- -1 for infinite (print on demand)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Users (Extended Profile)
-- Note: Supabase manages the 'auth.users' table. This 'public.users' table is for profile data.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Addresses (Multiple addresses per user)
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  is_default BOOLEAN DEFAULT false,
  full_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country_code TEXT NOT NULL, -- ISO 2-letter code (e.g., US, IN)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Wishlist (Many-to-Many)
CREATE TABLE IF NOT EXISTS wishlist (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Orders (The Transaction Header)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  
  -- External Integation IDs
  printify_order_id TEXT, -- ID from Printify after fulfillment is triggered
  razorpay_order_id TEXT, -- ID from Razorpay for tracking order
  razorpay_payment_id TEXT, -- ID from Razorpay for tracking payment
  razorpay_signature TEXT,
  
  -- Snapshot of address at time of order
  shipping_address JSONB NOT NULL,
  
  tracking_number TEXT,
  tracking_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Order Items (The Transaction Details)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  printify_variant_id TEXT, -- Redundant but safe for direct fulfillment
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- 9. Automated Webhook Logs (For Debugging & Reliability)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL, -- 'stripe' or 'printify'
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Brand Content (For UI flexibility)
CREATE TABLE IF NOT EXISTS brand_content (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL, -- e.g. 'hero_video', 'manifesto_text', 'home_banner'
  value TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image_url', 'video_url', 'json')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Configuration
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Variants" ON product_variants FOR SELECT USING (true);

-- User specific access
CREATE POLICY "User Read Own Profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User Update Own Profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "User Manage Own Addresses" ON addresses USING (auth.uid() = user_id);
CREATE POLICY "User Manage Own Wishlist" ON wishlist USING (auth.uid() = user_id);
CREATE POLICY "User View Own Orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User View Own Order Items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
