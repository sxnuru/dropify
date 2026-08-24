-- ============================================================================
-- DreamShelf — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Run this in the Supabase SQL Editor:
--   Project → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- ─── Enable extensions ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL DEFAULT '',
  brand             TEXT NOT NULL DEFAULT '',
  description       TEXT NOT NULL DEFAULT '',
  price             NUMERIC(10, 2) NOT NULL DEFAULT 0,
  original_price    NUMERIC(10, 2),
  discount_percent  NUMERIC(5, 2) DEFAULT 0,
  stock             INTEGER NOT NULL DEFAULT 0,
  category          TEXT NOT NULL DEFAULT '',
  subcategory       TEXT NOT NULL DEFAULT '',
  sku               TEXT,
  images            JSONB NOT NULL DEFAULT '[]',
  colors            JSONB NOT NULL DEFAULT '[]',
  sizes             JSONB NOT NULL DEFAULT '[]',
  specs             JSONB NOT NULL DEFAULT '{}',
  tags              JSONB NOT NULL DEFAULT '[]',
  features          JSONB,
  rating            NUMERIC(3, 1) DEFAULT 0,
  review_count      INTEGER DEFAULT 0,
  reviews           JSONB NOT NULL DEFAULT '[]',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_flash_deal     BOOLEAN NOT NULL DEFAULT false,
  is_new            BOOLEAN NOT NULL DEFAULT false,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  product_story     TEXT,
  estimated_delivery TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_category      ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand         ON products (brand);
CREATE INDEX IF NOT EXISTS idx_products_is_featured   ON products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_flash_deal ON products (is_flash_deal) WHERE is_flash_deal = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new        ON products (is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON products (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_price         ON products (price);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ORDERS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id      TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  subtotal         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_cost    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax              NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method   TEXT NOT NULL DEFAULT 'Cash on Delivery',
  payment_status   TEXT NOT NULL DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
  order_status     TEXT NOT NULL DEFAULT 'confirmed'
                   CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  fulfillment_status TEXT NOT NULL DEFAULT 'Pending'
                   CHECK (fulfillment_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id      ON orders (tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email   ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_status     ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at       ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status   ON orders (payment_status);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     TEXT NOT NULL,
  product_name   TEXT NOT NULL,   -- snapshot at order time
  sku            TEXT,             -- snapshot at order time
  selected_color TEXT,
  selected_size  TEXT,
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price     NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- server-calculated
  total_price    NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- unit_price * quantity
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id  ON order_items (product_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

-- Products: public read, service-role write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of active products" ON products;
CREATE POLICY "Allow public read of active products"
  ON products FOR SELECT
  USING (true);

-- Orders: no public access — all access goes through server API with service role
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to orders" ON orders;
CREATE POLICY "Service role full access to orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- Order items: no public access
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to order_items" ON order_items;
CREATE POLICY "Service role full access to order_items"
  ON order_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- ─── NOTES ───────────────────────────────────────────────────────────────────
-- Products are populated via the uploadProducts.ts script (XLSX → Supabase).
-- Orders and order_items are created server-side via the service role key only.
-- The public anon key can only read products.
-- tracking_id format: ORD-2026-XXXXXX (generated in server.ts)
