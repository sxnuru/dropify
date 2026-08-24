/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils/currency';
import { 
  Sparkles, Star, ShoppingBag, Eye, Heart, 
  ChevronRight, ArrowRight, Clock, Mail, Instagram,
  Shirt, Laptop, Sofa, Dumbbell, Coffee, Gamepad, BookOpen, Gift, Tag, Car, Dog,
  Lock, RotateCcw, Truck, ShieldCheck, HelpCircle
} from 'lucide-react';
import ProductCard from './ProductCard';
import CategoryArtwork, { CategoryShowcaseCard } from './CategoryArtwork';
import { getProductImage, isFallbackImage } from '../utils/image';
import { 
  getFeaturedProducts, 
  getFlashDealProducts, 
  getNewProducts, 
  getCategoryProductCount,
  getProductsByCategory
} from '../lib/products';

interface HomePageProps {
  onNavigateToShop: (category?: string) => void;
  onNavigateToProduct: (id: string) => void;
  onAddToCart: (p: Product, color: string, size: string) => void;
  onAddToWishlist: (p: Product) => void;
  products?: Product[];
  wishlistIds: string[];
}

const VISUAL_CATEGORIES = [
  { 
    name: 'Fashion', 
    sub: 'Premium apparel, everyday essentials & timeless wardrobe curation', 
    tag: '01 / APPAREL',
    span: 'col-span-1 sm:col-span-2 xl:col-span-8',
    height: 'h-[360px]',
  },
  { 
    name: 'Electronics', 
    sub: 'Premium audio, smart devices & workspace hardware', 
    tag: '02 / TECH',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[360px]',
  },
  { 
    name: 'Sports & Outdoors', 
    sub: 'High-performance athletic gear & premium outdoor accessories', 
    tag: '03 / MOVEMENT',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[380px]',
  },
  { 
    name: 'Home & Garden', 
    sub: 'Minimalist living, curated decor & premium soft textiles', 
    tag: '04 / DWELL',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[380px]',
  },
  { 
    name: 'Toys & Games', 
    sub: 'Retro play, classic board games & collectible treasures', 
    tag: '05 / PLAY',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[380px]',
  },
  { 
    name: 'Health & Personal Care', 
    sub: 'Daily wellness, self-care essentials & first aid', 
    tag: '06 / WELLNESS',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[320px]',
  },
  { 
    name: 'Food & Grocery', 
    sub: 'Premium pantry, organic selections & gourmet provisions', 
    tag: '07 / PANTRY',
    span: 'col-span-1 sm:col-span-2 xl:col-span-8',
    height: 'h-[320px]',
  },
  { 
    name: 'Other', 
    sub: 'Unique boutique finds & special curations', 
    tag: '08 / SPECIAL',
    span: 'col-span-1 sm:col-span-1 xl:col-span-4',
    height: 'h-[360px]',
  }
];

