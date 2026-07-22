import { PRODUCTS } from './data';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, UserProfile } from './types';
import { getProducts } from './firebaseProducts';
import HomePage from './components/HomePage';
import CategoryShop from './components/CategoryShop';
import ProductDetails from './components/ProductDetails';
import AccountDashboard from './components/AccountDashboard';
import DesignSystemViewer from './components/DesignSystemViewer';
import BrandsPage from './components/BrandsPage';
import ContactPage from './components/ContactPage';
import AuthPages from './components/AuthPages';
import { formatPrice } from './utils/currency';

import { 
  ShoppingBag, Heart, Search, Sparkles, User, 
  Settings, Clock, X, Trash2, CheckCircle2, ChevronRight, HelpCircle,
  ChevronDown, Menu, ArrowRight, Star, Tag, Award, ShieldCheck, Mail, Phone, MapPin, Compass, Mic,
  RotateCcw, Lock, CreditCard, Gift, Truck, Package, LogOut
} from 'lucide-react';

const megaMenuColumns = [
  {
    title: 'Apparel & Activewear',
    icon: <Compass className="w-3.5 h-3.5 text-blue-500" />,
    items: [
      { name: 'Fashion', desc: 'Unstructured coats & organic sets' },
      { name: 'Sports & Fitness', desc: 'Performance meshes & gear' },
      { name: 'Accessories', desc: 'Bespoke glass & carries' }
    ]
  },

  {
    title: 'Electronics & Tools',
    icon: <Settings className="w-3.5 h-3.5 text-blue-500" />,
    items: [
      { name: 'Electronics', desc: 'Aero-cellulose spatial audio' },
      { name: 'Automotive', desc: 'Precision mechanical accessories' },
      { name: 'Books & Stationery', desc: 'Brass pens & unruled journals' }
    ]
  },
  {
    title: 'Home & Spatial Objects',
    icon: <MapPin className="w-3.5 h-3.5 text-blue-500" />,
    items: [
      { name: 'Home & Living', desc: 'Brutalist clay & wood kilns' },
      { name: 'Kitchen & Dining', desc: 'Handfired stoneware pieces' },
      { name: 'Pet Supplies', desc: 'Tailored natural wool mats' }
    ]
  },
  {
    title: 'Self-Care & Wellness',
    icon: <Sparkles className="w-3.5 h-3.5 text-blue-500" />,
    items: [
      { name: 'Beauty & Personal Care', desc: 'Cold bioactive serum oils' },
      { name: 'Health & Wellness', desc: 'Thermal sensory eye masks' },
      { name: 'Baby & Kids', desc: 'Certified organic cotton items' }
    ]
  },
  {
    title: 'Curated Token Gifts',
    icon: <Award className="w-3.5 h-3.5 text-blue-500" />,
    items: [
      { name: 'Toys & Games', desc: 'Sustainable wooden puzzles' },
      { name: 'Gifts', desc: 'Signature voucher card sets' },
      { name: 'Seasonal Deals', desc: 'Active campaigns & 20% vouchers' }
    ]
  }
];

export default function App() {
  // Navigation & Screen Control
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'product' | 'style' | 'account' | 'brands' | 'contact' | 'auth'>('home');
  const [accountSubTab, setAccountSubTab] = useState<any>('profile');
  const [accountTrackingOrderId, setAccountTrackingOrderId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Products Local Store State
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);

  // Shopping States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Bespoke Ceramic', 'Sensory Eye Mask', 'Lounge Coat', 'Bioactive Serum'
  ]);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Listening...');

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // value in percentage
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Save for Later List
  const [saveForLater, setSaveForLater] = useState<CartItem[]>([]);
  // Last removed item for Undo
  const [lastRemovedItem, setLastRemovedItem] = useState<CartItem | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Mock User Profile State
const [currentUser, setCurrentUser] = useState<UserProfile | null>({
  fullName: 'Oliver Smith',
  email: 'oliver.smith@example.co.uk',
  phone: '+44 7700 900123',
  status: 'Platinum Tier',
  memberSince: 'January 2026',
  loyaltyPoints: 1250
});
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleUpdateProfile = (updatedUser: { fullName: string; email: string; phone: string }) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone
      };
    });
  };

  useEffect(() => {
  async function loadProducts() {
    try {
      console.log("Loading products from Firebase...");

      const firebaseProducts = await getProducts();

      console.log("Firebase returned:", firebaseProducts);

      if (firebaseProducts.length > 0) {
        setProductsList(firebaseProducts as Product[]);
        setSelectedProduct(firebaseProducts[0] as Product);
      }
    } catch (error) {
      console.error("Error loading Firebase products:", error);
    }
  }

  loadProducts();
}, []);

  // Redirect to login if account dashboard is accessed while logged out
  React.useEffect(() => {
    if (currentTab === 'account' && !currentUser) {
      setCurrentTab('auth');
    }
  }, [currentTab, currentUser]);

  // Checkout Flow & Stepper states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [isAddressValidating, setIsAddressValidating] = useState(false);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'biometric' | 'cod'>('cod');
  
  const [shippingName, setShippingName] = useState('Oliver Smith');
