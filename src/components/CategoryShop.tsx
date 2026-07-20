/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product } from '../types';
import { 
  SlidersHorizontal, AlertCircle, Grid, List, RotateCcw, Star,
  Truck, ShieldCheck, ShoppingCart, Heart, Eye
} from 'lucide-react';
import ProductCard from './ProductCard';
import { formatPrice } from '../utils/currency';

interface CategoryShopProps {
  onNavigateToProduct: (id: string) => void;
  onAddToCart: (p: Product, color: string, size: string) => void;
  onAddToWishlist: (p: Product) => void;
  wishlistIds: string[];
  initialCategoryFilter?: string;
  initialBrandFilter?: string;
  productsList: Product[];
  onBackToHome?: () => void;
}

export function mapMegaCategoryToCatalog(megaCategory: string): string {
  const mapping: Record<string, string> = {
    'Fashion': 'Fashion',
    'Electronics': 'Electronics',
    'Home & Living': 'Home Decor',
    'Home Decor': 'Home Decor',
    'Kitchen & Dining': 'Kitchen & Dining',
    'Beauty & Personal Care': 'Beauty',
    'Beauty': 'Beauty',
    'Health & Wellness': 'Health & Wellness',
    'Baby & Kids': 'Baby & Kids',
    'Toys & Games': 'Toys & Games',
    'Sports & Fitness': 'Gym Wear',
    'Gym Wear': 'Gym Wear',
    'Automotive': 'Automotive',
    'Books & Stationery': 'Books',
    'Books': 'Books',
    'Pet Supplies': 'Pet Supplies',
    'Accessories': 'Accessories',
    'Gaming': 'Collectibles',
    'Gifts': 'Gifts',
    'Seasonal Deals': 'Seasonal Deals'
  };
  return mapping[megaCategory] || megaCategory;
}

