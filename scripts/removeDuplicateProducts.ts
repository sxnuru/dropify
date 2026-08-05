import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import readline from "readline";

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

interface ProductDoc {
  id: string;
  sku: string;
  title: string;
  createdAt?: string;
}

async function run() {
  const snapshot = await getDocs(collection(db, "products"));
  console.log(`Total products in Firestore: ${snapshot.size}`);

  const groups = new Map<string, ProductDoc[]>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    const sku = (data.sku || "").trim();
    const title = (data.title || data.name || "").trim();
    const createdAt = data.createdAt;

    // Grouping by SKU (fallback to title if SKU is empty)
    let key = "";
    if (sku) {
      key = `sku:${sku.toLowerCase()}`;
    } else {
      key = `title:${title.toLowerCase()}`;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push({ id, sku, title, createdAt });
  });

  const toDelete: ProductDoc[] = [];
  const toKeep: { keep: ProductDoc; duplicates: ProductDoc[] }[] = [];

  groups.forEach((items, key) => {
    if (items.length > 1) {
      // Sort to keep the oldest document:
      // Ascending sort by createdAt timestamp. If missing, fall back to alphabetical ID.
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA && timeB) {
          return timeA - timeB;
        }
        return a.id.localeCompare(b.id);
      });

      const keep = items[0];
      const duplicates = items.slice(1);
      
      toKeep.push({ keep, duplicates });
      toDelete.push(...duplicates);
    }
  });

  if (toDelete.length === 0) {
    console.log("No duplicate products found in the products collection.");
    process.exit(0);
  }

  console.log("\n=================== DUPLICATES TO REMOVE ===================");
  toKeep.forEach(({ keep, duplicates }, i) => {
    console.log(`\nGroup #${i + 1}:`);
    console.log(`  KEEPING: ID="${keep.id}" | SKU="${keep.sku || 'N/A'}" | Title="${keep.title}" | CreatedAt="${keep.createdAt || 'N/A'}"`);
    console.log(`  DELETING:`);
    duplicates.forEach(dup => {
      console.log(`    - ID="${dup.id}" | SKU="${dup.sku || 'N/A'}" | Title="${dup.title}" | CreatedAt="${dup.createdAt || 'N/A'}"`);
    });
  });
  console.log("============================================================");
  console.log(`Total duplicate documents scheduled for deletion: ${toDelete.length}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nAre you sure you want to permanently delete these duplicate documents? Type 'YES' to confirm: ", async (answer) => {
    rl.close();
    if (answer.trim() === "YES") {
      console.log("\nStarting deletion...");
      for (const item of toDelete) {
        try {
          await deleteDoc(doc(db, "products", item.id));
          console.log(`Deleted document ID: ${item.id} (SKU: "${item.sku}", Title: "${item.title}")`);
        } catch (error) {
          console.error(`Failed to delete document ${item.id}:`, error);
        }
      }
      console.log("\nCleanup successfully completed.");
    } else {
      console.log("\nDeletion aborted. No documents were modified.");
    }
    process.exit(0);
  });
}

run().catch(console.error);
