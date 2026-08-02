/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Star, Heart, Eye, ShoppingCart, Truck } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  isWish: boolean;
  onNavigateToProduct: (id: string) => void;
  onAddToCart: (p: Product, color: string, size: string) => void;
  onAddToWishlist: (p: Product) => void;
}

const ProductCard = React.memo(function ProductCard({
  product,
  isWish,
  onNavigateToProduct,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    onAddToCart(
      product,
      product.colors?.[0] || 'Default',
      product.sizes?.[0] || 'Default'
    );

    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const hasDiscount = (product.discountPercent ?? 0) > 0;

  const originalPrice =
    product.originalPrice ??
    (hasDiscount
      ? Math.round(product.price / (1 - (product.discountPercent ?? 0) / 100))
      : undefined);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onNavigateToProduct(product.id)}
      className="group relative bg-white border border-slate-100/90 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:border-slate-200/50 transition-all duration-500 ease-out flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer overflow-hidden select-none"
    >
      <div className="space-y-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50/50 flex items-center justify-center">

<img
  src={product.images[0] || "https://placehold.co/500x500?text=No+Image"}
  alt={product.name}
  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
  loading="lazy"
  decoding="async"
  referrerPolicy="no-referrer"
  onError={(e) => {
    console.error(`Failed to load product card image for "${product.name}" (${product.id}): ${e.currentTarget.src}`);
    e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
  }}
/>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
            {product.isNew && (
              <span className="bg-slate-950 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                NEW RELEASE
              </span>
            )}

            {product.isFlashDeal && (
              <span className="bg-red-600 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                LIMITED DROP
              </span>
            )}

            {hasDiscount && (
              <span className="bg-blue-600 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                SAVE {product.discountPercent}%
              </span>
            )}
          </div>

          <button
            id={`wish-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            className={`absolute top-3 right-3 p-2.5 rounded-full shadow-sm transition-all duration-300 backdrop-blur-sm cursor-pointer z-10 border ${
              isWish
                ? 'bg-red-50 text-red-600 border-red-100 shadow-md scale-105'
                : 'bg-white/90 text-slate-400 border-slate-100 hover:text-red-500 hover:bg-white hover:scale-105'
            }`}
            name={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-red-600' : ''}`} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/40 via-slate-950/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center items-center pointer-events-none">
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-full backdrop-blur-sm">
              Quick Inspect
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="uppercase font-bold tracking-wider text-slate-400">
              {product.brand}
            </span>

            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span className="font-bold text-slate-800">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-slate-400">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          <h3 className="font-sans font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {product.name}
          </h3>

          <p className="text-slate-400 text-[11px] font-sans line-clamp-2 h-8 leading-normal">
            {product.description}
          </p>

          <div className="flex items-center gap-1.5 pt-0.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-600 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                SOLD OUT
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                ONLY {product.stock} LEFT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                IN STOCK
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3.5 mt-3.5 border-t border-slate-100 font-sans text-xs flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Truck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{product.estimatedDelivery || 'Complimentary 3-day transit'}</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            <span className="font-mono font-bold text-slate-950 text-sm">
              {formatPrice(product.price)}
            </span>

            {originalPrice && originalPrice > product.price && (
              <span className="text-slate-400 line-through text-[10px] mt-1 font-mono">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToProduct(product.id);
              }}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center min-w-[34px] ${
                isAdded
                  ? 'bg-blue-600 text-white scale-105'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-blue-600 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isAdded ? (
                <span className="text-[10px] font-mono font-bold px-1 uppercase">
                  ADDED
                </span>
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;