export default function CategoryShop({ 
  onNavigateToProduct, onAddToCart, onAddToWishlist, wishlistIds, 
  initialCategoryFilter = 'All', initialBrandFilter = 'All', productsList, onBackToHome
}: CategoryShopProps) {
  
  // Filtering & Sorting States
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrandFilter && initialBrandFilter !== 'All' ? [initialBrandFilter] : []
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [discountOnly, setDiscountOnly] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  
  const [sortBy, setSortBy] = useState<string>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync props when they change externally from header navigation
  useEffect(() => {
    setSelectedCategory(initialCategoryFilter);
    triggerLoading();
  }, [initialCategoryFilter]);

  useEffect(() => {
    if (initialBrandFilter && initialBrandFilter !== 'All') {
      setSelectedBrands([initialBrandFilter]);
    } else {
      setSelectedBrands([]);
    }
    triggerLoading();
  }, [initialBrandFilter]);

  // Simulate premium skeleton loading on filter updates
  const triggerLoading = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    triggerLoading();
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
    triggerLoading();
  };

  const handlePriceRangeToggle = (range: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range) 
        : [...prev, range]
    );
    triggerLoading();
  };

  const handleResetFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setMinRating(0);
    setInStockOnly(false);
    setDiscountOnly(false);
    setSelectedColor('All');
    setSelectedSize('All');
    setSelectedCondition('All');
    setSortBy('rating');
    triggerLoading();
  };

  // Available Categories in Catalog
  const categories = [
    'All', 'Fashion', 'Electronics', 'Home Decor', 'Gym Wear', 'Beauty', 'Collectibles', 'Books',
    'Kitchen & Dining', 'Health & Wellness', 'Baby & Kids', 'Toys & Games', 'Automotive', 'Pet Supplies', 
    'Accessories', 'Gifts', 'Seasonal Deals'
  ];
  
  // Available Brands in catalog
  const brands = Array.from(new Set(productsList.map(p => p.brand)));

  // Available unique colors & sizes gathered from catalog for high fidelity
  const uniqueColors = ['All', ...Array.from(new Set(productsList.flatMap(p => p.colors || [])))].slice(0, 8);
  const uniqueSizes = ['All', ...Array.from(new Set(productsList.flatMap(p => p.sizes || [])))].slice(0, 6);

  // Price range options
  const priceRangeOptions = [
    { label: 'Under Rs. 5,000', val: 'under_5000' },
    { label: 'Rs. 5,000 to Rs. 20,000', val: '5000_20000' },
    { label: 'Over Rs. 20,000', val: 'over_20000' }
  ];

  // Filtering calculation logic
  const filteredProducts = productsList.filter((p) => {
    // 1. Category match with custom mappings for extended list
    let matchesCategory = false;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Seasonal Deals') {
      matchesCategory = !!p.isFlashDeal || (p.discountPercent !== undefined && p.discountPercent > 0);
    } else if (selectedCategory === 'Accessories') {
      matchesCategory = p.category === 'Accessories' || p.subcategory.toLowerCase().includes('gadgets') || p.name.toLowerCase().includes('headphones') || p.name.toLowerCase().includes('wallet');
    } else {
      const mapped = mapMegaCategoryToCatalog(selectedCategory);
      matchesCategory = p.category === mapped || p.subcategory === mapped || p.category === selectedCategory || p.subcategory === selectedCategory;
    }
    
    // 2. Multiple Brands match
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    
    // 3. Multiple Price ranges match
    let matchesPrice = true;
    if (selectedPriceRanges.length > 0) {
      matchesPrice = selectedPriceRanges.some(range => {
        if (range === 'under_5000') return p.price < 5000;
        if (range === '5000_20000') return p.price >= 5000 && p.price <= 20000;
        if (range === 'over_20000') return p.price > 20000;
        return true;
      });
    }

    // 4. Rating threshold match
    const matchesRating = p.rating >= minRating;

    // 5. Stock status match
    const matchesStock = !inStockOnly || p.stock > 0;

    // 6. Discount only match
    const matchesDiscount = !discountOnly || (p.discountPercent !== undefined && p.discountPercent > 0);

    // 7. Color filter match
    const matchesColor = selectedColor === 'All' || (p.colors && p.colors.some(c => c.toLowerCase() === selectedColor.toLowerCase()));

    // 8. Size filter match
    const matchesSize = selectedSize === 'All' || (p.sizes && p.sizes.some(s => s.toLowerCase() === selectedSize.toLowerCase()));

    // 9. Condition filter match (simulating premium metadata condition)
    let matchesCondition = true;
    if (selectedCondition !== 'All') {
      // Products over $150 mapped as Premium Renewed for rich variance, others as Pristine New
      const productCondition = p.price > 150 ? 'Renewed' : 'New';
      matchesCondition = selectedCondition === productCondition;
    }

    return matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock && matchesDiscount && matchesColor && matchesSize && matchesCondition;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    if (sortBy === 'popular') return (b.reviewCount * b.rating) - (a.reviewCount * a.rating);
    if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
    return 0;
  });

  return (
    <div id="shop-root" className="space-y-6 font-sans">
      
      {/* Back Navigation */}
      <button 
        onClick={onBackToHome}
        className="group flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-slate-950 font-bold uppercase tracking-wider transition-all cursor-pointer"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span>Back to Home</span>
      </button>

      {/* Editorial Header */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">DREAMSHELF DIRECTORY</span>
          <h1 className="font-sans text-3xl md:text-5xl font-extrabold text-slate-950 tracking-tight mt-1">
            {selectedCategory === 'All' ? 'Curated Lifestyle Catalog' : `${selectedCategory}`}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-sans mt-2 max-w-2xl leading-relaxed">
            Browse through our luxury selections with multi-faceted filtering. All products include premium authentication, warranty, and complementary carbon-neutral delivery.
          </p>
        </div>

        {/* List / Grid Switcher & Sorting Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <span className="font-semibold text-slate-400 text-xs mr-1 hidden sm:inline">View:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="view-list-btn"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <select 
            id="sort-by-select"
            value={sortBy} 
            onChange={(e) => {
              setSortBy(e.target.value);
              triggerLoading();
            }}
            className="px-3.5 py-2.5 bg-white border border-slate-200 text-xs font-semibold font-sans rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
          >
            <option value="rating">Top Rated Appraisals</option>
            <option value="popular">Most Popular Pieces</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="newest">Newly Introduced</option>
            <option value="discount">Special Offers & Drops</option>
          </select>
        </div>
      </div>

      {/* Categories Horizontal Tabs bar */}
      <div className="overflow-x-auto whitespace-nowrap pb-2 flex gap-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            id={`filter-tab-${cat.replace(/\s+/g, '-')}`}
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-950 text-white shadow-md scale-102'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950 border border-slate-200/40'
            }`}
          >
            {cat === 'All' ? 'Everything' : cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Filters Panel Left + Products List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL: LEFT */}
        <div className={`space-y-6 lg:block ${isMobileFiltersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}`}>
          {isMobileFiltersOpen && (
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sans font-bold text-slate-900 text-base">Filter Curations</h3>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="px-3 py-1.5 bg-slate-950 text-white text-xs font-bold rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-sans font-extrabold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-wide">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Criteria
              </h3>
              {(selectedBrands.length > 0 || selectedPriceRanges.length > 0 || minRating > 0 || inStockOnly || discountOnly || selectedColor !== 'All' || selectedSize !== 'All' || selectedCondition !== 'All') && (
                <button
                  id="reset-filters-btn"
                  onClick={handleResetFilters}
                  className="text-[10px] font-mono text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  title="Clear all active filters"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Brand Checkboxes */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Boutique Brands</span>
              <div className="space-y-1.5 font-sans text-xs max-h-36 overflow-y-auto pr-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2.5 text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                    <input 
                      id={`brand-check-${brand.replace(/\s+/g, '-')}`}
                      type="checkbox" 
                      checked={selectedBrands.includes(brand)} 
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                    />
                    <span className="font-medium text-slate-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Checkboxes */}
            <div className="space-y-2.5 border-t border-slate-100/80 pt-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Price Brackets</span>
              <div className="space-y-1.5 font-sans text-xs">
                {priceRangeOptions.map((pr) => (
                  <label key={pr.val} className="flex items-center gap-2.5 text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                    <input 
                      id={`price-check-${pr.val}`}
                      type="checkbox" 
                      checked={selectedPriceRanges.includes(pr.val)} 
                      onChange={() => handlePriceRangeToggle(pr.val)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                    />
                    <span className="font-medium text-slate-700">{pr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ratings Slider/Selector */}
            <div className="space-y-2.5 border-t border-slate-100/80 pt-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Minimum Appraised Rating</span>
              <div className="flex gap-1.5 font-mono text-[10px]">
                {[0, 3, 4, 4.5].map((stars) => (
                  <button
                    id={`rating-filter-btn-${stars}`}
                    key={stars}
                    onClick={() => { setMinRating(stars); triggerLoading(); }}
                    className={`flex-1 py-1.5 rounded-lg border text-center font-bold cursor-pointer transition-all ${
                      minRating === stars
                        ? 'bg-amber-500/10 border-amber-500 text-amber-700 font-extrabold'
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {stars === 0 ? 'All' : `${stars}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Grid Filter */}
            <div className="space-y-2.5 border-t border-slate-100/80 pt-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Aesthetic Colors</span>
              <div className="flex flex-wrap gap-1.5">
                {uniqueColors.map((color) => (
                  <button
                    id={`color-filter-${color}`}
                    key={color}
                    onClick={() => { setSelectedColor(color); triggerLoading(); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'bg-slate-950 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Filter */}
            <div className="space-y-2.5 border-t border-slate-100/80 pt-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Dimensions & Sizes</span>
              <div className="flex flex-wrap gap-1.5">
                {uniqueSizes.map((size) => (
                  <button
                    id={`size-filter-${size}`}
                    key={size}
                    onClick={() => { setSelectedSize(size); triggerLoading(); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-slate-950 border-slate-950 text-white font-bold font-mono'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-mono'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div className="space-y-2.5 border-t border-slate-100/80 pt-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Item Condition</span>
              <div className="grid grid-cols-3 gap-1 font-sans text-[10px]">
                {['All', 'New', 'Renewed'].map((cond) => (
                  <button
                    id={`condition-filter-${cond}`}
                    key={cond}
                    onClick={() => { setSelectedCondition(cond); triggerLoading(); }}
                    className={`py-1.5 border rounded-lg font-bold text-center cursor-pointer transition-all ${
                      selectedCondition === cond
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {cond === 'All' ? 'All' : cond === 'New' ? 'Pristine' : 'Renewed'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Badges: In Stock & On Sale */}
            <div className="space-y-2.5 border-t border-slate-100/80 pt-4 font-sans text-xs">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Special Attributes</span>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-slate-600 hover:text-slate-950 cursor-pointer select-none">
                  <input 
                    id="stock-filter-check"
                    type="checkbox" 
                    checked={inStockOnly} 
                    onChange={(e) => { setInStockOnly(e.target.checked); triggerLoading(); }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                  />
                  <span className="font-medium text-slate-700">In Stock Pieces Only</span>
                </label>
                <label className="flex items-center gap-2.5 text-slate-600 hover:text-slate-950 cursor-pointer select-none">
                  <input 
                    id="discount-filter-check"
                    type="checkbox" 
                    checked={discountOnly} 
                    onChange={(e) => { setDiscountOnly(e.target.checked); triggerLoading(); }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                  />
                  <span className="font-medium text-slate-700">Discounted / On Sale</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID / LIST: RIGHT */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="flex justify-between items-center text-xs font-sans text-slate-400">
            <span>Showing <span className="font-bold text-slate-850 text-slate-900">{filteredProducts.length}</span> luxury items</span>
            <button 
              id="mobile-filters-trigger"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)} 
              className="lg:hidden flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-250 border-slate-200 rounded-xl text-slate-900 font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter / Sort
            </button>
          </div>

          {/* SKELETON LOADING SIMULATION VIEW */}
          {isLoading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={`bg-white border border-slate-100 rounded-3xl p-5 space-y-4 animate-pulse ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-6' : ''}`}>
                  <div className={`bg-slate-100 rounded-2xl ${viewMode === 'list' ? 'w-full sm:w-40 aspect-square' : 'aspect-square w-full'}`} />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-3.5 bg-slate-100 rounded w-1/4" />
                    <div className="h-5 bg-slate-100 rounded w-3/4" />
                    <div className="h-3.5 bg-slate-100 rounded w-full" />
                    <div className="h-3.5 bg-slate-100 rounded w-5/6" />
                    <div className="pt-4 flex justify-between items-center">
                      <div className="h-5 bg-slate-100 rounded w-1/3" />
                      <div className="h-8 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Standard Grid / List output */
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {filteredProducts.map((p) => {
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
            ) : (
              /* Upgraded list layout option */
              <div className="space-y-4 animate-fadeIn">
                {filteredProducts.map((p) => {
                  const isWish = wishlistIds.includes(p.id);
                  const hasDiscount = p.discountPercent && p.discountPercent > 0;
                  const originalPrice = p.originalPrice || (hasDiscount ? Math.round(p.price / (1 - (p.discountPercent || 0) / 100)) : undefined);
                  return (
                    <div 
                      id={`product-list-row-${p.id}`}
                      key={p.id}
                      onClick={() => onNavigateToProduct(p.id)}
                      className="group bg-white border border-slate-100/90 rounded-3xl p-5 hover:shadow-xl hover:border-slate-200/50 transition-all duration-300 flex flex-col sm:flex-row gap-6 cursor-pointer select-none items-stretch hover:-translate-y-0.5"
                    >
                      {/* Left side Image block */}
                      <div className="relative w-full sm:w-44 h-44 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        
                        {/* Tags floating overlay */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {p.isNew && (
                            <span className="bg-slate-950 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                          {hasDiscount && (
                            <span className="bg-blue-600 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              -{p.discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center Side Info details */}
                      <div className="flex-1 flex flex-col justify-between py-1 text-left min-w-0">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">{p.brand}</span>
                              <h3 className="font-sans font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{p.name}</h3>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg text-slate-500 font-mono text-[10px]">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="font-bold text-slate-850 text-slate-800">{p.rating.toFixed(1)}</span>
                              <span>({p.reviewCount})</span>
                            </div>
                          </div>

                          <p className="text-slate-400 text-xs font-sans line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>

                          {/* Attributes overview list */}
                          <div className="flex flex-wrap gap-2 pt-1.5">
                            {p.colors && p.colors.map(color => (
                              <span key={color} className="text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded uppercase font-semibold">{color}</span>
                            ))}
                            {p.sizes && p.sizes.map(size => (
                              <span key={size} className="text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-bold">{size}</span>
                            ))}
                            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase font-bold">
                              {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        {/* Estimated transit info block */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400/90 font-medium pt-3 mt-3 border-t border-slate-50">
                          <Truck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{p.estimatedDelivery || "Complimentary carbon-neutral standard transit"}</span>
                        </div>
                      </div>

                      {/* Right side checkout and price indicators */}
                      <div className="sm:w-36 flex sm:flex-col justify-between items-end border-t sm:border-t-0 sm:border-l border-slate-50 pt-4 sm:pt-0 sm:pl-5 flex-shrink-0 text-right">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-950 text-base block">${p.price}.00</span>
                          {originalPrice && originalPrice > p.price && (
                            <span className="text-slate-400 line-through text-[11px] block font-mono leading-none">
                              ${originalPrice}.00
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto pt-4 sm:pt-0">
                          <button
                            id={`row-wish-${p.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToWishlist(p);
                            }}
                            className={`p-2.5 rounded-xl border transition-all ${isWish ? 'bg-red-50 text-red-600 border-red-100 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 border-slate-100'}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-red-600' : ''}`} />
                          </button>
                          <button
                            id={`row-add-${p.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(p, p.colors[0], p.sizes[0]);
                            }}
                            disabled={p.stock === 0}
                            className="flex-1 sm:flex-none px-4 py-2 bg-slate-950 hover:bg-blue-600 text-white font-sans text-[10px] font-bold rounded-xl transition-all shadow-sm uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> BAG ADD
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <span className="font-bold text-slate-800 block">No matching catalog pieces found</span>
              <p className="max-w-xs mx-auto leading-normal">Try adjusting your active checkboxes or resetting filters to inspect other options.</p>
              <button 
                id="no-results-clear-btn"
                onClick={handleResetFilters} 
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-wider"
              >
                Reset Filter Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
