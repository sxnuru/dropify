/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Product, Order } from '../types';
import { formatPrice } from '../utils/currency';
import { 
  PlusCircle, Package, Trash2, ShieldAlert, Edit, Check, Settings, 
  Search, SlidersHorizontal, X, CheckCircle, Info, ChevronRight, HelpCircle
} from 'lucide-react';
import { getProductImage, isFallbackImage } from '../utils/image';

interface SellerDashboardProps {
  onAddProduct: (p: Product) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  productsList: Product[];
  onBackToHome?: () => void;
  ordersList?: Order[];
}

export default function SellerDashboard({ 
  onAddProduct, onEditProduct, onDeleteProduct, productsList, onBackToHome = () => {} 
}: SellerDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  
  // Store Settings (with LocalStorage persistence)
  const [storeName, setStoreName] = useState(() => localStorage.getItem('ds_store_name') || 'DreamShelf Premium Curation');
  const [storeDesc, setStoreDesc] = useState(() => localStorage.getItem('ds_store_desc') || 'Curating the finest boutique products, tech, and spatial accessories.');
  const [codEnabled, setCodEnabled] = useState(() => localStorage.getItem('ds_cod_enabled') !== 'false');
  const [standardShipping, setStandardShipping] = useState(() => localStorage.getItem('ds_std_shipping') || '4.99');
  const [expressShipping, setExpressShipping] = useState(() => localStorage.getItem('ds_exp_shipping') || '9.99');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('ds_support_email') || 'curator@dreamshelf.co.uk');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('ds_support_phone') || '+44 20 7946 0958');
  const [storeTheme, setStoreTheme] = useState(() => localStorage.getItem('ds_theme') || 'light');
  
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  // Modal / Drawer state for Add/Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add / Edit Form parameters
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('Fashion');
  const [formSubcategory, setFormSubcategory] = useState('Accessories');
  const [formStock, setFormStock] = useState('10');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  // Handle store settings configuration submit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ds_store_name', storeName);
    localStorage.setItem('ds_store_desc', storeDesc);
    localStorage.setItem('ds_cod_enabled', String(codEnabled));
    localStorage.setItem('ds_std_shipping', standardShipping);
    localStorage.setItem('ds_exp_shipping', expressShipping);
    localStorage.setItem('ds_support_email', supportEmail);
    localStorage.setItem('ds_support_phone', supportPhone);
    localStorage.setItem('ds_theme', storeTheme);
    
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Open form modal for new product addition
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormBrand('');
    setFormCategory('Fashion');
    setFormSubcategory('Accessories');
    setFormStock('10');
    setFormDescription('');
    setFormImage('');
    setIsFormOpen(true);
  };

  // Open form modal for editing an existing product
  const handleOpenEditForm = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(String(p.price));
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory);
    setFormStock(String(p.stock));
    setFormDescription(p.description);
    setFormImage(isFallbackImage(p.images[0]) ? '' : (p.images[0] || ''));
    setIsFormOpen(true);
  };

  // Handle form upload / edit submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formPrice) || 0;
    const stockNum = parseInt(formStock, 10) || 0;
    const imageLink = formImage.trim();

    if (editingProduct) {
      // Edit mode
      const updated: Product = {
        ...editingProduct,
        name: formName,
        price: priceNum,
        brand: formBrand,
        category: formCategory,
        subcategory: formSubcategory,
        stock: stockNum,
        description: formDescription,
        images: [imageLink, ...editingProduct.images.slice(1)]
      };
      onEditProduct(updated);
    } else {
      // Add mode
      // Generate secure unique SKU ID
      const nextIdNum = productsList.length + 1;
      const generatedId = `DS${String(nextIdNum).padStart(6, '0')}`;

      const added: Product = {
        id: generatedId,
        name: formName,
        price: priceNum,
        brand: formBrand,
        category: formCategory,
        subcategory: formSubcategory,
        stock: stockNum,
        description: formDescription,
        images: [imageLink],
        rating: 5.0,
        reviewCount: 0,
        specs: { "Origin": "UK Milled", "Quality": "Premium certified" },
        colors: ["Default"],
        sizes: ["One Size"],
        reviews: [],
        tags: [formCategory.toLowerCase(), formSubcategory.toLowerCase()]
      };
      onAddProduct(added);
    }

    setIsFormOpen(false);
  };

  // Filter products list based on Search & Select inputs
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'All' || 
        p.category.toLowerCase() === categoryFilter.toLowerCase();
      
      let matchesStock = true;
      if (stockFilter === 'Low Stock') {
        matchesStock = p.stock > 0 && p.stock < 6;
      } else if (stockFilter === 'Out of Stock') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [productsList, searchQuery, categoryFilter, stockFilter]);

  // Unique category tags from catalog
  const availableCategories = ['Fashion', 'Toys & Games', 'Sports & Outdoors', 'Health & Personal Care', 'Home & Garden', 'Electronics', 'Food & Grocery', 'Other'];

  return (
    <div id="merchant-dashboard-root" className="space-y-6 font-sans">
      
      {/* 1. SECURED SYSTEM BRAND HEADER */}
      <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[32px] relative overflow-hidden border border-slate-800 text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-[9px] font-mono text-blue-400 uppercase tracking-widest font-bold">
              <Settings className="w-3 h-3 animate-spin-slow" /> Store Management
            </div>
            <h1 className="text-3xl font-black tracking-tight">{storeName}</h1>
            <p className="text-slate-400 text-xs max-w-xl font-medium leading-relaxed">{storeDesc}</p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <button 
              onClick={onBackToHome}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              ← Exit Portal
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMMARY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Products</span>
          <span className="font-sans text-2xl font-bold text-slate-900 block mt-1">{productsList.length}</span>
          <span className="text-slate-500 font-mono text-[10px] mt-1.5 inline-block">Items in catalog</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Critical Low Stocks</span>
          <span className={`font-sans text-2xl font-bold block mt-1 ${productsList.filter(p => p.stock > 0 && p.stock < 6).length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {productsList.filter(p => p.stock > 0 && p.stock < 6).length}
          </span>
          <span className="text-slate-500 font-mono text-[10px] mt-1.5 inline-block">1 to 5 units remaining</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Out of Stock Items</span>
          <span className={`font-sans text-2xl font-bold block mt-1 ${productsList.filter(p => p.stock === 0).length > 0 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
            {productsList.filter(p => p.stock === 0).length}
          </span>
          <span className="text-slate-500 font-mono text-[10px] mt-1.5 inline-block">Zero units available</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Configuration Fee</span>
          <span className="font-sans text-2xl font-bold text-slate-900 block mt-1">£{standardShipping}</span>
          <span className="text-slate-500 font-mono text-[10px] mt-1.5 inline-block">Standard Delivery cost</span>
        </div>
      </div>

      {/* 3. TABS SELECTOR */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-sans">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 font-bold transition-all relative cursor-pointer ${
            activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Package className="w-4 h-4" /> Products Directory
          </span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 font-bold transition-all relative cursor-pointer ${
            activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> Hub Settings
          </span>
        </button>
      </div>

      {/* 4. MAIN WORKSPACE SEGMENTS */}
      <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100">
        
        {/* TAB A: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Filtering Tools & Action Trigger */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Left filter inputs group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1 max-w-3xl">
                
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search SKU, name, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Category selector */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Categories</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Stock selector */}
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="Low Stock">Low Stock (1-5)</option>
                  <option value="Out of Stock">Out of Stock (0)</option>
                </select>

              </div>

              {/* Add product listing trigger */}
              <button
                onClick={handleOpenAddForm}
                className="w-full md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-sans font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0"
              >
                <PlusCircle className="w-4 h-4" /> Add Product
              </button>

            </div>

            {/* Catalog Grid Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-sans text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-wider select-none">
                      <th className="p-4">SKU Code</th>
                      <th className="p-4">Item Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">MSRP Price</th>
                      <th className="p-4">Units Available</th>
                      <th className="p-4 text-right">Directory Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p, idx) => (
                        <tr id={`inventory-row-${p.id}`} key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-[10px] font-semibold text-slate-500 select-all">{p.id}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={getProductImage(p)} alt="" className="w-9 h-9 object-cover rounded-lg border border-slate-100" />
                              <div>
                                <span className="font-bold block text-slate-950">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">★ {p.rating} ({p.reviewCount} customer reviews)</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 font-mono text-[10px]">{p.category}</td>
                          <td className="p-4 text-slate-500 font-semibold">{p.brand}</td>
                          <td className="p-4 font-mono text-blue-800 font-bold">{formatPrice(p.price)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                p.stock === 0 ? 'bg-red-500 animate-pulse' : 
                                p.stock < 6 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                              }`} />
                              <span className="font-mono text-[10px] font-semibold">
                                {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleOpenEditForm(p)}
                                className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                                name="Edit product details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                name="Remove item listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400 font-sans">
                          <Info className="w-8 h-8 text-slate-350 mx-auto mb-2 opacity-50" />
                          <span>No products match the search query or filter parameters.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn text-left max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-sans font-bold text-slate-900 text-base">Store Settings Configuration</h3>
                <p className="text-slate-400 text-xs mt-0.5 font-sans">Modify storefront tags, shipping rate values, and supported parameters.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 2-column configuration grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Details */}
                  <div className="space-y-4">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-slate-50 pb-1">Store details</span>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Merchant Store Name</label>
                      <input 
                        type="text" required
                        value={storeName} onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Store Tagline / Description</label>
                      <textarea 
                        rows={3} required
                        value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Customer Support Email</label>
                      <input 
                        type="email" required
                        value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Support Contact Number</label>
                      <input 
                        type="text" required
                        value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right Column: Policies & Logistics */}
                  <div className="space-y-4">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-slate-50 pb-1">Payment & Logistics</span>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Store Currency</label>
                      <input 
                        type="text" disabled value="GBP (£) - System Lock"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-sans cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 pt-1.5">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Cash on Delivery (COD) Support</label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-bold select-none">
                        <input 
                          type="checkbox"
                          checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500"
                        />
                        <span>Enable Cash on Delivery Checkouts</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Standard Delivery Rate (£)</label>
                      <input 
                        type="number" step="0.01" required
                        value={standardShipping} onChange={(e) => setStandardShipping(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Express Delivery Rate (£)</label>
                      <input 
                        type="number" step="0.01" required
                        value={expressShipping} onChange={(e) => setExpressShipping(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Storefront Interface Theme</label>
                      <select 
                        value={storeTheme} onChange={(e) => setStoreTheme(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                      >
                        <option value="light">Classic Editorial Light (Active)</option>
                        <option value="dark">Minimalist Studio Dark</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Form CTA & Alert */}
                <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-blue-600 text-white text-xs font-sans font-bold rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
                  >
                    Save Store Configuration
                  </button>
                  {settingsSuccess && (
                    <span className="text-xs font-sans text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Store configuration records saved successfully!
                    </span>
                  )}
                </div>

              </form>
            </div>
          </div>
        )}

      </div>

      {/* 5. ADD / EDIT PRODUCT MODAL DRAWER OVERLAY */}
      {isFormOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto font-sans flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full p-6 md:p-8 relative z-10 space-y-5 max-h-[90vh] overflow-y-auto animate-scaleUp text-left">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">System Registry Portal</span>
                <h3 className="font-sans font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                  {editingProduct ? `Edit Listing SKU: ${editingProduct.id}` : "Create Product Listing"}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Product Title Name</label>
                  <input 
                    type="text" required placeholder="e.g. Vintage Leather Jacket"
                    value={formName} onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Milled Brand</label>
                  <input 
                    type="text" required placeholder="e.g. Atelier NORD"
                    value={formBrand} onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Price (£)</label>
                  <input 
                    type="number" required placeholder="e.g. 149"
                    value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Category</label>
                  <select 
                    value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Subcategory</label>
                  <input 
                    type="text" required placeholder="e.g. Apparel"
                    value={formSubcategory} onChange={(e) => setFormSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Stock level</label>
                  <input 
                    type="number" required placeholder="e.g. 24"
                    value={formStock} onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Product Image URL</label>
                <input 
                  type="url" placeholder="e.g. https://images.unsplash.com/..."
                  value={formImage} onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Detailed Description</label>
                <textarea 
                  rows={3} required placeholder="Describe product details, aesthetic design backgrounds, and materials..."
                  value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Form CTAs */}
              <div className="border-t border-slate-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-950 hover:bg-blue-600 text-white text-xs font-sans font-bold rounded-xl transition-all shadow-md cursor-pointer text-center uppercase tracking-wider"
                >
                  {editingProduct ? "Save Changes" : "Create Listing"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
