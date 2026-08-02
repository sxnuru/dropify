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
      className="group relative bg-white border border-slate-100/90 rounded-[28px] p-5 shadow-sm hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] hover:border-slate-200/60 transition-all duration-[250ms] ease-out flex flex-col justify-between hover:-translate-y-1 cursor-pointer overflow-hidden select-none"
    >
      <div className="space-y-4">
        {/* Larger Image Area with premium loaded shadow overlay */}
        <div className="relative aspect-[1.05] w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100/50">
          <img
            src={product.images[0] || "https://placehold.co/500x500?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.error(`Failed to load product card image for "${product.name}" (${product.id}): ${e.currentTarget.src}`);
              e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Smaller, Cleaner Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none z-10">
            {product.isNew && (
              <span className="bg-slate-950 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                NEW
              </span>
            )}
            {product.isFlashDeal && (
              <span className="bg-red-600 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                DROP
              </span>
            )}
            {hasDiscount && (
              <span className="bg-blue-600 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* Premium Wishlist Button with scaling transform */}
          <button
            id={`wish-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-sm transition-all duration-200 backdrop-blur-md cursor-pointer z-10 border ${
              isWish
                ? 'bg-red-50 text-red-650 border-red-100 text-red-600 shadow-md scale-105 active:scale-95'
                : 'bg-white/90 text-slate-400 border-slate-100 hover:text-red-500 hover:bg-white hover:scale-105 active:scale-95'
            }`}
            name={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-red-600 text-red-600' : ''}`} />
          </button>
        </div>

        {/* Brand, Rating, Title & Description layout */}
        <div className="space-y-2 text-left px-0.5">
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="uppercase font-bold tracking-widest text-slate-400">
              {product.brand}
            </span>

            <div className="flex items-center gap-0.5 text-slate-500 font-medium">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span className="font-bold text-slate-800 ml-0.5">
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

          <p className="text-slate-400 text-[11px] font-sans line-clamp-2 h-8 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-1.5 pt-0.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-red-600 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                SOLD OUT
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-amber-600 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                ONLY {product.stock} LEFT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-emerald-600 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                IN STOCK
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & Checkout Section */}
      <div className="pt-3 mt-3.5 border-t border-slate-100 font-sans text-xs flex flex-col gap-2 shrink-0 px-0.5">
        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
          <Truck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{product.estimatedDelivery || 'Complimentary 3-day transit'}</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col text-left">
            <span className="font-sans font-extrabold text-slate-950 text-base tracking-tight">
              {formatPrice(product.price)}
            </span>
            {originalPrice && originalPrice > product.price && (
              <span className="text-slate-400 line-through text-[10px] font-mono mt-0.5">
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
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
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
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-sm'
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
    </div>
  );
});

export default ProductCard;