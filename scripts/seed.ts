import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { query, getClient } from '../src/lib/db.js';

async function seed() {
  const filePath = path.resolve('public/products.json');
  console.log(`Reading products from ${filePath}...`);
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`Seeding ${products.length} products to Postgres in chunks...`);
  const dbClient = await getClient();

  const CHUNK_SIZE = 100;
  try {
    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      await dbClient.query('BEGIN');
      const chunk = products.slice(i, i + CHUNK_SIZE);
      
      for (const p of chunk) {
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
          p.id, p.name || 'Unnamed Product', p.brand || '', p.description || '', Number(p.price) || 0, p.originalPrice ? Number(p.originalPrice) : null,
          p.discountPercent ? Number(p.discountPercent) : 0, Number(p.stock) || 0, p.category || '', p.subcategory || '', p.sku || p.id,
          JSON.stringify(p.images || []), JSON.stringify(p.colors || []), JSON.stringify(p.sizes || []), JSON.stringify(p.specs || {}), JSON.stringify(p.tags || []), JSON.stringify(p.reviews || []),
          Number(p.rating) || 0, Number(p.reviews?.length || 0) || 0, !!p.isFeatured, !!p.isFlashDeal, !!p.isNew, p.isActive !== false, p.productStory || null
        ];

        await dbClient.query(sql, params);
      }
      
      await dbClient.query('COMMIT');
      console.log(`Committed chunk ending at index ${Math.min(i + CHUNK_SIZE, products.length)}`);
    }
    
    console.log('Seeding complete.');
  } catch (error: any) {
    await dbClient.query('ROLLBACK');
    console.error('Error during seeding:', error.message);
  } finally {
    dbClient.release();
    process.exit(0);
  }
}

seed().catch(console.error);
