/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../data';
import { 
  Sparkles, Star, ShoppingBag, Eye, Heart, 
  ChevronRight, ArrowRight, Clock, Mail, Instagram,
  Shirt, Laptop, Sofa, Dumbbell, Coffee, Gamepad, BookOpen, Gift, Tag, Car, Dog,
  Lock, RotateCcw, Truck, ShieldCheck, HelpCircle
} from 'lucide-react';
import ProductCard from './ProductCard';

interface HomePageProps {
  onNavigateToShop: (category?: string) => void;
  onNavigateToProduct: (id: string) => void;
  onAddToCart: (p: Product, color: string, size: string) => void;
  onAddToWishlist: (p: Product) => void;
  products: Product[];
  wishlistIds: string[];
}

const VISUAL_CATEGORIES = [
  { 
    name: 'Fashion', 
    sub: 'Premium apparel & timeless wardrobe essentials', 
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800', 
    tag: '01 / APPAREL',
    span: 'col-span-1 sm:col-span-2 xl:col-span-8',
    height: 'h-[360px]'
  },
  { 
    name: 'Electronics', 
    sub: 'Premium audio, smart devices & workspace hardware', 
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', 
    tag: '02 / TECH',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[360px]'
  },
  { 
    name: 'Beauty & Personal Care', 
    sub: 'Organic botanical skincare & luxury grooming', 
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600', 
    tag: '03 / SELF CARE',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[380px]'
  },
  { 
    name: 'Home & Living', 
    sub: 'Minimalist furniture, curated decor & soft textiles', 
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600', 
    tag: '04 / DWELL',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[380px]'
  },
  { 
    name: 'Kitchen & Dining', 
    sub: 'Artisan tableware, premium cookware & coffee crafts', 
    img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600', 
    tag: '05 / FEAST',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[380px]'
  },
  { 
    name: 'Sports & Fitness', 
    sub: 'High-performance athletic gear & studio equipment', 
    img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600', 
    tag: '06 / MOVEMENT',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[320px]'
  },
  { 
    name: 'Books & Stationery', 
    sub: 'Fine journals, writing instruments & premium reads', 
    img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', 
    tag: '07 / MIND',
    span: 'col-span-1 sm:col-span-2 xl:col-span-8',
    height: 'h-[320px]'
  },
  { 
    name: 'Pet Supplies', 
    sub: 'Premium nutrition, luxury leather collars & beds', 
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600', 
    tag: '08 / COMPANION',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[360px]'
  },
  { 
    name: 'Automotive', 
    sub: 'Sleek driving tools, interior care & hardware', 
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600', 
    tag: '09 / MOTIVE',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[360px]'
  },
  { 
    name: 'Accessories', 
    sub: 'Curated watches, fine leather goods & eyewear', 
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', 
    tag: '10 / STYLE',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[360px]'
  },
  { 
    name: 'Baby & Kids', 
    sub: 'Sustainable wooden toys, apparel & soft blankets', 
    img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600', 
    tag: '11 / FAMILY',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[340px]'
  },
  { 
    name: 'Gaming', 
    sub: 'Mechanical keycaps, high-performance mice & consoles', 
    img: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&q=80&w=600', 
    tag: '12 / INTERACTIVE',
    span: 'col-span-1 sm:col-span-2 xl:col-span-8',
    height: 'h-[340px]'
  }
];

