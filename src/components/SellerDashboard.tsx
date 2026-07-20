/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS, SELLER_ANALYTICS } from '../data';
import { formatPrice } from '../utils/currency';
import { 
  TrendingUp, BarChart4, PlusCircle, Package, Award, 
  Trash2, ShieldAlert, Edit, Check, Settings, PieChart
} from 'lucide-react';

interface SellerDashboardProps {
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  productsList: Product[];
}

export default function SellerDashboard({ onAddProduct, onDeleteProduct, productsList }: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'upload' | 'inventory'>('analytics');
  
  // Listing Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [subcategory, setSubcategory] = useState("Men's Clothing");
  const [stock, setStock] = useState('10');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('Material: 100% Organic Cotton\nWeight: 240gsm');
  const [story, setStory] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Promotion Builder state
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState('percentage');
  const [promoValue, setPromoValue] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !brand) return;

    const parsedSpecs: Record<string, string> = {};
    specs.split('\n').forEach((line) => {
      const [k, v] = line.split(':');
      if (k && v) parsedSpecs[k.trim()] = v.trim();
    });

    const newProd: Product = {
      id: `ds-${Date.now()}`,
      name,
      price: Number(price),
      description,
      brand,
      category,
      subcategory,
      stock: Number(stock),
      images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000'],
      rating: 5.0,
      reviewCount: 0,
      colors: ['Midnight Black', 'Alabaster'],
      sizes: ['S', 'M', 'L'],
      productStory: story || 'An artisan curated addition to the DreamShelf platform.',
      specs: parsedSpecs,
      reviews: []
    };

    onAddProduct(newProd);
    setUploadSuccess(true);
    
    // Clear form
    setName('');
    setPrice('');
    setBrand('');
    setDescription('');
    setStory('');

    setTimeout(() => setUploadSuccess(false), 4000);
  };

  const handlePromoCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode || !promoValue) return;
    setPromoSuccess(true);
    setTimeout(() => {
      setPromoSuccess(false);
      setPromoCode('');
      setPromoValue('');
    }, 4000);
  };

  return (
    <div id="seller-hub-root" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      
      {/* Seller Header */}
      <div className="bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-mono text-blue-400 uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> Merchant Portal
            </div>
            <h1 className="font-sans text-2xl md:text-4xl font-bold tracking-tight mb-1">
              Store Dashboard
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-sans max-w-lg">
              Manage product listings, review store traffic charts, run custom brand promotions, and monitor live inventory counts.
            </p>
          </div>

          <div className="flex gap-2 bg-slate-800/80 p-1 rounded-xl self-start md:self-auto border border-slate-700/40">
            {(['analytics', 'upload', 'inventory'] as const).map((tab) => (
              <button
                id={`seller-tab-${tab}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'analytics' && 'Analytics'}
                {tab === 'upload' && 'Add Listing'}
                {tab === 'inventory' && 'Inventory Hub'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="p-6 md:p-10 bg-slate-50/50">
        
        {/* TAB 1: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Store Views</span>
                <span className="font-sans text-2xl font-bold text-slate-900 block mt-1">98,450</span>
                <span className="text-blue-600 font-mono text-[10px] font-bold mt-2 inline-block">↑ 14.2% this week</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Conversion Rate</span>
                <span className="font-sans text-2xl font-bold text-slate-900 block mt-1">{SELLER_ANALYTICS.viewsStats.conversionRate}</span>
                <span className="text-blue-600 font-mono text-[10px] font-bold mt-2 inline-block">↑ 0.8% overall average</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Active Listings</span>
                <span className="font-sans text-2xl font-bold text-slate-900 block mt-1">{productsList.length}</span>
                <span className="text-slate-500 font-mono text-[10px] mt-2 inline-block">Synchronized with live feed</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Critical Stocks</span>
                  <span className="font-sans text-2xl font-bold text-red-600 block mt-1">
                    {productsList.filter(p => p.stock < 6).length}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px] mt-2 inline-block">Items below 6 units</span>
                </div>
                <span className="bg-red-50 p-2 rounded-xl text-red-600"><ShieldAlert className="w-5 h-5" /></span>
              </div>
            </div>

            {/* Custom Visual Data Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart A: Monthly Revenue (Dynamic SVG) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Revenue Volume (GBP)
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Interactive Chart</span>
                </div>

                {/* SVG Bar Chart */}
                <div className="relative pt-4">
                  <svg className="w-full h-64" viewBox="0 0 600 240">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="580" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="80" x2="580" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="140" x2="580" y2="140" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                    <line x1="40" y1="200" x2="580" y2="200" stroke="#E2E8F0" strokeWidth="1" />

                    {/* Chart Bars */}
                    {SELLER_ANALYTICS.monthlyRevenue.map((d, index) => {
                      const barWidth = 40;
                      const gap = 50;
                      const startX = 60 + index * (barWidth + gap);
                      const maxVal = 45000;
                      // Height Calculations
                      const totalH = (d.sales / maxVal) * 160;
                      const organicH = (d.organic / maxVal) * 160;
                      const adH = totalH - organicH;

                      return (
                        <g key={index} className="group cursor-pointer">
                          {/* Hover background tooltip card */}
                          <rect 
                            x={startX - 10} y="10" width={barWidth + 20} height="190" 
                            fill="transparent" 
                            className="hover:fill-slate-50/50 transition-colors"
                          />
                          {/* Organic Sales Segment (Blue-600) */}
                          <rect 
                            x={startX} y={200 - organicH} width={barWidth} height={organicH} 
                            fill="#2563eb" rx="4"
                          />
                          {/* Ad Sales Segment (Blue-400) */}
                          <rect 
                            x={startX} y={200 - totalH} width={barWidth} height={adH} 
                            fill="#60a5fa" rx="4"
                          />

                          {/* Data label */}
                          <text x={startX + barWidth/2} y="220" textAnchor="middle" className="font-mono text-[10px] fill-slate-400">{d.month}</text>
                          
                          {/* Value pop-up (Visible on hover in styling) */}
                          <text x={startX + barWidth/2} y={185 - totalH} textAnchor="middle" className="font-mono text-[9px] fill-slate-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                            £{(d.sales / 1000).toFixed(0)}k
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Legend */}
                  <div className="flex gap-4 justify-center pt-2 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-700 rounded" /> Organic Discovery</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-400 rounded" /> Advertising Referrals</span>
                  </div>
                </div>
              </div>

              {/* Chart B: Category Share Shares (Donut representation) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                  <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-600" /> Share by Category
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Live Weights</span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4 py-2">
                  <div className="relative w-36 h-36">
                    {/* SVG Circular Donut representation */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="3" />
                      
                      {/* Fashion Segment 38% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e3a8a" strokeWidth="3.2" strokeDasharray="38 62" strokeDashoffset="0" />
                      {/* Home Living Segment 22% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="22 78" strokeDashoffset="-38" />
                      {/* Electronics Segment 20% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3.2" strokeDasharray="20 80" strokeDashoffset="-60" />
                      {/* Gym Gear 12% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#60a5fa" strokeWidth="3.2" strokeDasharray="12 88" strokeDashoffset="-80" />
                      {/* Collectibles 8% */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#0F172A" strokeWidth="3.2" strokeDasharray="8 92" strokeDashoffset="-92" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                      <span className="font-sans text-xs text-slate-400 uppercase font-bold tracking-wider text-[8px]">TOTAL SALE</span>
                      <span className="font-sans text-lg font-extrabold text-slate-900">£149k</span>
                    </div>
                  </div>

                  {/* List of segment descriptions */}
                  <div className="w-full space-y-1.5 font-sans text-xs">
                    {SELLER_ANALYTICS.categoryShare.map((c, idx) => (
                      <div id={`category-share-${idx}`} key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ 
                              backgroundColor: 
                                idx === 0 ? '#1e3a8a' : 
                                idx === 1 ? '#2563eb' : 
                                idx === 2 ? '#3b82f6' : 
                                idx === 3 ? '#60a5fa' : '#0F172A' 
                            }} 
                          />
                          {c.name}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{c.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand promotions Creator */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Store-wide Promotions & Brand Coupons</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">Launch targeted loyalty rewards to incentivize high-basket checkouts. Coupons sync immediately across all customer checkouts.</p>
              </div>

              <form onSubmit={handlePromoCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Coupon Promo Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. FLASH30" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Deduction Type</label>
                  <select 
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage">Percentage deduction (%)</option>
                    <option value="fixed">Fixed cash voucher (£)</option>
                    <option value="free_shipping">Free Expedited Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Value Amount</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 30" 
                    value={promoValue}
                    onChange={(e) => setPromoValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button type="submit" className="py-2.5 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-blue-600 transition-all">
                  ACTIVATE PROMOTION
                </button>
              </form>

              {promoSuccess && (
                <div id="promo-success-alert" className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 text-blue-800 text-xs">
                  <Check className="w-5 h-5" />
                  <div>
                    <span className="font-bold block">Promotion Coupon Code Successfully Mounted!</span>
                    <span className="font-mono text-[10px]">Activated code: **{promoCode.toUpperCase()}** worth **{promoType === 'percentage' ? promoValue + '%' : '£' + promoValue}**. Ready to receive traffic.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD LISTING FORM */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm max-w-3xl mx-auto animate-fadeIn">
            <h2 className="font-sans text-xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" /> Create Product Listing
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">Describe materials, design background, specifications, and retail price fields carefully to list your product.</p>

            <form onSubmit={handleUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Product Title</label>
                  <input 
                    type="text" required placeholder="e.g. Unstructured Wool Parka" 
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Milled Brand</label>
                  <input 
                    type="text" required placeholder="e.g. Atelier NORD" 
                    value={brand} onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">MSRP Price (£)</label>
                  <input 
                    type="number" required placeholder="e.g. 165" 
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category Hub</label>
                  <select 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:border-blue-500"
                  >
                    <option value="Fashion">Fashion & Wardrobe</option>
                    <option value="Gym Wear">Athleisure & Gym</option>
                    <option value="Electronics">Electronics & Tech</option>
                    <option value="Home Decor">Home Living & Decor</option>
                    <option value="Beauty">Organic Beauty & Skincare</option>
                    <option value="Collectibles">Collectibles & Toys</option>
                    <option value="Books">Books & Stationery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Subcategory</label>
                  <input 
                    type="text" required placeholder="e.g. Outerwear" 
                    value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Initial Stock (Units)</label>
                  <input 
                    type="number" required placeholder="e.g. 15" 
                    value={stock} onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Short Description</label>
                <textarea 
                  required rows={3} placeholder="Provide an elegant, minimal summary of form and purpose..." 
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Technical Specs (Key: Value - One per line)</label>
                  <textarea 
                    rows={4} placeholder="Material: 100% Cashmere&#10;Origin: Handcrafted in Italy" 
                    value={specs} onChange={(e) => setSpecs(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Product Description / Story</label>
                  <textarea 
                    rows={4} placeholder="Weave a story of design inspirations, atelier processes, factory sourcing..." 
                    value={story} onChange={(e) => setStory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 text-white font-sans text-xs font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-md uppercase tracking-wider">
                PUBLISH PRODUCT LISTING
              </button>
            </form>

            {uploadSuccess && (
              <div id="upload-success-alert" className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 text-blue-800 text-xs animate-pulse">
                <Check className="w-5 h-5" />
                <div>
                  <span className="font-bold block">Product Successfully Published!</span>
                  <span className="font-mono text-[10px]">The product has been successfully added to the DreamShelf catalog and is now live.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY HUB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-55/20">
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm">Active Product Listings Catalog ({productsList.length})</h3>
                  <p className="text-slate-400 text-[11px] font-sans">Delete, alter price fields, and inspect current store ratings.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-sans text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-4">SKU / ID</th>
                      <th className="p-4">Item details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Retail Price</th>
                      <th className="p-4">Stock level</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {productsList.map((p, idx) => (
                      <tr id={`inventory-row-${p.id}`} key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono text-[10px] font-semibold text-slate-500">{p.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt="" className="w-9 h-9 object-cover rounded-lg border border-slate-100" />
                            <div>
                              <span className="font-bold block text-slate-900">{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{p.reviewCount} customer reviews • ★ {p.rating}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-[10px]">{p.category}</td>
                        <td className="p-4 text-slate-500">{p.brand}</td>
                        <td className="p-4 font-mono text-blue-800 font-bold">{formatPrice(p.price)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${p.stock < 6 ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                            <span className="font-mono text-[11px] font-semibold">{p.stock} units left</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            id={`delete-btn-${p.id}`}
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                            title="Remove listing from directory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
