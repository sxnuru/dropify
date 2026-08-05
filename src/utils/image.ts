const fallbackUrls = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
  "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08",
  "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
];

export const GRAY_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'><rect width='500' height='500' fill='%23e2e8f0'/><text x='250' y='260' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2364748b' text-anchor='middle'>No Image Available</text></svg>";

export function isFallbackImage(url?: string): boolean {
  if (!url) return true;
  const urlStr = String(url).trim();
  if (urlStr === "" || urlStr === "NONE" || urlStr.includes("placehold.co")) return true;
  return fallbackUrls.some(fallback => urlStr.startsWith(fallback));
}

export function getProductImage(product: any): string {
  if (!product) return GRAY_PLACEHOLDER;
  
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    if (!isFallbackImage(firstImg)) {
      return firstImg;
    }
  }
  
  if (product.image && !isFallbackImage(product.image)) {
    return product.image;
  }
  
  return GRAY_PLACEHOLDER;
}

export function getCleanProductImages(product: any): string[] {
  if (!product) return [GRAY_PLACEHOLDER];
  
  const clean: string[] = [];
  if (Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      if (img && !isFallbackImage(img)) {
        clean.push(img);
      }
    });
  }
  
  if (clean.length === 0 && product.image && !isFallbackImage(product.image)) {
    clean.push(product.image);
  }
  
  if (clean.length === 0) {
    clean.push(GRAY_PLACEHOLDER);
  }
  
  return clean;
}
