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
  console.log(`Total products in Firestore: ${snapshot.size}`);

  const skus = new Map<string, string[]>();
  const titles = new Map<string, string[]>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const id = doc.id;
    const sku = (data.sku || "").trim().toLowerCase();
    const title = (data.title || data.name || "").trim().toLowerCase();

    if (sku && sku !== "0") {
      if (!skus.has(sku)) skus.set(sku, []);
      skus.get(sku)!.push(id);
    }
    if (title) {
      if (!titles.has(title)) titles.set(title, []);
      titles.get(title)!.push(id);
    }
  });

  let duplicateSkuCount = 0;
  skus.forEach((ids, sku) => {
    if (ids.length > 1) {
      duplicateSkuCount++;
      console.log(`Duplicate SKU: "${sku}" in documents: ${ids.join(", ")}`);
    }
  });

  let duplicateTitleCount = 0;
  titles.forEach((ids, title) => {
    if (ids.length > 1) {
      duplicateTitleCount++;
      console.log(`Duplicate Title: "${title}" in documents: ${ids.join(", ")}`);
    }
  });

  console.log(`Duplicate SKU sets remaining: ${duplicateSkuCount}`);
  console.log(`Duplicate Title sets remaining: ${duplicateTitleCount}`);
}

run().catch(console.error);
