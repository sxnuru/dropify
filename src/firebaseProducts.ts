import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, limit, getDoc, getCountFromServer } from "firebase/firestore";
import { Product } from "./types";

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        name: data.title || data.name || "",
        isFeatured: !!data.featured || !!data.isFeatured,
        isFlashDeal: !!data.sale || !!data.isFlashDeal,
        isNew: !!data.isNew,
        isActive: data.isActive !== false,
      } as Product;
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
  }
  return null;
}

export async function getProductsByCategory(category: string, limitVal?: number): Promise<Product[]> {
  try {
    const coll = collection(db, "products");
    let q;
    if (category === "All") {
      q = limitVal ? query(coll, limit(limitVal)) : coll;
    } else {
      q = limitVal 
        ? query(coll, where("category", "==", category), limit(limitVal))
        : query(coll, where("category", "==", category));
    }
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        ...data,
        id: doc.id,
        name: data.title || data.name || "",
        isFeatured: !!data.featured || !!data.isFeatured,
        isFlashDeal: !!data.sale || !!data.isFlashDeal,
        isNew: !!data.isNew,
        isActive: data.isActive !== false,
      } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function getFeaturedProducts(limitVal: number): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), where("isFeatured", "==", true), limit(limitVal));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        ...data,
        id: doc.id,
        name: data.title || data.name || "",
        isFeatured: true,
        isFlashDeal: !!data.sale || !!data.isFlashDeal,
        isNew: !!data.isNew,
        isActive: data.isActive !== false,
      } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getFlashDealProducts(limitVal: number): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), where("isFlashDeal", "==", true), limit(limitVal));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        ...data,
        id: doc.id,
        name: data.title || data.name || "",
        isFeatured: !!data.featured || !!data.isFeatured,
        isFlashDeal: true,
        isNew: !!data.isNew,
        isActive: data.isActive !== false,
      } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching flash deal products:", error);
    return [];
  }
}

export async function getNewProducts(limitVal: number): Promise<Product[]> {
  try {
    const q = query(collection(db, "products"), where("isNew", "==", true), limit(limitVal));
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        ...data,
        id: doc.id,
        name: data.title || data.name || "",
        isFeatured: !!data.featured || !!data.isFeatured,
        isFlashDeal: !!data.sale || !!data.isFlashDeal,
        isNew: true,
        isActive: data.isActive !== false,
      } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching new products:", error);
    return [];
  }
}

export async function getCategoryProductCount(category: string): Promise<number> {
  try {
    const coll = collection(db, "products");
    const q = category === "All" 
      ? coll 
      : query(coll, where("category", "==", category));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting category product count:", error);
    return 0;
  }
}

export let cachedCatalog: Product[] | null = null;

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const qStr = searchTerm.toLowerCase().trim();
  if (!qStr) return [];
  try {
    if (!cachedCatalog) {
      cachedCatalog = await getProducts();
    }
    const hits: Product[] = [];
    cachedCatalog.forEach((p) => {
      const name = (p.name || (p as any).title || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const subcategory = (p.subcategory || "").toLowerCase();
      const sku = ((p as any).sku || "").toLowerCase();
      const description = (p.description || "").toLowerCase();

      if (
        name.includes(qStr) ||
        brand.includes(qStr) ||
        category.includes(qStr) ||
        subcategory.includes(qStr) ||
        sku.includes(qStr) ||
        description.includes(qStr)
      ) {
        hits.push(p);
      }
    });
    return hits;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, "products"));
  const products: Product[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    products.push({
      ...data,
      id: doc.id,
      name: data.title || data.name || "",
      isFeatured: !!data.featured || !!data.isFeatured,
      isFlashDeal: !!data.sale || !!data.isFlashDeal,
      isNew: !!data.isNew,
      isActive: data.isActive !== false,
    } as Product);
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
          products.push({ id: docId, ...productData } as Product);
        }
      }
    } catch (error) {
      console.error("Failed to seed default products:", error);
    }
  }

  cachedCatalog = products;
  return products;
}

export async function addProduct(p: Product): Promise<void> {
  const docId = p.id || `prod-${Date.now()}`;
  const productData = {
    ...p,
    id: docId,
    name: (p as any).title || p.name || "",
    isFeatured: !!(p as any).featured || !!p.isFeatured,
    isFlashDeal: !!(p as any).sale || !!p.isFlashDeal,
    isNew: p.isNew,
    isActive: p.isActive !== false
  };
  await setDoc(doc(db, "products", docId), productData);
  if (cachedCatalog) {
    cachedCatalog.push(productData as Product);
  }
}

export async function updateProduct(p: Product): Promise<void> {
  const docRef = doc(db, "products", p.id);
  const productData = {
    ...p,
    name: (p as any).title || p.name || "",
    isFeatured: !!(p as any).featured || !!p.isFeatured,
    isFlashDeal: !!(p as any).sale || !!p.isFlashDeal,
    isNew: p.isNew,
    isActive: p.isActive !== false
  };
  await setDoc(docRef, productData, { merge: true });
  if (cachedCatalog) {
    const idx = cachedCatalog.findIndex(x => x.id === p.id);
    if (idx !== -1) {
      cachedCatalog[idx] = { ...cachedCatalog[idx], ...productData } as Product;
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
  if (cachedCatalog) {
    cachedCatalog = cachedCatalog.filter(x => x.id !== id);
  }
}