const [shippingStreet, setShippingStreet] = useState('221B Baker Street');
const [shippingCity, setShippingCity] = useState('London');
const [shippingArea, setShippingArea] = useState('Marylebone');
const [shippingState, setShippingState] = useState('Greater London');
const [shippingZip, setShippingZip] = useState('NW1 6XE');
const [shippingPhone, setShippingPhone] = useState('+44 7700 900123');

  // Sync shipping info with active profile changes
  React.useEffect(() => {
    if (currentUser) {
      setShippingName(currentUser.fullName);
      setShippingPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Delivery Estimator states
  const [estimatorZip, setEstimatorZip] = useState('');
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  // Success Confirmation state
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<Order | undefined>(undefined);
  const [activePolicy, setActivePolicy] = useState<'about' | 'faq' | 'privacy' | 'terms' | 'shipping' | 'returns' | null>(null);

  // Complete Order History Track State
  const [activeOrder, setActiveOrder] = useState<Order | undefined>(undefined);

  // Add Product to Cart handler
  const handleAddToCart = (product: Product, color: string, size: string) => {
    const itemKey = `${product.id}-${color}-${size}`;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === itemKey);
      if (existing) {
        return prevCart.map((item) => 
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, {
        id: itemKey,
        product,
        quantity: 1,
        selectedColor: color,
        selectedSize: size
      }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  // Upgraded Removal with Undo support
  const handleRemoveFromCart = (id: string) => {
    const itemToRemove = cart.find(item => item.id === id);
    if (itemToRemove) {
      setLastRemovedItem(itemToRemove);
      setShowUndoToast(true);
      // Auto dismiss undo toast after 8 seconds
      setTimeout(() => setShowUndoToast(false), 8000);
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleUndoRemove = () => {
    if (lastRemovedItem) {
      setCart((prev) => [...prev, lastRemovedItem]);
      setLastRemovedItem(null);
      setShowUndoToast(false);
    }
  };

  // Save for later workflows
  const handleSaveForLater = (id: string) => {
    const itemToSave = cart.find(item => item.id === id);
    if (itemToSave) {
      setSaveForLater(prev => [...prev, itemToSave]);
      setCart(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleMoveToCartFromSave = (id: string) => {
    const itemToRestore = saveForLater.find(item => item.id === id);
    if (itemToRestore) {
      setCart(prev => [...prev, itemToRestore]);
      setSaveForLater(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleRemoveFromSaveForLater = (id: string) => {
    setSaveForLater(prev => prev.filter(item => item.id !== id));
  };

  // Zip Code Delivery Estimator
  const handleEstimateDelivery = () => {
    if (!estimatorZip || estimatorZip.length < 5) return;
    setIsEstimating(true);
    setTimeout(() => {
      setIsEstimating(false);
      const deliveryDays = estimatorZip.startsWith('9') ? 2 : estimatorZip.startsWith('1') ? 3 : 4;
      const date = new Date();
      date.setDate(date.getDate() + deliveryDays);
      setEstimatedArrivalDate(date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    }, 450);
  };

  // Address recognition checker
  const handleValidateAddress = () => {
    if (!shippingStreet || !shippingCity || !shippingZip) return;
    setIsAddressValidating(true);
    setTimeout(() => {
      setIsAddressValidating(false);
      setIsAddressValidated(true);
    }, 700);
  };

  // Add or Toggle Product to Wishlist
  const handleAddToWishlist = (product: Product) => {
    setWishlist((prevWish) => {
      const exists = prevWish.some((p) => p.id === product.id);
      if (exists) {
        return prevWish.filter((p) => p.id !== product.id);
      }
      return [...prevWish, product];
    });
  };

  const handleMoveWishToCart = (product: Product) => {
    handleAddToCart(product, product.colors[0], product.sizes[0]);
    setWishlist((prev) => prev.filter((p) => p.id !== product.id));
  };

  // Seller Listing Callbacks
  const handleAddProduct = (newProduct: Product) => {
    setProductsList((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  };

  // Global Navigation Helper
  const handleNavigateToProduct = (id: string) => {
    const found = productsList.find((p) => p.id === id);
    if (found) {
      setSelectedProduct(found);
      setCurrentTab('product');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToShop = (category?: string) => {
    if (category) {
      setCategoryFilter(category);
    } else {
      setCategoryFilter('All');
    }
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search Logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const hits = productsList.filter((p) => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(hits);
  };

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    const hits = productsList.filter((p) => 
      p.name.toLowerCase().includes(term.toLowerCase()) || 
      p.brand.toLowerCase().includes(term.toLowerCase()) ||
      p.category.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(hits);
    
    // Add to recent searches (up to 5 items)
    setRecentSearches(prev => {
      const filtered = prev.filter(x => x.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 5);
    });
  };

  const triggerVoiceSearch = () => {
    setIsVoiceSearching(true);
    setVoiceStatus('Listening for pieces...');
    
    // Step 1: Simulating listening status
    setTimeout(() => {
      setVoiceStatus('Processing audio specs...');
    }, 1100);

    // Step 2: Simulating voice recognition
    setTimeout(() => {
      setVoiceStatus('Recognized: "Ceramic Tableware"');
    }, 2300);

    // Step 3: Trigger search
    setTimeout(() => {
      setIsVoiceSearching(false);
      handleSelectSearchTerm('Ceramic Tableware');
      setIsSearchFocused(true);
    }, 3300);
  };

  // Coupon application logic
  const handleApplyCoupon = () => {
    setPromoError('');
    setPromoSuccess('');
    if (promoCode.toUpperCase() === 'DREAM20') {
      setAppliedDiscount(20);
      setPromoSuccess('Promo coupon DREAM20 successfully applied (20% Off).');
    } else {
      setPromoError('Invalid coupon voucher code. Please try again.');
    }
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountSum = Number((cartSubtotal * (appliedDiscount / 100)).toFixed(2));
  const taxSum = Number(((cartSubtotal - discountSum) * 0.20).toFixed(2)); // 20% VAT (UK standard)
  
  // Free delivery above £100.00, otherwise £4.99 standard delivery cost
  const baseShipping = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 4.99;
  const shippingSum = shippingSpeed === 'standard' 
    ? baseShipping 
    : shippingSpeed === 'express' 
      ? baseShipping + 2.50 
      : baseShipping + 5.00;

  const cartTotal = Number((cartSubtotal - discountSum + taxSum + shippingSum).toFixed(2));

  // Checkout Placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Generate real custom order log
    const orderLog: Order = {
      id: `DS-${Math.floor(10000 + Math.random() * 90000)}-2026`,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountSum,
      tax: taxSum,
      shipping: shippingSum,
      total: cartTotal,
      status: 'processing',
      trackingNumber: `TR_UK_${Math.floor(100000000 + Math.random() * 900000000)}`,
      estimatedDelivery: shippingSpeed === 'standard' ? '2 to 5 business days (UK Standard Delivery)' : shippingSpeed === 'express' ? '2 business days (Express Courier)' : '1 business day (Next-Day Delivery across UK)',
      shippingAddress: {
        fullName: shippingName,
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        area: shippingArea,
        zipCode: shippingZip,
        country: 'United Kingdom',
        phone: shippingPhone
      },
      paymentMethod: selectedPaymentMethod === 'cod' ? 'Cash on Delivery (COD)' : selectedPaymentMethod === 'card' ? `Visa ending in ${paymentCard}` : 'Instant Biometric Secured Token Pay',
      date: new Date().toISOString().split('T')[0],
      events: [
        { title: 'Order Placed Successfully', description: selectedPaymentMethod === 'cod' ? 'Cash on Delivery order booked.' : 'Transaction processed and settled securely.', time: 'Just now', done: true },
        { title: 'Processing & Verification', description: 'Address verified for delivery dispatch.', time: 'Just now', done: true }
      ]
    };

    setActiveOrder(orderLog);
    setOrderSuccessDetails(orderLog);
    setCart([]); // Clear cart
    setAppliedDiscount(0);
    setPromoCode('');
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCheckoutStep(1);
    setIsAddressValidated(false);
    setShippingSpeed('standard');
    setShowOrderSuccessModal(true); // Open the beautiful confirmation screen
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col justify-between">
      
      {/* 0. ANNOUNCEMENT BANNER */}
      <div className="bg-slate-950 text-white py-2 px-4 text-center text-[10px] font-mono uppercase tracking-widest border-b border-slate-900 flex justify-center items-center select-none">
        <span>✨ Complimentary Delivery on Orders over £100.00 • Enter code <strong className="text-blue-400">DREAM20</strong> for 20% off ✨</span>
      </div>

      {/* 1. ELITE GLOBAL HEADER */}
      <header className="sticky top-0 z-40 bg-[#FCFCFC]/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 relative">
          
          {/* Logo Brand Typography */}
          <div 
            onClick={() => {
              setCurrentTab('home');
              setIsMegaMenuOpen(false);
            }}
            className="flex items-center cursor-pointer shrink-0 select-none group"
          >
            <span className="font-display font-light text-slate-950 text-base md:text-lg tracking-[0.25em] uppercase transition-all duration-300 group-hover:tracking-[0.28em]">
              DREAM<span className="font-bold text-blue-600">SHELF</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-home"
              onClick={() => {
                setCurrentTab('home');
                setIsMegaMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-sans font-bold tracking-tight transition-all cursor-pointer relative group ${
                currentTab === 'home' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Home
              {currentTab === 'home' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              id="nav-shop"
              onClick={() => {
                setCategoryFilter('All');
                setBrandFilter('All');
                setCurrentTab('shop');
                setIsMegaMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-sans font-bold tracking-tight transition-all cursor-pointer relative group ${
                currentTab === 'shop' && categoryFilter === 'All' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Shop
              {currentTab === 'shop' && categoryFilter === 'All' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            {/* Categories Menu Trigger */}
            <div 
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                id="nav-categories-trigger"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-sans font-bold tracking-tight transition-all cursor-pointer flex items-center gap-1 ${
                  isMegaMenuOpen || (categoryFilter !== 'All' && currentTab === 'shop') ? 'text-blue-600 font-extrabold' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Categories <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <button
              id="nav-brands"
              onClick={() => {
                setCurrentTab('brands');
                setIsMegaMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-sans font-bold tracking-tight transition-all cursor-pointer relative group ${
                currentTab === 'brands' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Brands
              {currentTab === 'brands' && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>


          </nav>

          {/* Search bar & utilities */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search input with shortcut badge */}
            <div className="relative hidden lg:block w-64 xl:w-72 transition-all duration-300">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input 
                  id="search-input"
                  type="text" 
                  placeholder="Search catalog tags..." 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm"
                />
                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                  <button
                    id="voice-search-mic"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerVoiceSearch();
                    }}
                    className="p-1 hover:text-blue-600 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Search by voice"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <span className="bg-slate-200/60 border border-slate-200 text-slate-500 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded leading-none select-none">
                    ⌘K
                  </span>
                </div>
              </div>
              
              {/* Invisible full-screen dismiss overlay when focused */}
              {isSearchFocused && (
                <div className="fixed inset-0 z-40" onClick={() => setIsSearchFocused(false)} />
              )}

              {/* Upgraded Smart Search Dropdown */}
              {isSearchFocused && (
                <div 
                  id="search-dropdown" 
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 space-y-4 z-50 max-h-[480px] overflow-y-auto animate-fadeIn duration-200 text-left"
                >
                  {/* Empty query state: show Recents, Trending, and Categories */}
                  {!searchQuery.trim() ? (
                    <div className="space-y-4">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                            <span>Recent Searches</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecentSearches([]);
                              }}
                              className="hover:text-red-500 transition-colors"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {recentSearches.map((term, i) => (
                              <div key={i} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg text-[10px] font-sans hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer" onClick={() => handleSelectSearchTerm(term)}>
                                <Clock className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                                <span className="text-slate-600 group-hover:text-blue-700 font-semibold">{term}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRecentSearches(prev => prev.filter(x => x !== term));
                                  }}
                                  className="text-slate-300 hover:text-slate-600 p-0.5 rounded-full"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trending Searches */}
                      <div className="space-y-2">
                        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Trending Searches</div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Ceramic', 'Lounge Coat', 'Bioactive Serum', 'Audio', 'Knit Blazer'].map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSelectSearchTerm(term)}
                              className="px-2 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 text-slate-700 hover:text-blue-700 text-[10px] font-semibold font-sans rounded-lg transition-all"
                            >
                              🔥 {term}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Popular Sectors */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Popular Sectors</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: 'Fashion', label: 'Apparel Sector' },
                            { name: 'Electronics', label: 'Acoustic Sector' },
                            { name: 'Home & Living', label: 'Ceramics Sector' },
                            { name: 'Beauty & Personal Care', label: 'Botanicals Sector' }
                          ].map((col) => (
                            <button
                              key={col.name}
                              onClick={() => {
                                setCategoryFilter(col.name);
                                setBrandFilter('All');
                                setCurrentTab('shop');
                                setIsSearchFocused(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-left p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all flex items-center gap-2 group"
                            >
                              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-[10px]">{col.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SearchQuery active: show suggestions, products and Spellcheck / Did you mean */
                    <div className="space-y-4">
                      {/* Spellcheck / Suggestion / Did you mean */}
                      {searchResults.length === 0 && (
                        <div className="bg-amber-50/50 border border-amber-100/60 p-2.5 rounded-2xl text-[10px] text-slate-700 space-y-1">
                          <span className="font-mono text-amber-800 font-bold uppercase tracking-wider block">Did you mean?</span>
                          <p className="leading-normal">
                            Try curation keywords like{' '}
                            <button onClick={() => handleSelectSearchTerm('Ceramic')} className="font-bold text-blue-600 hover:underline">Ceramic</button>,{' '}
                            <button onClick={() => handleSelectSearchTerm('Lounge')} className="font-bold text-blue-600 hover:underline">Lounge</button>,{' '}
                            <button onClick={() => handleSelectSearchTerm('Serum')} className="font-bold text-blue-600 hover:underline">Serum</button>, or{' '}
                            <button onClick={() => handleSelectSearchTerm('Audio')} className="font-bold text-blue-600 hover:underline">Audio</button>.
                          </p>
                        </div>
                      )}

                      {/* Matching Products */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                          <span>Search Results ({searchResults.length})</span>
                        </div>
                        {searchResults.length > 0 ? (
                          <div className="space-y-1.5">
                            {searchResults.slice(0, 4).map((hit) => (
                              <div 
                                id={`search-hit-${hit.id}`}
                                key={hit.id}
                                onClick={() => {
                                  handleNavigateToProduct(hit.id);
                                  // Add to recents
                                  setRecentSearches(prev => {
                                    const filtered = prev.filter(x => x !== hit.name);
                                    return [hit.name, ...filtered].slice(0, 5);
                                  });
                                  setIsSearchFocused(false);
                                  setSearchQuery('');
                                }}
                                className="flex gap-2.5 p-1.5 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 cursor-pointer transition-all items-center group"
                              >
                                <img src={hit.images[0]} className="w-8 h-8 object-cover rounded-lg border border-slate-100 bg-slate-50" />
                                <div className="text-[10px] font-sans min-w-0 flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{hit.name}</span>
                                    <span className="font-mono text-slate-950 font-bold ml-2">{formatPrice(hit.price)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] text-slate-400 mt-0.5">
                                    <span>{hit.brand} • {hit.category}</span>
                                    {hit.stock <= 3 && hit.stock > 0 && <span className="text-amber-600 font-bold font-mono">ONLY {hit.stock} LEFT</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Empty Search Illustration */
                          <div className="text-center py-4 space-y-2">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                              <Search className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 text-[10px] block">No items match</span>
                              <p className="text-[9px] text-slate-400 max-w-[180px] mx-auto leading-normal">
                                Try adjusting tags or clearing filters to see our full boutique offerings.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist triggers */}
            <button 
              id="header-wish-btn"
              onClick={() => setIsWishlistOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition-all relative cursor-pointer"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart trigger */}
            <button 
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-xl bg-slate-950 text-white hover:bg-blue-600 transition-all relative cursor-pointer shadow-sm flex items-center justify-center"
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Profile Trigger Container for Dropdown */}
            <div className="relative">
              <button
                id="header-profile-btn"
                onClick={() => {
                  if (!currentUser) {
                    setCurrentTab('auth');
                  } else {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  }
                }}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  currentTab === 'account' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-950'
                }`}
                title="Client Profile Dashboard"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Profile Dropdown Menu */}
              {currentUser && isProfileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsProfileDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl p-2 z-50 animate-fadeInDown">
                    <div className="px-3 py-2.5 border-b border-slate-50 mb-1.5 text-left">
                      <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">SIGNED IN AS</span>
                      <span className="block font-sans text-xs font-black text-slate-900 truncate">{currentUser.fullName}</span>
                      <span className="block font-mono text-[9px] text-blue-600 truncate">{currentUser.email}</span>
                    </div>
                    <ul className="space-y-0.5 text-xs text-left">
                      {[
                        { label: 'My Account', subTab: 'profile', icon: User },
                        { label: 'My Orders', subTab: 'orders', icon: Package },
                        { label: 'Wishlist', subTab: 'wishlist', icon: Heart },
                        { label: 'Saved Addresses', subTab: 'addresses', icon: MapPin },
                        { label: 'Help & Support', subTab: 'support', icon: HelpCircle },
                      ].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <li key={index}>
                            <button
                              onClick={() => {
                                setAccountSubTab(item.subTab as any);
                                setCurrentTab('account');
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl text-left text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2.5 font-medium"
                            >
                              <IconComponent className="w-4 h-4 text-slate-400" />
                              <span>{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                      <li className="pt-1.5 border-t border-slate-50 mt-1">
                        <button
                          onClick={() => {
                            setCurrentUser(null);
                            setCurrentTab('home');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-all cursor-pointer flex items-center gap-2.5 font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger toggle */}
            <button 
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 md:hidden cursor-pointer flex items-center justify-center"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Mega Menu Dropdown inside Header, absolute positioned */}
          {isMegaMenuOpen && (
            <div 
              id="categories-mega-menu"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
              className="absolute left-0 right-0 top-full w-full bg-white/98 backdrop-blur-md border-b border-slate-200/50 shadow-2xl p-8 z-50 animate-fadeInDown grid grid-cols-1 md:grid-cols-5 gap-6 rounded-b-3xl border-t border-slate-100"
            >
              {megaMenuColumns.map((col, idx) => (
                <div key={idx} className="space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest select-none">
                    {col.icon}
                    <span>{col.title}</span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {col.items.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={() => {
                            setCategoryFilter(item.name);
                            setBrandFilter('All');
                            setCurrentTab('shop');
                            setIsMegaMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-left w-full hover:text-blue-600 transition-colors flex flex-col group cursor-pointer"
                        >
                          <span className="font-sans font-bold text-slate-800 flex items-center justify-between">
                            {item.name}
                            <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal mt-0.5 font-sans leading-none">{item.desc}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN DISPLAY SWITCH FRAME */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 w-full">
        {currentTab === 'home' && (
          <HomePage 
            onNavigateToShop={handleNavigateToShop}
            onNavigateToProduct={handleNavigateToProduct}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            products={productsList}
            wishlistIds={wishlist.map(w => w.id)}
          />
        )}

        {currentTab === 'shop' && (
          <CategoryShop 
            onNavigateToProduct={handleNavigateToProduct}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            wishlistIds={wishlist.map(w => w.id)}
            initialCategoryFilter={categoryFilter}
            initialBrandFilter={brandFilter}
            productsList={productsList}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'brands' && (
          <BrandsPage 
            onNavigateToShopWithBrand={(brand) => {
              setBrandFilter(brand);
              setCategoryFilter('All');
              setCurrentTab('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            availableBrands={Array.from(new Set(productsList.map(p => p.brand)))}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage onBackToHome={() => setCurrentTab('home')} />
        )}

        {currentTab === 'product' && (
          <ProductDetails 
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            onNavigateToProduct={handleNavigateToProduct}
            isInWishlist={wishlist.some(w => w.id === selectedProduct.id)}
            onBackToShop={() => setCurrentTab('shop')}
          />
        )}

        {currentTab === 'style' && (
          <DesignSystemViewer />
        )}

        {currentTab === 'account' && currentUser && (
          <AccountDashboard 
            initialSubTab={accountSubTab}
            initialTrackingOrderId={accountTrackingOrderId}
            onClearTracking={() => setAccountTrackingOrderId(null)}
            wishlist={wishlist}
            onToggleWishlist={handleAddToWishlist}
            onMoveWishToCart={handleMoveWishToCart}
            onNavigateToProduct={handleNavigateToProduct}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onLogout={() => {
              setCurrentUser(null);
              setCurrentTab('home');
            }}
          />
        )}

        {currentTab === 'auth' && (
          <AuthPages 
            onSuccess={(user) => {
              setCurrentUser(user);
              setCurrentTab('account');
            }}
            onCancel={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* 3. CART SLIDE-OVER DRAWER SHEET */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-sans font-extrabold text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" /> Shopping Bag
                </h3>
                <button 
                  id="close-cart-btn"
                  onClick={() => setIsCartOpen(false)} 
                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scroll body list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Shipping Progress Meter */}
                {cart.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-sans font-bold text-slate-700 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" /> Delivery Progress
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {cartSubtotal >= 100 ? "COMPLIMENTARY SECURED" : `${formatPrice(cartSubtotal)} / £100.00`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${cartSubtotal >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                        style={{ width: `${Math.min((cartSubtotal / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                      {cartSubtotal >= 100 
                        ? "✓ Congratulations! Your order qualifies for free delivery."
                        : `Add ${formatPrice(100 - cartSubtotal)} more of curated pieces to qualify for complimentary delivery!`
                      }
                    </p>
                  </div>
                )}

                {/* Main Cart Items */}
                <div className="space-y-3.5">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Shopping Bag Items ({cart.length})</span>
                  {cart.length > 0 ? (
                    cart.map((item) => (
                       <div id={`cart-item-${item.id}`} key={item.id} className="flex gap-4 items-center bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                        <img src={item.product.images[0]} alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-100 bg-slate-50" />
                        
                        <div className="flex-1 min-w-0 space-y-1 text-xs">
                          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block">{item.product.brand}</span>
                          <h4 className="font-sans font-bold text-slate-900 truncate">{item.product.name}</h4>
                          <span className="font-mono text-[10px] text-slate-500 block">Tone: {item.selectedColor} • Dimension: {item.selectedSize}</span>
                          
                          {/* Quantity controllers */}
                          <div className="flex items-center gap-2 pt-1">
                            <button 
                              id={`qty-minus-${item.id}`}
                              onClick={() => handleUpdateCartQuantity(item.id, -1)}
                              className="w-5 h-5 bg-slate-50 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-[11px] text-slate-900 w-4 text-center">{item.quantity}</span>
                            <button 
                              id={`qty-plus-${item.id}`}
                              onClick={() => handleUpdateCartQuantity(item.id, 1)}
                              className="w-5 h-5 bg-slate-50 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between items-end h-full min-h-[56px]">
                          <span className="font-mono font-bold text-slate-900 text-xs block">{formatPrice(item.product.price * item.quantity)}</span>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleSaveForLater(item.id)}
                              className="text-[9px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              title="Save this piece for later browsing"
                            >
                              Save for Later
                            </button>
                            <button 
                              id={`del-cart-item-${item.id}`}
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-10 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block text-xs">Your bag is empty</span>
                        <p className="text-[10px] max-w-[240px] mx-auto leading-normal text-slate-400">Browse our boutique catalog to curate and add exquisite pieces.</p>
                      </div>
                      <button 
                        onClick={() => { setIsCartOpen(false); setCurrentTab('shop'); }}
                        className="mt-2 px-4 py-1.5 bg-slate-950 text-white text-[10px] font-sans font-bold rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Shop New Releases
                      </button>
                    </div>
                  )}
                </div>

                {/* Save For Later Section */}
                {saveForLater.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold text-blue-600">Saved For Later ({saveForLater.length})</span>
                    <div className="space-y-2">
                      {saveForLater.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs">
                          <img src={item.product.images[0]} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h5 className="font-bold text-slate-800 truncate">{item.product.name}</h5>
                            <span className="text-[10px] text-slate-500 font-mono">{formatPrice(item.product.price)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMoveToCartFromSave(item.id)}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 font-bold text-[9px] rounded-lg transition-colors flex items-center gap-1"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => handleRemoveFromSaveForLater(item.id)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Date Estimator */}
                {cart.length > 0 && (
                  <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3 text-xs">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Estimated Dispatch Calculator</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={5}
                        placeholder="ZIP / Postal Code (e.g. 98102)"
                        value={estimatorZip}
                        onChange={(e) => setEstimatorZip(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button 
                        onClick={handleEstimateDelivery}
                        disabled={estimatorZip.length < 5 || isEstimating}
                        className="px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-sans font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        {isEstimating ? "Calculating..." : "ESTIMATE"}
                      </button>
                    </div>
                    {estimatedArrivalDate && (
                      <div className="p-2.5 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-sans text-blue-800">
                          Estimated Delivery: <strong className="font-bold">{estimatedArrivalDate}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Upselling / Recommended items in Cart */}
                {cart.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold text-amber-600">Exclusive Cart Additions</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {productsList.filter(p => !cart.some(item => item.product.id === p.id)).slice(0, 2).map((item) => (
                        <div key={item.id} className="flex gap-3 items-center bg-white border border-slate-100 p-2.5 rounded-xl">
                          <img src={item.images[0]} className="w-10 h-10 object-cover rounded-lg bg-slate-50" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-800 text-[11px] truncate">{item.name}</h5>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono font-bold">{formatPrice(item.price)}</span>
                              <span className="text-[9px] text-amber-600 font-bold font-sans">🔥 Popular addition</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item, item.colors[0], item.sizes[0])}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white font-sans font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                          >
                            + Quick Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Calculations & checkout */}
              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                  {/* Promo vouchers inputs */}
                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">Client Promo Voucher Code</span>
                    <div className="flex gap-2">
                      <input 
                        id="promo-input"
                        type="text" 
                        placeholder="e.g. DREAM20" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button 
                        id="apply-promo-btn"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-sans font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        APPLY
                      </button>
                    </div>
                    {promoError && <span className="block text-[10px] text-red-600 font-semibold">{promoError}</span>}
                    {promoSuccess && <span className="block text-[10px] text-blue-600 font-semibold">{promoSuccess}</span>}
                  </div>

                  <div className="space-y-1.5 border-t border-slate-200/60 pt-4 font-sans text-xs font-medium">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal amount</span>
                      <span className="font-mono">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-blue-600 font-semibold">
                        <span>Campaign Discount (-{appliedDiscount}%)</span>
                        <span className="font-mono">-{formatPrice(discountSum)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Sales Tax (13% GST)</span>
                      <span className="font-mono">{formatPrice(taxSum)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Nationwide Delivery</span>
                      <span className="font-mono">{shippingSum === 0 ? 'COMPLIMENTARY' : formatPrice(shippingSum)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-200/40 pt-2.5">
                      <span>Total Invoice</span>
                      <span className="font-mono text-sm">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button 
                    id="trigger-checkout-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3.5 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    PROCEED TO SECURE CHECKOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. WISHLIST SLIDE-OVER SHEET */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={() => setIsWishlistOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-sans font-extrabold text-slate-900 text-base uppercase tracking-wider flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600 fill-red-50" /> Portfolio Wishlist
                </h3>
                <button 
                  id="close-wish-btn"
                  onClick={() => setIsWishlistOpen(false)} 
                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <div id={`wish-item-${item.id}`} key={item.id} className="flex gap-4 items-center bg-white border border-slate-50 p-3.5 rounded-2xl shadow-sm">
                      <img src={item.images[0]} alt="" className="w-12 h-12 object-cover rounded-xl border border-slate-100" />
                      
                      <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                        <span className="font-mono text-[9px] text-slate-400 block uppercase font-bold">{item.brand}</span>
                        <h4 className="font-sans font-bold text-slate-900 truncate">{item.name}</h4>
                        <span className="font-mono text-[10px] text-emerald-800 font-bold block">{formatPrice(item.price)}</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          id={`wish-bag-btn-${item.id}`}
                          onClick={() => handleMoveWishToCart(item)}
                          className="p-2 bg-slate-900 hover:bg-emerald-800 text-white rounded-xl transition-all"
                          title="Move to bag"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          id={`wish-del-btn-${item.id}`}
                          onClick={() => handleAddToWishlist(item)}
                          className="p-2 bg-slate-100 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-12 space-y-2">
                    <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="font-bold text-slate-800 block">Wishlist is empty</span>
                    <p className="text-[11px] max-w-xs mx-auto leading-normal">Keep tabs on limited aesthetic items during high-demand releases.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MULTI-STEP CHECKOUT FORM MODAL OVERLAY */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-55 overflow-y-auto font-sans flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsCheckoutOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full p-6 md:p-8 relative z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">DreamShelf Secure Portal</span>
                <h3 className="font-sans font-extrabold text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Secure Checkout
                </h3>
              </div>
              <button 
                id="close-checkout-btn"
                onClick={() => { setIsCheckoutOpen(false); setCheckoutStep(1); }} 
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicator Stepper */}
            <div className="grid grid-cols-3 gap-2 pb-2">
              {[
                { step: 1, label: "1. Shipping", desc: "Address & Method" },
                { step: 2, label: "2. Payment", desc: "Card details" },
                { step: 3, label: "3. Review", desc: "Order summary" }
              ].map((s) => (
                <div key={s.step} className="text-center space-y-1">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${checkoutStep >= s.step ? "bg-blue-600" : "bg-slate-100"}`} />
                  <span className={`block text-[10px] font-sans font-bold transition-colors ${checkoutStep === s.step ? "text-blue-600" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* STEP 1: SHIPPING DETAILS */}
              {checkoutStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Shipping & Contact Details</span>
                    <span className="text-[10px] text-slate-400 font-mono">Step 1 of 3</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={shippingName} 
                        onChange={(e) => setShippingName(e.target.value)} 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">Phone Number</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g'+44 7700 900123'"
                        value={shippingPhone} 
                        onChange={(e) => setShippingPhone(e.target.value)} 
                        className="w-full px-4 py-2.5 bg-[#F6FAF6] border border-emerald-100 focus:bg-white rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-slate-800 font-mono" 
                      />
                    </div>
                    <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">
  County
</label>

<select
  required
  value={shippingState}
  onChange={(e) => {
    setShippingState(e.target.value);
    setIsAddressValidated(false);
  }}
  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-xs font-sans text-slate-800"
>
  <option value="Greater London">Greater London</option>
  <option value="Greater Manchester">Greater Manchester</option>
  <option value="West Midlands">West Midlands</option>
  <option value="Merseyside">Merseyside</option>
  <option value="West Yorkshire">West Yorkshire</option>
  <option value="Kent">Kent</option>
  <option value="Surrey">Surrey</option>
  <option value="Essex">Essex</option>
  <option value="Hampshire">Hampshire</option>
  <option value="Lancashire">Lancashire</option>
</select>
           </div>

<div>
  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">
    City
  </label>
  <input
    type="text"
    required
    placeholder="e.g. London, Manchester"
    value={shippingCity}
    onChange={(e) => {
      setShippingCity(e.target.value);
      setIsAddressValidated(false);
    }}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
  />
</div>

<div>
  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">
    Town / District
  </label>
  <input
    type="text"
    required
    placeholder="e.g. Westminster, Kensington"
    value={shippingArea}
    onChange={(e) => {
      setShippingArea(e.target.value);
      setIsAddressValidated(false);
    }}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
  />
</div>

<div>
  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">
    Postcode
  </label>
  <input
    type="text"
    required
    placeholder="e.g. SW1A 1AA"
    value={shippingZip}
    onChange={(e) => {
      setShippingZip(e.target.value.toUpperCase());
      setIsAddressValidated(false);
    }}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-mono"
  />
</div>

<div className="md:col-span-2">
  <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1 font-bold">
    Street Address
  </label>

  <div className="relative">
    <input
      type="text"
      required
      placeholder="e.g. Flat 5, 221B Baker Street"
      value={shippingStreet}
      onChange={(e) => {
        setShippingStreet(e.target.value);
        setIsAddressValidated(false);
      }}
      className="w-full pl-4 pr-24 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
    />

    <button
      type="button"
      onClick={handleValidateAddress}
      disabled={!shippingStreet || isAddressValidating}
      className="absolute right-2 top-2 px-2.5 py-1 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-mono text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
    >
      {isAddressValidating ? "Checking..." : "CHECK"}
    </button>
  </div>

  {isAddressValidated && (
  <span className="block text-[9px] text-emerald-600 font-sans mt-1.5 font-bold flex items-center gap-1">
    ✓ Address verified for UK delivery
  </span>
)}
</div>   {/* closes md:col-span-2 */}

</div>   {/* closes the grid started on line 1421 */}

{/* Delivery Speed Selector Tiers */}
<div className="space-y-2.5 pt-2">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Shipping Method</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {[
                        { id: 'standard', title: 'Standard Ground', desc: '2-5 business days', price: cartSubtotal >= 100 ? "COMPLIMENTARY" : "+£4.99" },
                        { id: 'express', title: 'Express Courier', desc: '2 business days', price: cartSubtotal >= 100 ? "+£2.50" : "+£7.49" },
                        { id: 'overnight', title: 'Next-Day Delivery', desc: 'Next business morning', price: cartSubtotal >= 100 ? "+£5.00" : "+£9.99" }
                      ].map((tier) => (
                        <div 
                          key={tier.id}
                          onClick={() => setShippingSpeed(tier.id as any)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer text-left transition-all relative ${
                            shippingSpeed === tier.id 
                              ? "bg-blue-50/50 border-blue-600 text-blue-900" 
                              : "bg-white border-slate-100 hover:border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="font-bold text-[11px] font-sans flex justify-between items-center">
                            <span>{tier.title}</span>
                            {shippingSpeed === tier.id && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />}
                          </div>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{tier.desc}</span>
                          <span className="block text-[10px] font-mono font-bold mt-1.5">{tier.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(2)}
                      className="w-full py-3 bg-slate-900 text-white hover:bg-blue-600 text-xs font-sans font-bold rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Continue to Payment Method
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SECURED PAYMENT METHOD DETAILS */}
              {checkoutStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Payment Method</span>
                    <span className="text-[10px] text-slate-400 font-mono">Step 2 of 3</span>
                  </div>

                  <div className="p-6 text-center space-y-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl animate-fadeIn text-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                      <Truck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-slate-900 text-sm">Cash on Delivery (COD)</h5>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-[340px] mx-auto font-medium">
                        Pay in cash when your order is delivered anywhere in UK.
                      </p>
                    </div>
                    <span className="inline-flex bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-3 py-1 rounded border border-emerald-200 uppercase tracking-wide">
                      COD Supported across UK
                    </span>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="group flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-sans font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
                      <span>Back to Shipping</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(3)}
                      className="flex-1 py-3 bg-slate-900 text-white hover:bg-blue-600 text-xs font-sans font-bold rounded-xl transition-all"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER OVERVIEW SUMMARY REVIEW */}
              {checkoutStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Final Review & Confirmation</span>
                    <span className="text-[10px] text-slate-400 font-mono">Step 3 of 3</span>
                  </div>

                  {/* Summary of shipping address */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-sans space-y-1 text-left relative">
                    <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5">Shipping Address & Speed</span>
                    <div className="font-bold text-slate-800">{shippingName}</div>
                    <div className="text-slate-500">{shippingStreet}, {shippingCity}, {shippingState} {shippingZip}</div>
                    <div className="text-slate-500 font-mono mt-1 text-[10px] flex justify-between items-center">
                      <span>Shipping Method: {shippingSpeed === 'standard' ? 'Standard Ground' : shippingSpeed === 'express' ? 'Express Delivery' : 'Next-Day Delivery'}</span>
                      <button onClick={() => setCheckoutStep(1)} className="text-blue-600 font-bold hover:underline">Edit</button>
                    </div>
                  </div>

                  {/* Item summaries */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center bg-white border border-slate-50 p-2 rounded-xl text-xs">
                        <img src={item.product.images[0]} className="w-8 h-8 object-cover rounded-lg border border-slate-100" />
                        <div className="flex-1 min-w-0">
                          <h6 className="font-bold text-slate-800 truncate">{item.product.name}</h6>
                          <span className="text-[9px] text-slate-400 font-mono">Color: {item.selectedColor} • Size: {item.selectedSize} • Qty: {item.quantity}</span>
                        </div>
                        <span className="font-mono text-slate-900 font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Review of breakdown invoice */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-sans space-y-1">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-blue-600 font-bold">
                        <span>Discount (-{appliedDiscount}%)</span>
                        <span className="font-mono">-{formatPrice(discountSum)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Shipping</span>
                      <span className="font-mono">{shippingSum === 0 ? 'COMPLIMENTARY' : formatPrice(shippingSum)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Estimated Sales Tax (13% GST)</span>
                      <span className="font-mono">{formatPrice(taxSum)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200/40 pt-2.5">
                      <span>Order Total</span>
                      <span className="font-mono text-blue-600">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Terms and conditions agreement */}
                  <p className="text-[9px] text-slate-400 leading-normal text-center max-w-sm mx-auto">
                    By clicking authorize, you agree to our Terms of Sale and authorize payment to complete your purchase securely.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(2)}
                      className="group flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-sans font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
                      <span>Back to Payment</span>
                    </button>
                    <button 
                      id="place-order-btn"
                      type="submit" 
                      className="flex-1 py-3 bg-slate-950 hover:bg-blue-600 text-white text-xs font-sans font-bold rounded-xl transition-all shadow-md uppercase tracking-wider active:scale-95"
                    >
                      AUTHORIZE & PLACE ORDER
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* VOICE SEARCH OVERLAY */}
      {isVoiceSearching && (
        <div className="fixed inset-0 z-55 overflow-hidden font-sans flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setIsVoiceSearching(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-8 relative z-50 text-center space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Acoustic Search</span>
              <button onClick={() => setIsVoiceSearching(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              {/* Concentric pulsing waves */}
              <div className="relative flex items-center justify-center w-24 h-24">
                <div className="absolute w-20 h-20 bg-blue-500/10 rounded-full animate-ping" />
                <div className="absolute w-14 h-14 bg-blue-500/20 rounded-full animate-pulse" />
                <div className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center relative shadow-lg">
                  <Mic className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <h4 className="font-mono text-xs text-slate-800 font-bold uppercase tracking-wider">{voiceStatus}</h4>
                <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                  DreamShelf voice decoder is translating catalog frequencies.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4 text-[10px] text-slate-400 font-mono">
              SUGGESTION: Try saying "Ceramic Tableware"
            </div>
          </div>
        </div>
      )}

      {/* 6. ELITE MINIMALIST FOOTER */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-900 shrink-0 mt-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-900 text-xs">
          {/* Logo & description */}
          <div className="space-y-4">
            <span className="font-display font-light text-white text-base tracking-[0.25em] uppercase">
              DREAM<span className="font-bold text-blue-600">SHELF</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              An avant-garde marketplace for progressive curators. Transacting fashion, sound engineering, bespoke spaces, and collectibles.
            </p>
            <div className="flex gap-3 pt-2 text-[10px] font-mono tracking-widest text-slate-500">
              <a href="#instagram" className="hover:text-blue-500 transition-colors uppercase">IG</a>
              <span>/</span>
              <a href="#pinterest" className="hover:text-blue-500 transition-colors uppercase">PIN</a>
              <span>/</span>
              <a href="#twitter" className="hover:text-blue-500 transition-colors uppercase">X</a>
              <span>/</span>
              <a href="#linkedin" className="hover:text-blue-500 transition-colors uppercase">LI</a>
            </div>
          </div>

          {/* Sectors & Operations */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-[10px] text-blue-400 uppercase tracking-widest">Sectors & Operations</h4>
            <ul className="space-y-1.5 text-slate-400 font-medium">
              <li><button onClick={() => handleNavigateToShop('Fashion')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Premium Wardrobe</button></li>
              <li><button onClick={() => handleNavigateToShop('Home Decor')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Spatial Balanced Living</button></li>
              <li><button onClick={() => handleNavigateToShop('Electronics')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Acoustic Devices</button></li>
              <li><button onClick={() => { setAccountSubTab('profile'); setCurrentTab('account'); }} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Manage Client Profile</button></li>
              <li><button onClick={() => { setAccountSubTab('orders'); setCurrentTab('account'); }} className="hover:text-white transition-colors text-left block w-full cursor-pointer">My Orders & History</button></li>
            </ul>
          </div>

          {/* Editorial & Support */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-[10px] text-blue-400 uppercase tracking-widest">Editorial & Support</h4>
            <ul className="space-y-1.5 text-slate-400 font-medium text-left">
              <li><button onClick={() => setActivePolicy('about')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">About DreamShelf</button></li>
              <li><button onClick={() => setCurrentTab('contact')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => setActivePolicy('faq')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Operations FAQs</button></li>
              <li><button onClick={() => setIsWishlistOpen(true)} className="hover:text-white transition-colors text-left block w-full font-bold text-lime-400 cursor-pointer">Curated Wishlist Portfolio</button></li>
            </ul>
          </div>

          {/* Legal Directives */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-[10px] text-lime-400 uppercase tracking-widest">Legal Directives</h4>
            <ul className="space-y-1.5 text-slate-400 font-medium text-left">
              <li><button onClick={() => setActivePolicy('privacy')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setActivePolicy('terms')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Terms & Conditions</button></li>
              <li><button onClick={() => setActivePolicy('shipping')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Shipping Policy</button></li>
              <li><button onClick={() => setActivePolicy('returns')} className="hover:text-white transition-colors text-left block w-full cursor-pointer">Returns & Refunds Policy</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-mono">
          <span>© 2026 DreamShelf Inc. All Rights Reserved.</span>
          <span>Designed with premium Awwwards concepts.</span>
        </div>
      </footer>

      {/* MOBILE NAVIGATION SIDE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans md:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col h-full animate-slideInLeft">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-display font-light text-slate-950 text-sm tracking-[0.22em] uppercase">
                  DREAM<span className="font-bold text-blue-600">SHELF</span>
                </span>
                <button 
                  id="close-mobile-menu"
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs font-sans">
                {/* Search inside Mobile menu */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input 
                    id="mobile-search-input"
                    type="text" 
                    placeholder="Search catalog tags..." 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg p-2 space-y-1 z-55 max-h-48 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((hit) => (
                          <div 
                            key={hit.id}
                            onClick={() => {
                              handleNavigateToProduct(hit.id);
                              setSearchQuery('');
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-[11px]"
                          >
                            <img src={hit.images[0]} className="w-7 h-7 object-cover rounded" />
                            <span className="font-bold text-slate-950 truncate flex-1">{hit.name}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 block text-center py-1">No items match</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Main links */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Navigation</span>
                  {[
                    { id: 'home', label: 'Home' },
                    { id: 'shop', label: 'Boutique Shop' },
                    { id: 'brands', label: 'Artisan Brands' },
                    { id: 'account', label: 'Client Profile' }
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        if (link.id === 'shop') {
                          setCategoryFilter('All');
                          setBrandFilter('All');
                        }
                        if (link.id === 'account') {
                          setAccountSubTab('profile');
                        }
                        setCurrentTab(link.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-bold tracking-tight transition-all flex items-center justify-between ${
                        currentTab === link.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  ))}
                </div>

                {/* Categories inside Mobile Menu */}
                <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Shop Categories</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      'Fashion', 'Electronics', 'Home & Living', 'Kitchen & Dining', 
                      'Beauty & Personal Care', 'Health & Wellness', 'Baby & Kids', 'Toys & Games', 
                      'Sports & Fitness', 'Automotive', 'Books & Stationery', 'Pet Supplies', 
                      'Accessories', 'Gifts', 'Seasonal Deals'
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategoryFilter(cat);
                          setBrandFilter('All');
                          setCurrentTab('shop');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-left text-[11px] text-slate-500 hover:text-blue-600 hover:bg-slate-50 p-2 rounded-lg truncate transition-colors font-semibold"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING UNDO REMOVE TOAST ALERT */}
      {showUndoToast && lastRemovedItem && (
        <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-800 animate-slideInRight flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={lastRemovedItem.product.images[0]} className="w-9 h-9 object-cover rounded-lg border border-slate-800" />
            <div className="min-w-0">
              <span className="block text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">Removed item</span>
              <p className="text-xs font-bold truncate text-slate-100">{lastRemovedItem.product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleUndoRemove}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> UNDO
            </button>
            <button
              onClick={() => setShowUndoToast(false)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM ORDER SUCCESS CONFIRMATION MODAL OVERLAY */}
      {showOrderSuccessModal && orderSuccessDetails && (
        <div className="fixed inset-0 z-55 overflow-y-auto font-sans flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowOrderSuccessModal(false)} />
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl max-w-lg w-full p-6 md:p-8 relative z-10 space-y-6 text-center animate-scaleUp">
            
            {/* Celebration Indicator */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[9px] text-emerald-600 font-bold uppercase tracking-widest block">SECURE PURCHASE COMPLETED</span>
              <h3 className="font-sans font-black text-slate-950 text-2xl uppercase tracking-tight">Order Confirmed</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you for shopping at DreamShelf. Your order has been securely registered and is preparing for shipment.
              </p>
            </div>

            {/* Key credentials container */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left text-xs font-sans space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase">Order Reference ID</span>
                  <span className="font-mono text-slate-900 font-bold">{orderSuccessDetails.id}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-mono text-slate-400 uppercase">Shipping Carrier</span>
                  <span className="font-mono text-slate-900 font-bold flex items-center gap-1">
                    DHL Global Express <Truck className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase">Tracking Number</span>
                  <span className="font-mono text-slate-800 font-bold truncate block">{orderSuccessDetails.trackingNumber}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 uppercase">Shipping Method</span>
                  <span className="font-sans text-slate-800 font-bold block">{orderSuccessDetails.estimatedDelivery}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/50 pt-2.5">
                <span className="block text-[8px] font-mono text-slate-400 uppercase mb-0.5">Delivery Address</span>
                <p className="text-slate-600 font-medium">
                  {orderSuccessDetails.shippingAddress.fullName} • {orderSuccessDetails.shippingAddress.street}{orderSuccessDetails.shippingAddress.area ? `, ${orderSuccessDetails.shippingAddress.area}` : ''}, {orderSuccessDetails.shippingAddress.city}, {orderSuccessDetails.shippingAddress.state} {orderSuccessDetails.shippingAddress.zipCode}
                </p>
              </div>

              {/* Order total info */}
              <div className="border-t border-slate-200/50 pt-2.5 flex justify-between items-center text-xs font-bold text-slate-900">
                <span>Order Total</span>
                <span className="font-mono text-sm text-blue-600">{formatPrice(orderSuccessDetails.total)}</span>
              </div>
            </div>

            {/* Interactive logistics tracker trigger */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowOrderSuccessModal(false);
                  setAccountSubTab('orders');
                  setAccountTrackingOrderId(orderSuccessDetails?.id || null);
                  setCurrentTab('account');
                }}
                className="w-full py-3 bg-slate-950 text-white hover:bg-blue-600 text-xs font-sans font-bold rounded-xl transition-colors tracking-wider uppercase"
              >
                TRACK ORDER STATUS
              </button>
              <button
                onClick={() => setShowOrderSuccessModal(false)}
                className="w-full py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-sans font-semibold rounded-xl transition-colors"
              >
                Keep Browsing Marketplace
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE POLICY & INFORMATION MODAL */}
      {activePolicy && (
        <div className="fixed inset-0 z-55 overflow-y-auto font-sans flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActivePolicy(null)} />
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl max-w-xl w-full p-6 md:p-8 relative z-10 space-y-6 text-left animate-scaleUp">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">
                  {activePolicy === 'about' && 'EDITORIAL DOSSIER'}
                  {activePolicy === 'faq' && 'CLIENT OPERATIONS DIRECTIVE'}
                  {activePolicy === 'privacy' && 'METADATA & SECURITY PROTOCOL'}
                  {activePolicy === 'terms' && 'TRANSACTION COVENANT'}
                  {activePolicy === 'shipping' && 'LOGISTICS & CONVEYANCE'}
                  {activePolicy === 'returns' && 'RE-CURATION FRAMEWORK'}
                </span>
                <h3 className="font-sans font-black text-slate-950 text-xl md:text-2xl uppercase tracking-tight">
                  {activePolicy === 'about' && 'About DreamShelf'}
                  {activePolicy === 'faq' && 'Frequently Asked Questions'}
                  {activePolicy === 'privacy' && 'Privacy Policy'}
                  {activePolicy === 'terms' && 'Terms & Conditions'}
                  {activePolicy === 'shipping' && 'Shipping Policy'}
                  {activePolicy === 'returns' && 'Returns & Refunds'}
                </h3>
              </div>
              <button 
                onClick={() => setActivePolicy(null)}
                className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1 text-xs text-slate-600 leading-relaxed font-sans">
              {activePolicy === 'about' && (
                <div className="space-y-4">
                  <p>
                    <strong>DreamShelf</strong> is an avant-garde digital marketplace engineered for progressive creators, boutique designers, and refined collectors. Founded in 2026, we reject cookie-cutter retail and commercial saturation.
                  </p>
                  <p>
                    Our core mission is to establish a unified sanctuary where haute couture wardrobe elements, acoustic innovations, minimalist home decors, and curated collectibles are transacted under high-fidelity standards. We bridge the gap between brutalist physical architecture and seamless, modern digital interaction.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-black mb-1">OUR SUSTAINABILITY DIRECTIVE</span>
                    <p className="text-[11px] text-slate-500">
                      We believe aesthetic curation must respect our biosphere. Every listing verified on DreamShelf strictly complies with eco-friendly standards, wood-fired ceramic certifications, GOTS-certified organic cotton, and complete carbon-offset compensations.
                    </p>
                  </div>
                </div>
              )}

              {activePolicy === 'faq' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-950">How do I track active transit shipments?</h4>
                    <p>Simply navigate to your Account Lounge and enter your Order ID or tracking code under 'My Orders'. The live tracker updates in real-time with precise DHL or FedEx logistics milestones.</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-950">How do I accumulate and redeem Loyalty Points?</h4>
                    <p>Registered patrons receive 1 loyalty credit point for every unit of currency spent. These points accrue automatically and can be applied during checkout to redeem curated price reductions and secure elite statuses.</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-950">Can I request personalized styling suggestions?</h4>
                    <p>Yes, our built-in Gemini-powered Live Assistant is available 24/7. Simply describe the exact vibe, color scheme, or spatial layout you are designing, and the assistant will instantly query and recommend matching items from our directory.</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-950">What are the safe handshake protocols for checkout?</h4>
                    <p>Every checkout transaction is authorized via biometric simulation tokens or secure, server-side Stripe integrations. We never store or transmit raw card credentials on-screen or client-side.</p>
                  </div>
                </div>
              )}

              {activePolicy === 'privacy' && (
                <div className="space-y-4">
                  <p>
                    We operate with the highest standards of digital hygiene. Your personal identifiers, including delivery coordinates, transaction histories, email registries, and phone numbers, are secured inside encrypted databases.
                  </p>
                  <p>
                    All credit card and payment processing data are encrypted at rest and in transit via Secure Socket Layers (SSL) and processed server-side. Under no circumstances do we lease, sell, or disseminate client profiles or search metadata to external advertising brokers.
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-100/50 rounded-2xl text-[11px] text-blue-800 flex items-start gap-2.5">
                    <span className="font-mono font-bold">SECURE:</span>
                    <span>Your session data is protected. You can request a complete profile purge or data download from our operations office at any time.</span>
                  </div>
                </div>
              )}

              {activePolicy === 'terms' && (
                <div className="space-y-4">
                  <p>
                    By accessing, browsing, or transacting within the DreamShelf marketplace, you agree to comply with our community standards of authenticity and secure trade.
                  </p>
                  <div className="space-y-2">
                    <p><strong>1. Genuine Listings:</strong> All items listed in our directory are verified by brand consultants for material authenticity, certified GOTS organic cotton, and genuine sound certifications.</p>
                    <p><strong>2. Secured Escrows:</strong> Payments must be processed through our official secure biometric or card tokens. Circumventing our system to settle transactions offline voids all customer protection guarantees.</p>
                    <p><strong>3. Curator Responsibility:</strong> Patrons must maintain accurate account profile information. False identities or duplicate accounts are strictly forbidden to ensure trust within the ecosystem.</p>
                  </div>
                </div>
              )}

              {activePolicy === 'shipping' && (
                <div className="space-y-4">
                  <p>
                    DreamShelf utilizes premium express courier networks to ensure your acquisitions arrive in perfect structural condition. All parcels are packaged in climate-controlled, protective modular crates.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="block font-mono font-bold text-slate-800 text-[10px]">STANDARD SHIPMENT</span>
                      <span className="block text-[10px] text-slate-500 mt-1">2–5 business days. Completely carbon-offset, zero client delivery fees.</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="block font-mono font-bold text-slate-800 text-[10px]">EXPRESS PRIORITY</span>
                      <span className="block text-[10px] text-slate-500 mt-1">1–2 business days. Dedicated courier transit with real-time signature proof.</span>
                    </div>
                  </div>
                </div>
              )}

              {activePolicy === 'returns' && (
                <div className="space-y-4">
                  <p>
                    If an item does not integrate with your wardrobe or spatial layout exactly as envisioned, we support a seamless <strong>14-day re-curation window</strong>.
                  </p>
                  <p>
                    Simply navigate to your Account Dashboard, go to My Orders, select the purchase, and click the "Request Return" button. Our system will immediately generate a prepaid shipping label and schedule a courier pickup.
                  </p>
                  <p>
                    To qualify for a refund, returned items must be shipped back in their original premium packaging with authentic labels intact. Refunds are credited back to your original payment card token within 3 business days of warehouse inspection.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <button
                onClick={() => setActivePolicy(null)}
                className="w-full py-3 bg-slate-950 text-white hover:bg-blue-600 text-xs font-sans font-bold rounded-xl transition-all cursor-pointer shadow uppercase tracking-wider text-center"
              >
                Acknowledge Directive
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
