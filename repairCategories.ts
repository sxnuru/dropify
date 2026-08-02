import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch } from "firebase/firestore";
import * as fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyBxb55UM4ITO8bmlRnYgLZ-poO8YMoGVV0",
  authDomain: "dreamshelf-1b319.firebaseapp.com",
  projectId: "dreamshelf-1b319",
  storageBucket: "dreamshelf-1b319.firebasestorage.app",
  messagingSenderId: "1065928573899",
  appId: "1:1065928573899:web:30410eae569c7f8cc0ec4e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const isExecute = process.argv.includes("--execute");

  try {
    console.log("Reading public/products.json...");
    const localProducts = JSON.parse(fs.readFileSync("public/products.json", "utf-8"));
    const localMap = new Map<string, any>();
    
    localProducts.forEach((p: any) => {
      if (p.sku) {
        localMap.set(p.sku.toLowerCase(), p);
      }
      if (p.id) {
        localMap.set(p.id.toLowerCase(), p);
      }
    });

    console.log("Fetching Firestore products...");
    const snapshot = await getDocs(collection(db, "products"));
    
    let matchedCount = 0;
    const updates: { docId: string; category: string; subcategory: string; name: string }[] = [];
    const samples: { name: string; beforeCat: string; afterCat: string; beforeSub: string; afterSub: string }[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const sku = data.sku || doc.id;
      const matched = localMap.get(sku.toLowerCase());

      if (matched) {
        matchedCount++;
        const targetCategory = matched.category || "Uncategorized";
        const targetSubcategory = matched.subcategory || "";

        // Check if category or subcategory has changed (e.g. from "" to correct value)
        if (data.category !== targetCategory || data.subcategory !== targetSubcategory) {
          updates.push({
            docId: doc.id,
            category: targetCategory,
            subcategory: targetSubcategory,
            name: data.name || data.title || "Untitled",
          });

          if (samples.length < 10) {
            samples.push({
              name: data.name || data.title || "Untitled",
              beforeCat: data.category !== undefined ? `"${data.category}"` : "undefined",
              afterCat: `"${targetCategory}"`,
              beforeSub: data.subcategory !== undefined ? `"${data.subcategory}"` : "undefined",
              afterSub: `"${targetSubcategory}"`,
            });
          }
        }
      }
    });

    console.log("\n========== DRY-RUN REPORT ==========");
    console.log(`Total Products Fetched from Firestore: ${snapshot.size}`);
    console.log(`Total Products Matched in Source File: ${matchedCount}`);
    console.log(`Total Products to Update: ${updates.length}`);
    
    console.log("\nSample Before/After Updates (10 Products):");
    samples.forEach((sample, i) => {
      console.log(`${i + 1}. "${sample.name}"`);
      console.log(`   - category:    ${sample.beforeCat} => ${sample.afterCat}`);
      console.log(`   - subcategory: ${sample.beforeSub} => ${sample.afterSub}`);
    });

    if (!isExecute) {
      console.log("\n[DRY RUN] No changes were written. Run with '--execute' to perform the updates.");
      process.exit(0);
    }

    if (updates.length === 0) {
      console.log("\n[INFO] All categories and subcategories are already up to date. No updates needed.");
      process.exit(0);
    }

    console.log(`\n[EXECUTION] Beginning batch updates for ${updates.length} products...`);
    
    // Batch size of 500 is the limit for Firestore writeBatch
    const BATCH_SIZE = 450;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = updates.slice(i, i + BATCH_SIZE);
      
      chunk.forEach(upd => {
        const docRef = doc(db, "products", upd.docId);
        batch.update(docRef, {
          category: upd.category,
          subcategory: upd.subcategory
        });
      });

      console.log(`  -> Committing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)} (${chunk.length} items)...`);
      await batch.commit();
    }

    console.log("\n[SUCCESS] Category repair completed successfully!");
  } catch (err: any) {
    console.error("\n[ERROR] Repair failed:", err.message);
  }
  process.exit(0);
}

run();
