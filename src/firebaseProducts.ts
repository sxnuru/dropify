import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, "products"));
  const products: Product[] = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() } as Product);
  });

  if (products.length === 0) {
    // Seed database from products_dev.json
    try {
      const response = await fetch("/products_dev.json");
      if (response.ok) {
        const defaultProducts = await response.json();
        for (const p of defaultProducts) {
          const productData = {
            ...p,
            name: p.title || p.name || "",
            isFeatured: !!p.featured || !!p.isFeatured,
            isFlashDeal: !!p.sale || !!p.isFlashDeal,
            isNew: !!p.isNew,
            isActive: p.isActive !== false
          };
          const docId = p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          await setDoc(doc(db, "products", docId), productData);
          products.push({ id: docId, ...productData });
        }
      }
    } catch (error) {
      console.error("Failed to seed default products:", error);
    }
  }

  return products;
}

export async function addProduct(p: Product): Promise<void> {
  const docId = p.id || `prod-${Date.now()}`;
  await setDoc(doc(db, "products", docId), {
    ...p,
    id: docId,
    isActive: p.isActive !== false
  });
}

export async function updateProduct(p: Product): Promise<void> {
  const docRef = doc(db, "products", p.id);
  await setDoc(docRef, {
    ...p,
    isActive: p.isActive !== false
  }, { merge: true });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}