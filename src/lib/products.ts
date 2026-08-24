import { Product } from '../types';

const API_BASE = '/api';

export let cachedCatalog: Product[] | null = null;

// ─── Helpers ───────────────────────────────────────────────────────────────

function normalizeProduct(data: any): Product {
  return {
    ...data,
    id: data.id,
    name: data.name || data.title || '',
    price: Number(data.price) || 0,
    originalPrice: data.original_price ? Number(data.original_price) : undefined,
    discountPercent: data.discount_percent ? Number(data.discount_percent) : undefined,
    stock: Number(data.stock) || 0,
    category: data.category || '',
    subcategory: data.subcategory || '',
    brand: data.brand || '',
    description: data.description || '',
    images: Array.isArray(data.images) ? data.images : (data.images ? JSON.parse(data.images) : []),
    colors: Array.isArray(data.colors) ? data.colors : (data.colors ? JSON.parse(data.colors) : []),
    sizes: Array.isArray(data.sizes) ? data.sizes : (data.sizes ? JSON.parse(data.sizes) : []),
    specs: data.specs && typeof data.specs === 'object' ? data.specs : {},
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? JSON.parse(data.tags) : []),
    rating: Number(data.rating) || 0,
    reviewCount: Number(data.review_count) || Number(data.reviewCount) || 0,
    isFeatured: !!data.is_featured || !!data.isFeatured || !!data.featured,
    isFlashDeal: !!data.is_flash_deal || !!data.isFlashDeal || !!data.sale,
    isNew: !!data.is_new || !!data.isNew,
    isActive: data.is_active !== false && data.isActive !== false,
    productStory: data.product_story || data.productStory || undefined,
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    features: Array.isArray(data.features) ? data.features : undefined,
    estimatedDelivery: data.estimated_delivery || data.estimatedDelivery || undefined,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list: Product[] = (data.products || data || []).map(normalizeProduct);
    cachedCatalog = list;
    return list;
  } catch (error) {
    console.error('[products] getProducts failed:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  // Check cache first
  if (cachedCatalog) {
    const found = cachedCatalog.find(p => p.id === id);
    if (found) return found;
  }
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data ? normalizeProduct(data) : null;
  } catch (error) {
    console.error('[products] getProductById failed:', error);
    return null;
  }
}

export async function getFeaturedProducts(limitVal: number): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products?featured=true&limit=${limitVal}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.products || data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[products] getFeaturedProducts failed:', error);
    return [];
  }
}

export async function getFlashDealProducts(limitVal: number): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products?flash_deal=true&limit=${limitVal}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.products || data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[products] getFlashDealProducts failed:', error);
    return [];
  }
}

export async function getNewProducts(limitVal: number): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products?new=true&limit=${limitVal}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.products || data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[products] getNewProducts failed:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string, limitVal?: number): Promise<Product[]> {
  try {
    let url = `${API_BASE}/products?category=${encodeURIComponent(category)}`;
    if (limitVal) url += `&limit=${limitVal}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.products || data || []).map(normalizeProduct);
  } catch (error) {
    console.error('[products] getProductsByCategory failed:', error);
    return [];
  }
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const qStr = searchTerm.toLowerCase().trim();
  if (!qStr) return [];
  if (!cachedCatalog) {
    cachedCatalog = await getProducts();
  }
  return cachedCatalog.filter(p => {
    const name = (p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const subcategory = (p.subcategory || '').toLowerCase();
    const description = (p.description || '').toLowerCase();
    const tags = (p.tags || []).join(' ').toLowerCase();
    return (
      name.includes(qStr) ||
      brand.includes(qStr) ||
      category.includes(qStr) ||
      subcategory.includes(qStr) ||
      description.includes(qStr) ||
      tags.includes(qStr)
    );
  });
}

export async function addProduct(p: Product): Promise<void> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  // Invalidate cache
  cachedCatalog = null;
}

export async function updateProduct(p: Product): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(p.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  // Invalidate cache
  cachedCatalog = null;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  // Invalidate cache
  cachedCatalog = null;
}

export async function getCategoryProductCount(category: string): Promise<number> {
  try {
    const products = await getProducts();
    if (category === 'All') return products.length;
    return products.filter(p => p.category === category).length;
  } catch {
    return 0;
  }
}
