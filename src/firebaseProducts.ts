import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getProducts() {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,

      // Fix Firestore field names
      brand: data.Brand ?? data.brand ?? "",
      image: data.image ?? "",
      images: data.images ?? (data.image ? [data.image] : []),
      rating: data.rating ?? 0,
      reviewCount: data.reviewCount ?? 0,
      description: data.description ?? "",
      colors: data.colors ?? [],
      sizes: data.sizes ?? [],
    };
  });
}