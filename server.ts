/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { query, getClient } from './src/lib/db.js';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from './src/lib/email.js';


const app = express();
const PORT = 3000;

app.use(express.json());

// ─── Gemini AI ───────────────────────────────────────────────────────────────

let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    console.log('Gemini AI Client successfully initialized.');
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI:', error);
  }
} else {
  console.warn('GEMINI_API_KEY missing or placeholder. Running in mock AI mode.');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generates a unique, human-readable order tracking ID: ORD-2026-X7K92P */
function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ORD-${year}-${suffix}`;
}

/** Ensure the tracking_id is truly unique in the DB. */
async function generateUniqueTrackingId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateTrackingId();
    const { rows } = await query('SELECT tracking_id FROM orders WHERE tracking_id = $1', [id]);
    if (rows.length === 0) return id; // not in DB → unique
  }
  // Extremely unlikely fallback — append timestamp
  return `ORD-${Date.now()}`;
}

function normalizeProductOut(row: any) {
  return {
    ...row,
    id: row.id,
    name: row.name || '',
    images: Array.isArray(row.images) ? row.images : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    specs: row.specs && typeof row.specs === 'object' ? row.specs : {},
    tags: Array.isArray(row.tags) ? row.tags : [],
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    isFeatured: !!row.is_featured,
    isFlashDeal: !!row.is_flash_deal,
    isNew: !!row.is_new,
    isActive: row.is_active !== false,
    originalPrice: row.original_price,
    discountPercent: row.discount_percent,
    reviewCount: row.review_count,
    productStory: row.product_story,
    estimatedDelivery: row.estimated_delivery,
  };
}

// ─── PRODUCT ROUTES ───────────────────────────────────────────────────────────

/** GET /api/products — list products with optional filters */
app.get('/api/products', async (req, res) => {
  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    const { category, featured, flash_deal, new: isNew, limit, active } = req.query;

    if (category && category !== 'All') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (featured === 'true') {
      sql += ` AND is_featured = true`;
    }
    if (flash_deal === 'true') {
      sql += ` AND is_flash_deal = true`;
    }
    if (isNew === 'true') {
      sql += ` AND is_new = true`;
    }
    // Only show active products to public (admin can override)
    if (active !== 'all') {
      sql += ` AND is_active = true`;
    }

    sql += ' ORDER BY created_at DESC';

    let finalLimit = 100;
    if (limit) {
      finalLimit = parseInt(limit as string, 10);
    }
    sql += ` LIMIT $${paramIndex++}`;
    params.push(finalLimit);

    const { rows } = await query(sql, params);
    const products = rows.map(normalizeProductOut);
    return res.json({ products });
  } catch (err: any) {
    console.error('[/api/products] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** GET /api/products/count — get total count of products */
app.get('/api/products/count', async (req, res) => {
  try {
    let sql = 'SELECT COUNT(*) FROM products WHERE is_active = true';
    const params: any[] = [];
    const { category } = req.query;

    if (category && category !== 'All') {
      sql += ' AND category = $1';
      params.push(category);
    }

    const { rows } = await query(sql, params);
    return res.json({ count: parseInt(rows[0].count, 10) });
  } catch (err: any) {
    console.error('[/api/products/count] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** GET /api/products/:id — single product by ID */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json(normalizeProductOut(rows[0]));
  } catch (err: any) {
    console.error('[/api/products/:id] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** POST /api/products — create product (admin) */
app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    if (!p.id || !p.name || !p.price) {
      return res.status(400).json({ error: 'id, name, and price are required.' });
    }

    const sql = `
      INSERT INTO products (
        id, name, brand, description, price, original_price, discount_percent, stock, category, subcategory, sku, images, colors, sizes, specs, tags, reviews, rating, review_count, is_featured, is_flash_deal, is_new, is_active, product_story
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        brand = EXCLUDED.brand,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        original_price = EXCLUDED.original_price,
        discount_percent = EXCLUDED.discount_percent,
        stock = EXCLUDED.stock,
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        sku = EXCLUDED.sku,
        images = EXCLUDED.images,
        colors = EXCLUDED.colors,
        sizes = EXCLUDED.sizes,
        specs = EXCLUDED.specs,
        tags = EXCLUDED.tags,
        reviews = EXCLUDED.reviews,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        is_featured = EXCLUDED.is_featured,
        is_flash_deal = EXCLUDED.is_flash_deal,
        is_new = EXCLUDED.is_new,
        is_active = EXCLUDED.is_active,
        product_story = EXCLUDED.product_story
    `;
    
    const params = [
      p.id, p.name, p.brand || '', p.description || '', Number(p.price), p.originalPrice ? Number(p.originalPrice) : null,
      p.discountPercent ? Number(p.discountPercent) : 0, Number(p.stock) || 0, p.category || '', p.subcategory || '', p.id,
      JSON.stringify(p.images || []), JSON.stringify(p.colors || []), JSON.stringify(p.sizes || []), JSON.stringify(p.specs || {}), JSON.stringify(p.tags || []), JSON.stringify(p.reviews || []),
      Number(p.rating) || 0, Number(p.reviewCount) || 0, !!p.isFeatured, !!p.isFlashDeal, !!p.isNew, p.isActive !== false, p.productStory || null
    ];

    await query(sql, params);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[POST /api/products] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** PUT /api/products/:id — update product (admin) */
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;

    const sql = `
      UPDATE products SET
        name = $1, brand = $2, description = $3, price = $4, original_price = $5, discount_percent = $6, stock = $7,
        category = $8, subcategory = $9, images = $10, colors = $11, sizes = $12, specs = $13, tags = $14,
        is_featured = $15, is_flash_deal = $16, is_new = $17, is_active = $18, product_story = $19
      WHERE id = $20
    `;
    
    const params = [
      p.name, p.brand || '', p.description || '', Number(p.price), p.originalPrice ? Number(p.originalPrice) : null,
      p.discountPercent ? Number(p.discountPercent) : 0, Number(p.stock) || 0, p.category || '', p.subcategory || '',
      JSON.stringify(p.images || []), JSON.stringify(p.colors || []), JSON.stringify(p.sizes || []), JSON.stringify(p.specs || {}), JSON.stringify(p.tags || []),
      !!p.isFeatured, !!p.isFlashDeal, !!p.isNew, p.isActive !== false, p.productStory || null, id
    ];

    await query(sql, params);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[PUT /api/products/:id] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** DELETE /api/products/:id — deactivate product (admin) */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Soft-delete: set is_active = false
    await query('UPDATE products SET is_active = false WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/products/:id] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** PATCH /api/admin/products/:id/stock — update stock (admin) */
app.patch('/api/admin/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Valid stock value required.' });
    }
    await query('UPDATE products SET stock = $1 WHERE id = $2', [Number(stock), id]);
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[PATCH /api/admin/products/:id/stock] unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── ORDER ROUTES ─────────────────────────────────────────────────────────────

/**
 * POST /api/orders — place an order
 */
app.post('/api/orders', async (req, res) => {
  const dbClient = await getClient();
  try {
    await dbClient.query('BEGIN');
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      payment_method,
      shipping_speed,
      promo_discount_percent = 0,
    } = req.body;

    // 1. Validate required fields
    if (!customer_name?.trim()) throw new Error('Customer name is required.');
    if (!customer_email?.trim()) throw new Error('Email address is required.');
    if (!shipping_address?.street?.trim()) throw new Error('Shipping street is required.');
    if (!shipping_address?.city?.trim()) throw new Error('Shipping city is required.');
    if (!items || !Array.isArray(items) || items.length === 0) throw new Error('Cart is empty.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) throw new Error('Invalid email address.');

    // 3. Fetch product prices (with FOR UPDATE to lock rows safely)
    const productIds = [...new Set(items.map((i: any) => i.product_id))];
    const { rows: productRows } = await dbClient.query(`
      SELECT id, name, price, stock, sku, is_active, images 
      FROM products 
      WHERE id = ANY($1) FOR UPDATE
    `, [productIds]);

    const productMap = new Map(productRows.map((p: any) => [p.id, p]));

    // 4. Validate items
    const orderItemsPayload: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error(`Product not found: ${item.product_id}`);
      if (!product.is_active) throw new Error(`Product is no longer available: ${product.name}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);

      const unitPrice = Number(product.price);
      const totalPrice = Number((unitPrice * item.quantity).toFixed(2));
      subtotal += totalPrice;

      orderItemsPayload.push({
        product_id: item.product_id,
        product_name: product.name,
        sku: product.sku || item.product_id,
        selected_color: item.selected_color || '',
        selected_size: item.selected_size || '',
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (typeof product.images === 'string' ? JSON.parse(product.images)[0] : '')
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // 5. Pricing calculations
    const discount = Number((subtotal * (Math.max(0, Math.min(100, promo_discount_percent)) / 100)).toFixed(2));
    const taxableAmount = subtotal - discount;
    const tax = Number((taxableAmount * 0.20).toFixed(2)); // 20% UK VAT
    const baseShipping = subtotal > 100 ? 0 : 4.99;
    const shippingCost = Number((
      shipping_speed === 'express' ? baseShipping + 2.50 :
      shipping_speed === 'overnight' ? baseShipping + 5.00 :
      baseShipping
    ).toFixed(2));
    const total = Number((taxableAmount + tax + shippingCost).toFixed(2));

    // 6. Generate unique tracking ID
    let trackingId = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      trackingId = generateTrackingId();
      const { rows } = await dbClient.query('SELECT tracking_id FROM orders WHERE tracking_id = $1', [trackingId]);
      if (rows.length === 0) break;
    }

    const paymentMethodLabel =
      payment_method === 'card' ? 'Credit / Debit Card' :
      payment_method === 'biometric' ? 'Instant Biometric Secured Token Pay' :
      'Cash on Delivery (COD)';

    const paymentStatus = payment_method === 'cod' ? 'pending' : 'paid';

    // 8. Insert order row
    const addressJson = JSON.stringify({
      fullName: shipping_address.fullName || customer_name,
      street: shipping_address.street,
      area: shipping_address.area || '',
      city: shipping_address.city,
      state: shipping_address.state || '',
      zipCode: shipping_address.zipCode || '',
      country: shipping_address.country || 'United Kingdom',
      phone: customer_phone || '',
    });

    const { rows: orderInserted } = await dbClient.query(`
      INSERT INTO orders (
        tracking_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_cost, tax, discount, total, payment_method, payment_status, order_status, fulfillment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'confirmed', 'Pending')
      RETURNING *
    `, [trackingId, customer_name.trim(), customer_email.trim().toLowerCase(), customer_phone?.trim() || null, addressJson, subtotal, shippingCost, tax, discount, total, paymentMethodLabel, paymentStatus]);

    const orderRow = orderInserted[0];

    // 9. Insert order items
    for (const item of orderItemsPayload) {
      await dbClient.query(`
        INSERT INTO order_items (order_id, product_id, product_name, sku, selected_color, selected_size, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [orderRow.id, item.product_id, item.product_name, item.sku, item.selected_color, item.selected_size, item.quantity, item.unit_price, item.total_price]);
    }

    // 10. Decrement stock for each product
    for (const item of orderItemsPayload) {
      await dbClient.query(`UPDATE products SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.product_id]);
    }

    await dbClient.query('COMMIT');
    
    // 11. Send confirmation emails
    const emailData = {
      tracking_id: trackingId,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone || '',
      shipping_address: JSON.parse(addressJson),
      items: orderItemsPayload,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      discount,
      total,
      payment_method: paymentMethodLabel,
      payment_status: paymentStatus,
      order_status: 'confirmed',
      created_at: orderRow.created_at,
    };

    Promise.allSettled([
      sendOrderConfirmationEmail(emailData),
      sendAdminNotificationEmail(emailData),
    ]).then(emailResults => {
      emailResults.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`[POST /api/orders] Email failed for ${trackingId}:`, result.reason);
        }
      });
    });

    return res.json({
      success: true,
      order_id: orderRow.id,
      tracking_id: trackingId,
      total,
      subtotal,
      tax,
      shipping_cost: shippingCost,
      discount,
      payment_status: paymentStatus,
      order_status: 'confirmed',
      created_at: orderRow.created_at,
    });
  } catch (err: any) {
    await dbClient.query('ROLLBACK');
    console.error('[POST /api/orders] Unexpected error:', err);
    return res.status(err.message.includes('required') || err.message.includes('stock') ? 400 : 500).json({ error: err.message || 'An unexpected error occurred. Please try again.' });
  } finally {
    dbClient.release();
  }
});

