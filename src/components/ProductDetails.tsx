/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { PRODUCTS } from '../data';
import { formatPrice } from '../utils/currency';
import { 
  Heart, Shield, Rotate3d, Plus, Star, ShoppingBag, Eye,
  CheckCircle, Truck, RefreshCw, Award, ArrowRight, Sparkles, MessageSquarePlus,
  X, ChevronLeft, ChevronRight, Share2, AlertCircle, Check
} from 'lucide-react';
import ProductCard from './ProductCard';
import { getCleanProductImages } from '../utils/image';
import { getProductsByCategory, getProductById } from '../firebaseProducts';
interface ProductDetailsProps {
  product: Product;
  productsList?: Product[];
  onAddToCart: (p: Product, color: string, size: string) => void;
  onAddToWishlist: (p: Product) => void;
  onNavigateToProduct: (id: string) => void;
  isInWishlist: boolean;
  onBackToShop?: () => void;
  recentlyViewed?: Product[];
}

export default function ProductDetails({ 
  product, productsList, onAddToCart, onAddToWishlist, onNavigateToProduct, isInWishlist, onBackToShop, recentlyViewed 
}: ProductDetailsProps) {
  const safeImages = getCleanProductImages(product);

  const [activeImg, setActiveImg] = useState(safeImages[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Default');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Default');
  
  // Hover Magnifier Zoom States
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  // Interactive 360 viewer state
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Redesign state hooks
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);

  // Mobile swipe support states & handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const idx = safeImages.indexOf(activeImg);
      if (isLeftSwipe) {
        const nextIdx = idx < safeImages.length - 1 ? idx + 1 : 0;
        handleThumbnailClick(safeImages[nextIdx]);
      } else {
        const prevIdx = idx > 0 ? idx - 1 : safeImages.length - 1;
        handleThumbnailClick(safeImages[prevIdx]);
      }
    }
  };

  // Dynamic reviews state to allow writing real-time appraisals
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Bundle Selector (Frequently bought together)
  const bundleCompanion = PRODUCTS.find(p => p.id !== product.id) || PRODUCTS[1];
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const handleThumbnailClick = (img: string) => {
    if (img === activeImg) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveImg(img);
      setIsFading(false);
    }, 150);
  };

  useEffect(() => {
    setIsImgLoading(true);
  }, [activeImg]);

  // Sync state if product changes
  useEffect(() => {
    setActiveImg(safeImages[0]);
    setSelectedColor(product.colors?.[0] || 'Default');
    setSelectedSize(product.sizes?.[0] || 'Default');
    setReviewsList(product.reviews || []);
    setIs360Mode(false);
    setIsSpecsOpen(false);
  }, [product]);

  // Scroll listener to toggle sticky purchase bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 550) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hover zoom magnifier helper
  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImg})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeaveZoom = () => {
    setZoomStyle({ display: 'none' });
  };

  // 360 degree drag rotation simulation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setRotationAngle((prev) => (prev + deltaX * 1.5) % 360);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const triggerAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 3000);
  };

  const triggerAddBundleToCart = () => {
    onAddToCart(product, selectedColor, selectedSize);
    if (bundleCompanion) {
      onAddToCart(bundleCompanion, bundleCompanion?.colors?.[0] || 'Default', bundleCompanion?.sizes?.[0] || 'Default');
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 3000);
  };

  // Handle client review submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const addedReview: Review = {
      id: `rev-${Date.now()}`,
      username: newAuthor,
      rating: newRating,
      comment: newComment,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0
    };

    setReviewsList(prev => [addedReview, ...prev]);
    setNewAuthor('');
    setNewComment('');
    setNewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const [customersAlsoViewed, setCustomersAlsoViewed] = useState<Product[]>([]);
  const [resolvedRecentlyViewed, setResolvedRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    async function loadRecommendations() {
      try {
        const list = await getProductsByCategory(product.category, 6);
        if (!active) return;
        
        // Customers Also Viewed: items in same category excluding current product
        const sameCategory = list.filter(p => p.id !== product.id).slice(0, 3);
        setCustomersAlsoViewed(sameCategory);
        
        // Recently Viewed: use prop recentlyViewed if available, 
        // else fallback to some other items from this category
        if (recentlyViewed && recentlyViewed.length > 0) {
          setResolvedRecentlyViewed(recentlyViewed);
        } else {
          const fallbackList = list.filter(p => p.id !== product.id).slice(3, 6);
          setResolvedRecentlyViewed(fallbackList);
        }
      } catch (error) {
        console.error("Error loading product recommendations:", error);
      }
    }
    loadRecommendations();
    return () => {
      active = false;
    };
  }, [product.id, recentlyViewed]);

  return (
    <div id={`product-details-${product.id}`} className="space-y-6 animate-fadeIn relative pb-20 lg:pb-0">
      
      {/* Back Navigation */}
      <button 
        onClick={onBackToShop}
        className="group flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-slate-950 font-bold uppercase tracking-wider mb-2 transition-all cursor-pointer"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span>Back to Shop</span>
      </button>

      {/* Product Primary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Premium Gallery with Interactive Zoom & 360 Spin */}
        <div className="flex flex-col md:flex-row-reverse gap-4 items-start w-full">
          {/* Main Image View */}
          <div className="flex-1 w-full relative">
            <div 
              className="relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/50 aspect-square flex items-center justify-center cursor-zoom-in group shadow-inner"
              onMouseMove={handleMouseMoveZoom}
              onMouseLeave={handleMouseLeaveZoom}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                if (!is360Mode) {
                  const idx = safeImages.indexOf(activeImg);
                  setLightboxIndex(idx >= 0 ? idx : 0);
                  setIsLightboxOpen(true);
                }
              }}
            >
              {/* Image Counter */}
              {!is360Mode && (
                <div className="absolute top-4 left-4 bg-slate-950/80 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none tracking-wider z-10">
                  {safeImages.indexOf(activeImg) + 1} / {safeImages.length}
                </div>
              )}

              {!is360Mode ? (
                <>
                  {isImgLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-pulse z-10" />
                  )}
                  <img 
                    src={activeImg} 
                    alt={product.name} 
                    onLoad={() => setIsImgLoading(false)}
                    className={`w-full h-full object-cover transition-opacity duration-150 ${isFading || isImgLoading ? 'opacity-0' : 'opacity-100'}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      console.error(`Failed to load product details activeImg for "${product.name}" (${product.id}): ${e.currentTarget.src}`);
                      e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                      setIsImgLoading(false);
                    }}
                  />
                  {/* Simulated Lens Zoom Element */}
                  <div 
                    className="absolute inset-0 pointer-events-none hidden group-hover:block transition-all duration-150"
                    style={zoomStyle}
                  />
                  <div className="absolute top-4 right-4 bg-slate-950/80 text-white font-mono text-[8px] font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    CLICK TO VIEW FULLSCREEN
                  </div>
                </>
              ) : (
                <div 
                  id="rotator-canvas"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full cursor-grab active:cursor-grabbing flex flex-col items-center justify-center select-none p-8"
                >
                  {/* Simulated 3D rotatable geometric outline using CSS rotates */}
                  <div 
                    className="w-56 h-56 bg-white border border-slate-200/60 rounded-3xl flex items-center justify-center shadow-lg transition-transform"
                    style={{ transform: `rotateY(${rotationAngle}deg)` }}
                  >
                    <img 
                      src={safeImages[0]} 
                      alt="" 
                      className="w-44 h-44 object-contain p-2" 
                      onError={(e) => {
                        console.error(`Failed to load 360 viewer image for "${product.name}" (${product.id}): ${e.currentTarget.src}`);
                        e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="text-center mt-6 space-y-1 relative z-10 pointer-events-none">
                    <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">INTERACTIVE 360 VIEWER</span>
                    <span className="text-slate-400 text-[9px]">Drag horizontally to spin (Angle: {Math.round(rotationAngle)}°)</span>
                  </div>
                </div>
              )}

              {/* Toggle 360 View */}
              <button
                id="toggle-360-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIs360Mode(!is360Mode);
                }}
                className="absolute bottom-4 right-4 bg-white/95 hover:bg-slate-950 hover:text-white border border-slate-200 px-3.5 py-2 rounded-xl text-slate-900 shadow-md transition-all flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer z-20"
              >
                <Rotate3d className={`w-3.5 h-3.5 ${is360Mode ? 'text-blue-500 animate-spin' : ''}`} />
                {is360Mode ? 'Standard Gallery' : 'Interactive 360°'}
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {!is360Mode && (
            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible w-full md:w-20 shrink-0 pb-2 md:pb-0 scrollbar-none">
              {safeImages.map((img, index) => (
                <button
                  id={`thumb-btn-${index}`}
                  key={index}
                  onClick={() => handleThumbnailClick(img)}
                  className={`aspect-square w-16 md:w-full rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                    activeImg === img 
                      ? 'border-slate-950 ring-2 ring-slate-950/10' 
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      console.error(`Failed to load product thumbnail image for "${product.name}" (${product.id}): ${e.currentTarget.src}`);
                      e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column: Title, variants, story, spec cards */}
        <div className="space-y-6 text-left lg:pl-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest block">{product.brand}</span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase">SKU: {(product as any).sku || product.id}</span>
            </div>
            
            <h1 className="font-sans text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating and Stock */}
            <div className="flex flex-wrap items-center gap-4 pt-1 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1 text-amber-500 font-mono text-xs bg-amber-50/60 px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-slate-900">{product.rating}</span>
                <span className="text-slate-455">({reviewsList.length} Appraisals)</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-500">{product.category}</span>
              <span className="text-slate-300">|</span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Premium Pricing Section */}
          <div className="bg-slate-50/65 rounded-2xl p-5 border border-slate-100/80 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-extrabold text-slate-950">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="font-mono text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-blue-600 text-white font-mono text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-sans">
                Or 3 interest-free monthly installments of <span className="font-bold text-slate-900 font-mono">{formatPrice(Math.round(product.price / 3))}</span> with split-payment options.
              </p>
              <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> VAT & import duties included. Free standard shipping.
              </p>
            </div>
          </div>

          {/* Sourcing & Seller Integrity Card */}
          <div className="border border-slate-200/60 rounded-2xl p-4 flex gap-4 items-start bg-white shadow-sm">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-900 block font-sans">Seller: DreamShelf Archive Direct</span>
              <p className="text-slate-400 leading-normal font-sans">Artisan Certified catalog items with authentic certifications, 12-month boutique warranty, and hassle-free returns.</p>
            </div>
          </div>

          {/* Expandable Description */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Product Story</span>
            <p className={`text-slate-655 text-slate-600 text-xs leading-relaxed font-sans ${isDescExpanded ? '' : 'line-clamp-3'}`}>
              {product.description || "No product description available."}
            </p>
            {product.description && product.description.length > 150 && (
              <button 
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-blue-650 text-blue-600 hover:text-blue-750 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer mt-1"
              >
                {isDescExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Variants Segment Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Color circles */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">Select Aesthetic tone: {selectedColor}</span>
                <div className="flex gap-2">
                  {(product.colors || []).map((color) => (
                    <button
                      id={`color-btn-${color}`}
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sans border transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'border-slate-950 bg-slate-950 text-white font-bold'
                          : 'border-slate-200 hover:border-slate-400 text-slate-600 bg-white'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizing blocks */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">Select Dimension / Size: {selectedSize}</span>
                <div className="flex gap-2">
                  {(product.sizes || []).map((size) => (
                    <button
                      id={`size-btn-${size}`}
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-slate-950 bg-slate-950 text-white ring-2 ring-slate-950/10'
                          : 'border-slate-200 hover:border-slate-400 text-slate-600 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Purchase Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Quantity Selector & Action row */}
            <div className="flex items-center gap-4">
              <div className="space-y-1.5 text-left">
                <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Qty</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shrink-0 shadow-inner-sm">
                  <button 
                    onClick={() => setPurchaseQuantity(q => q > 1 ? q - 1 : 1)}
                    className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-colors cursor-pointer active:scale-95"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 font-mono font-bold text-xs text-slate-950 min-w-[24px] text-center">
                    {purchaseQuantity}
                  </span>
                  <button 
                    onClick={() => setPurchaseQuantity(q => q + 1)}
                    className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-colors cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Purchase Method</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="details-add-to-cart"
                    onClick={triggerAddToCart}
                    className="py-3 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 font-sans text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider active:scale-98"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Bag
                  </button>
                  <button
                    onClick={() => {
                      triggerAddToCart();
                      setTimeout(() => {
                        alert("Proceeding directly to checkout processing with this order item!");
                      }, 400);
                    }}
                    className="py-3 bg-slate-950 text-white hover:bg-blue-600 font-sans text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm active:scale-98"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Utility buttons */}
            <div className="flex gap-2">
              <button
                id="details-add-to-wish"
                onClick={() => onAddToWishlist(product)}
                className={`flex-1 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold uppercase active:scale-98 ${
                  isInWishlist 
                    ? 'bg-red-50 text-red-605 text-red-600 border-red-100 shadow-sm' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-red-600 text-red-600' : ''}`} />
                <span>{isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Product link successfully copied to your clipboard!");
                }}
                className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[10px] font-mono font-bold uppercase active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Piece</span>
              </button>
            </div>

            {/* Secure Checkout Badge */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-semibold font-sans uppercase tracking-widest select-none">
              <span>🔒 Secure Checkout</span>
              <span>•</span>
              <span>100% Encrypted</span>
            </div>
          </div>

          {/* Delivery & Return Policies Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4 font-sans text-xs">
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-1.5 text-left">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900 block text-[11px] leading-tight">Free Shipping</span>
              <p className="text-slate-500 text-[10px] leading-snug">{product.estimatedDelivery || 'Arrives in 3-5 days'}</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-1.5 text-left">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900 block text-[11px] leading-tight">30-Day Returns</span>
              <p className="text-slate-500 text-[10px] leading-snug">Hassle-free complimentary returns</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-1.5 text-left">
              <Shield className="w-4 h-4 text-slate-800" />
              <span className="font-bold text-slate-900 block text-[11px] leading-tight">Warranty</span>
              <p className="text-slate-500 text-[10px] leading-snug">12-Month direct cover warranty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative & Specification Expandable Accordions */}
      <div className="space-y-4 pt-12 border-t border-slate-100 text-left">
        {/* Accordion 1: Description & Story */}
        <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
          <button 
            onClick={() => setIsDescExpanded(!isDescExpanded)} 
            className="w-full flex justify-between items-center p-5 text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span>Product Overview & Story</span>
            <Plus className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDescExpanded ? 'rotate-45 text-slate-800' : ''}`} />
          </button>
          {isDescExpanded && (
            <div className="p-6 border-t border-slate-100 text-xs text-slate-500 leading-relaxed font-sans space-y-4 animate-fadeIn">
              <p>{product.description || "No product description available."}</p>
              {product.productStory && <p>{product.productStory}</p>}
              
              {Array.isArray(product.features) && product.features.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Featured Attributes</span>
                  <ul className="space-y-1.5 text-slate-655 list-disc pl-4">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 2: Specs Matrix */}
        <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
          <button 
            onClick={() => setIsSpecsOpen(!isSpecsOpen)} 
            className="w-full flex justify-between items-center p-5 text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span>Technical Specifications</span>
            <Plus className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isSpecsOpen ? 'rotate-45 text-slate-800' : ''}`} />
          </button>
          {isSpecsOpen && (
            <div className="border-t border-slate-100 animate-fadeIn">
              {product.specs && Object.keys(product.specs).length > 0 ? (
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {Object.entries(product.specs ?? {}).map(([key, val], idx) => (
                      <tr id={`spec-row-${idx}`} key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900 font-mono text-[9px] uppercase w-1/3 tracking-wider bg-slate-50/30">{key}</td>
                        <td className="p-4 text-slate-500">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-slate-400 italic text-center">No specifications available.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Frequently bought together aggregate bundle */}
      <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6 text-left">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-base">Frequently Bought Together</h3>
          <p className="text-slate-400 text-xs mt-0.5 font-sans">Coordinate your aesthetic bundle and save an automatic 10% credit discount.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            {/* Main Item */}
            <div className="flex items-center gap-3">
              <img 
                src={safeImages[0]} 
                alt="" 
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white" 
                onError={(e) => {
                  console.error(`Failed to load bundle main image for "${product.name}" (${product.id}): ${e.currentTarget.src}`);
                  e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                }}
              />
              <div>
                <span className="font-bold text-slate-900 block text-xs">{product.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{formatPrice(product.price)}</span>
              </div>
            </div>

            <span className="text-slate-300 text-lg font-bold font-mono">+</span>

            {/* Companion Item */}
            <div className="flex items-center gap-3">
              <img 
                src={(Array.isArray(bundleCompanion?.images) && bundleCompanion.images[0]) || 'https://placehold.co/500x500?text=No+Image'} 
                alt="" 
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white" 
                onError={(e) => {
                  console.error(`Failed to load bundle companion image for "${bundleCompanion?.name || 'Companion'}" (${bundleCompanion?.id || 'unknown'}): ${e.currentTarget.src}`);
                  e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                }}
              />
              <div>
                <span className="font-bold text-slate-900 block text-xs">{bundleCompanion?.name || "Complementary Item"}</span>
                <span className="font-mono text-[11px] text-slate-500">{formatPrice(bundleCompanion?.price || 0)}</span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-3">
            <div className="font-sans text-xs">
              <span className="text-slate-400">Coordinated Bundle Price (10% off): </span>
              <span className="font-mono font-bold text-slate-900 text-base ml-1">
                {formatPrice(Math.round((product.price + (bundleCompanion?.price || 0)) * 0.9))}
              </span>
            </div>
            <button
              id="details-add-bundle"
              onClick={triggerAddBundleToCart}
              className="px-5 py-2.5 bg-slate-950 hover:bg-blue-600 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
            >
              ADD COORDINATED BUNDLE TO BAG
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMERS ALSO VIEWED RECOMMENDATION CAROUSEL */}
      <div className="space-y-6 pt-12 border-t border-slate-100 text-left">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-sans font-bold text-slate-950 text-lg">Customers Also Viewed</h3>
            <p className="text-slate-400 text-xs mt-0.5">Other pieces frequently inspected by searchers of this brand.</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Scroll Horizontally →</span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {customersAlsoViewed.map((item) => (
            <div key={item.id} className="snap-start shrink-0 w-72">
              <ProductCard
                product={item}
                isWish={false}
                onNavigateToProduct={onNavigateToProduct}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            </div>
          ))}
        </div>
      </div>

      {/* RECENTLY VIEWED PRODUCTS BLOCK */}
      <div className="space-y-6 pt-12 border-t border-slate-100 text-left">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-sans font-bold text-slate-955 text-slate-900 text-lg">Recently Viewed Catalog Pieces</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-sans">Your browsing footprint from current and past curation periods.</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Scroll Horizontally →</span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {resolvedRecentlyViewed.map((item) => (
            <div key={item.id} className="snap-start shrink-0 w-72">
              <ProductCard
                product={item}
                isWish={false}
                onNavigateToProduct={onNavigateToProduct}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Customer Feedback section with Interactive review submission */}
      <div className="space-y-8 pt-12 border-t border-slate-100 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Average Rating Block */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-lg">Client Appraisals ({reviewsList.length})</h3>
              <p className="text-xs text-slate-400 mt-0.5">Verified purchasing experiences and aesthetic feedback.</p>
            </div>
            
            <div className="bg-slate-50/60 rounded-3xl p-6 border border-slate-100 text-center space-y-3">
              <span className="text-5xl font-extrabold text-slate-950 block font-mono">{product.rating}</span>
              <div className="flex justify-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-500' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-slate-400 text-[10px] font-mono block uppercase">Cumulative Brand Score</span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviewsList.filter(r => Math.round(r.rating) === stars).length;
                const total = reviewsList.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-8 text-slate-500 font-bold">{stars} Star</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-950 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-slate-400 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of client appraisals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviewsList.map((r) => (
                <div id={`review-card-${r.id}`} key={r.id} className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-mono font-bold flex items-center justify-center text-xs">
                        {(r.username || 'Anonymous').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-sans font-extrabold text-slate-900 text-xs block">{r.username || 'Anonymous'}</span>
                        <span className="font-mono text-[9px] text-slate-400">{r.date || 'Today'}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 font-sans text-xs leading-relaxed italic">"{r.comment}"</p>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400 pt-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Verified Buyer • helpful count:</span>
                    <span className="font-bold text-slate-700">{r.helpfulCount || 1} clients verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WRITE AN APPRAISAL FORM */}
        <div className="bg-slate-50/70 border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="space-y-1 text-left">
            <h4 className="font-sans font-bold text-slate-950 text-sm flex items-center gap-2">
              <MessageSquarePlus className="w-4.5 h-4.5 text-blue-600" /> Write a verified Appraisal
            </h4>
            <p className="text-slate-400 text-xs font-sans">Submit your verified user experience, sizing details, and color appraisal.</p>
          </div>

          {reviewSuccess ? (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs py-3.5 px-4 rounded-xl text-center font-bold font-mono tracking-wider uppercase animate-fadeIn">
              ✓ THANK YOU! APPRAISAL HAS BEEN ADDED TO CATALOG SUCCESSFULLY
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Appraiser Screen Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Sarah J."
                    value={newAuthor} 
                    onChange={(e) => setNewAuthor(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Appraisal Rating</label>
                  <select 
                    value={newRating} 
                    onChange={(e) => setNewRating(parseInt(e.target.value))} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans font-semibold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellence)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 Superior)</option>
                    <option value={3}>⭐⭐⭐ (3/5 Standard)</option>
                    <option value={2}>⭐⭐ (2/5 Fair)</option>
                    <option value={1}>⭐ (1/5 Poor)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Appraisal comments</label>
                <textarea 
                  rows={3}
                  required 
                  placeholder="Describe details regarding craftsmanship quality, tactile feedback, and size coordinates..."
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <button 
                type="submit" 
                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest font-sans transition-colors cursor-pointer text-[10px]"
              >
                SUBMIT CATALOG APPRAISAL
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Premium Sticky Purchase Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 py-3.5 px-4 transition-all duration-500 ease-in-out shadow-[0_-8px_30px_rgb(0,0,0,0.06)] flex justify-between items-center ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={safeImages[0]} 
              alt="" 
              className="w-12 h-12 object-cover rounded-xl border border-slate-100 bg-slate-50 shrink-0" 
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
              }}
            />
            <div className="text-left font-sans">
              <span className="text-slate-900 text-xs font-bold block max-w-[150px] sm:max-w-md truncate">{product.name}</span>
              <span className="text-slate-400 text-[10px] font-mono block uppercase tracking-wider">{product.brand} • {product.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-sans">
              <span className="text-slate-400 text-[9px] block font-mono">Standard Price</span>
              <span className="font-mono font-extrabold text-slate-950 text-sm">{formatPrice(product.price * purchaseQuantity)}</span>
            </div>
            
            <button
              onClick={triggerAddToCart}
              className="px-5 py-3 bg-slate-950 text-white font-sans text-[10px] font-bold rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-widest shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center animate-fadeIn select-none">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors p-2 cursor-pointer z-55"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-4xl max-h-[85vh] flex items-center justify-center p-4">
            {/* Prev Arrow */}
            <button 
              onClick={() => setLightboxIndex(prev => (prev > 0 ? prev - 1 : safeImages.length - 1))}
              className="absolute left-4 md:left-6 text-white hover:text-slate-300 transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm cursor-pointer z-55"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img 
              src={safeImages[lightboxIndex]} 
              alt={product.name} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error(`Failed to load lightbox image: ${e.currentTarget.src}`);
                e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
              }}
            />

            {/* Next Arrow */}
            <button 
              onClick={() => setLightboxIndex(prev => (prev < safeImages.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 md:right-6 text-white hover:text-slate-300 transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm cursor-pointer z-55"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Image Counter & Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <span className="text-white/60 text-xs font-mono">
              {lightboxIndex + 1} / {safeImages.length}
            </span>
            <div className="flex gap-2">
              {safeImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${lightboxIndex === idx ? 'bg-white scale-120' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
