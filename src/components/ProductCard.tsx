/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Star, Heart, Eye, ShoppingCart, Truck } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { ProductCardImage } from './CategoryArtwork';

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
      className="group relative bg-slate-950 border border-slate-900 rounded-[28px] p-3.5 sm:p-4 shadow-xl hover:shadow-[0_24px_50px_rgba(0,0,0,0.5)] hover:border-slate-800 transition-all duration-[300ms] ease-out flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer overflow-hidden select-none"
    >
      <div className="space-y-3.5">
        {/* TOP SECTION: Real Catalog Product Image floating on Category Radial Glow & Accents */}
        <div className="relative aspect-[1.05] w-full rounded-2xl overflow-hidden border border-slate-900 shadow-inner group">
          <ProductCardImage product={product} />

          {/* Top Left Live Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none z-20">
            {product.isNew && (
              <span className="bg-slate-950/90 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-md border border-white/10 shadow-sm">
                NEW
              </span>
            )}
            {product.isFlashDeal && (
              <span className="bg-red-600/90 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-md shadow-sm">
                DROP
              </span>
            )}
            {hasDiscount && (
              <span className="bg-blue-600/90 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-md shadow-sm">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* Top Right Live Wishlist Button */}
          <button
            id={`wish-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md transition-all duration-200 backdrop-blur-md cursor-pointer z-20 border ${
              isWish
                ? 'bg-red-500/90 text-white border-red-400 scale-105 active:scale-95'
                : 'bg-slate-950/70 text-slate-300 border-white/10 hover:text-red-400 hover:bg-slate-900/90 hover:scale-105 active:scale-95'
            }`}
            aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-white text-white' : ''}`} />
          </button>
        </div>

        {/* BOTTOM SECTION: Live Dynamic Data from Firebase */}
        <div className="space-y-2 text-left px-1">
          {/* Brand & Live Rating */}
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="uppercase font-bold tracking-widest text-slate-400 truncate max-w-[60%]">
              {product.brand}
            </span>

            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span className="font-bold text-slate-200">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-slate-500">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-sans font-bold text-white text-sm line-clamp-1 group-hover:text-cyan-400 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-[11px] font-sans line-clamp-2 h-8 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Status Indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
              <Truck className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[140px]">{product.estimatedDelivery || 'Complimentary transit'}</span>
            </div>

            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-red-400 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                SOLD OUT
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-amber-400 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                ONLY {product.stock} LEFT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-emerald-400 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                IN STOCK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PRICING & CHECKOUT ACTIONS */}
      <div className="pt-3 mt-3 border-t border-slate-900 font-sans text-xs flex items-center justify-between gap-2 shrink-0 px-1">
        {/* Price & Original Price */}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans font-extrabold text-white text-base tracking-tight">
              {formatPrice(product.price)}
            </span>
            {originalPrice && originalPrice > product.price && (
              <span className="text-slate-500 line-through text-[10px] font-mono">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Quick View Eye Button & Add to Cart Action */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToProduct(product.id);
            }}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-slate-800"
            aria-label="Quick View Product"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[38px] cursor-pointer ${
              isAdded
                ? 'bg-blue-600 text-white scale-105 active:scale-95 shadow-md'
                : isOutOfStock
                ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                : 'bg-slate-900 hover:bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-sm border border-slate-800'
            }`}
          >
            {isAdded ? (
              <span className="text-[9px] font-mono font-bold px-1 uppercase tracking-wider">
                ADDED
              </span>
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;