/** GET /api/orders/track/:trackingId — public order lookup by tracking ID */
app.get('/api/orders/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    if (!trackingId || trackingId.length < 5) {
      return res.status(400).json({ error: 'Invalid tracking ID.' });
    }

    const { rows: orderRows } = await query(`
      SELECT id, tracking_id, customer_name, shipping_address, subtotal, shipping_cost, tax, discount, total, payment_method, payment_status, order_status, fulfillment_status, created_at, updated_at
      FROM orders WHERE tracking_id = $1
    `, [trackingId.toUpperCase()]);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'No order found with that tracking ID. Please check and try again.' });
    }
    const order = orderRows[0];

    // Fetch order items
    const { rows: items } = await query(`
      SELECT product_name, selected_color, selected_size, quantity, unit_price, total_price
      FROM order_items WHERE order_id = $1
    `, [order.id]);

    return res.json({
      ...order,
      items: items || [],
    });
  } catch (err: any) {
    console.error('[GET /api/orders/track] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** GET /api/admin/orders — all orders for admin */
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { rows: orders } = await query('SELECT * FROM orders ORDER BY created_at DESC');

    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order: any) => {
        const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        return { ...order, order_items: items || [] };
      })
    );

    return res.json({ orders: ordersWithItems });
  } catch (err: any) {
    console.error('[GET /api/admin/orders] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/** PATCH /api/admin/orders/:id — update order status (admin) */
app.patch('/api/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status, fulfillment_status } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (order_status) {
      updates.push(`order_status = $${idx++}`);
      params.push(order_status);
    }
    if (payment_status) {
      updates.push(`payment_status = $${idx++}`);
      params.push(payment_status);
    }
    if (fulfillment_status) {
      updates.push(`fulfillment_status = $${idx++}`);
      params.push(fulfillment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No update fields provided.' });
    }

    params.push(id);
    await query(`UPDATE orders SET ${updates.join(', ')} WHERE id = $${idx}`, params);

    return res.json({ success: true });
  } catch (err: any) {
    console.error('[PATCH /api/admin/orders/:id] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── AI ROUTES (existing, updated to use Postgres products) ──────────────────

app.post('/api/chat', async (req, res) => {
  const { messages, userPreferences } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid or missing messages array.' });
  }

  let catalogContext = 'Product catalog unavailable.';
  try {
    const { rows: products } = await query(`
      SELECT id, name, price, original_price, category, subcategory, brand, colors, sizes, rating, stock, specs, product_story
      FROM products WHERE is_active = true LIMIT 50
    `);

    if (products && products.length > 0) {
      catalogContext = products
        .map((p: any) => `ID: ${p.id}, Name: ${p.name}, Price: £${p.price}, Category: ${p.category}, Brand: ${p.brand}, Rating: ${p.rating}, Stock: ${p.stock}`)
        .join('n---n');
    }
  } catch (e) {
    console.warn('[/api/chat] Could not load products for catalog context.');
  }

  const systemInstruction = `You are the DreamShelf AI Smart Personal Shopper and Virtual Stylist.
DreamShelf is a progressive, luxury, highly curated online marketplace selling elite apparel, next-gen devices, brutalist home decor, high-performance gym gear, self-care skincare, and lifestyle items.
Your purpose is to welcome clients, help them coordinate visual outfits, answer deep technical specs, and suggest matching companion pieces with sophistication.

Here is the live DreamShelf product catalog:
${catalogContext}

Instructions:
1. Always suggest products from our live catalog above. Recommend specific items by ID and price.
2. IMPORTANT: When mentioning a product, use: [Product Name](href:product:ID) format so the frontend can render clickable cards.
3. Maintain an elegant, warm, friendly, minimalist, yet luxury voice. Speak like a senior personal shopper in a Milan boutique.
4. Keep answers brief, visual, and highly styled in markdown. Avoid long-winded paragraphs.
5. FAQ context: returns accepted within 14 days; coupon DREAM20 (20% off); shipping 2-5 days; free shipping above £100.

Current User Preferences: ${JSON.stringify(userPreferences || {})}`;

  if (!ai) {
    const lastMessage = messages[messages.length - 1]?.text || '';
    let responseText = `Welcome to DreamShelf. I am currently running in Offline Concierge Mode.nnFeel free to use the coupon code **DREAM20** for a 20% saving on your first checkout!`;
    if (lastMessage.toLowerCase().includes('skin') || lastMessage.toLowerCase().includes('beauty')) {
      responseText = `Our skincare philosophy focuses on barrier health. Browse our Health & Personal Care collection for premium self-care essentials.`;
    }
    return res.json({ text: responseText, source: 'offline_concierge' });
  }

  try {
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));
    const lastMessageText = messages[messages.length - 1].text;
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction, temperature: 0.75 },
      history,
    });
    const result = await chat.sendMessage({ message: lastMessageText });
    return res.json({ text: result.text || 'I was unable to formulate a response.', source: 'gemini' });
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    res.status(500).json({ error: 'AI engine encountered an issue.', message: error.message });
  }
});