const EditorialCollage = ({ products }: { products: Product[] }) => {
  const validImages: string[] = [];
  const seenUrls = new Set<string>();
  
  products.forEach(p => {
    const img = getProductImage(p);
    if (img && img !== "/images/product-placeholder.svg" && !img.startsWith("data:") && !seenUrls.has(img)) {
      validImages.push(img);
      seenUrls.add(img);
    }
  });

  const imgs = validImages.slice(0, 4);

  if (imgs.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-sans font-bold text-xs select-none">
        No Images Available
      </div>
    );
  }

  if (imgs.length === 1) {
    return (
      <img 
        src={imgs[0]} 
        alt="" 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
      />
    );
  }

  if (imgs.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 w-full h-full bg-slate-100">
        <img src={imgs[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <img src={imgs[1]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>
    );
  }

  if (imgs.length === 3) {
    return (
      <div className="grid grid-cols-3 gap-2 w-full h-full bg-slate-100">
        <div className="col-span-2 h-full overflow-hidden">
          <img src={imgs[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <img src={imgs[1]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          <img src={imgs[2]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full bg-slate-100">
      <img src={imgs[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      <img src={imgs[1]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      <img src={imgs[2]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      <img src={imgs[3]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
    </div>
  );
};

const getEditorial1Description = (products: Product[]) => {
  if (products.length === 0) {
    return "Curated minimal workspace essentials. Investigate premium sound-isolated headphones, desk accessories, and custom mechanical keycaps designed to optimize focus.";
  }
  const topProducts = products.slice(0, 3);
  const brands = Array.from(new Set(products.map(p => p.brand))).slice(0, 3).join(", ");
  return `Explore our premium office and acoustic catalog featuring handpicked innovations from ${brands}. Discover essentials like the ${topProducts[0]?.name || 'latest electronics'} and other high-fidelity gear engineered to optimize focus.`;
};

const getEditorial2Description = (products: Product[]) => {
  if (products.length === 0) {
    return "Elevate your autumn styling profile. Timeless tailored silhouettes, premium organic cotton items, and aesthetic boutique statement pieces built for comfort.";
  }
  const topProducts = products.slice(0, 3);
  const brands = Array.from(new Set(products.map(p => p.brand))).slice(0, 3).join(", ");
  return `Elevate your styling profile with our seasonal fashion catalog featuring premium designs from ${brands}. Discover aesthetic boutique arrivals like the ${topProducts[0]?.name || 'timeless statement pieces'} built for comfort and style.`;
};

export default function HomePage({ 
  onNavigateToShop, onNavigateToProduct, onAddToCart, onAddToWishlist, products, wishlistIds 
}: HomePageProps) {
  
  // Flash Deal Timer state (simulating countdown)
  const [timeLeft, setTimeLeft] = useState({ hrs: 4, mins: 12, secs: 45 });
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [
    {
      title: "Designed for Everyday Living.",
      eyebrow: "Workspace Collection",
      headline2: "Curated Spaces.",
      image: "/hero_main.png",
      category: "Electronics",
      cta: "Shop Collection",
      overlayFrom: "from-slate-950/85",
      overlayTo: "to-slate-950/10",
      textLight: true
    },
    {
      title: "Minimal Design.",
      eyebrow: "Contemporary Wardrobe",
      headline2: "Maximum Comfort.",
      image: "/hero_main.png",
      category: "Fashion",
      cta: "Explore Fashion",
      overlayFrom: "from-slate-950/85",
      overlayTo: "to-slate-950/10",
      textLight: true
    },
    {
      title: "Discover Beautiful",
      eyebrow: "Summer Living",
      headline2: "Everyday Essentials.",
      image: "/hero_main.png",
      category: "Home & Garden",
      cta: "View Home",
      overlayFrom: "from-slate-950/85",
      overlayTo: "to-slate-950/10",
      textLight: true
    },
    {
      title: "Gear Built",
      eyebrow: "Outdoor Essentials",
      headline2: "for Performance.",
      image: "/hero_main.png",
      category: "Sports & Outdoors",
      cta: "View Athletics",
      overlayFrom: "from-slate-950/85",
      overlayTo: "to-slate-950/10",
      textLight: true
    }
  ];

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

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(heroTimer);
  }, []);

  // Email state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic homepage product states
  const [featured, setFeatured] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trendingNow, setTrendingNow] = useState<Product[]>([]);
  const [recommendedForYou, setRecommendedForYou] = useState<Product[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [editorialsData, setEditorialsData] = useState<{
    title: string;
    description: string;
    products: Product[];
    category: string;
    tag: string;
  }[]>([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [feat, flash, newArr, electProd, fashionProd, homeProd, sportsProd] = await Promise.all([
          getFeaturedProducts(12),
          getFlashDealProducts(12),
          getNewProducts(12),
          getProductsByCategory("Electronics", 25),
          getProductsByCategory("Fashion", 25),
          getProductsByCategory("Home & Garden", 25),
          getProductsByCategory("Sports & Outdoors", 25)
        ]);
        
        if (!active) return;
        
        setFeatured(feat);
        setFlashDeals(flash);
        setNewArrivals(newArr);

        const filterAndSortProducts = (products: Product[]) => {
          return products
            .filter(p => {
              const img = getProductImage(p);
              return (
                p.stock > 0 &&
                img &&
                img !== "/images/product-placeholder.svg" &&
                !img.startsWith("data:") &&
                !isFallbackImage(img)
              );
            })
            .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        };

        const validElect = filterAndSortProducts(electProd);
        const validFashion = filterAndSortProducts(fashionProd);
        const validHome = filterAndSortProducts(homeProd);
        const validSports = filterAndSortProducts(sportsProd);

        const list: typeof editorialsData = [];

        if (validElect.length > 0) {
          list.push({
            title: "Modern Workspace Collection",
            tag: "WORKSPACE ARCHIVE",
            category: "Electronics",
            description: `Explore premium office and acoustic innovations curated from brands like ${Array.from(new Set(validElect.map(p => p.brand))).slice(0, 3).join(", ")}. Discover essentials like the ${validElect[0].name} designed to optimize productivity.`,
            products: validElect
          });
        }

        if (validFashion.length > 0) {
          list.push({
            title: "Contemporary Wardrobe",
            tag: "CLOTHING CURATION",
            category: "Fashion",
            description: `Elevate your styling profile with premium garments from ${Array.from(new Set(validFashion.map(p => p.brand))).slice(0, 3).join(", ")}. Discover timeless pieces like the ${validFashion[0].name} built for comfort and modern style.`,
            products: validFashion
          });
        }

        if (validHome.length > 0) {
          list.push({
            title: "Modern Home Curation",
            tag: "LIVING INSPIRATION",
            category: "Home & Garden",
            description: `Transform your spaces with handpicked decor and lifestyle items from ${Array.from(new Set(validHome.map(p => p.brand))).slice(0, 3).join(", ")}. Featuring premium accents like the ${validHome[0].name}.`,
            products: validHome
          });
        }

        if (validSports.length > 0) {
          list.push({
            title: "High-Performance Gear",
            tag: "ATHLETICS SECTOR",
            category: "Sports & Outdoors",
            description: `Pinnacle sports gear and outdoor accessories curated to elevate your active lifestyle, featuring top picks from ${Array.from(new Set(validSports.map(p => p.brand))).slice(0, 3).join(", ")}, including the ${validSports[0].name}.`,
            products: validSports
          });
        }

        setEditorialsData(list);
        
        const allLoaded = [...feat, ...flash, ...newArr];
        const uniqueLoadedMap: Record<string, Product> = {};
        allLoaded.forEach(p => {
          uniqueLoadedMap[p.id] = p;
        });
        const uniqueLoaded = Object.values(uniqueLoadedMap);
        
        setBestSellers(uniqueLoaded.filter(p => p.rating >= 4.7).slice(0, 4));
        setTrendingNow(uniqueLoaded.filter(p => p.reviewCount >= 10).slice(0, 4));
        setRecommendedForYou(uniqueLoaded.filter(p => p.isFeatured && !p.isFlashDeal).slice(0, 3));
        
        const cats = [
          'Fashion', 'Toys & Games', 'Sports & Outdoors', 'Health & Personal Care', 
          'Home & Garden', 'Electronics', 'Food & Grocery', 'Other'
        ];
        const counts = await Promise.all(
          cats.map(async (catName) => {
            const count = await getCategoryProductCount(catName);
            return { catName, count };
          })
        );
        
        if (!active) return;
        const countsMap: Record<string, number> = {};
        counts.forEach(({ catName, count }) => {
          countsMap[catName.toLowerCase()] = count;
        });
        
      } catch (error) {
        console.error("Error loading home page product sets:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const displayFlashDeals = [...flashDeals].reverse().slice(0, 8);
  const popularBrands = ['Nike', 'Waddingtons', 'Barbie', 'JVC', 'Speedo', 'Kookaburra'];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const quickCategories = [
    { name: 'Fashion', icon: <Shirt className="w-3.5 h-3.5" />, color: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200' },
    { name: 'Toys & Games', icon: <Gamepad className="w-3.5 h-3.5" />, color: 'hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200' },
    { name: 'Sports & Outdoors', icon: <Dumbbell className="w-3.5 h-3.5" />, color: 'hover:bg-red-50 hover:text-red-700 hover:border-red-200' },
    { name: 'Health & Personal Care', icon: <Heart className="w-3.5 h-3.5" />, color: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200' },
    { name: 'Home & Garden', icon: <Sofa className="w-3.5 h-3.5" />, color: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
    { name: 'Electronics', icon: <Laptop className="w-3.5 h-3.5" />, color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
    { name: 'Food & Grocery', icon: <Coffee className="w-3.5 h-3.5" />, color: 'hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200' },
    { name: 'Other', icon: <Tag className="w-3.5 h-3.5" />, color: 'hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200' }
  ];

  const handleExploreCategories = () => {
    const element = document.getElementById('quick-categories-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div id="homepage-root" className="space-y-12 md:space-y-16 font-sans">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden h-[520px] md:h-[640px] bg-slate-950 shadow-2xl select-none">
        {heroSlides.map((slide, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${heroIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            {/* Full-bleed campaign photograph */}
            <img
              src={slide.image}
              alt={slide.eyebrow}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${heroIndex === idx ? 'scale-[1.04]' : 'scale-100'}`}
            />
            {/* Cinematic left-to-right gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayFrom} via-slate-950/40 ${slide.overlayTo} pointer-events-none`} />
            {/* Subtle bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}

        {/* Campaign Text — always on top */}
        <div className="absolute inset-0 flex flex-col justify-end md:justify-center text-left p-8 sm:p-12 md:p-16 lg:p-20 max-w-2xl space-y-4 md:space-y-5 z-20 pb-16 md:pb-0">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 font-mono text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.2em] w-fit border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {heroSlides[heroIndex].eyebrow}
          </span>
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              {heroSlides[heroIndex].title}
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white/60 leading-[1.05]">
              {heroSlides[heroIndex].headline2}
            </h1>
          </div>

          <div className="flex flex-row gap-3 pt-3">
            <button 
              onClick={() => onNavigateToShop(heroSlides[heroIndex].category)}
              className="px-7 py-3.5 bg-white text-slate-950 font-sans text-[11px] font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-95"
            >
              {heroSlides[heroIndex].cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleExploreCategories}
              className="px-7 py-3.5 bg-white/10 text-white font-sans text-[11px] font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer backdrop-blur-sm"
            >
              Explore Shop
            </button>
          </div>
        </div>

        {/* Slide number + pill indicators */}
        <div className="absolute bottom-7 right-7 flex items-center gap-3 z-20">
          <span className="text-white/40 font-mono text-[10px] font-bold tabular-nums">
            {String(heroIndex + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
          </span>
          <div className="flex gap-1.5">
            {heroSlides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${heroIndex === i ? 'bg-white w-6 h-1.5' : 'bg-white/30 hover:bg-white/50 w-1.5 h-1.5'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. INSTANT CURATED CATEGORIES SECTION */}
      <section id="quick-categories-section" className="space-y-6 scroll-mt-24">
        <div className="text-left space-y-1">
          <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">Instant Curated Gateways</span>
          <h2 className="font-sans text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Shop by Boutique Department</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Fashion', icon: <Shirt className="w-6 h-6" />, gradient: 'from-amber-500/10 to-orange-500/5 hover:from-amber-500 hover:to-orange-500 hover:text-white' },
            { name: 'Toys & Games', icon: <Gamepad className="w-6 h-6" />, gradient: 'from-cyan-500/10 to-blue-500/5 hover:from-cyan-500 hover:to-blue-500 hover:text-white' },
            { name: 'Sports & Outdoors', icon: <Dumbbell className="w-6 h-6" />, gradient: 'from-red-500/10 to-rose-500/5 hover:from-red-500 hover:to-rose-500 hover:text-white' },
            { name: 'Health & Personal Care', icon: <Heart className="w-6 h-6" />, gradient: 'from-purple-500/10 to-pink-500/5 hover:from-purple-500 hover:to-pink-500 hover:text-white' },
            { name: 'Home & Garden', icon: <Sofa className="w-6 h-6" />, gradient: 'from-emerald-500/10 to-teal-500/5 hover:from-emerald-500 hover:to-teal-500 hover:text-white' },
            { name: 'Electronics', icon: <Laptop className="w-6 h-6" />, gradient: 'from-indigo-500/10 to-purple-500/5 hover:from-indigo-500 hover:to-indigo-500 hover:text-white' }
          ].map((cat) => {
            const count = categoryCounts[cat.name.toLowerCase()] || 0;
            return (
              <button
                id={`hero-chip-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={cat.name}
                onClick={() => onNavigateToShop(cat.name)}
                className={`group relative p-6 bg-gradient-to-br ${cat.gradient} border border-slate-200/40 rounded-3xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between h-40 overflow-hidden`}
              >
                <div className="p-3 bg-white/90 group-hover:bg-white text-slate-800 rounded-2xl w-fit group-hover:scale-110 transition-all shadow-sm">
                  {cat.icon}
                </div>
                <div className="space-y-1 text-slate-900 group-hover:text-white z-10 transition-colors">
                  <span className="block text-xs font-bold font-sans tracking-tight">{cat.name}</span>
                  <span className="block text-[9px] font-mono opacity-60 uppercase">{count} pieces</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. TRENDING BENTO CATEGORIES GRID */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 auto-rows-max">
          {VISUAL_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.name.toLowerCase()] || 0;
            return (
              <div
                key={cat.name}
                id={`category-masonry-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onNavigateToShop(cat.name)}
                className={`${cat.span} ${cat.height} group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-[400ms] ease-out hover:-translate-y-[5px] hover:scale-[1.015]`}
                style={{
                  boxShadow: '0 4px 32px rgba(0,0,0,0.55)',
                  outline: '1px solid rgba(16,185,129,0)',
                  transition: 'transform 400ms ease-out, box-shadow 400ms ease-out, outline-color 400ms ease-out',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.35), 0 0 32px rgba(16,185,129,0.12)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 32px rgba(0,0,0,0.55)';
                }}
              >
                {/* Premium showroom card: navy bg + zinc glow + SVG doodles + floating editorial object */}
                <CategoryShowcaseCard category={cat.name} />

                {/* Deep text gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040810]/95 via-[#040810]/30 to-transparent z-20 pointer-events-none" />

                {/* Floating tag pill */}
                <div className="absolute top-4 right-4 z-30 bg-[#0D1321]/70 backdrop-blur-md border border-[#BFC5CE]/15 px-2.5 py-1 rounded-full text-[8px] font-mono font-bold tracking-[0.18em] select-none uppercase"
                  style={{ color: '#9097A3' }}>
                  {cat.tag}
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-5 left-5 right-5 z-30 flex justify-between items-end gap-3">
                  <div className="space-y-0.5 max-w-[80%] transition-transform duration-[400ms] group-hover:-translate-y-1">
                    <h3 className="font-sans text-lg md:text-xl font-extrabold tracking-tight leading-tight text-white">
                      {cat.name}
                    </h3>
                    <p className="font-sans text-[11px] font-medium line-clamp-1 transition-colors duration-[400ms]"
                      style={{ color: '#9097A3' }}>
                      {count > 0 ? `${count.toLocaleString()} products` : cat.sub}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-[400ms] group-hover:scale-110"
                      style={{
                        background: 'rgba(191,197,206,0.08)',
                        border: '1px solid rgba(191,197,206,0.18)',
                        color: '#BFC5CE',
                        boxShadow: '0 0 0 0 rgba(191,197,206,0)',
                      }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FLASH DEALS COUNTER SECTION */}
      {flashDeals.length > 0 && (
        <section className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> FLASH DEALS
                </div>
                <h3 className="font-sans text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-none">Limited Drops Curation</h3>
                <p className="text-white/60 text-xs">High-end accessories with exclusive deductions. Drops close when the timer settles.</p>
              </div>

              {/* Countdown Timer */}
              <div className="flex gap-3 text-center">
                {[
                  { label: 'Hrs', val: timeLeft.hrs },
                  { label: 'Mins', val: timeLeft.mins },
                  { label: 'Secs', val: timeLeft.secs }
                ].map((unit, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0 min-w-[60px] backdrop-blur-sm">
                    <span className="font-mono text-xl md:text-2xl font-bold text-white block">
                      {unit.val.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase text-white/50 font-sans block tracking-wider mt-0.5">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {displayFlashDeals.map((p) => {
                const isWish = wishlistIds.includes(p.id);
                return (
                  <div key={p.id} className="snap-start shrink-0 w-64 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group">
                    <div className="space-y-3 relative">
                      {/* Image Frame */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
                        <img 
                          src={getProductImage(p)} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
                          }}
                        />
                        {/* Discount Sticker */}
                        {p.discountPercent && (
                          <div className="absolute top-3 left-3 bg-blue-600 text-white font-mono text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wider">
                            {p.discountPercent}% OFF
                          </div>
                        )}
                        {/* Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => onNavigateToProduct(p.id)}
                            className="p-3 bg-white text-slate-950 rounded-xl hover:bg-slate-100 transition-colors shadow cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAddToWishlist(p)}
                            className={`p-3 rounded-xl transition-colors shadow cursor-pointer ${isWish ? 'bg-red-50 text-red-600' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                          >
                            <Heart className={`w-4 h-4 ${isWish ? 'fill-red-600' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="text-xs space-y-1 text-left">
                        <span className="font-mono text-[9px] text-blue-400 block font-bold uppercase tracking-wider">{p.brand}</span>
                        <h4 className="font-sans font-bold text-white text-sm truncate">{p.name}</h4>
                        <div className="flex gap-2 items-baseline font-mono text-xs">
                          <span className="font-bold text-white">{formatPrice(p.price)}</span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-slate-500 line-through text-[10px]">{formatPrice(p.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onAddToCart(p, p.colors?.[0] || 'Default', p.sizes?.[0] || 'Default')}
                      className="mt-4 w-full py-2.5 bg-white hover:bg-blue-650 hover:bg-blue-600 hover:text-white text-slate-950 font-sans text-[10px] font-bold rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. TRENDING PRODUCTS GRID */}
      <section className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div className="text-left">
            <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">SOCIAL HEATMAP</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Trending Now</h2>
          </div>
          <button onClick={() => onNavigateToShop()} className="text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer">
            VIEW ALL TRENDING <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : (
            trendingNow.map((p) => {
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
            })
          )}
        </div>
      </section>

      {/* 5. FEATURED COLLECTIONS ALTERNATING GRIDS */}
      <section className="space-y-8 pt-6">
        <div className="text-left space-y-1">
          <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">CURATED EDITORIALS</span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-955 text-slate-900 tracking-tight">Featured Collections</h2>
        </div>

        <div className="space-y-6">
          {editorialsData.map((col, idx) => (
            <div 
              key={idx}
              className={`flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} gap-8 items-center bg-slate-50/70 border border-slate-200/50 rounded-3xl p-6 md:p-10 relative overflow-hidden`}
            >
              <div className="w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-slate-100 relative group">
                <EditorialCollage products={col.products} />
              </div>
              <div className="w-full md:w-1/2 text-left space-y-4">
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">{col.tag}</span>
                <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">{col.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{col.description}</p>
                <button 
                  onClick={() => onNavigateToShop(col.category)}
                  className="px-6 py-3 bg-slate-950 text-white font-sans text-[10px] font-bold rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SHOP BY BRAND */}
      <section className="space-y-6 pt-6">
        <div className="text-left space-y-1">
          <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">TRUSTED PARTNERS</span>
          <h2 className="font-sans text-xl md:text-2xl font-extrabold text-slate-950 tracking-tight">Shop by Curator Brand</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {popularBrands.map((brand, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateToShop(brand)}
              className="bg-white hover:bg-slate-50 border border-slate-200/60 py-6 px-8 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group snap-start shrink-0 min-w-[150px]"
            >
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-widest transition-colors block">
                {brand}
              </span>
              <span className="text-[8px] text-slate-400 font-sans block mt-1 uppercase">EST. ARCHIVE</span>
            </button>
          ))}
        </div>
      </section>

      {/* 7. NEW ARRIVALS GRID */}
      <section className="space-y-6 pt-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div className="text-left">
            <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">FRESH DROPS</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">New Arrivals</h2>
          </div>
          <button onClick={() => onNavigateToShop()} className="text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer">
            VIEW ALL NEW <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : (
            newArrivals.slice(0, 4).map((p) => {
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
            })
          )}
        </div>
      </section>

      {/* 8. BEST SELLERS GRID */}
      <section className="space-y-6 pt-6">
        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
          <div className="text-left">
            <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">VOLUME ARCHIVES</span>
            <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Best Sellers</h2>
          </div>
          <button onClick={() => onNavigateToShop()} className="text-xs font-mono font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer">
            VIEW ALL SELLERS <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : (
            bestSellers.map((p) => {
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
            })
          )}
        </div>
      </section>

      {/* 9. WHY SHOP WITH US */}
      <section className="bg-slate-50/70 border border-slate-200/50 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">CUSTOMER BENEFITS</span>
            <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Why Shop With DreamShelf?</h3>
            <p className="text-slate-500 text-xs max-w-lg mx-auto">We are committed to delivering an exceptional, reliable, and premium online shopping experience with every order.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: <Truck className="w-6 h-6 text-blue-600" />,
                name: "Fast Delivery",
                desc: "Express shipping directly to your doorstep in United Kingdom with real-time transit tracking."
              },
              {
                icon: <Lock className="w-6 h-6 text-blue-600" />,
                name: "Secure Payments",
                desc: "Fully encrypted transaction channels including Secured Credit Cards and Cash on Delivery."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
                name: "Warranty",
                desc: "100% authentic inventory covered by 12-month manufacturer partner warranties."
              },
              {
                icon: <RotateCcw className="w-6 h-6 text-blue-600" />,
                name: "Easy Returns",
                desc: "Hassle-free 30-day complimentary return collection service if you are not fully satisfied."
              },
              {
                icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
                name: "24/7 Support",
                desc: "Bespoke customer care team standing by to coordinate sizing queries and support tickets."
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/50 p-5 rounded-2xl text-left space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-xs text-slate-900 tracking-tight">{feature.name}</h4>
                  <p className="text-slate-500 text-[10px] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. LUXURY NEWSLETTER */}
      <section className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-900 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-md space-y-2 text-left relative z-10">
          <h3 className="font-sans font-extrabold text-white text-xl md:text-2xl tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" /> Join The Vanguard Circle
          </h3>
          <p className="text-white/60 text-xs leading-relaxed">Sign up to receive limited drops notification, VIP points multiplier alerts, and boutique lifestyle essays.</p>
        </div>

        <div className="w-full max-w-sm shrink-0 relative z-10">
          <form onSubmit={handleSubscribe} className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1 shadow-inner backdrop-blur-sm">
            <input 
              type="email" 
              required
              placeholder="ENTER EMAIL ADDRESS" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-3 text-xs font-mono focus:outline-none placeholder-white/30 text-white uppercase"
            />
            <button 
              id="newsletter-sub-btn"
              type="submit" 
              className="px-5 py-2.5 bg-white text-slate-950 hover:bg-blue-600 hover:text-white text-xs font-sans font-bold rounded-lg transition-all shadow cursor-pointer"
            >
              SUBSCRIBE
            </button>
          </form>

          {subscribed && (
            <div id="newsletter-success-alert" className="absolute top-full left-0 right-0 mt-2 bg-blue-600 border border-blue-500 p-2.5 rounded-lg text-center text-[10px] font-semibold text-white font-mono uppercase tracking-wide">
              WELCOME TO THE VANGUARD CIRCLE!
            </div>
          )}
        </div>
      </section>

      {/* 11. PREMIUM FOOTER */}
      <footer className="border-t border-slate-200 pt-12 pb-6 space-y-10 text-left">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-xs font-sans text-slate-600">
              <li><button onClick={() => onNavigateToShop()} className="hover:text-blue-600 transition-colors cursor-pointer">Shop Catalog</button></li>
              <li><button onClick={() => onNavigateToShop('Fashion')} className="hover:text-blue-600 transition-colors cursor-pointer">Fashion</button></li>
              <li><button onClick={() => onNavigateToShop('Electronics')} className="hover:text-blue-600 transition-colors cursor-pointer">Electronics</button></li>
              <li><button onClick={() => onNavigateToShop('Sports & Outdoors')} className="hover:text-blue-600 transition-colors cursor-pointer">Sports Curation</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Support</h4>
            <ul className="space-y-2 text-xs font-sans text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center / FAQ</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Delivery Tracking</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Submit Ticket</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Policies</h4>
            <ul className="space-y-2 text-xs font-sans text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Direct Warranty Rules</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Sourcing Standards</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bespoke Curation</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Curated by DreamShelf Archive Direct in the United Kingdom. Bringing artisanal verification, fast delivery, and global boutique catalog products under a secure digital shelf.
            </p>
            <div className="text-[10px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100 font-sans text-left">
              <span className="block">146 Elizabeth Street, Manchester, England, M8 8BQ</span>
              <span className="block">Phone: +44 7828 755062 | Email: info@dreamshelf.co.uk</span>
              <span className="block">Reg No: 17141473</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-400 uppercase">
          <span>© 2026 DreamShelf Inc. All Rights Reserved.</span>
          <div className="flex gap-4">
            <span>SECURE PAYMENT: VISA, MASTERCARD, APPLE PAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