export default function HomePage({ 
  onNavigateToShop, onNavigateToProduct, onAddToCart, onAddToWishlist, products, wishlistIds 
}: HomePageProps) {
  
  // Flash Deal Timer state (simulating countdown)
  const [timeLeft, setTimeLeft] = useState({ hrs: 4, mins: 12, secs: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: 4, mins: 12, secs: 45 }; // Reset for simulation
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Email state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Filter lists for specials
  const flashDeals = products.filter(p => p.isFlashDeal);
  const featured = products.filter(p => p.isFeatured);
  const newArrivals = products.filter(p => p.isNew);
  const bestSellers = products.filter(p => p.rating >= 4.7).slice(0, 4);
  const trendingNow = products.filter(p => p.reviewCount >= 10).slice(0, 4);
  const recommendedForYou = products.filter(p => p.isFeatured && !p.isFlashDeal).slice(0, 3);
  
  // Popular brands helper
  const popularBrands = Array.from(new Set(products.map(p => p.brand))).slice(0, 6);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const quickCategories = [
    { name: 'Fashion', icon: <Shirt className="w-3.5 h-3.5" />, color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200' },
    { name: 'Electronics', icon: <Laptop className="w-3.5 h-3.5" />, color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
    { name: 'Beauty & Personal Care', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200' },
    { name: 'Home & Living', icon: <Sofa className="w-3.5 h-3.5" />, color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
    { name: 'Kitchen & Dining', icon: <Coffee className="w-3.5 h-3.5" />, color: 'hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200' },
    { name: 'Sports & Fitness', icon: <Dumbbell className="w-3.5 h-3.5" />, color: 'hover:bg-red-50 hover:text-red-700 hover:border-red-200' },
    { name: 'Books & Stationery', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200' },
    { name: 'Pet Supplies', icon: <Dog className="w-3.5 h-3.5" />, color: 'hover:bg-amber-100 hover:text-amber-800 hover:border-amber-300' },
    { name: 'Automotive', icon: <Car className="w-3.5 h-3.5" />, color: 'hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300' },
    { name: 'Accessories', icon: <Tag className="w-3.5 h-3.5" />, color: 'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200' },
    { name: 'Baby & Kids', icon: <Gift className="w-3.5 h-3.5" />, color: 'hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200' },
    { name: 'Gaming', icon: <Gamepad className="w-3.5 h-3.5" />, color: 'hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200' }
  ];

  const handleExploreCategories = () => {
    const element = document.getElementById('quick-categories-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div id="homepage-root" className="space-y-12 md:space-y-16 font-sans">
      
      {/* 1. PREMIUM EDITORIAL HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-white p-6 sm:p-8 md:p-10 lg:p-12 border border-slate-100 shadow-sm transition-all">
        {/* Soft atmospheric gradient blur circles */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-50/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-50/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Textual content */}
          <div className="lg:col-span-6 space-y-4 text-left">
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Discover Everything <br />
              You Love, <span className="text-blue-600">All in One Place.</span>
            </h1>
            
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-lg">
              From fashion and tech to home essentials, beauty, toys, and everyday must-haves—DreamShelf brings quality products together in one trusted marketplace.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                id="hero-shop-now-btn"
                onClick={() => onNavigateToShop()}
                className="px-8 py-4 bg-slate-950 text-white font-sans text-xs font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-98"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                id="hero-explore-categories-btn"
                onClick={handleExploreCategories}
                className="px-8 py-4 bg-white text-slate-800 font-sans text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1 uppercase tracking-wider cursor-pointer active:scale-98"
              >
                Explore Categories
              </button>
            </div>
          </div>

          {/* Right Column: Visually Balanced Lifestyle Collage (7 Categories represented with gorgeous offset grids) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-3 w-full max-w-md mx-auto relative select-none">
              {/* Decor atmospheric accent */}
              <div className="absolute inset-0 bg-slate-100/40 rounded-3xl -z-20 transform scale-102 blur-lg pointer-events-none" />

              {/* 1. Fashion (Tall centerpiece) */}
              <div className="col-span-6 row-span-2 h-64 sm:h-72 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=350" 
                  alt="Apparel & Fashion" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="block text-[8px] font-mono text-blue-300 uppercase tracking-widest font-bold">01 / FASHION</span>
                  <span className="block text-xs font-sans font-extrabold">Atelier Apparel</span>
                </div>
              </div>

              {/* 2. Electronics */}
              <div className="col-span-6 h-30 sm:h-34 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=350" 
                  alt="Sleek Electronics" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="block text-[8px] font-mono text-blue-300 uppercase tracking-widest font-bold">02 / ELECTRONICS</span>
                  <span className="block text-xs font-sans font-extrabold">Spatial Acoustics</span>
                </div>
              </div>

              {/* 3. Beauty */}
              <div className="col-span-6 h-30 sm:h-34 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=350" 
                  alt="Aesthetic Beauty Products" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="block text-[8px] font-mono text-blue-300 uppercase tracking-widest font-bold">03 / BEAUTY</span>
                  <span className="block text-xs font-sans font-extrabold">Skincare & Beauty</span>
                </div>
              </div>

              {/* 4. Home Decor */}
              <div className="col-span-4 h-30 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=250" 
                  alt="Modern Home Decor" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <span className="block text-[7px] font-mono text-blue-300 uppercase tracking-widest font-bold">04 / HOME & LIVING</span>
                </div>
              </div>

              {/* 5. Kitchen Essentials */}
              <div className="col-span-4 h-30 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=250" 
                  alt="Artisan Tableware & Kitchen" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <span className="block text-[7px] font-mono text-blue-300 uppercase tracking-widest font-bold">05 / KITCHEN & DINING</span>
                </div>
              </div>

              {/* 6. Fitness */}
              <div className="col-span-4 h-30 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=250" 
                  alt="High-performance fitness gear" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <span className="block text-[7px] font-mono text-blue-300 uppercase tracking-widest font-bold">06 / SPORTS & FITNESS</span>
                </div>
              </div>

              {/* 7. Toys & Games */}
              <div className="col-span-12 h-24 rounded-2xl overflow-hidden relative group border border-slate-100/80 shadow-inner-sm hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600" 
                  alt="Premium Wooden Toys" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-50 group-hover:opacity-65 transition-opacity" />
                <div className="absolute bottom-3 left-4 text-white">
                  <span className="block text-[8px] font-mono text-blue-300 uppercase tracking-widest font-bold">07 / BABY & KIDS</span>
                  <span className="block text-xs font-sans font-extrabold">Sustainable Family Crafts</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Elegant Quick-Access Category Chips Section */}
        <div id="quick-categories-section" className="pt-5 md:pt-6 border-t border-slate-100 mt-6 md:mt-8 space-y-3">
          <div className="flex items-center gap-2 select-none">
            <span className="h-px w-6 bg-slate-200"></span>
            <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest">Instant Curated Gateways</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickCategories.map((cat) => (
              <button
                id={`hero-chip-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={cat.name}
                onClick={() => onNavigateToShop(cat.name)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-sans font-bold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${cat.color}`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* 2. TRENDING BENTO CATEGORIES GRID */}
      <section id="shop-by-categories-section" className="space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-5 gap-4">
          <div>
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block mb-1">VISUAL CATALOG DIRECTORY</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Shop by Categories</h2>
          </div>
          <button 
            onClick={() => onNavigateToShop()} 
            className="group text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors w-fit"
          >
            EXPLORE THE FULL CATALOG <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Masonry-Style Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-max">
          {VISUAL_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              id={`category-masonry-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onNavigateToShop(cat.name)}
              className={`${cat.span} ${cat.height} group relative rounded-3xl overflow-hidden cursor-pointer border border-slate-200/50 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl`}
            >
              {/* Subtle dark overlay with vignette gradient for premium, high-contrast feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/15 group-hover:via-slate-950/35 transition-all duration-500 z-10" />
              
              {/* Image with zoom transition */}
              <img 
                src={cat.img} 
                alt={cat.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.03]" 
              />
              
              {/* Floating Monospaced Tag */}
              <div className="absolute top-5 right-5 z-20 bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold text-white tracking-widest select-none">
                {cat.tag}
              </div>

              {/* Bottom Details Content */}
              <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end gap-4">
                <div className="text-white space-y-1 max-w-[80%]">
                  <h3 className="font-sans text-xl md:text-2xl font-extrabold tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="font-sans text-xs text-slate-200/90 font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {cat.sub}
                  </p>
                </div>
                
                {/* Modern Elegant "Explore" Button with sliding action */}
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105">
                    <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS COUNTER GRID */}
      {flashDeals.length > 0 && (
        <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-84 h-84 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Flash Info & Clock */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> FLASH OFFERS
              </div>
              <h3 className="font-sans text-3xl font-bold tracking-tight text-white leading-none">Limited Drops Clock</h3>
              <p className="text-blue-200/70 text-xs">High-end accessories with exclusive credits deductions. Drops close when the timer settles.</p>
              
              {/* Clock Timer */}
              <div className="flex gap-2 pt-2 text-center">
                {[
                  { label: 'Hrs', val: timeLeft.hrs },
                  { label: 'Mins', val: timeLeft.mins },
                  { label: 'Secs', val: timeLeft.secs }
                ].map((unit, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl shrink-0 min-w-[50px]">
                    <span className="font-mono text-xl font-bold text-blue-400 block">
                      {unit.val.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase text-slate-400 font-sans block">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Spotlights */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flashDeals.map((p, idx) => (
                <div id={`flash-deal-card-${p.id}`} key={idx} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex gap-4 items-center group relative overflow-hidden">
                  <img src={p.images[0]} alt="" className="w-20 h-20 object-cover rounded-xl border border-slate-800 bg-white" />
                  <div className="space-y-1 text-xs">
                    <span className="font-mono text-[9px] text-blue-400 block font-bold">-{p.discountPercent}% COMPLIMENTARY</span>
                    <h4 className="font-sans font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                    <div className="flex gap-2 items-baseline font-mono text-xs">
                      <span className="font-bold text-white">${p.price}</span>
                      {p.originalPrice && (
                        <span className="text-slate-500 line-through text-[10px]">${p.originalPrice}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => onNavigateToProduct(p.id)}
                      className="text-[10px] text-blue-400 font-mono uppercase tracking-wider font-bold flex items-center gap-0.5 hover:text-white pt-1.5 cursor-pointer"
                    >
                      Inspect Drop <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. NEW ARRIVALS HORIZONTAL CAROUSEL */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">FRESH LOGISTICS</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">The Autumn Catalogue</h2>
          </div>
          <button onClick={() => onNavigateToShop()} className="text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1">
            VIEW ALL DROPS <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Frame */}
        <div className="overflow-x-auto whitespace-nowrap pb-4 flex gap-6 scrollbar-hide">
          {newArrivals.map((p) => {
            const isWish = wishlistIds.includes(p.id);
            return (
              <div 
                key={p.id}
                className="inline-block w-64 shrink-0 whitespace-normal text-left"
              >
                <ProductCard
                  product={p}
                  isWish={isWish}
                  onNavigateToProduct={onNavigateToProduct}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">VOLUME FAVORITES</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Best Sellers</h2>
          </div>
          <button onClick={() => onNavigateToShop()} className="text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1">
            VIEW ALL BEST SELLERS <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((p) => {
            const isWish = wishlistIds.includes(p.id);
            return (
              <ProductCard
                key={p.id}
                product={p}
                isWish={isWish}
                onNavigateToProduct={onNavigateToProduct}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            );
          })}
        </div>
      </section>

      {/* TRENDING NOW SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">SOCIAL HEATMAP</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Trending Now</h2>
          </div>
          <button onClick={() => onNavigateToShop()} className="text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1">
            VIEW TRENDING CATALOG <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingNow.map((p) => {
            const isWish = wishlistIds.includes(p.id);
            return (
              <ProductCard
                key={p.id}
                product={p}
                isWish={isWish}
                onNavigateToProduct={onNavigateToProduct}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
              />
            );
          })}
        </div>
      </section>

      {/* RECOMMENDED FOR YOU (PERSONALIZED ENGAGEMENT GRID) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">TAILORED ARCHIVE</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Recommended For You</h2>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-600 font-bold bg-blue-50/80 border border-blue-100 px-2.5 py-1 rounded-full animate-pulse select-none">
            <Sparkles className="w-3 h-3" /> MATCH INDEX: 98%
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Personalized Banner */}
          <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl flex flex-col justify-between space-y-6 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3">
              <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider block">PREFERENCE PROFILE</span>
              <h3 className="font-sans text-lg font-extrabold text-slate-900 tracking-tight leading-snug">Personalized Curation Match</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Based on your active browsing and styling orientation, our smart system has prepared a premium catalog capsule matching your aesthetic interests.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-3 rounded-xl text-[10px] font-mono font-bold text-slate-700 flex justify-between">
                <span>STYLE PREFERENCE:</span>
                <span className="text-blue-600">MODERN CAPSULE</span>
              </div>
              <button 
                onClick={() => {
                  const element = document.getElementById('shop-by-categories-section');
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="w-full py-3 bg-slate-950 hover:bg-blue-600 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-sm uppercase tracking-wider text-center cursor-pointer"
              >
                Refine Preferences
              </button>
            </div>
          </div>

          {/* Curated Products */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommendedForYou.map((p) => {
              const isWish = wishlistIds.includes(p.id);
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWish={isWish}
                  onNavigateToProduct={onNavigateToProduct}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED EDITORIAL COLLECTIONS */}
      <section className="space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">EDITORIAL DIRECTION</span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Featured Collections</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "The Silent Workspace",
              sub: "Acoustic devices & tactile keyboards",
              img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600",
              category: "Electronics"
            },
            {
              title: "Modern Living Archive",
              sub: "Brutalist ceramic art & spatial accessories",
              img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
              category: "Home Decor"
            },
            {
              title: "Sartorial Simplicity",
              sub: "Luxury capsule tailoring & organic cotton items",
              img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600",
              category: "Fashion"
            }
          ].map((col, idx) => (
            <div 
              key={idx}
              onClick={() => onNavigateToShop(col.category)}
              className="h-80 rounded-3xl overflow-hidden relative group cursor-pointer border border-slate-200/50 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent group-hover:via-slate-950/30 transition-all z-10" />
              <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-1 text-left text-white">
                <span className="font-mono text-[9px] text-blue-300 font-bold uppercase tracking-widest block">COLLECTION {idx + 1}</span>
                <h3 className="font-sans text-lg font-extrabold tracking-tight leading-tight">{col.title}</h3>
                <p className="text-xs text-slate-200/90 leading-tight font-medium">{col.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR BRANDS MARQUEE GRID */}
      <section className="space-y-6">
        <div className="border-b border-slate-100 pb-4 text-center md:text-left">
          <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">TRUSTED CURATORS</span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Popular Brands</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularBrands.map((brand, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateToShop(brand)}
              className="bg-white hover:bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer group"
            >
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest transition-colors block">
                {brand}
              </span>
              <span className="text-[8px] text-slate-400 font-sans block mt-1 uppercase">EST. ARCHIVE</span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. WHY SHOP DREAM SHELF? */}
      <section className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm transition-all">
        <div className="absolute top-0 right-0 w-84 h-84 bg-blue-50/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">CUSTOMER FIRST EXPERIENCE</span>
            <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Why Shop DreamShelf?</h3>
            <p className="text-slate-500 text-xs max-w-lg mx-auto">We are committed to delivering an exceptional, reliable, and premium online shopping experience with every order.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck className="w-6 h-6 text-blue-600" />,
                title: "Fast Nationwide Delivery",
                desc: "Express shipping directly to your doorstep in United Kingdom with real-time transit tracking and zero delay."
              },
              {
                icon: <Lock className="w-6 h-6 text-blue-600" />,
                title: "Secure Payments",
                desc: "Fully encrypted transaction channels including Cash on Delivery (COD) and secured card processing."
              },
              {
                icon: <RotateCcw className="w-6 h-6 text-blue-600" />,
                title: "Easy Returns",
                desc: "Hassle-free 30-day complimentary return collection service if you are not fully satisfied."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
                title: "Quality Assured Products",
                desc: "100% authentic inventory sourced directly from trusted global brands and verified partners."
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50/60 hover:bg-white border border-slate-100 hover:border-blue-100 p-6 rounded-2xl text-center sm:text-left space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-pointer"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-inner-sm flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-blue-50/50 transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-sm text-slate-900 tracking-tight">{feature.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INSTAGRAM SOCIAL STYLE JOURNAL & testimonials */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        {/* Testimonials */}
        <div className="space-y-6">
          <div>
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">CLIENT STORIES</span>
            <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-none">Curator Endorsements</h3>
          </div>
          
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <p className="text-slate-500 text-xs italic leading-relaxed">"DreamShelf completely solved my workspace aesthetic. No more browsing through endless standard e-commerce pages. The brutalist terracotta vases drapes drapes beautifully."</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-sans text-xs font-bold flex items-center justify-center">MR</div>
              <div>
                <span className="font-sans font-bold text-slate-900 text-xs block">Marcus Ross</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Verified Curator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 font-sans font-bold text-slate-800 text-sm">
            <Instagram className="w-4 h-4 text-blue-600" /> Style Journal #DreamShelfStudio
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
              'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=400',
              'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400'
            ].map((img, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200/50 relative group cursor-pointer shadow-sm">
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all" />
                <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MINIMALIST NEWSLETTER FORM */}
      <section className="bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="max-w-md space-y-2 text-center md:text-left relative z-10">
          <h3 className="font-sans font-extrabold text-slate-950 text-xl md:text-2xl tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-5 h-5 text-blue-600" /> Join The Vanguard Circle
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">Sign up to receive limited drops notification, VIP points multiplier alerts, and boutique lifestyle essays.</p>
        </div>

        <div className="w-full max-w-sm shrink-0 relative z-10">
          <form onSubmit={handleSubscribe} className="flex bg-white border border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm">
            <input 
              type="email" 
              required
              placeholder="ENTER EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-3 text-xs font-mono focus:outline-none placeholder-slate-400 uppercase"
            />
            <button 
              id="newsletter-sub-btn"
              type="submit" 
              className="px-4 py-2 bg-slate-900 text-white hover:bg-blue-600 text-xs font-sans font-bold rounded-lg transition-all shadow-sm"
            >
              SUBSCRIBE
            </button>
          </form>

          {subscribed && (
            <div id="newsletter-success-alert" className="absolute top-full left-0 right-0 mt-2 bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-center text-[10px] font-semibold text-blue-800 font-mono uppercase tracking-wide">
              WELCOME TO THE VANGUARD CIRCLE!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