app.post('/api/recommend', async (req, res) => {
  const { mood, budget } = req.body;

  let products: any[] = [];
  try {
    const { rows } = await query(`
      SELECT id, name, price, category, brand, images, rating, description
      FROM products WHERE is_active = true LIMIT 30
    `);
    products = rows || [];
  } catch (e) {
    console.warn('[/api/recommend] Could not load products.');
  }

  if (!ai) {
    const filtered = products.filter(p => !budget || p.price <= budget);
    return res.json({
      recommendations: filtered.slice(0, 3),
      reasoning: 'These selections represent our premium items that fit within your specified criteria.',
      source: 'offline_concierge',
    });
  }

  try {
    const prompt = `Based on the client's mood of "${mood || 'Minimalist Luxury'}" and max budget of ${budget ? '£' + budget : 'unlimited'}, recommend 2 products from this catalog and return JSON with {"productIds": [...], "reasoning": "..."}.
Catalog: ${products.map(p => `${p.id}: ${p.name} (£${p.price})`).join('n')}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT' as any,
          properties: {
            productIds: { type: 'ARRAY' as any, items: { type: 'STRING' as any } },
            reasoning: { type: 'STRING' as any },
          },
          required: ['productIds', 'reasoning'],
        },
      },
    });

    const parsed = JSON.parse(result.text || '{}');
    const recommended = products.filter(p => parsed.productIds?.includes(p.id));

    res.json({
      recommendations: recommended.length > 0 ? recommended : products.slice(0, 2),
      reasoning: parsed.reasoning || 'Selected to bring harmony into your creative workspace.',
      source: 'gemini',
    });
  } catch (error) {
    console.error('Recommendation API failed:', error);
    res.json({
      recommendations: products.slice(0, 2),
      reasoning: 'These exquisite pieces are chosen by our lead stylists to evoke quiet luxury.',
      source: 'offline_concierge',
    });
  }
});

// ─── Vite / Static serving ────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware mounted.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DreamShelf server running on http://localhost:${PORT}`);
  });
}

// Only start the server locally. Vercel will just import 'app' and run it as a serverless function.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer();
}

export default app;
