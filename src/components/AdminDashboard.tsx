/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Product, Order } from '../types';
import { formatPrice } from '../utils/currency';
import { 
  LayoutDashboard, Package, Tags, Award, ShoppingCart, Users, Ticket, 
  MessageSquare, Settings, LogOut, Search, Plus, Edit3, Trash2, Eye, 
  X, Check, AlertTriangle, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, Star, CheckCircle, Menu, Filter, ArrowUpDown,
  UserCheck, UserMinus, EyeOff, Calendar, Copy, Percent, Layers
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface AdminDashboardProps {
  productsList: Product[];
  onAddProduct: (p: Product) => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onBackToHome: () => void;
  onLogout?: () => void;
  onUpdateOrderStatus?: (
    orderId: string,
    paymentStatus?: 'Pending' | 'Paid' | 'Refunded' | 'Cancelled',
    fulfillmentStatus?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled',
    trackingNumber?: string
  ) => void;
  ordersList?: Order[];
  usersList?: any[];
}

export default function AdminDashboard({
  productsList,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onBackToHome,
  onLogout,
  onUpdateOrderStatus,
  ordersList = [],
  usersList = []
}: AdminDashboardProps) {
  // Left Sidebar active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 'customers' | 'inventory' | 'coupons' | 'reviews' | 'settings'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');

  const [draftStockUpdates, setDraftStockUpdates] = useState<Record<string, number>>({});
  const [inventorySearch, setInventorySearch] = useState('');

  // Settings Configuration (saved in localStorage or defaults)
  const [storeName, setStoreName] = useState(() => localStorage.getItem('ds_admin_store_name') || 'DreamShelf Premium Curation');
  const [storeLogo, setStoreLogo] = useState(() => localStorage.getItem('ds_admin_store_logo') || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100');
  const [storeBanner, setStoreBanner] = useState(() => localStorage.getItem('ds_admin_store_banner') || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800');
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('ds_admin_support_email') || 'admin@dreamshelf.co.uk');
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('ds_admin_support_phone') || '+44 20 8947 2059');
  const [codEnabled, setCodEnabled] = useState(() => localStorage.getItem('ds_admin_cod_enabled') !== 'false');
  const [shippingFee, setShippingFee] = useState(() => localStorage.getItem('ds_admin_shipping_fee') || '4.99');
  const [taxesPercent, setTaxesPercent] = useState(() => localStorage.getItem('ds_admin_taxes_percent') || '20');
  const [socialLinks, setSocialLinks] = useState({
    instagram: localStorage.getItem('ds_admin_social_insta') || 'https://instagram.com/dreamshelf',
    twitter: localStorage.getItem('ds_admin_social_tw') || 'https://twitter.com/dreamshelf'
  });
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('ds_admin_theme') || 'light');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ds_admin_store_name', storeName);
    localStorage.setItem('ds_admin_store_logo', storeLogo);
    localStorage.setItem('ds_admin_store_banner', storeBanner);
    localStorage.setItem('ds_admin_support_email', supportEmail);
    localStorage.setItem('ds_admin_support_phone', supportPhone);
    localStorage.setItem('ds_admin_shipping_fee', shippingFee);
    localStorage.setItem('ds_admin_taxes_percent', taxesPercent);
    localStorage.setItem('ds_admin_theme', adminTheme);
    localStorage.setItem('ds_admin_social_insta', socialLinks.instagram);
    localStorage.setItem('ds_admin_social_tw', socialLinks.twitter);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Dynamic lists in local state to allow CRUD operations
  const [categoriesList, setCategoriesList] = useState<any[]>([
    { name: 'Fashion', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Toys & Games', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Sports & Outdoors', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Health & Personal Care', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Home & Garden', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Electronics', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Food & Grocery', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=150', status: 'active' },
    { name: 'Other', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150', status: 'active' }
  ]);

  const [brandsList, setBrandsList] = useState<any[]>([
    { name: 'Chronos Tech', logo: 'CT', country: 'Switzerland', status: 'active' },
    { name: 'Vanguard Outfitters', logo: 'VO', country: 'United Kingdom', status: 'active' },
    { name: 'Aether Lab', logo: 'AL', country: 'Germany', status: 'active' },
    { name: 'Brut Ceramic', logo: 'BC', country: 'Japan', status: 'active' },
    { name: 'Soleil Wear', logo: 'SW', country: 'France', status: 'active' },
    { name: 'Moderne Dwell', logo: 'MD', country: 'Denmark', status: 'active' }
  ]);

  const [coupons, setCoupons] = useState([
    { id: '1', code: 'DREAM20', discount: 20, type: 'percentage', expiryDate: '2026-12-31', minOrder: 50, status: 'active', usageCount: 142 },
    { id: '2', code: 'LAUNCH50', discount: 50, type: 'fixed', expiryDate: '2026-09-30', minOrder: 150, status: 'active', usageCount: 68 },
    { id: '3', code: 'FREESHIP', discount: 0, type: 'shipping', expiryDate: '2026-08-15', minOrder: 30, status: 'inactive', usageCount: 209 }
  ]);

  const [reviews, setReviews] = useState(() => {
    const list: any[] = [];
    productsList.forEach(p => {
      if (p.reviews) {
        p.reviews.forEach(r => {
          list.push({ ...r, productName: p.name, productId: p.id, status: 'approved' });
        });
      }
    });
    if (list.length === 0) {
      return [
        { id: 'rev-1', username: 'Alex Mercer', rating: 5, comment: 'Exceptional materials and premium brutalist aesthetic. Worth every penny.', date: 'July 24, 2026', productName: 'Minimalist Ceramic Vase', status: 'approved' },
        { id: 'rev-2', username: 'Sophia Chen', rating: 4, comment: 'Responsive electronics features and premium case design. High fidelity audio.', date: 'July 20, 2026', productName: 'Brutalist ANC Headphones', status: 'approved' },
        { id: 'rev-3', username: 'Liam O\'Connor', rating: 3, comment: 'Decent, but size runs slightly large.', date: 'July 18, 2026', productName: 'Over-dyed Oversized Hoodie', status: 'pending' }
      ];
    }
    return list;
  });

  // Search and Filter States for Orders Dashboard
  const [orderSearch, setOrderSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('All');
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      // 1. Search filter (ID, Customer Name, Email)
      const matchesSearch = 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customerName || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customerEmail || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.shippingAddress?.fullName || '').toLowerCase().includes(orderSearch.toLowerCase());

      // 2. Payment status filter
      const matchesPayment = 
        paymentStatusFilter === 'All' || 
        o.paymentStatus === paymentStatusFilter;

      // 3. Fulfillment status filter
      const matchesFulfillment = 
        fulfillmentStatusFilter === 'All' || 
        o.fulfillmentStatus === fulfillmentStatusFilter;

      // 4. Date filter
      const matchesDate = 
        !dateFilter || 
        o.date === dateFilter;

      return matchesSearch && matchesPayment && matchesFulfillment && matchesDate;
    });
  }, [ordersList, orderSearch, paymentStatusFilter, fulfillmentStatusFilter, dateFilter]);

  // Merge Firestore users with live order history stats
  const customersWithStats = useMemo(() => {
    return usersList.map(c => {
      const customerOrders = ordersList.filter(o => o.userId === c.id || o.customerEmail === c.email);
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...c,
        ordersCount: customerOrders.length,
        totalSpent: totalSpent
      };
    });
  }, [usersList, ordersList]);

  // Filtered customer registry list
  const filteredCustomers = useMemo(() => {
    return customersWithStats.filter(c => {
      const name = c.fullName || c.name || '';
      const email = c.email || '';
      const phone = c.phoneNumber || c.phone || '';
      return name.toLowerCase().includes(customerSearch.toLowerCase()) ||
             email.toLowerCase().includes(customerSearch.toLowerCase()) ||
             phone.includes(customerSearch);
    });
  }, [customersWithStats, customerSearch]);

  // KPI Computations
  const totalRevenue = useMemo(() => ordersList.reduce((sum, o) => sum + o.total, 0), [ordersList]);
  const lowStockProducts = useMemo(() => productsList.filter(p => p.stock <= 5), [productsList]);

  const averageOrderValue = useMemo(() => {
    if (ordersList.length === 0) return 0;
    return totalRevenue / ordersList.length;
  }, [ordersList, totalRevenue]);

  const salesByMonth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: Record<string, number> = {};
    months.forEach(m => { data[m] = 0; });
    
    ordersList.forEach(o => {
      if (!o.date) return;
      const parts = o.date.split('-');
      if (parts.length >= 2) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          const monthName = months[monthIndex];
          data[monthName] += o.total;
        }
      }
    });
    
    return months.map(m => ({ month: m, amount: data[m] }));
  }, [ordersList]);

  const topSellingProducts = useMemo(() => {
    const sales: Record<string, { product: any; quantity: number; revenue: number }> = {};
    ordersList.forEach(o => {
      o.items.forEach(item => {
        if (!item.product) return;
        const id = item.product.id;
        if (!sales[id]) {
          sales[id] = { product: item.product, quantity: 0, revenue: 0 };
        }
        sales[id].quantity += item.quantity;
        sales[id].revenue += item.product.price * item.quantity;
      });
    });
    return Object.values(sales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [ordersList]);

  const ordersByStatus = useMemo(() => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const counts: Record<string, number> = {};
    statuses.forEach(s => { counts[s] = 0; });
    ordersList.forEach(o => {
      const status = o.fulfillmentStatus || 'Pending';
      counts[status] = (counts[status] || 0) + 1;
    });
    return statuses.map(s => ({ status: s, count: counts[s] }));
  }, [ordersList]);

  const revenueByCategory = useMemo(() => {
    const revenue: Record<string, number> = {};
    ordersList.forEach(o => {
      o.items.forEach(item => {
        if (!item.product) return;
        const cat = item.product.category || 'Other';
        revenue[cat] = (revenue[cat] || 0) + (item.product.price * item.quantity);
      });
    });
    return Object.entries(revenue).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [ordersList]);
  
  // Recent Customer Activities list
  const recentActivities = useMemo(() => {
    return [
      { text: 'Sophia Chen submitted order ORD-89421', time: '2 hours ago' },
      { text: 'Alex Mercer created return ticket SL-RET-49204-A', time: '4 hours ago' },
      { text: 'Marcus Sterling cleared checkout with DREAM20 code', time: '1 day ago' },
      { text: 'Liam O\'Connor registered a new client profile', time: '2 days ago' }
    ];
  }, []);

  // Category shares calculations for progress bars
  const categoryShares = useMemo(() => {
    const counts: Record<string, number> = {};
    productsList.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, val]) => ({ name, val })).sort((a, b) => b.val - a.val).slice(0, 4);
  }, [productsList]);

  // Product filters and sorting
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('All');
  const [prodBrandFilter, setProdBrandFilter] = useState('All');
  const [prodSortBy, setProdSortBy] = useState<string>('name');
  const [productPage, setProductPage] = useState(1);
  const itemsPerPage = 8;

  const sortedAndFilteredProducts = useMemo(() => {
    const list = productsList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                            p.description.toLowerCase().includes(prodSearch.toLowerCase()) ||
                            p.id.toLowerCase().includes(prodSearch.toLowerCase());
      const matchesCat = prodCatFilter === 'All' || p.category === prodCatFilter;
      const matchesBrand = prodBrandFilter === 'All' || p.brand === prodBrandFilter;
      return matchesSearch && matchesCat && matchesBrand;
    });

    if (prodSortBy === 'priceAsc') return list.sort((a, b) => a.price - b.price);
    if (prodSortBy === 'priceDesc') return list.sort((a, b) => b.price - a.price);
    if (prodSortBy === 'stock') return list.sort((a, b) => a.stock - b.stock);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [productsList, prodSearch, prodCatFilter, prodBrandFilter, prodSortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (productPage - 1) * itemsPerPage;
    return sortedAndFilteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredProducts, productPage]);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);

  // Forms / Overlays
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [selectedCurateProduct, setSelectedCurateProduct] = useState<Product | null>(null);
  
  // Product Fields
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDiscount, setPDiscount] = useState('');
  const [pStock, setPStock] = useState('');
  const [pSku, setPSku] = useState('');
  const [pImages, setPImages] = useState('');
  const [pStory, setPStory] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(false);
  const [pIsFlashDeal, setPIsFlashDeal] = useState(false);
  const [pTags, setPTags] = useState('');
  const [pSpecs, setPSpecs] = useState<{ key: string; val: string }[]>([{ key: 'Material', val: '' }]);
  const [pColors, setPColors] = useState('');
  const [pSizes, setPSizes] = useState('');
  const [pIsActive, setPIsActive] = useState(true);

  // Categories form modal
  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormImg, setCatFormImg] = useState('');
  const [catFormStatus, setCatFormStatus] = useState<'active' | 'inactive'>('active');

  // Brands form modal
  const [isBrandFormOpen, setIsBrandFormOpen] = useState(false);
  const [editingBrandIdx, setEditingBrandIdx] = useState<number | null>(null);
  const [brandFormName, setBrandFormName] = useState('');
  const [brandFormLogo, setBrandFormLogo] = useState('');
  const [brandFormCountry, setBrandFormCountry] = useState('');
  const [brandFormStatus, setBrandFormStatus] = useState<'active' | 'inactive'>('active');

  // Coupons form

  // Coupons form
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [coupCode, setCoupCode] = useState('');
  const [coupDiscount, setCoupDiscount] = useState('');
  const [coupType, setCoupType] = useState('percentage');
  const [coupExpiry, setCoupExpiry] = useState('');
  const [coupMinOrder, setCoupMinOrder] = useState('');
  const [coupStatus, setCoupStatus] = useState<'active' | 'inactive'>('active');

  // Specs helper rows
  const addSpecRow = () => setPSpecs([...pSpecs, { key: '', val: '' }]);
  const removeSpecRow = (idx: number) => setPSpecs(pSpecs.filter((_, i) => i !== idx));
  const updateSpecRow = (idx: number, field: 'key' | 'val', val: string) => {
    const updated = [...pSpecs];
    updated[idx][field] = val;
    setPSpecs(updated);
  };

  // Open forms helper
  const openAddProdModal = () => {
    setSelectedCurateProduct(null);
    setPName('');
    setPBrand(brandsList[0]?.name || 'Moderne Dwell');
    setPCategory(categoriesList[0]?.name || 'Fashion');
    setPDescription('');
    setPPrice('');
    setPDiscount('');
    setPStock('15');
    setPSku(`DS-${Date.now().toString().substring(8)}`);
    setPImages('');
    setPStory('');
    setPIsFeatured(false);
    setPIsFlashDeal(false);
    setPTags('');
    setPColors('Gray, Alabaster');
    setPSizes('Standard');
    setPIsActive(true);
    setPSpecs([{ key: 'Material', val: '' }]);
    setIsProductFormOpen(true);
  };

  const openEditProdModal = (p: Product) => {
    setSelectedCurateProduct(p);
    setPName(p.name);
    setPBrand(p.brand);
    setPCategory(p.category);
    setPDescription(p.description);
    setPPrice(String(p.price));
    setPDiscount(p.originalPrice ? String(p.originalPrice) : '');
    setPStock(String(p.stock));
    setPSku(p.id);
    setPImages(p.images ? p.images.join(', ') : '');
    setPStory(p.productStory || '');
    setPIsFeatured(!!p.isFeatured);
    setPIsFlashDeal(!!p.isFlashDeal);
    setPTags(p.tags ? p.tags.join(', ') : '');
    setPColors(p.colors ? p.colors.join(', ') : '');
    setPSizes(p.sizes ? p.sizes.join(', ') : '');
    setPIsActive(p.isActive !== false);
    
    const arr = Object.entries(p.specs || {}).map(([key, val]) => ({ key, val }));
    setPSpecs(arr.length > 0 ? arr : [{ key: 'Material', val: '' }]);
    setIsProductFormOpen(true);
  };

  // Forms Submits
  const handleProductSave = (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    if (!pName.trim() || !pPrice || !pImages) return;

    const specsRec: Record<string, string> = {};
    pSpecs.forEach(r => {
      if (r.key.trim()) specsRec[r.key] = r.val;
    });

    const tagsArr = pTags.split(',').map(t => t.trim()).filter(Boolean);
    const colorsArr = pColors.split(',').map(c => c.trim()).filter(Boolean);
    const sizesArr = pSizes.split(',').map(s => s.trim()).filter(Boolean);
    const imagesArr = pImages.split(',').map(img => img.trim()).filter(Boolean);

    const priceNum = parseFloat(pPrice);
    const origPriceNum = pDiscount ? parseFloat(pDiscount) : undefined;
    const discountPercent = origPriceNum && origPriceNum > priceNum 
      ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) 
      : undefined;

    const payload: Product = {
      id: selectedCurateProduct ? selectedCurateProduct.id : pSku || `prod-${Date.now()}`,
      name: pName,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent,
      stock: parseInt(pStock),
      category: pCategory,
      brand: pBrand,
      description: pDescription,
      images: imagesArr,
      subcategory: selectedCurateProduct ? selectedCurateProduct.subcategory : 'Premium Curation',
      rating: selectedCurateProduct ? selectedCurateProduct.rating : 5.0,
      reviewCount: selectedCurateProduct ? selectedCurateProduct.reviewCount : 0,
      specs: specsRec,
      colors: colorsArr,
      sizes: sizesArr,
      isFeatured: pIsFeatured,
      isFlashDeal: pIsFlashDeal,
      productStory: pStory || undefined,
      tags: tagsArr,
      isActive: status === 'draft' ? false : pIsActive,
      reviews: selectedCurateProduct ? selectedCurateProduct.reviews : []
    };

    if (selectedCurateProduct) {
      onEditProduct(payload);
    } else {
      onAddProduct(payload);
    }

    setIsProductFormOpen(false);
    setSelectedCurateProduct(null);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;

    if (editingCatIdx !== null) {
      setCategoriesList(categoriesList.map((c, i) => i === editingCatIdx ? {
        ...c,
        name: catFormName,
        img: catFormImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150',
        status: catFormStatus
      } : c));
    } else {
      setCategoriesList([...categoriesList, {
        name: catFormName,
        img: catFormImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150',
        status: catFormStatus
      }]);
    }
    setIsCatFormOpen(false);
    setEditingCatIdx(null);
  };

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandFormName.trim()) return;

    if (editingBrandIdx !== null) {
      setBrandsList(brandsList.map((b, i) => i === editingBrandIdx ? {
        ...b,
        name: brandFormName,
        logo: brandFormLogo || brandFormName.substring(0, 2).toUpperCase(),
        country: brandFormCountry || 'United Kingdom',
        status: brandFormStatus
      } : b));
    } else {
      setBrandsList([...brandsList, {
        name: brandFormName,
        logo: brandFormLogo || brandFormName.substring(0, 2).toUpperCase(),
        country: brandFormCountry || 'United Kingdom',
        status: brandFormStatus
      }]);
    }
    setIsBrandFormOpen(false);
    setEditingBrandIdx(null);
  };



  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode.trim()) return;

    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? {
        ...c,
        code: coupCode.toUpperCase(),
        discount: parseFloat(coupDiscount),
        type: coupType,
        expiryDate: coupExpiry || '2026-12-31',
        minOrder: parseFloat(coupMinOrder) || 0,
        status: coupStatus
      } : c));
    } else {
      setCoupons([...coupons, {
        id: `cpn-${Date.now()}`,
        code: coupCode.toUpperCase(),
        discount: parseFloat(coupDiscount) || 0,
        type: coupType,
        expiryDate: coupExpiry || '2026-12-31',
        minOrder: parseFloat(coupMinOrder) || 0,
        status: coupStatus,
        usageCount: 0
      }]);
    }
    setIsCouponFormOpen(false);
    setEditingCoupon(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans text-xs">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`bg-slate-950 text-slate-400 shrink-0 flex flex-col justify-between border-r border-slate-900 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-full md:w-20' : 'w-full md:w-64'
      }`}>
        <div>
          {/* Logo Head */}
          <div className="p-6 border-b border-slate-900 flex items-center justify-between gap-3">
            <span className={`font-display font-light text-white tracking-[0.2em] uppercase select-none transition-all ${
              isSidebarCollapsed ? 'hidden' : 'block text-sm'
            }`}>
              DREAM<span className="font-bold text-emerald-400">HUB</span>
            </span>
            {isSidebarCollapsed && (
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold rounded-lg select-none mx-auto">
                DH
              </span>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer hidden md:block"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Links list */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
              { id: 'categories', label: 'Categories', icon: <Tags className="w-4 h-4" /> },
              { id: 'brands', label: 'Brands', icon: <Award className="w-4 h-4" /> },
              { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
              { id: 'inventory', label: 'Inventory', icon: <Layers className="w-4 h-4" /> },
              { id: 'coupons', label: 'Coupons', icon: <Ticket className="w-4 h-4" /> },
              { id: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-tight transition-all cursor-pointer ${
                  activeTab === link.id
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-800'
                    : 'hover:bg-slate-900/40 hover:text-slate-200'
                }`}
              >
                {link.icon}
                <span className={isSidebarCollapsed ? 'hidden' : 'block'}>{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar logout button */}
        <div className="p-4 border-t border-slate-900">
          <button 
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                signOut(auth).catch(console.error);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900 rounded-xl font-bold text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>Logout</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE AREA RIGHT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {/* TOP STATUS CONTROL BAR */}
        <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div>
            <h1 className="font-sans text-xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Product Management'}
              {activeTab === 'categories' && 'Categories Catalogue'}
              {activeTab === 'brands' && 'Boutique Brand Editors'}
              {activeTab === 'orders' && 'Client Orders Management'}
              {activeTab === 'customers' && 'Customer Registry'}
              {activeTab === 'inventory' && 'Inventory Management'}
              {activeTab === 'coupons' && 'Promo Coupons & Incentives'}
              {activeTab === 'reviews' && 'Reviews & Appraisals Moderation'}
              {activeTab === 'settings' && 'System Configuration Settings'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Active Store Curation: <strong className="text-slate-700">{storeName}</strong>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-400 text-[10px] bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              CURRENCY: <strong className="text-slate-900">GBP (£)</strong>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Gross Revenue', val: formatPrice(totalRevenue), icon: <DollarSign className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
                { title: 'Total Orders', val: String(ordersList.length), icon: <ShoppingCart className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-100 text-blue-800' },
                { title: 'Total Customers', val: String(usersList.length), icon: <Users className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100 text-indigo-800' },
                { title: 'Total Products', val: String(productsList.length), icon: <Package className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-100 text-amber-800' },
                { title: 'Average Order Value', val: formatPrice(averageOrderValue), icon: <Percent className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 border-rose-100 text-rose-800' }
              ].map((c, idx) => (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold font-sans text-[10px] uppercase tracking-wider block">{c.title}</span>
                    <span className="font-display font-light text-xl text-slate-900 tracking-tight block">{c.val}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${c.bg}`}>
                    {c.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts section: Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Sales by Month */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-sans font-bold text-slate-800 text-sm">Sales by Month</h3>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase">LIVE UPDATE</span>
                </div>
                
                <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                  {(() => {
                    const maxAmount = Math.max(...salesByMonth.map(s => s.amount), 1);
                    return salesByMonth.map((s, idx) => {
                      const pct = (s.amount / maxAmount) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="relative w-full flex justify-center">
                            <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-950 text-white font-mono text-[9px] px-1.5 py-0.5 rounded transition-all duration-200 pointer-events-none whitespace-nowrap z-20">
                              {formatPrice(s.amount)}
                            </span>
                          </div>
                          <div 
                            className="w-full bg-slate-100 rounded-t-md hover:bg-emerald-500 transition-all duration-300"
                            style={{ height: `${Math.max(pct, 4)}%` }}
                          />
                          <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">{s.month}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Chart 2: Revenue by Category */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <h3 className="font-sans font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Revenue by Category</h3>
                <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                  {(() => {
                    const overallRevenue = revenueByCategory.reduce((sum, r) => sum + r.amount, 0);
                    return revenueByCategory.length > 0 ? (
                      revenueByCategory.map((r, i) => {
                        const pct = overallRevenue ? (r.amount / overallRevenue) * 100 : 0;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between font-sans text-xs text-slate-700 font-medium">
                              <span className="font-bold">{r.category}</span>
                              <span className="font-mono text-[10px] text-slate-500">{formatPrice(r.amount)} ({pct.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-400">No category sales metrics detected.</div>
                    );
                  })()}
                </div>
              </div>

            </div>

            {/* Charts section: Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 3: Top Selling Products */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="font-sans font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Top Selling Products</h3>
                <div className="space-y-3.5">
                  {topSellingProducts.length > 0 ? (
                    topSellingProducts.map((item, idx) => {
                      const maxQty = topSellingProducts[0]?.quantity || 1;
                      const pct = (item.quantity / maxQty) * 100;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <img src={item.product.images[0]} className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between text-xs font-sans text-slate-800 font-medium">
                              <span className="font-bold truncate max-w-[200px]">{item.product.name}</span>
                              <span className="font-mono text-[10px] text-slate-500 shrink-0">{item.quantity} sold ({formatPrice(item.revenue)})</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400">No product sales logged yet.</div>
                  )}
                </div>
              </div>

              {/* Chart 4: Orders by Status */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <h3 className="font-sans font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Orders by Status</h3>
                <div className="space-y-3.5">
                  {ordersByStatus.map((item, idx) => {
                    const totalCount = ordersList.length || 1;
                    const pct = (item.count / totalCount) * 100;
                    return (
                      <div key={idx} className="space-y-1 font-sans text-xs">
                        <div className="flex justify-between font-medium text-slate-700">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span className={`w-2 h-2 rounded-full ${
                              item.status === 'Delivered' ? 'bg-emerald-500' :
                              item.status === 'Shipped' ? 'bg-blue-500' :
                              item.status === 'Processing' ? 'bg-amber-500' :
                              item.status === 'Cancelled' ? 'bg-red-500' : 'bg-slate-400'
                            }`} />
                            {item.status}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{item.count} orders ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            item.status === 'Delivered' ? 'bg-emerald-500' :
                            item.status === 'Shipped' ? 'bg-blue-500' :
                            item.status === 'Processing' ? 'bg-amber-500' :
                            item.status === 'Cancelled' ? 'bg-red-500' : 'bg-slate-400'
                          }`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Recent Orders table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <h3 className="font-sans font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-sans">
                    {ordersList.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900">{o.id}</td>
                        <td className="py-3 font-bold text-slate-800">{o.customerName || o.shippingAddress.fullName}</td>
                        <td className="py-3 text-slate-500">{o.date}</td>
                        <td className="py-3 font-mono font-bold text-slate-900">{formatPrice(o.total)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold ${
                            o.fulfillmentStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            o.fulfillmentStatus === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            o.fulfillmentStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {o.fulfillmentStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Filters panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search name, specifications, ID..."
                  value={prodSearch}
                  onChange={(e) => { setProdSearch(e.target.value); setProductPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                <select
                  value={prodCatFilter}
                  onChange={(e) => { setProdCatFilter(e.target.value); setProductPage(1); }}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map((c, i) => (
                    <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={prodBrandFilter}
                  onChange={(e) => { setProdBrandFilter(e.target.value); setProductPage(1); }}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Brands</option>
                  {brandsList.map((b, i) => (
                    <option key={`${b.name}-${i}`} value={b.name}>{b.name}</option>
                  ))}
                </select>

                <select
                  value={prodSortBy}
                  onChange={(e) => { setProdSortBy(e.target.value); setProductPage(1); }}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="stock">Low Stock First</option>
                </select>

                <button 
                  onClick={openAddProdModal}
                  className="px-4 py-2 bg-slate-950 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto"
                >
                  <Plus className="w-4 h-4" /> CURATE PRODUCT
                </button>
              </div>
            </div>

            {/* Products Directory table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                      <th className="p-4">Product</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images && p.images[0] ? p.images[0] : ''} alt="" className="w-10 h-10 object-cover rounded-xl border border-slate-200/80 bg-white" />
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 truncate block max-w-[200px]">{p.name}</span>
                                  {p.isFeatured && (
                                    <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-mono font-bold rounded uppercase">Featured</span>
                                  )}
                                </div>
                                <span className="font-mono text-[9px] text-slate-400 block">{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-700">{p.brand}</td>
                          <td className="p-4 font-medium text-slate-500">{p.category}</td>
                          <td className="p-4 font-mono font-bold text-slate-900">
                            {formatPrice(p.price)}
                            {p.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through font-normal block">{formatPrice(p.originalPrice)}</span>
                            )}
                          </td>
                          <td className="p-4 font-mono">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-1.5 py-0.5 border text-[8px] font-mono font-bold rounded uppercase ${
                              p.isActive !== false 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {p.isActive !== false ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                           <td className="p-4 text-right space-x-1">
                            <button onClick={() => openEditProdModal(p)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors inline-block cursor-pointer">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onAddProduct({ ...p, id: `prod-${Date.now()}`, name: `${p.name} (Copy)` })} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600 transition-colors inline-block cursor-pointer">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => onEditProduct({ ...p, isActive: p.isActive === false })} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600 transition-colors inline-block cursor-pointer">
                              {p.isActive !== false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors inline-block cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                          <span>No products match current filters.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Showing {(productPage - 1) * itemsPerPage + 1} - {Math.min(productPage * itemsPerPage, sortedAndFilteredProducts.length)} of {sortedAndFilteredProducts.length} items
                  </span>
                  <div className="flex gap-1">
                    <button disabled={productPage === 1} onClick={() => setProductPage(prev => Math.max(1, prev - 1))} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setProductPage(i + 1)} className={`px-3 py-1.5 border rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        productPage === i + 1 ? 'bg-slate-950 border-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                      }`}>
                        {i + 1}
                      </button>
                    ))}
                    <button disabled={productPage === totalPages} onClick={() => setProductPage(prev => Math.min(totalPages, prev + 1))} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CATEGORIES CATALOGUE */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Categories Catalogue</h3>
                <p className="text-slate-400 text-xs">Sector configurations inside the shop layout.</p>
              </div>
              <button 
                onClick={() => { setEditingCatIdx(null); setCatFormName(''); setCatFormImg(''); setCatFormStatus('active'); setIsCatFormOpen(true); }}
                className="px-4 py-2 bg-slate-950 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> NEW CATEGORY
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-4">Category Image</th>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Linked Products</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {categoriesList.map((cat, idx) => {
                    const count = productsList.filter(p => p.category === cat.name).length;
                    return (
                      <tr key={`${cat.name}-${idx}`} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4">
                          <img src={cat.img} className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                        </td>
                        <td className="p-4 font-bold text-slate-800">{cat.name}</td>
                        <td className="p-4 font-mono text-slate-500">{count} products</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            cat.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <button 
                            onClick={() => { setEditingCatIdx(idx); setCatFormName(cat.name); setCatFormImg(cat.img); setCatFormStatus(cat.status); setIsCatFormOpen(true); }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors inline-block cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={idx === 0}
                            onClick={() => setCategoriesList(categoriesList.filter((_, i) => i !== idx))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors inline-block disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BRANDS */}
        {/* ========================================================================= */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Brands Catalogue</h3>
                <p className="text-slate-400 text-xs">Curated boutique brands Registry.</p>
              </div>
              <button 
                onClick={() => { setEditingBrandIdx(null); setBrandFormName(''); setBrandFormLogo(''); setBrandFormCountry('Switzerland'); setBrandFormStatus('active'); setIsBrandFormOpen(true); }}
                className="px-4 py-2 bg-slate-950 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> NEW BRAND
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-4">Brand Logo</th>
                    <th className="p-4">Brand Name</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Linked Products</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {brandsList.map((brand, idx) => {
                    const count = productsList.filter(p => p.brand === brand.name).length;
                    return (
                      <tr key={`${brand.name}-${idx}`} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4">
                          <span className="w-7 h-7 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-mono font-bold text-slate-600 select-none">
                            {brand.logo}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-800">{brand.name}</td>
                        <td className="p-4 text-slate-500">{brand.country}</td>
                        <td className="p-4 font-mono font-bold text-slate-500">{count} products</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                            brand.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {brand.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <button 
                            onClick={() => { setEditingBrandIdx(idx); setBrandFormName(brand.name); setBrandFormLogo(brand.logo); setBrandFormCountry(brand.country); setBrandFormStatus(brand.status); setIsBrandFormOpen(true); }}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors inline-block cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={idx === 0}
                            onClick={() => setBrandsList(brandsList.filter((_, i) => i !== idx))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors inline-block disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Filter panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search ID, customer name, email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Payment:</span>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-sans"
                  >
                    <option value="All">All Payments</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Fulfillment:</span>
                  <select
                    value={fulfillmentStatusFilter}
                    onChange={(e) => setFulfillmentStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-sans"
                  >
                    <option value="All">All Fulfillments</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Date:</span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                  {dateFilter && (
                    <button onClick={() => setDateFilter('')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800">Clear</button>
                  )}
                </div>
              </div>
            </div>

            {/* Orders listing table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status Configuration</th>
                      <th className="p-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-sans">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-900">
                            <div>{o.id}</div>
                            {o.trackingNumber && (
                              <span className="text-[8px] font-mono bg-blue-50 text-blue-700 px-1 py-0.2 rounded mt-0.5 inline-block">Track: {o.trackingNumber}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{o.customerName || o.shippingAddress.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{o.customerEmail || 'guest@dreamshelf.co.uk'}</div>
                          </td>
                          <td className="p-4 text-slate-500">{o.date}</td>
                          <td className="p-4 font-mono font-bold text-slate-900">{formatPrice(o.total)}</td>
                          <td className="p-4 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-mono text-slate-400 uppercase w-14">Payment:</span>
                              <select
                                value={o.paymentStatus || 'Pending'}
                                onChange={(e) => {
                                  if (onUpdateOrderStatus) {
                                    onUpdateOrderStatus(o.id, e.target.value as any, undefined);
                                  }
                                }}
                                className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-[9px] uppercase tracking-wider text-slate-700 cursor-pointer focus:outline-none font-sans"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Refunded">Refunded</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-mono text-slate-400 uppercase w-14">Fulfill:</span>
                              <select
                                value={o.fulfillmentStatus || 'Pending'}
                                onChange={(e) => {
                                  if (onUpdateOrderStatus) {
                                    onUpdateOrderStatus(o.id, undefined, e.target.value as any);
                                  }
                                }}
                                className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-[9px] uppercase tracking-wider text-slate-700 cursor-pointer focus:outline-none font-sans"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-4 text-right font-sans">
                            <button 
                              onClick={() => setSelectedOrder(o)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                          <span>No orders match current search/filter parameters.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CUSTOMERS */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex-col md:flex-row gap-3">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Customer Registry</h3>
                <p className="text-slate-400 text-xs">Registered buyers history, contact directory, and customer spending metrics.</p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search customer name, email, phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Customers table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Orders count</th>
                    <th className="p-4">Total Spending</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-slate-150 rounded-full font-mono text-[10px] font-bold text-slate-700">
                            {(c.fullName || c.name || 'CU')[0].toUpperCase()}
                          </span>
                          <span onClick={() => setSelectedCustomerDetail(c)} className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">{c.fullName || c.name}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-550">{c.email}</td>
                        <td className="p-4 font-mono text-slate-500">{c.phoneNumber || c.phone || 'N/A'}</td>
                        <td className="p-4 text-slate-500">
                          {c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : c.dateJoined || 'N/A'}
                        </td>
                        <td className="p-4 font-mono">{c.ordersCount} orders</td>
                        <td className="p-4 font-mono font-bold text-slate-900">{formatPrice(c.totalSpent)}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedCustomerDetail(c)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-650 transition-colors inline-flex items-center gap-1 cursor-pointer font-sans"
                          >
                            <Eye className="w-3.5 h-3.5" /> Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <span>No customers found in directory.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ========================================================================= */}
        {/* TAB 6.5: INVENTORY MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Inventory overview stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Catalog Products', val: String(productsList.length), bg: 'bg-slate-50 border-slate-200' },
                { title: 'Total Units in Stock', val: String(productsList.reduce((sum, p) => sum + (typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock)) || 0), 0)), bg: 'bg-slate-50 border-slate-200' },
                { title: 'Low Stock Alerts (< 5)', val: String(productsList.filter(p => (typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock)) || 0) < 5 && (typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock)) || 0) > 0).length), bg: 'bg-amber-50/50 border-amber-200 text-amber-900' },
                { title: 'Out of Stock Alerts', val: String(productsList.filter(p => (typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock)) || 0) === 0).length), bg: 'bg-red-50/50 border-red-200 text-red-900' }
              ].map((c, idx) => (
                <div key={idx} className={`bg-white border rounded-2xl p-4 shadow-sm ${c.bg}`}>
                  <span className="text-slate-400 font-bold font-sans text-[10px] uppercase tracking-wider block">{c.title}</span>
                  <span className="font-display font-bold text-xl tracking-tight block mt-1">{c.val}</span>
                </div>
              ))}
            </div>

            {/* Controls panel */}
            <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex-col md:flex-row gap-3">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Inventory Ledger</h3>
                <p className="text-slate-400 text-xs">Verify SKU stocks, apply micro-adjustments, or commit bulk updates.</p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text"
                  placeholder="Search product name, SKU..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-4">Product Details</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4">Quick Adjustment Controls</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {productsList
                    .filter(p => p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.id.toLowerCase().includes(inventorySearch.toLowerCase()))
                    .map(p => {
                      const dbStock = typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock)) || 0;
                      const hasDraft = p.id in draftStockUpdates;
                      const currentVal = hasDraft ? draftStockUpdates[p.id] : dbStock;
                      const isLow = dbStock < 5 && dbStock > 0;
                      const isOut = dbStock === 0;

                      return (
                        <tr 
                          key={p.id} 
                          className={`hover:bg-slate-50/30 transition-colors ${
                            isOut ? 'bg-red-50/20' : isLow ? 'bg-amber-50/15' : ''
                          }`}
                        >
                          <td className="p-4 flex items-center gap-3">
                            <img src={p.images[0]} className="w-9 h-9 object-cover rounded-lg border" />
                            <div>
                              <span className="font-bold text-slate-800 block max-w-[200px] truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block">{p.brand} • {p.category}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-500">{p.id}</td>
                          <td className="p-4 font-mono font-bold">
                            <span className={isOut ? 'text-red-650' : isLow ? 'text-amber-650' : 'text-slate-900'}>
                              {dbStock} units
                            </span>
                          </td>
                          <td className="p-4">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-50 text-red-705 border border-red-100 uppercase">Out of Stock</span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-50 text-amber-705 border border-amber-100 uppercase">Low Stock Warning</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-705 border border-emerald-100 uppercase">Optimal</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => {
                                  const newVal = Math.max(0, currentVal - 1);
                                  setDraftStockUpdates(prev => ({ ...prev, [p.id]: newVal }));
                                }}
                                className="w-7 h-7 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-200 select-none cursor-pointer"
                              >
                                -
                              </button>
                              <input 
                                type="number" 
                                value={currentVal}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setDraftStockUpdates(prev => ({ ...prev, [p.id]: val }));
                                }}
                                className={`w-14 text-center px-1 py-1 border rounded-lg font-mono font-bold text-xs bg-white ${
                                  hasDraft ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'
                                }`}
                              />
                              <button 
                                onClick={() => {
                                  const newVal = currentVal + 1;
                                  setDraftStockUpdates(prev => ({ ...prev, [p.id]: newVal }));
                                }}
                                className="w-7 h-7 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-200 select-none cursor-pointer"
                              >
                                +
                              </button>
                              {hasDraft && (
                                <button 
                                  onClick={() => {
                                    setDraftStockUpdates(prev => {
                                      const next = { ...prev };
                                      delete next[p.id];
                                      return next;
                                    });
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-slate-650 ml-1 font-mono uppercase font-bold"
                                >
                                  Undo
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              disabled={!hasDraft}
                              onClick={() => {
                                const updatedProd = { ...p, stock: currentVal };
                                onEditProduct(updatedProd);
                                setDraftStockUpdates(prev => {
                                  const next = { ...prev };
                                  delete next[p.id];
                                  return next;
                                });
                              }}
                              className={`px-3 py-1.5 font-bold rounded-lg transition-all text-[11px] ${
                                hasDraft 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer' 
                                  : 'bg-slate-50 text-slate-450 border border-slate-150 cursor-not-allowed'
                              }`}
                            >
                              Update Item
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Bulk Save banner */}
            {Object.keys(draftStockUpdates).length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-bounce">
                <div>
                  <span className="block font-bold text-xs">Unsaved stock changes pending</span>
                  <span className="block text-[10px] text-slate-400 font-mono">You configured new stock levels for {Object.keys(draftStockUpdates).length} products.</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDraftStockUpdates({})}
                    className="px-3.5 py-1.5 border border-slate-800 text-[11px] font-bold rounded-xl hover:bg-slate-900 cursor-pointer"
                  >
                    DISCARD
                  </button>
                  <button 
                    onClick={() => {
                      Object.entries(draftStockUpdates).forEach(([id, newStock]) => {
                        const targetProd = productsList.find(p => p.id === id);
                        if (targetProd) {
                          onEditProduct({ ...targetProd, stock: newStock });
                        }
                      });
                      setDraftStockUpdates({});
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl cursor-pointer"
                  >
                    SAVE BULK CHANGES
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
        {/* ========================================================================= */}
        {/* TAB 7: COUPONS */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Coupons configuration</h3>
                <p className="text-slate-400 text-xs">Vouchers configured for client billing discount.</p>
              </div>
              <button 
                onClick={() => { setEditingCoupon(null); setCoupCode(''); setCoupDiscount('20'); setCoupType('percentage'); setCoupExpiry('2026-12-31'); setCoupMinOrder('50'); setCoupStatus('active'); setIsCouponFormOpen(true); }}
                className="px-4 py-2 bg-slate-950 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> NEW COUPON
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Min Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Usages</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="p-4 font-mono font-bold text-slate-800">
                        {c.type === 'percentage' ? `${c.discount}% OFF` : 
                         c.type === 'fixed' ? `£${c.discount} OFF` : 'FREE DELIVERY'}
                      </td>
                      <td className="p-4 font-mono text-slate-500">{c.expiryDate}</td>
                      <td className="p-4 font-mono font-bold text-slate-700">£{c.minOrder}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{c.usageCount} times</td>
                      <td className="p-4 text-right space-x-1.5">
                        <button 
                          onClick={() => { setEditingCoupon(c); setCoupCode(c.code); setCoupDiscount(String(c.discount)); setCoupType(c.type); setCoupExpiry(c.expiryDate); setCoupMinOrder(String(c.minOrder)); setCoupStatus(c.status as 'active' | 'inactive'); setIsCouponFormOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors inline-block cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCoupons(coupons.filter(cop => cop.id !== c.id))}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors inline-block cursor-pointer"
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
        )}

        {/* ========================================================================= */}
        {/* TAB 8: REVIEWS */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Product Appraisal Reviews</h3>
                <p className="text-slate-400 text-xs">Moderate, hide, or approve user review submittals.</p>
              </div>
              <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase select-none">
                MODERATION
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="p-4">User</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Appraisal Comment</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderations Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{r.username}</td>
                      <td className="p-4 font-bold text-slate-700 truncate max-w-[120px]">{r.productName}</td>
                      <td className="p-4 text-slate-500 italic max-w-sm truncate">{r.comment}</td>
                      <td className="p-4">
                        <div className="flex gap-0.5 items-center text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                          r.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          r.status === 'hidden' ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          disabled={r.status === 'approved'}
                          onClick={() => setReviews(reviews.map(rev => rev.id === r.id ? { ...rev, status: 'approved' } : rev))}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-emerald-600 disabled:opacity-30 cursor-pointer font-bold"
                        >
                          Approve
                        </button>
                        <button
                          disabled={r.status === 'hidden'}
                          onClick={() => setReviews(reviews.map(rev => rev.id === r.id ? { ...rev, status: 'hidden' } : rev))}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 disabled:opacity-30 cursor-pointer font-bold"
                        >
                          Hide
                        </button>
                        <button
                          onClick={() => setReviews(reviews.filter(rev => rev.id !== r.id))}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-red-600 cursor-pointer font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-sans font-bold text-slate-800 text-sm">Store Configuration</h3>
              <p className="text-slate-400 text-xs">Operational constraints, banner layouts, taxes rates, and socials configuration.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 font-sans text-xs">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Official Store Name</label>
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)} 
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 font-sans"
                  required
                />
              </div>

              {/* Logo & Banner URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Brand Logo URL</label>
                  <input 
                    type="text" 
                    value={storeLogo} 
                    onChange={(e) => setStoreLogo(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Cover Banner URL</label>
                  <input 
                    type="text" 
                    value={storeBanner} 
                    onChange={(e) => setStoreBanner(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50"
                    required
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Support Email</label>
                  <input 
                    type="email" 
                    value={supportEmail} 
                    onChange={(e) => setSupportEmail(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Support Phone</label>
                  <input 
                    type="text" 
                    value={supportPhone} 
                    onChange={(e) => setSupportPhone(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50"
                    required
                  />
                </div>
              </div>

              {/* Shipping, Taxes, Currency */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Shipping Standard Fee (£)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={shippingFee} 
                    onChange={(e) => setShippingFee(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Value Added Tax (VAT %)</label>
                  <input 
                    type="number" 
                    value={taxesPercent} 
                    onChange={(e) => setTaxesPercent(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Store Theme</label>
                  <select 
                    value={adminTheme} 
                    onChange={(e) => setAdminTheme(e.target.value)} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 cursor-pointer"
                  >
                    <option value="light">Boutique Emerald Clean Light</option>
                    <option value="dark">Brutalist Anthracite Dark</option>
                  </select>
                </div>
              </div>

              {/* Social links */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Instagram Handle URL</label>
                  <input 
                    type="text" 
                    value={socialLinks.instagram} 
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Twitter Handle URL</label>
                  <input 
                    type="text" 
                    value={socialLinks.twitter} 
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })} 
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              {/* Notifications settings */}
              <div className="flex items-center gap-2.5 pt-2 select-none">
                <input 
                  id="notif-email-check"
                  type="checkbox" 
                  checked={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="notif-email-check" className="font-bold text-slate-700 cursor-pointer">Enable Email Alerts for New Sales Orders</label>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-slate-950 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  SAVE CONFIGURATION
                </button>
                {settingsSuccess && (
                  <span className="text-emerald-600 font-mono font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Settings saved successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* OVERLAY MODALS */}
      {/* ========================================================================= */}

      {/* 1. PRODUCT ADD / EDIT MODAL */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsProductFormOpen(false)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 md:p-8 space-y-6 relative overflow-hidden text-xs text-left">
              
              <button onClick={() => setIsProductFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-sans font-bold text-slate-900 text-base">
                  {selectedCurateProduct ? 'Update Product Curation' : 'Publish Brand New Product'}
                </h3>
              </div>

              <form onSubmit={(e) => handleProductSave(e, 'published')} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 bg-white">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Product Name</label>
                  <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" placeholder="Product Title" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Category</label>
                    <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 cursor-pointer">
                      {categoriesList.map((c, i) => (
                        <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Brand</label>
                    <select value={pBrand} onChange={(e) => setPBrand(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 cursor-pointer">
                      {brandsList.map((b, i) => (
                        <option key={`${b.name}-${i}`} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Price (GBP £)</label>
                    <input type="number" step="0.01" value={pPrice} onChange={(e) => setPPrice(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Original Price / Discount (£)</label>
                    <input type="number" step="0.01" value={pDiscount} onChange={(e) => setPDiscount(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" placeholder="Original Price" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Available Stock</label>
                    <input type="number" value={pStock} onChange={(e) => setPStock(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">SKU Code</label>
                    <input type="text" value={pSku} onChange={(e) => setPSku(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 font-mono" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Image Asset Links (comma separated)</label>
                    <input type="text" value={pImages} onChange={(e) => setPImages(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..." required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Colors (comma separated)</label>
                    <input type="text" value={pColors} onChange={(e) => setPColors(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" placeholder="Gray, Alabaster, Crimson" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Sizes (comma separated)</label>
                    <input type="text" value={pSizes} onChange={(e) => setPSizes(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" placeholder="Standard, Large, Small" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Short Description</label>
                  <textarea value={pDescription} onChange={(e) => setPDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 h-16 resize-none" required />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Product Story</label>
                  <textarea value={pStory} onChange={(e) => setPStory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50 h-16 resize-none" placeholder="Narrative inspirations..." />
                </div>

                <div className="flex gap-6 pt-1">
                  <div className="flex items-center gap-2 select-none">
                    <input id="p-featured-chk" type="checkbox" checked={pIsFeatured} onChange={(e) => setPIsFeatured(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer" />
                    <label htmlFor="p-featured-chk" className="font-bold text-slate-700 cursor-pointer">Mark Featured</label>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <input id="p-flash-chk" type="checkbox" checked={pIsFlashDeal} onChange={(e) => setPIsFlashDeal(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer" />
                    <label htmlFor="p-flash-chk" className="font-bold text-slate-700 cursor-pointer">Assign to Limited Drops</label>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <input id="p-active-chk" type="checkbox" checked={pIsActive} onChange={(e) => setPIsActive(e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5 cursor-pointer" />
                    <label htmlFor="p-active-chk" className="font-bold text-slate-700 cursor-pointer">Set Product Active</label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Tags (Comma Separated)</label>
                  <input type="text" value={pTags} onChange={(e) => setPTags(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-slate-50" placeholder="brutalist, ceramics, design" />
                </div>

                {/* Specs */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Specifications</label>
                    <button type="button" onClick={addSpecRow} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border rounded font-bold cursor-pointer">Add Row</button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {pSpecs.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input type="text" placeholder="Key" value={row.key} onChange={(e) => updateSpecRow(idx, 'key', e.target.value)} className="flex-1 px-2.5 py-1 border rounded bg-slate-50" />
                        <input type="text" placeholder="Value" value={row.val} onChange={(e) => updateSpecRow(idx, 'val', e.target.value)} className="flex-1 px-2.5 py-1 border rounded bg-slate-50" />
                        <button type="button" disabled={pSpecs.length === 1} onClick={() => removeSpecRow(idx)} className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-20 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsProductFormOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">CANCEL</button>
                  <button type="button" onClick={(e) => handleProductSave(e, 'draft')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold border cursor-pointer">SAVE DRAFT</button>
                  <button type="submit" className="px-5 py-2 bg-slate-950 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">PUBLISH PRODUCT</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDER SPECIFICATIONS VIEW */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 md:p-8 space-y-6 relative overflow-hidden text-xs text-left">
              
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-sans font-bold text-slate-900 text-base">Order details: {selectedOrder.id}</h3>
                <span className="font-mono text-[9px] text-slate-400">Date Placed: {selectedOrder.date}</span>
              </div>

              <div className="space-y-4">
                {/* Product listing */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Ordered Products</span>
                  <div className="bg-slate-50 border p-3 rounded-2xl space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex gap-2 items-center">
                          <img src={item.product.images[0]} className="w-8 h-8 object-cover rounded" />
                          <div>
                            <span className="font-bold text-slate-850 truncate block max-w-[200px]">{item.product.name}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">Qty: {item.quantity} • Tone: {item.selectedColor} • Size: {item.selectedSize}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline and delivery */}
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Shipping Address</span>
                    <p className="text-slate-650 font-sans leading-normal">
                      <strong>{selectedOrder.shippingAddress.fullName}</strong><br/>
                      {selectedOrder.shippingAddress.street}<br/>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br/>
                      {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Order Timeline</span>
                    <div className="space-y-1 font-mono text-[9px] text-slate-500">
                      {selectedOrder.events.map((ev, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span>✓ {ev.name}</span>
                          <span>{ev.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tracking code input */}
                <div className="border-t pt-3 space-y-2">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Tracking Information</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Courier Tracking Code"
                      value={selectedOrder.trackingNumber || ''}
                      onChange={(e) => {
                        if (onUpdateOrderStatus) {
                          onUpdateOrderStatus(selectedOrder.id, undefined, undefined, e.target.value);
                        }
                        setSelectedOrder({ ...selectedOrder, trackingNumber: e.target.value });
                      }}
                      className="flex-1 px-3 py-1.5 border rounded-xl bg-slate-50 font-mono text-[10px] focus:outline-none"
                    />
                    <button onClick={() => setSelectedOrder(null)} className="px-4 py-1.5 bg-slate-950 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">CONFIRM</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 CUSTOMER PROFILE VIEW MODAL */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedCustomerDetail(null)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 md:p-8 space-y-6 relative overflow-hidden text-xs text-left">
              
              <button onClick={() => setSelectedCustomerDetail(null)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                <span className="w-12 h-12 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-full font-mono text-xs font-bold text-slate-650">
                  {(selectedCustomerDetail.fullName || selectedCustomerDetail.name || 'CU')[0].toUpperCase()}
                </span>
                <div>
                  <h3 className="font-sans font-bold text-slate-900 text-base">
                    {selectedCustomerDetail.fullName || selectedCustomerDetail.name}
                  </h3>
                  <span className="font-mono text-[9px] text-slate-400">Customer Profile • ID: {selectedCustomerDetail.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left side: Contact info, addresses, wishlist */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Contact Directory</span>
                    <div className="space-y-1 font-sans text-slate-700">
                      <div><strong>Email:</strong> {selectedCustomerDetail.email}</div>
                      <div><strong>Phone:</strong> {selectedCustomerDetail.phoneNumber || selectedCustomerDetail.phone || 'N/A'}</div>
                      <div><strong>Member Since:</strong> {selectedCustomerDetail.createdAt ? new Date(selectedCustomerDetail.createdAt.seconds * 1000).toLocaleDateString() : selectedCustomerDetail.dateJoined || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Shipping Address Directory</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {(() => {
                        const customerOrders = ordersList.filter(o => o.userId === selectedCustomerDetail.id || o.customerEmail === selectedCustomerDetail.email);
                        const addresses = customerOrders.map(o => o.shippingAddress).filter((addr, index, self) => 
                          self.findIndex(a => a.street === addr.street && a.zipCode === addr.zipCode) === index
                        );
                        return addresses.length > 0 ? (
                          addresses.map((addr, idx) => (
                            <div key={idx} className="p-2 bg-white rounded-xl border border-slate-100 font-sans text-slate-650 leading-relaxed">
                              <strong>{addr.fullName}</strong><br/>
                              {addr.street}, {addr.city}, {addr.state}, {addr.zipCode}, {addr.country}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 block italic">No saved addresses detected.</span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Wishlist */}
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Wishlist Registry</span>
                    <div className="max-h-32 overflow-y-auto pr-1 space-y-1">
                      {selectedCustomerDetail.wishlist && selectedCustomerDetail.wishlist.length > 0 ? (
                        selectedCustomerDetail.wishlist.map((item: any, idx: number) => (
                          <div key={idx} className="p-2 bg-white rounded-xl border border-slate-100 font-bold text-slate-800">
                            {item.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 block italic">Wishlist is empty.</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right side: Order History & Recent Activity */}
                <div className="space-y-6">
                  {/* Order History */}
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Order History</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(() => {
                        const customerOrders = ordersList.filter(o => o.userId === selectedCustomerDetail.id || o.customerEmail === selectedCustomerDetail.email);
                        return customerOrders.length > 0 ? (
                          customerOrders.map(o => (
                            <div key={o.id} className="flex justify-between items-center p-2 bg-white rounded-xl border border-slate-100 text-xs">
                              <div>
                                <span className="font-mono font-bold text-slate-900 block">{o.id}</span>
                                <span className="text-[9px] text-slate-400 block font-mono">{o.date} • {o.items.length} items</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 block">{formatPrice(o.total)}</span>
                                <span className="text-[8px] font-mono font-bold uppercase text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.2 rounded inline-block">{o.fulfillmentStatus || 'Pending'}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 block italic">No order history available.</span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Recent Activities</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 font-mono text-[10px]">
                      {(() => {
                        const customerOrders = ordersList.filter(o => o.userId === selectedCustomerDetail.id || o.customerEmail === selectedCustomerDetail.email);
                        const activities = [];
                        if (selectedCustomerDetail.createdAt) {
                          activities.push({ text: 'Client profile registered in directory.', time: new Date(selectedCustomerDetail.createdAt.seconds * 1000).toLocaleDateString() });
                        } else {
                          activities.push({ text: 'Client profile registered in directory.', time: selectedCustomerDetail.dateJoined || 'N/A' });
                        }
                        customerOrders.forEach(o => {
                          activities.push({ text: `Checked out order ${o.id}.`, time: o.date });
                        });
                        return activities.map((act, i) => (
                          <div key={i} className="flex justify-between items-center p-1.5 border-b border-slate-200/50 text-slate-600">
                            <span>{act.text}</span>
                            <span className="text-slate-400 font-bold shrink-0 ml-2">{act.time}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORIES MODAL */}
      {isCatFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsCatFormOpen(false)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-6 relative overflow-hidden text-xs text-left">
              
              <button onClick={() => setIsCatFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b pb-3">
                <h3 className="font-sans font-bold text-slate-900 text-base">
                  {editingCatIdx !== null ? 'Modify Category' : 'Create Category'}
                </h3>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category Name</label>
                  <input type="text" value={catFormName} onChange={(e) => setCatFormName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-slate-50" placeholder="e.g. Home Living" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category Banner Image URL</label>
                  <input type="text" value={catFormImg} onChange={(e) => setCatFormImg(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-slate-50" placeholder="https://images.unsplash.com/..." />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status</label>
                  <select value={catFormStatus} onChange={(e) => setCatFormStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-slate-50 cursor-pointer">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button type="button" onClick={() => setIsCatFormOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">CANCEL</button>
                  <button type="submit" className="px-5 py-2 bg-slate-950 text-white font-bold rounded-xl cursor-pointer">CONFIRM</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. BRANDS MODAL */}
      {isBrandFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsBrandFormOpen(false)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-6 relative overflow-hidden text-xs text-left">
              
              <button onClick={() => setIsBrandFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b pb-3">
                <h3 className="font-sans font-bold text-slate-900 text-base">
                  {editingBrandIdx !== null ? 'Modify Brand Curation' : 'Add Brand Curation'}
                </h3>
              </div>

              <form onSubmit={handleBrandSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Brand Name</label>
                  <input type="text" value={brandFormName} onChange={(e) => setBrandFormName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-slate-50" placeholder="Brand Name" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Country of Origin</label>
                  <input type="text" value={brandFormCountry} onChange={(e) => setBrandFormCountry(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-slate-50" placeholder="e.g. Denmark" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status</label>
                  <select value={brandFormStatus} onChange={(e) => setBrandFormStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-slate-50 cursor-pointer">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button type="button" onClick={() => setIsBrandFormOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">CANCEL</button>
                  <button type="submit" className="px-5 py-2 bg-slate-950 text-white font-bold rounded-xl cursor-pointer">CONFIRM</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* 6. COUPON MODAL */}
      {isCouponFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-white">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsCouponFormOpen(false)} />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-6 relative overflow-hidden text-xs text-left">
              
              <button onClick={() => setIsCouponFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="border-b pb-3">
                <h3 className="font-sans font-bold text-slate-900 text-base">
                  {editingCoupon ? 'Modify Coupon' : 'Create Coupon'}
                </h3>
              </div>

              <form onSubmit={handleCouponSubmit} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Coupon Code</label>
                  <input type="text" value={coupCode} onChange={(e) => setCoupCode(e.target.value)} className="w-full px-3.5 py-2 border rounded-xl bg-slate-50 font-mono font-bold" placeholder="e.g. EXTRA10" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Type</label>
                    <select value={coupType} onChange={(e) => setCoupType(e.target.value)} className="w-full px-3.5 py-2 border rounded-xl bg-slate-50 cursor-pointer">
                      <option value="percentage">Percentage OFF</option>
                      <option value="fixed">Fixed Amount OFF</option>
                      <option value="shipping">Free Shipping</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Discount Value</label>
                    <input type="number" value={coupDiscount} disabled={coupType === 'shipping'} onChange={(e) => setCoupDiscount(e.target.value)} className="w-full px-3.5 py-2 border rounded-xl bg-slate-50" required={coupType !== 'shipping'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Expiry Date</label>
                    <input type="date" value={coupExpiry} onChange={(e) => setCoupExpiry(e.target.value)} className="w-full px-3.5 py-2 border rounded-xl bg-slate-50 font-mono" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Minimum Order (£)</label>
                    <input type="number" value={coupMinOrder} onChange={(e) => setCoupMinOrder(e.target.value)} className="w-full px-3.5 py-2 border rounded-xl bg-slate-50 font-mono" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Status</label>
                  <select value={coupStatus} onChange={(e) => setCoupStatus(e.target.value as any)} className="w-full px-3.5 py-2 border rounded-xl bg-slate-50 cursor-pointer">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button type="button" onClick={() => setIsCouponFormOpen(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">CANCEL</button>
                  <button type="submit" className="px-5 py-2 bg-slate-950 text-white font-bold rounded-xl cursor-pointer">CONFIRM</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
