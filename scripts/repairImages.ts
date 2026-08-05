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

const FALLBACK_IMAGES = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
  fashion: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
  home: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
  gaming: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=800",
  beauty: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800",
  sports: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800",
  food: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800",
  books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
  other: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
};

function getFallbackImage(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("electr") || cat.includes("tech") || cat.includes("audio") || cat.includes("phone") || cat.includes("computer")) {
    return FALLBACK_IMAGES.electronics;
  }
  if (cat.includes("fashion") || cat.includes("apparel") || cat.includes("cloth") || cat.includes("wear") || cat.includes("shoe")) {
    return FALLBACK_IMAGES.fashion;
  }
  if (cat.includes("home") || cat.includes("garden") || cat.includes("furniture") || cat.includes("living") || cat.includes("decor")) {
    return FALLBACK_IMAGES.home;
  }
  if (cat.includes("toy") || cat.includes("game") || cat.includes("gaming") || cat.includes("play")) {
    return FALLBACK_IMAGES.gaming;
  }
  if (cat.includes("health") || cat.includes("beauty") || cat.includes("care") || cat.includes("wellness") || cat.includes("skin")) {
    return FALLBACK_IMAGES.beauty;
  }
  if (cat.includes("food") || cat.includes("grocer") || cat.includes("pantry") || cat.includes("snack")) {
    return FALLBACK_IMAGES.food;
  }
  if (cat.includes("sport") || cat.includes("outdoor") || cat.includes("fit") || cat.includes("gym")) {
    return FALLBACK_IMAGES.sports;
  }
  if (cat.includes("book") || cat.includes("read") || cat.includes("media")) {
    return FALLBACK_IMAGES.books;
  }
  return FALLBACK_IMAGES.other;
}

async function run() {
  const isExecute = process.argv.includes("--execute");

  try {
    console.log("Reading public/products.json...");
    const localProducts = JSON.parse(fs.readFileSync("public/products.json", "utf-8"));
    const localMap = new Map<string, any>();
    localProducts.forEach((p: any) => {
      if (p.id) localMap.set(String(p.id).trim().toLowerCase(), p);
      if (p.sku) localMap.set(String(p.sku).trim().toLowerCase(), p);
      if (p.title) localMap.set(String(p.title).trim().toLowerCase(), p);
      if (p.name) localMap.set(String(p.name).trim().toLowerCase(), p);
    });

    console.log("Fetching Firestore products...");
    const snapshot = await getDocs(collection(db, "products"));
    console.log(`Fetched ${snapshot.size} products from Firestore.`);

    const updates: { docId: string; name: string; image: string; images: string[]; source: "catalog" | "category_fallback" }[] = [];
    let alreadyValid = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const docId = doc.id;
      const sku = String(data.sku || "").trim();
      const name = String(data.name || data.title || "").trim();
      const category = data.category || "";

      const hasImage = typeof data.image === "string" && data.image.trim() !== "" && data.image !== "NONE";
      const hasImages = Array.isArray(data.images) && data.images.length > 0 && data.images.some((img: any) => typeof img === "string" && img.trim() !== "" && img !== "NONE");

      if (hasImage || hasImages) {
        alreadyValid++;
        return;
      }

      // Needs repair
      let matched = localMap.get(docId.trim().toLowerCase());
      if (!matched && sku) matched = localMap.get(sku.trim().toLowerCase());
      if (!matched && name) matched = localMap.get(name.trim().toLowerCase());

      let finalImage = "";
      let finalImages: string[] = [];
      let source: "catalog" | "category_fallback" = "catalog";

      if (matched) {
        const localHasImage = typeof matched.image === "string" && matched.image.trim() !== "" && matched.image !== "NONE";
        const localHasImages = Array.isArray(matched.images) && matched.images.length > 0 && matched.images.some((img: any) => typeof img === "string" && img.trim() !== "" && img !== "NONE");

        if (localHasImage) {
          finalImage = matched.image;
        }
        if (localHasImages) {
          finalImages = matched.images;
        } else if (localHasImage) {
          finalImages = [matched.image];
        }
      }

      // Fallback if still empty
      if (finalImage === "" || finalImages.length === 0) {
        const fallback = getFallbackImage(category);
        finalImage = fallback;
        finalImages = [fallback];
        source = "category_fallback";
      }

      updates.push({
        docId,
        name,
        image: finalImage,
        images: finalImages,
        source,
      });
    });

    console.log("\n========== DRY-RUN REPORT ==========");
    console.log(`Total Products in Firestore: ${snapshot.size}`);
    console.log(`Already Valid Products: ${alreadyValid}`);
    console.log(`Products to Repair: ${updates.length}`);
    
    const catalogSourceCount = updates.filter(u => u.source === "catalog").length;
    const fallbackSourceCount = updates.filter(u => u.source === "category_fallback").length;
    console.log(`  - Restored from source catalog: ${catalogSourceCount}`);
    console.log(`  - Repopulated with category fallback: ${fallbackSourceCount}`);

    if (updates.length > 0) {
      console.log("\nSample Updates (First 10 items):");
      updates.slice(0, 10).forEach((upd, i) => {
        console.log(`${i + 1}. [${upd.docId}] "${upd.name}"`);
        console.log(`   - Source: ${upd.source}`);
        console.log(`   - Image:  "${upd.image}"`);
        console.log(`   - Images:`, upd.images);
      });
    }

    if (!isExecute) {
      console.log("\n[DRY RUN] No changes were written. Run with '--execute' to perform the updates.");
      process.exit(0);
    }

    if (updates.length === 0) {
      console.log("\n[INFO] All product images are already up to date. No updates needed.");
      process.exit(0);
    }

    console.log(`\n[EXECUTION] Beginning batch updates for ${updates.length} products...`);
    const BATCH_SIZE = 450;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = updates.slice(i, i + BATCH_SIZE);
      
      chunk.forEach(upd => {
        const docRef = doc(db, "products", upd.docId);
        batch.update(docRef, {
          image: upd.image,
          images: upd.images,
        });
      });

      console.log(`  -> Committing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)} (${chunk.length} items)...`);
      await batch.commit();
    }

    console.log("\n[SUCCESS] Image repair completed successfully!");
  } catch (err: any) {
    console.error("\n[ERROR] Repair failed:", err.message);
  }
  process.exit(0);
}

run();
