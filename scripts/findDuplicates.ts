import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const snapshot = await getDocs(collection(db, "products"));
  console.log("Total products fetched from Firestore:", snapshot.size);

  const groups = new Map<string, { id: string; sku: string; title: string }[]>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    const sku = (data.sku || "").trim();
    const title = (data.title || data.name || "").trim();

    // Key definition: SKU first, and title if SKU is missing
    let key = "";
    if (sku) {
      key = `sku:${sku.toLowerCase()}`;
    } else {
      key = `title:${title.toLowerCase()}`;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push({ id, sku, title });
  });

  console.log("\nDuplicate Products Found:");
  console.log("=========================================");

  let duplicateCount = 0;
  groups.forEach((items, key) => {
    if (items.length > 1) {
      duplicateCount++;
      const first = items[0];
      console.log(`\nDuplicate #${duplicateCount}:`);
      console.log(`  Key: ${key}`);
      console.log(`  SKU: "${first.sku || 'N/A'}"`);
      console.log(`  Title: "${first.title}"`);
      console.log(`  Duplicate Count: ${items.length}`);
      console.log(`  Firestore Document IDs:`);
      items.forEach(item => {
        console.log(`    - ${item.id}`);
      });
    }
  });

  console.log("\n=========================================");
  console.log("Total unique duplicate sets:", duplicateCount);
}

run().catch(console.error);
