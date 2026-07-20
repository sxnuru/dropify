/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Address, SavedCard, Order, Product, UserProfile } from '../types';
import { PRODUCTS } from '../data';
import { formatPrice } from '../utils/currency';
import OrderTracking from './OrderTracking';
import { 
  User, Award, Gift, Shield, Bell, MapPin, 
  CreditCard, Copy, Check, Plus, Trash2, Tag, Eye, ShoppingBag, Lock, Smartphone, RefreshCw, ChevronRight, Star, Sparkles, Heart, HelpCircle, LogOut, Menu
} from 'lucide-react';

const activeOrderObj: Order = {
  id: 'DS-77491-2026',
  items: [
    {
      id: 'speaker-1',
      product: PRODUCTS.find(p => p.id === 'ds-002') || PRODUCTS[1],
      quantity: 1,
      selectedColor: 'Matte Silver',
      selectedSize: 'One Size'
    }
  ],
  subtotal: 340,
  discount: 0,
  tax: 0,
  shipping: 0,
  total: 340,
  status: 'out_for_delivery',
  trackingNumber: 'TR_DHL_774912026',
  estimatedDelivery: 'July 18 - July 19',
  shippingAddress: {
    fullName: 'Aria Malik',
    street: 'House 45-B, Sector Z, Street 12, DHA Phase 3',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54000',
    country: 'Pakistan',
    phone: '+92 333 4567890'
  },
  paymentMethod: 'Cash on Delivery (COD)',
  date: '2026-07-17',
  events: [
    { title: 'Out for Delivery with Courier', description: 'Departed regional carrier facility.', time: '08:30 AM Today', done: true },
    { title: 'Arrived at Sorting Facility', description: 'Processed at Lahore sorting hub.', time: '04:15 AM Today', done: true },
    { title: 'In Transit', description: 'Package dispatched from warehouse.', time: '02:00 PM Yesterday', done: true },
    { title: 'Order Confirmed', description: 'Cash on Delivery order booked.', time: '01:05 PM Yesterday', done: true }
  ]
};

const deliveredOrderObj: Order = {
  id: 'DS-42918-2026',
  items: [
    {
      id: 'blazer-1',
      product: PRODUCTS.find(p => p.id === 'ds-001') || PRODUCTS[0],
      quantity: 1,
      selectedColor: 'Soft Black',
      selectedSize: 'M'
    }
  ],
  subtotal: 185,
  discount: 0,
  tax: 0,
  shipping: 0,
  total: 185,
  status: 'delivered',
  trackingNumber: 'TR_DHL_429182026',
  estimatedDelivery: 'July 15, 2026',
  shippingAddress: {
    fullName: 'Aria Malik',
    street: 'House 45-B, Sector Z, Street 12, DHA Phase 3',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54000',
    country: 'Pakistan',
    phone: '+92 333 4567890'
  },
  paymentMethod: 'Cash on Delivery (COD)',
  date: '2026-07-15',
  events: [
    { title: 'Delivered at front lobby door', description: 'Signature on file.', time: '03:15 PM July 15', done: true },
    { title: 'Out for Delivery with Courier', description: 'Departed regional courier facility.', time: '09:00 AM July 15', done: true },
    { title: 'Order Confirmed', description: 'Cash on Delivery order booked.', time: '10:00 AM July 14', done: true }
  ]
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';
};

interface AccountDashboardProps {
  initialSubTab?: 'profile' | 'orders' | 'wishlist' | 'recentlyViewed' | 'addresses' | 'notifications' | 'support' | 'logout';
  initialTrackingOrderId?: string | null;
  onClearTracking?: () => void;
  wishlist?: Product[];
  onToggleWishlist?: (p: Product) => void;
  onMoveWishToCart?: (p: Product) => void;
  onNavigateToProduct?: (id: string) => void;
  onLogout?: () => void;
  currentUser?: UserProfile;
  onUpdateProfile?: (updated: { fullName: string; email: string; phone: string }) => void;
}

