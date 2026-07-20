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
  CheckCircle, Truck, RefreshCw, Award, ArrowRight, Sparkles, MessageSquarePlus
} from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (p: Product, color: string, size: string) => void;
  onAddToWishlist: (p: Product) => void;
  onNavigateToProduct: (id: string) => void;
  isInWishlist: boolean;
  onBackToShop?: () => void;
}

export default function ProductDetails({ 
  product, onAddToCart, onAddToWishlist, onNavigateToProduct, isInWishlist, onBackToShop 
}: ProductDetailsProps) {
  const [activeImg, setActiveImg] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  
  // Hover Magnifier Zoom States
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  // Interactive 360 viewer state
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Dynamic reviews state to allow writing real-time appraisals
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Bundle Selector (Frequently bought together)
  const bundleCompanion = PRODUCTS.find(p => p.id !== product.id) || PRODUCTS[1];
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Sync state if product changes
  useEffect(() => {
    setActiveImg(product.images[0]);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[0]);
    setReviewsList(product.reviews);
    setIs360Mode(false);
  }, [product]);

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
    onAddToCart(bundleCompanion, bundleCompanion.colors[0], bundleCompanion.sizes[0]);
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

  // Recommendations: Customers Also Viewed (3 similar items based on category)
  const customersAlsoViewed = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  
  // Recommendations: Recently Viewed pieces (3 different items)
  const recentlyViewed = PRODUCTS.filter(p => p.id !== product.id && p.category !== product.category).slice(0, 3);

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
        <div className="space-y-4">
          <div 
            className="relative bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/50 aspect-square flex items-center justify-center cursor-crosshair group shadow-inner"
            onMouseMove={handleMouseMoveZoom}
            onMouseLeave={handleMouseLeaveZoom}
          >
            {!is360Mode ? (
              <>
                <img 
                  src={activeImg} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-0"
                  referrerPolicy="no-referrer"
                />
                {/* Simulated Lens Zoom Element */}
                <div 
                  className="absolute inset-0 pointer-events-none hidden group-hover:block transition-all duration-150"
                  style={zoomStyle}
                />
                <div className="absolute top-4 right-4 bg-slate-950/80 text-white font-mono text-[8px] font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  HOVER TO ZOOM
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
                  <img src={product.images[0]} alt="" className="w-44 h-44 object-contain p-2" />
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
              onClick={() => setIs360Mode(!is360Mode)}
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-slate-950 hover:text-white border border-slate-200 px-3.5 py-2 rounded-xl text-slate-900 shadow-md transition-all flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer z-20"
            >
              <Rotate3d className={`w-3.5 h-3.5 ${is360Mode ? 'text-blue-500 animate-spin' : ''}`} />
              {is360Mode ? 'Standard Gallery' : 'Interactive 360°'}
            </button>
          </div>

          {/* Thumbnail Strip */}
          {!is360Mode && (
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img, index) => (
                <button
                  id={`thumb-btn-${index}`}
                  key={index}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                    activeImg === img 
                      ? 'border-blue-650 border-blue-600 ring-2 ring-blue-50' 
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Column: Title, variants, story, spec cards */}
        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest block">{product.brand}</span>
            <h1 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-none">
              {product.name}
            </h1>
            
            {/* Price and Rating */}
            <div className="flex items-center gap-4 pt-1">
              <span className="font-mono text-2xl font-bold text-slate-950">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="font-mono text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              <div className="flex items-center gap-1 text-amber-500 font-mono text-xs">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-slate-900">{product.rating}</span>
                <span className="text-slate-400">({reviewsList.length} Appraisals)</span>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed font-sans">{product.description}</p>

          {/* Sourcing & Seller Integrity Card */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-start">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-900 block font-sans">Seller: DreamShelf Archive Direct</span>
              <p className="text-slate-400 leading-normal font-sans">Artisan Certified catalog items with authentic certifications, 12-month boutique warranty, and hassle-free returns.</p>
            </div>
          </div>

          {/* Variants Segment Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Color circles */}
            <div>
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">Select Aesthetic tone: {selectedColor}</span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    id={`color-btn-${color}`}
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sans border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                        : 'border-slate-200 hover:border-slate-400 text-slate-600 bg-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing blocks */}
            <div>
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">Select Dimension / Size: {selectedSize}</span>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    id={`size-btn-${size}`}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-50'
                        : 'border-slate-200 hover:border-slate-400 text-slate-600 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="details-add-to-cart"
              onClick={triggerAddToCart}
              className="flex-1 py-4 bg-slate-950 text-white font-sans text-xs font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" /> ADD TO SHOPPING BAG
            </button>
            <button
              id="details-add-to-wish"
              onClick={() => onAddToWishlist(product)}
              className={`p-4 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isInWishlist 
                  ? 'bg-red-50 text-red-600 border-red-100 shadow-sm scale-102' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:scale-102'
              }`}
            >
              <Heart className={`w-4.5 h-4.5 ${isInWishlist ? 'fill-red-600' : ''}`} />
            </button>
          </div>

          {isAddedToCart && (
            <div id="item-added-alert" className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] py-2.5 px-4 rounded-xl text-center font-bold font-mono tracking-wider uppercase animate-fadeIn">
              ✓ PIECE ADDED TO BAG SUCCESSFULY
            </div>
          )}

          {/* Trust Badges Bar */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans text-[11px] text-slate-500 leading-relaxed">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Dispatch transit
              </span>
              Arrives: {product.estimatedDelivery || 'Complimentary 3 Days'}
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Easy returns
              </span>
              Full 30-day trial refund guarantee.
            </div>
          </div>
        </div>
      </div>

      {/* Narrative & Specification Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100 text-left">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-lg mb-3">Product Narrative & Inspiration</h3>
          <p className="text-slate-500 text-xs leading-relaxed font-sans">{product.productStory || "Our catalog story investigates design inspirations, handcrafting techniques, and sustainable sourcing methodologies."}</p>
          
          {product.features && (
            <div className="mt-6 space-y-2">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Featured Attributes</span>
              <ul className="space-y-2 text-xs font-sans text-slate-600 list-disc pl-4 leading-normal">
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-sans font-bold text-slate-900 text-lg mb-3">Specifications Matrix</h3>
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <tbody className="divide-y divide-slate-50 text-slate-750 text-slate-700">
                {Object.entries(product.specs).map(([key, val], idx) => (
                  <tr id={`spec-row-${idx}`} key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 font-mono text-[9px] uppercase w-1/3 tracking-wider bg-slate-50/30">{key}</td>
                    <td className="p-3.5 text-slate-500">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <img src={product.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">{product.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{formatPrice(product.price)}</span>
              </div>
            </div>

            <span className="text-slate-300 text-lg font-bold font-mono">+</span>

            {/* Companion Item */}
            <div className="flex items-center gap-3">
              <img src={bundleCompanion.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white" />
              <div>
                <span className="font-bold text-slate-900 block text-xs">{bundleCompanion.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{formatPrice(bundleCompanion.price)}</span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-3">
            <div className="font-sans text-xs">
              <span className="text-slate-400">Coordinated Bundle Price (10% off): </span>
              <span className="font-mono font-bold text-slate-900 text-base ml-1">
                {formatPrice(Math.round((product.price + bundleCompanion.price) * 0.9))}
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
        <div>
          <h3 className="font-sans font-bold text-slate-950 text-lg">Customers Also Viewed</h3>
          <p className="text-slate-400 text-xs mt-0.5">Other pieces frequently inspected by searchers of this brand.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customersAlsoViewed.map((item) => (
            <div 
              key={item.id}
              onClick={() => onNavigateToProduct(item.id)}
              className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50">
                  <img src={item.images[0]} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-102" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="uppercase font-bold">{item.brand}</span>
                    <span className="text-slate-900 font-bold font-mono">{formatPrice(item.price)}</span>
                  </div>
                  <h4 className="font-sans font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENTLY VIEWED PRODUCTS BLOCK */}
      <div className="space-y-6 pt-12 border-t border-slate-100 text-left">
        <div>
          <h3 className="font-sans font-bold text-slate-950 text-lg">Recently Viewed Catalog Pieces</h3>
          <p className="text-slate-400 text-xs mt-0.5">Your browsing footprint from current and past curation periods.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentlyViewed.map((item) => (
            <div 
              key={item.id}
              onClick={() => onNavigateToProduct(item.id)}
              className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50">
                  <img src={item.images[0]} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-102" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="uppercase font-bold">{item.brand}</span>
                    <span className="text-slate-900 font-bold font-mono">{formatPrice(item.price)}</span>
                  </div>
                  <h4 className="font-sans font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Feedback section with Interactive review submission */}
      <div className="space-y-8 pt-12 border-t border-slate-100 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-lg">Client Appraisals ({reviewsList.length})</h3>
            <p className="text-xs text-slate-400 mt-0.5">Verified purchasing experiences and aesthetic feedback.</p>
          </div>
          
          <div className="flex items-center gap-1 text-amber-500 font-mono text-sm bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="font-bold text-slate-900">{product.rating} / 5.0</span>
            <span className="text-slate-400 text-xs ml-1">cumulative brand score</span>
          </div>
        </div>

        {/* List of client appraisals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewsList.map((r) => (
            <div id={`review-card-${r.id}`} key={r.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-sans text-xs font-bold text-slate-750 text-slate-800">
                    {r.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-sans font-extrabold text-slate-900 text-xs block">{r.username}</span>
                    <span className="font-mono text-[9px] text-slate-400">{r.date}</span>
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

        {/* WRITE AN APPRAISAL FORM */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-slate-950 text-sm flex items-center gap-2">
              <MessageSquarePlus className="w-4.5 h-4.5 text-blue-600" /> Write a verified Appraisal
            </h4>
            <p className="text-slate-400 text-xs font-sans">Submit your verified user experience, sizing details, and color appraisal.</p>
          </div>

          {reviewSuccess ? (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs py-3.5 px-4 rounded-xl text-center font-bold font-mono tracking-wider uppercase animate-fadeIn">
              ✓ THANK YOU! APPRAISAL HAS BEEN ADDED TO CATALGOE SUCCESSFULY
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Appraisal comments</label>
                <textarea 
                  rows={3}
                  required 
                  placeholder="Describe details regarding craftmanship quality, tactile feedback, and size coordinates..."
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <button 
                type="submit" 
                className="px-6 py-2.5 bg-slate-950 text-white hover:bg-blue-600 rounded-xl font-bold uppercase tracking-wider font-sans transition-colors cursor-pointer text-[10px]"
              >
                SUBMIT CATALOG APPRAISAL
              </button>
            </form>
          )}
        </div>
      </div>

      {/* MOBILE STICKY ADD TO BAG STRIP */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 lg:hidden flex justify-between items-center shadow-lg animate-slideUp">
        <div className="text-left font-sans text-xs">
          <span className="text-slate-400 block truncate max-w-[150px] font-bold">{product.name}</span>
          <span className="font-mono font-bold text-slate-950 text-sm">{formatPrice(product.price)}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAddToWishlist(product)}
            className={`p-3 rounded-xl border transition-colors ${isInWishlist ? 'bg-red-50 text-red-600 border-red-100' : 'border-slate-250 border-slate-200 bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-600' : ''}`} />
          </button>
          <button
            onClick={triggerAddToCart}
            className="px-5 py-3 bg-slate-950 text-white font-sans text-[10px] font-bold rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-wider shadow-md"
          >
            ADD TO BAG
          </button>
        </div>
      </div>

    </div>
  );
}
