import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { query, getClient } from '../src/lib/db.js';

async function importExcel() {
  const filePath = path.resolve('DreamShelf_Master_Catalog_CLEANED.xlsx');
  console.log(`Reading products from ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  // Convert to array of objects. First row is header.
  const rawData: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log(`Parsed ${rawData.length} rows from Excel.`);
  console.log('Connecting to database...');
  
  const dbClient = await getClient();

  // Optionally truncate first if we want a fresh start, 
  // but let's just do upsert to be safe, or we can TRUNCATE if requested.
  // The plan said "truncate existing products table and insert data".
  // Wait, if I truncate `products`, `order_items` referencing it might fail if there's a foreign key?
  // Let's just truncate with CASCADE, or delete all.
  console.log('Truncating existing products...');
  await dbClient.query('TRUNCATE TABLE products CASCADE');

  console.log(`Seeding ${rawData.length} products to Postgres in chunks...`);
  
  const CHUNK_SIZE = 100;
  try {
    for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
      await dbClient.query('BEGIN');
      const chunk = rawData.slice(i, i + CHUNK_SIZE);
      
      const promises = chunk.map((row) => {
        const id = row.ProductID ? String(row.ProductID) : `DS${Math.random().toString().slice(2,8)}`;
        const name = row.Title || 'Unnamed Product';
        const brand = row.Brand || '';
        const description = row.Description || '';
        const price = Number(row.Price) || 0;
        const originalPrice = row.OriginalPrice ? Number(row.OriginalPrice) : null;
        const discountPercent = row.DiscountPercent ? Number(row.DiscountPercent) : 0;
        const stock = Number(row.Stock) || 0;
        const category = row.MainCategory || '';
        const subcategory = row.SubCategory || '';
        const sku = row.SKU || id;
        
        // Build images array
        const images = [];
        if (row.Image1) images.push(row.Image1);
        if (row.Image2) images.push(row.Image2);
        if (row.Image3) images.push(row.Image3);
        if (row.Image4) images.push(row.Image4);
        if (row.Image5) images.push(row.Image5);

        // Colors and Sizes
        const colors = row.Color ? row.Color.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
        const sizes = row.Size ? row.Size.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        const tags = row.Tags ? row.Tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
        
        const rating = Number(row.Rating) || 0;
        const reviewCount = Number(row.ReviewCount) || 0;
        const isFeatured = !!row.Featured;
        const isFlashDeal = false; // not in excel explicitly
        const isNew = !!row.NewArrival;
        const isActive = true;
        
        const specs: Record<string, string> = {};
        if (row.Material) specs.Material = row.Material;
        if (row.Gender) specs.Gender = row.Gender;
        if (row.AgeGroup) specs.AgeGroup = row.AgeGroup;

        const productStory = row.SearchKeywords || null; // put keywords in story for now

        const sql = `
          INSERT INTO products (
            id, name, brand, description, price, original_price, discount_percent, stock, category, subcategory, sku, images, colors, sizes, specs, tags, rating, review_count, is_featured, is_flash_deal, is_new, is_active, product_story
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
          ) ON CONFLICT (id) DO NOTHING
        `;
        
        const params = [
          id, name, brand, description, price, originalPrice, discountPercent, stock, category, subcategory, sku,
          JSON.stringify(images), JSON.stringify(colors), JSON.stringify(sizes), JSON.stringify(specs), JSON.stringify(tags),
          rating, reviewCount, isFeatured, isFlashDeal, isNew, isActive, productStory
        ];

        return dbClient.query(sql, params);
      });
      await Promise.all(promises);
      
      await dbClient.query('COMMIT');
      console.log(`Committed chunk ending at index ${Math.min(i + CHUNK_SIZE, rawData.length)}`);
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

importExcel().catch(console.error);