export default function AccountDashboard({ 
  initialSubTab = 'profile', 
  initialTrackingOrderId = null,
  onClearTracking,
  wishlist = [],
  onToggleWishlist = () => {},
  onMoveWishToCart = () => {},
  onNavigateToProduct = () => {},
  onLogout = () => {},
  currentUser = {
    fullName: 'Aria Malik',
    email: 'aria.malik@vanguard.co',
    phone: '+92 333 4567890',
    status: 'Platinum Tier',
    memberSince: 'January 2026',
    loyaltyPoints: 1250
  },
  onUpdateProfile = () => {}
}: AccountDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(initialTrackingOrderId);
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(false);

  const getSubTabLabel = (id: string) => {
    switch(id) {
      case 'profile': return 'My Profile';
      case 'orders': return 'My Orders';
      case 'wishlist': return 'Wishlist';
      case 'recentlyViewed': return 'Recently Viewed';
      case 'addresses': return 'Saved Addresses';
      case 'notifications': return 'Notifications';
      case 'support': return 'Help & Support';
      default: return 'My Account';
    }
  };

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    setTrackingOrderId(initialTrackingOrderId);
  }, [initialTrackingOrderId]);
  
  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([
    {
      fullName: 'Muhammad Bilal',
      street: 'House 45-B, Sector Z, Street 12',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan',
      phone: '+92 300 1234567',
      isDefault: true
    }
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isAddrValidating, setIsAddrValidating] = useState(false);
  const [isAddrValidated, setIsAddrValidated] = useState(false);

  // Profile fields state
  const [profileName, setProfileName] = useState(currentUser.fullName);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileSuccessToast, setProfileSuccessToast] = useState(false);

  useEffect(() => {
    setProfileName(currentUser.fullName);
    setProfileEmail(currentUser.email);
    setProfilePhone(currentUser.phone);
  }, [currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName: profileName,
      email: profileEmail,
      phone: profilePhone
    });
    setProfileSuccessToast(true);
    setTimeout(() => setProfileSuccessToast(false), 3000);
  };

  const activeOrderObjWithUser = useMemo(() => ({
    ...activeOrderObj,
    shippingAddress: {
      ...activeOrderObj.shippingAddress,
      fullName: currentUser.fullName
    }
  }), [currentUser.fullName]);

  const deliveredOrderObjWithUser = useMemo(() => ({
    ...deliveredOrderObj,
    shippingAddress: {
      ...deliveredOrderObj.shippingAddress,
      fullName: currentUser.fullName
    }
  }), [currentUser.fullName]);

  // Loyalty Program Points
  const loyaltyPoints = currentUser.loyaltyPoints ?? 750;
  const loyaltyHistory = [
    { label: 'Purchased: AeroWeave Knit Blazer', points: '+185 Points', date: '2026-07-15' },
    { label: 'Product Review submitted (Verified)', points: '+50 Points', date: '2026-07-10' },
    { label: 'Referral Sign-up: Michael Ross', points: '+500 Points', date: '2026-06-28' },
    { label: 'Account Activation bonus', points: '+15 Points', date: '2026-06-12' }
  ];

  // Referrals
  const referralCode = useMemo(() => {
    const firstName = currentUser.fullName.split(' ')[0].toLowerCase() || 'user';
    return `dreamshelf.com/invite/${firstName}750`;
  }, [currentUser.fullName]);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleValidateNewAddr = () => {
    if (!newStreet) return;
    setIsAddrValidating(true);
    setTimeout(() => {
      setIsAddrValidating(false);
      setIsAddrValidated(true);
    }, 1200);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity) return;
    const newAddr: Address = {
      fullName: newFullName,
      street: newStreet,
      city: newCity,
      state: newState || "Punjab",
      zipCode: newZipCode || "54000",
      country: 'Pakistan',
      phone: newPhone || "+92 300 1234567"
    };
    setAddresses([...addresses, newAddr]);
    setShowAddressForm(false);
    setIsAddrValidated(false);
    // Clear
    setNewFullName('');
    setNewStreet('');
    setNewCity('');
    setNewState('');
    setNewZipCode('');
    setNewPhone('');
  };

  const handleDeleteAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  return (
    <div id="account-hub-root" className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden font-sans">
      
      {/* Premium Private Lounge Top Header Banner */}
      <div className="bg-slate-950 text-white p-8 md:p-12 relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#1e3a8a_0%,transparent_50%)] opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900 border-2 border-amber-400/40 flex items-center justify-center text-white font-sans text-xl md:text-2xl font-black uppercase shadow-2xl relative">
                {getInitials(currentUser.fullName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-400 flex items-center justify-center border-2 border-slate-950 shadow">
                <Star className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              </div>
            </div>
            
            <div>
              <span className="font-mono text-[9px] text-amber-400 font-bold uppercase tracking-widest block mb-1">ELITE MEMBER</span>
              <h1 className="font-sans text-xl md:text-3xl font-black tracking-tight uppercase">{currentUser.fullName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-slate-400 text-xs">
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-400" /> Gold Status</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span>Member since {currentUser.memberSince || 'June 2026'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="text-left">
              <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold font-black">LOYALTY CREDIT BALANCE</span>
              <span className="block font-mono text-xs font-black text-amber-400">{loyaltyPoints} PTS</span>
            </div>
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Account Area - Responsive Sidebar Grid */}
      <div className="flex flex-col lg:flex-row min-h-[600px] bg-slate-50/50">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 p-6 flex-shrink-0">
          
          {/* Mobile Accordion Toggle Header */}
          <div className="lg:hidden mb-4">
            <button 
              type="button"
              onClick={() => setIsMobileNavExpanded(!isMobileNavExpanded)}
              className="w-full px-4 py-3 bg-slate-950 hover:bg-slate-900 text-white font-sans font-bold text-xs rounded-xl transition-all flex items-center justify-between shadow cursor-pointer uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Menu className="w-4 h-4" />
                <span>Viewing: {getSubTabLabel(activeSubTab)}</span>
              </span>
              <ChevronRight className={`w-4 h-4 transform transition-transform duration-200 ${isMobileNavExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Grouped Links (visible on desktop or expanded on mobile) */}
          <div className={`space-y-6 ${isMobileNavExpanded ? 'block' : 'hidden lg:block'}`}>
            
            {/* ACCOUNT GROUP */}
            <div className="space-y-1">
              <span className="block text-[8px] font-mono font-black text-slate-400 tracking-wider uppercase mb-2 px-3">ACCOUNT</span>
              {[
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'recentlyViewed', label: 'Recently Viewed', icon: Eye },
              ].map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    id={`account-tab-${t.id}`}
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveSubTab(t.id as any);
                      setIsMobileNavExpanded(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeSubTab === t.id
                        ? 'bg-slate-950 text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ADDRESSES GROUP */}
            <div className="space-y-1">
              <span className="block text-[8px] font-mono font-black text-slate-400 tracking-wider uppercase mb-2 px-3">ADDRESSES</span>
              {[
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              ].map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    id={`account-tab-${t.id}`}
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveSubTab(t.id as any);
                      setIsMobileNavExpanded(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeSubTab === t.id
                        ? 'bg-slate-950 text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SUPPORT GROUP */}
            <div className="space-y-1">
              <span className="block text-[8px] font-mono font-black text-slate-400 tracking-wider uppercase mb-2 px-3">SUPPORT</span>
              {[
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'support', label: 'Help & Support', icon: HelpCircle },
              ].map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    id={`account-tab-${t.id}`}
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveSubTab(t.id as any);
                      setIsMobileNavExpanded(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeSubTab === t.id
                        ? 'bg-slate-950 text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SESSION GROUP */}
            <div className="space-y-1 pt-4 border-t border-slate-100">
              <span className="block text-[8px] font-mono font-black text-slate-400 tracking-wider uppercase mb-2 px-3">SESSION</span>
              <button
                id="account-tab-logout"
                type="button"
                onClick={() => {
                  setIsMobileNavExpanded(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Dynamic Display Panel Content */}
        <div className="flex-1 p-6 md:p-10">

        {/* PROFILE DETAILS */}
        {activeSubTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">PERSONAL DETAILS</span>
                <h3 className="font-sans font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Profile Information
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors font-medium font-sans" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Email Address</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      onChange={(e) => setProfileEmail(e.target.value)} 
                      className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors font-medium font-sans" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Verified Phone</label>
                    <input 
                      type="text" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)} 
                      className="w-full px-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors font-medium font-mono" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">New Security Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••••" 
                      className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors font-mono" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="px-5 py-3 bg-slate-950 hover:bg-blue-600 text-white text-xs font-sans font-bold rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Save Profile Changes
                  </button>
                  {profileSuccessToast && (
                    <span className="text-[10px] text-emerald-600 font-mono font-bold animate-pulse flex items-center gap-1">
                      ✓ Profile updated successfully!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MY ORDERS LIST */}
        {activeSubTab === 'orders' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn text-left">
            {trackingOrderId ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setTrackingOrderId(null);
                    if (onClearTracking) onClearTracking();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer mb-2"
                >
                  ← BACK TO ORDERS LIST
                </button>
                <OrderTracking 
                  onBackToShop={() => {
                    setTrackingOrderId(null);
                    if (onClearTracking) onClearTracking();
                  }}
                  activeOrder={trackingOrderId === 'DS-77491-2026' ? activeOrderObjWithUser : deliveredOrderObjWithUser}
                />
              </div>
            ) : (
              <>
                <div>
                  <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">ORDER HISTORY</span>
                  <h3 className="font-sans font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" /> Current & Past Orders
                  </h3>
                </div>
                
                <div className="space-y-4 text-left">
                  {/* Active Order */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/5 rounded-full blur-2xl" />
                    
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4 relative z-10">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] text-slate-400 block font-bold">ORDER ID REFERENCE</span>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">DS-77491-2026</span>
                      </div>
                      <div className="space-y-1 md:text-right">
                        <span className="font-mono text-[9px] text-slate-400 block font-bold">ORDER DATE</span>
                        <span className="text-xs text-slate-700 font-bold font-sans">July 17, 2026</span>
                      </div>
                      <div className="space-y-1 md:text-right">
                        <span className="font-mono text-[9px] text-slate-400 block font-bold">ORDER TOTAL</span>
                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50/50 border border-blue-100 px-2.5 py-0.5 rounded">{formatPrice(340.00)}</span>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-blue-100 uppercase tracking-wider animate-pulse">
                          IN TRANSIT
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80" alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-100 shadow-sm" />
                      <div className="flex-1 min-w-0 text-xs text-left">
                        <span className="font-mono text-[8px] text-slate-400 block uppercase font-bold tracking-wider">Acoustics Devices</span>
                        <h4 className="font-sans font-extrabold text-slate-900 truncate">Cellulose Spatial Audio Speaker</h4>
                        <span className="text-slate-400 font-mono text-[10px] block mt-1">Tone: Matte Silver • Qty: 1</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 text-xs font-sans gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                        <span>Estimated arrival: Tomorrow via Courier Express (Cash on Delivery)</span>
                      </div>
                      <button 
                        onClick={() => setTrackingOrderId('DS-77491-2026')}
                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-sans text-[10px] font-bold rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Track Order Status
                      </button>
                    </div>
                  </div>

                  {/* Delivered Order */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] text-slate-400 block font-bold">ORDER ID REFERENCE</span>
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">DS-42918-2026</span>
                      </div>
                      <div className="space-y-1 md:text-right">
                        <span className="font-mono text-[9px] text-slate-400 block font-bold">ORDER DATE</span>
                        <span className="text-xs text-slate-600 font-bold font-sans">July 15, 2026</span>
                      </div>
                      <div className="space-y-1 md:text-right">
                        <span className="font-mono text-[9px] text-slate-400 block font-bold">ORDER TOTAL</span>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{formatPrice(115.00)}</span>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wider">
                          DELIVERED
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80" alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-100 shadow-sm" />
                      <div className="flex-1 min-w-0 text-xs text-left">
                        <span className="font-mono text-[8px] text-slate-400 block uppercase font-bold tracking-wider">Curated Apparel</span>
                        <h4 className="font-sans font-extrabold text-slate-900 truncate">AeroWeave Knit Blazer</h4>
                        <span className="text-slate-400 font-mono text-[10px] block mt-1">Tone: Soft Black • Qty: 1</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 text-xs font-sans gap-3">
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 text-left">✓ Delivered and COD Cash Settled successfully</span>
                      <button 
                        onClick={() => setTrackingOrderId('DS-42918-2026')}
                        className="px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 font-sans text-[10px] font-bold rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        Track Shipment Details
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* WISHLIST */}
        {activeSubTab === 'wishlist' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn text-left">
            <div>
              <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">SAVED PIECES</span>
              <h3 className="font-sans font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600 fill-blue-600" /> My Personal Wishlist
              </h3>
            </div>

            {wishlist.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4 shadow-sm">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-sans font-extrabold text-slate-800 text-base">Your Wishlist is Empty</h4>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">Explore our premium marketplace collections and bookmark products you love to keep them saved here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((p) => (
                  <div 
                    key={p.id}
                    className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50/50">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button
                          onClick={() => onToggleWishlist(p)}
                          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white text-rose-500 shadow-sm transition-transform cursor-pointer hover:scale-110"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span className="uppercase font-bold tracking-wider">{p.brand}</span>
                          <span className="font-mono text-slate-950 font-black">{formatPrice(p.price)}</span>
                        </div>
                        <h3 className="font-sans font-extrabold text-slate-900 text-sm line-clamp-1 hover:text-blue-600 cursor-pointer" onClick={() => onNavigateToProduct(p.id)}>
                          {p.name}
                        </h3>
                        <p className="text-slate-400 text-[11px] line-clamp-2 h-8 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 mt-4 flex gap-2">
                      <button 
                        onClick={() => onMoveWishToCart(p)}
                        className="flex-1 py-2 bg-slate-950 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider font-sans transition-colors cursor-pointer text-center font-sans"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => onNavigateToProduct(p.id)}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg uppercase font-sans transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECENTLY VIEWED PRODUCTS */}
        {activeSubTab === 'recentlyViewed' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn text-left">
            <div>
              <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">SAVED DECOR & FASHION</span>
              <h3 className="font-sans font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" /> Recently Viewed Items
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.slice(0, 3).map((p) => (
                <div 
                  key={p.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50/50">
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute top-3 left-3 bg-slate-950 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                        BOOKMARKED
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-left">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="uppercase font-bold tracking-wider">{p.brand}</span>
                        <span className="font-mono text-slate-950 font-black">{formatPrice(p.price)}</span>
                      </div>
                      <h3 className="font-sans font-extrabold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer text-left" onClick={() => onNavigateToProduct(p.id)}>
                        {p.name}
                      </h3>
                      <p className="text-slate-400 text-[11px] line-clamp-2 h-8 leading-relaxed text-left">
                        {p.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> IN STOCK
                    </span>
                    <button 
                      onClick={() => onNavigateToProduct(p.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider font-sans transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADDRESS DIRECTORIES */}
        {activeSubTab === 'addresses' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn text-left">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block">SAVED ADDRESSES</span>
                <h3 className="font-sans font-black text-slate-900 text-sm uppercase tracking-tight">Address Book</h3>
              </div>
              <button 
                id="add-addr-btn"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="px-4 py-2 bg-slate-950 text-white font-sans text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-blue-600 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 font-sans text-xs animate-fadeIn text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Full Name</label>
                    <input type="text" required value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="Muhammad Bilal" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Phone Number</label>
                    <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="+92 300 1234567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Street Address</label>
                    <div className="relative">
                      <input type="text" required value={newStreet} onChange={(e) => { setNewStreet(e.target.value); setIsAddrValidated(false); }} className="w-full pl-4 pr-24 py-2.5 rounded-xl border border-slate-200" placeholder="House 45, Street 12, DHA Phase 3" />
                      <button
                        type="button"
                        onClick={handleValidateNewAddr}
                        disabled={!newStreet || isAddrValidating}
                        className="absolute right-2 top-2 px-2.5 py-1 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-mono text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {isAddrValidating ? "Verifying..." : "VALIDATE"}
                      </button>
                    </div>
                    {isAddrValidated && (
                      <span className="block text-[9px] text-emerald-600 font-sans mt-1 font-bold">
                        ✓ Address validated and delivery zone recognized
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">City</label>
                    <input type="text" required value={newCity} onChange={(e) => setNewCity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" placeholder="Lahore" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-bold">Province & Zip Code</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Punjab" value={newState} onChange={(e) => setNewState(e.target.value)} className="w-24 px-2 py-2.5 rounded-xl border border-slate-200 text-center" />
                      <input type="text" placeholder="54000" value={newZipCode} onChange={(e) => setNewZipCode(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2.5 pt-2 justify-end">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-slate-950 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer">Save Address</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a, idx) => (
                <div id={`addr-card-${idx}`} key={idx} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2 font-sans text-xs text-left">
                    <div className="flex items-center gap-2 justify-between">
                      <span className="font-extrabold text-slate-900 block text-sm">{a.fullName}</span>
                      {a.isDefault && (
                        <span className="bg-blue-50 text-blue-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100 uppercase">DEFAULT</span>
                      )}
                    </div>
                    <span className="text-slate-500 block leading-normal">{a.street}</span>
                    <span className="text-slate-500 block">{a.city}, {a.state} {a.zipCode}</span>
                    <span className="text-slate-500 block">{a.country}</span>
                    <span className="text-slate-400 block font-mono text-[10px] mt-1">{a.phone}</span>
                  </div>
                  <button 
                    id={`delete-addr-${idx}`}
                    onClick={() => handleDeleteAddress(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 self-end rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeSubTab === 'notifications' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn text-left">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-5 font-sans text-xs">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">TRANSACTIONAL INBOX</span>
                <h3 className="font-sans font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-50 pb-3">
                  <Bell className="w-4.5 h-4.5 text-blue-600" /> Notifications & Alerts
                </h3>
              </div>

              <div className="space-y-4 text-left">
                {[
                  { title: 'COD Order Confirmed', desc: 'Your Cash on Delivery order DS-77491-2026 has been confirmed and booked for Lahore delivery.', time: 'July 17, 2026 - 01:05 PM' },
                  { title: 'Courier Dispatch Alert', desc: 'Package containing "Cellulose Spatial Audio Speaker" has been dispatched with tracking ID TR_DHL_774912026.', time: 'July 17, 2026 - 02:00 PM' },
                  { title: 'Order Delivered & Settled', desc: 'Order DS-42918-2026 was delivered. Cash payment was collected successfully by our courier partner.', time: 'July 15, 2026 - 03:15 PM' },
                ].map((notif, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-950 block">{notif.title}</span>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                      <span className="font-mono text-[9px] text-slate-400 mt-1.5 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HELP & SUPPORT */}
        {activeSubTab === 'support' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn text-left">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-5 font-sans text-xs">
              <div>
                <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-widest block mb-1">CLIENT CONCIERGE</span>
                <h3 className="font-sans font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2 border-b border-slate-50 pb-3">
                  <HelpCircle className="w-4.5 h-4.5 text-blue-600" /> Help & Support Center
                </h3>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">How does Cash on Delivery (COD) work?</span>
                  <p className="text-slate-500 leading-relaxed">We support Cash on Delivery all across Pakistan. You only pay our courier representative in cash when your ordered package is physically delivered to your saved address.</p>
                </div>
                <div className="space-y-1 border-t border-slate-100/50 pt-3">
                  <span className="font-bold text-slate-900 block">What are the delivery times and charges?</span>
                  <p className="text-slate-500 leading-relaxed">Standard shipping is completely free for orders over £100.00. For other orders, we charge a flat £4.99 rate. Deliveries to major cities take 2-3 business days. Other areas take 3-5 business days.</p>
                </div>
                <div className="space-y-1 border-t border-slate-100/50 pt-3">
                  <span className="font-bold text-slate-900 block">How can I request an exchange or return?</span>
                  <p className="text-slate-500 leading-relaxed">We offer a 14-day hassle-free return and exchange policy. Simply go to "My Orders", select your delivered order, and click "Request Easy Exchange" or reach out to our team at support@dreamshelf.pk.</p>
                </div>
                <div className="space-y-1 border-t border-slate-100/50 pt-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-900 block">Need Urgent Assistance?</span>
                  <p className="text-blue-700 leading-relaxed mt-0.5">Our helpline is active Monday to Saturday from 9:00 AM to 6:00 PM PST. Feel free to call us at +92 (42) 111-SHELF (74353) or email concierge@dreamshelf.pk.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
