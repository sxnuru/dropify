import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

async function run() {
  console.log("=== STARTING PRODUCT IMAGE STORAGE MIGRATION PIPELINE ===");
  
  let totalProcessed = 0;
  let successfulUploads = 0;
  let failedDownloads = 0;
  let firestoreUpdates = 0;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Loaded ${products.length} products from Firestore.`);

    for (const p of products) {
      totalProcessed++;
      const title = p.name || p.title || "Untitled";
      const images: string[] = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
      
      // Determine if this product needs migration
      // Skip if all image URLs are already in Firebase Storage or are "NONE"
      const needsMigration = images.some(url => url && url !== "NONE" && !url.includes("firebasestorage.googleapis.com"));
      
      if (!needsMigration) {
        console.log(`[SKIP] "${title}" (${p.id}) is already migrated or has no valid remote images.`);
        continue;
      }

      console.log(`[MIGRATING] "${title}" (${p.id}) - Found ${images.length} images.`);
      
      const newImages: string[] = [];
      let updatedAny = false;

      for (let i = 0; i < images.length; i++) {
        const url = images[i];
        
        if (!url || url === "NONE" || url.trim() === "") {
          newImages.push("NONE");
          continue;
        }

        if (url.includes("firebasestorage.googleapis.com")) {
          // Already migrated this specific index
          newImages.push(url);
          continue;
        }

        try {
          console.log(`  -> Downloading image ${i + 1}/${images.length}: ${url}`);
          const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const storagePath = `products/${p.id}/img_${i}_${Date.now()}.jpg`;
          const storageRef = ref(storage, storagePath);

          console.log(`  -> Uploading to Firebase Storage: ${storagePath}`);
          await uploadBytes(storageRef, buffer, { contentType: "image/jpeg" });
          
          const downloadUrl = await getDownloadURL(storageRef);
          newImages.push(downloadUrl);
          successfulUploads++;
          updatedAny = true;
        } catch (err: any) {
          console.error(`  [ERROR] Failed to migrate image ${i + 1} (${url}):`, err.message);
          if (err.serverResponse) {
            console.error(`    -> Server Response:`, err.serverResponse);
          }
          failedDownloads++;
          // Fall back to original URL so we don't lose it if we retry
          newImages.push(url);
        }
      }

      if (updatedAny) {
        try {
          console.log(`  -> Updating Firestore document for product ${p.id}`);
          const docRef = doc(db, "products", p.id);
          await setDoc(docRef, {
            images: newImages,
            image: newImages[0] || "NONE"
          }, { merge: true });
          firestoreUpdates++;
        } catch (dbErr: any) {
          console.error(`  [ERROR] Failed to update Firestore for product ${p.id}:`, dbErr.message);
        }
      }
      console.log("----------------------------------------");
    }
  } catch (error: any) {
    console.error("Migration pipeline encountered critical error:", error.message);
  }

  console.log("\n=== MIGRATION PIPELINE SUMMARY REPORT ===");
  console.log(`- Total products processed: ${totalProcessed}`);
  console.log(`- Successful image uploads: ${successfulUploads}`);
  console.log(`- Failed image downloads: ${failedDownloads}`);
  console.log(`- Firestore document updates: ${firestoreUpdates}`);
  console.log("=========================================");
  process.exit(0);
}

run();
