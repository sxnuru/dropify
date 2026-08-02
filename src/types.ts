/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  helpfulCount: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  subcategory: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  colors: string[];
  sizes: string[];
  stock: number;
  brand: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isFlashDeal?: boolean;
  discountPercent?: number;
  isAISuggestion?: boolean;
  productStory?: string;
  reviews: Review[];
  features?: string[];
  estimatedDelivery?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + color + size)
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface BlogPost {
  id: string;
  name: string;
  category: string;
  author: string;
  date: string;
  coverImage: string;
  summary: string;
  content: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';
  trackingNumber: string;
  estimatedDelivery: string;
  shippingAddress: Address;
  paymentMethod: string;
  date: string;
  events: { name: string; description: string; time: string; done: boolean }[];
  customerName?: string;
  customerEmail?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Refunded' | 'Cancelled';
  fulfillmentStatus?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  userId?: string;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  area?: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface SavedCard {
  id: string;
  cardholderName: string;
  cardNumber: string; // masked, e.g. **** **** **** 4242
  expiryDate: string;
  cardBrand: 'visa' | 'mastercard' | 'amex';
  isDefault?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Sitemap Node for IA Visualization
export interface SitemapNode {
  name: string;
  path: string;
  category: 'core' | 'support' | 'seller' | 'account' | 'legal';
  description: string;
  children?: SitemapNode[];
}

// User Flow Step
export interface UserFlowStep {
  id: string;
  name: string;
  actor: 'User' | 'System' | 'AI Assistant' | 'Seller';
  description: string;
  nextStepIds: string[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  status?: string;
  memberSince?: string;
  loyaltyPoints?: number;
  role?: string;
  uid?: string;
}
