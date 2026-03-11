-- AETHER SUPABASE SCHEMA V2 [STUNNING_STREETWEAR_EDITION]
-- This schema is designed for 500x scale, real-time search, and mission-critical sync reliability.

-- 🚨 CAUTION: This will wipe existing V1 tables for a clean V2 migration.
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. UTILITIES: Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printify_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT, -- e.g., 'hoodie', 'tshirt'
  gender TEXT, -- 'men', 'women', 'kids', 'unisex'
  status TEXT DEFAULT 'published', 
  base_price DECIMAL(12, 2) DEFAULT 0.00,
  markup_price DECIMAL(12, 2) DEFAULT 0.00,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Store tags, original printify payload etc.
  tags TEXT[], -- Array for fast filtering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || coalesce(description, '')));

-- 4. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  printify_variant_id TEXT UNIQUE NOT NULL,
  sku TEXT,
  color TEXT,
  size TEXT,
  hex_code TEXT DEFAULT '#888888',
  price DECIMAL(12, 2) DEFAULT 0.00,
  image_url TEXT,
  is_enabled BOOLEAN DEFAULT true,
  inventory_count INTEGER DEFAULT -1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'shipping',
  is_default BOOLEAN DEFAULT false,
  full_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  shipping_cost DECIMAL(12, 2) DEFAULT 0.00,
  tax_amount DECIMAL(12, 2) DEFAULT 0.00,
  
  -- Tracking & Fulfillment
  printify_order_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  
  shipping_address JSONB NOT NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. LOGS (Webhooks & Internal Sync)
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- 'printify_webhook', 'manual_sync', 'razorpay'
  level TEXT DEFAULT 'info', -- 'info', 'warn', 'error'
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SITE CONFIG & SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SECURITY POLICIES (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Public can read products/categories/settings
CREATE POLICY "Public Read Categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Variants" ON product_variants FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT TO public USING (true);

-- Users can manage their own data
CREATE POLICY "Manage Own Profile" ON users FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Manage Own Addresses" ON addresses FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "View Own Orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "View Own Items" ON order_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Manage Wishlist" ON wishlist FOR ALL TO authenticated USING (auth.uid() = user_id);

-- SEED DATA (Categories)
INSERT INTO categories (name, slug, description) VALUES
('Men', 'men', 'Premium menswear engineered for the future.'),
('Women', 'women', 'Digital-first apparel for the modern woman.'),
('Kids', 'kids', 'Future wear for the next generation.'),
('Unisex', 'unisex', 'Universal silhouettes for everyone.')
ON CONFLICT (slug) DO NOTHING;
