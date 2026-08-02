/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, BlogPost, SitemapNode, UserFlowStep, Address, SavedCard } from './types';

// Design System Tokens (for display in our Design System panel)
export const DESIGN_TOKENS = {
  colors: [
    { name: 'Deep Emerald', value: '#064E3B', text: '#FFFFFF', desc: 'Primary Brand Color (Luxury, Premium tone)' },
    { name: 'Soft Teal', value: '#14B8A6', text: '#0F172A', desc: 'Primary Brand Highlight' },
    { name: 'Electric Lime', value: '#84CC16', text: '#0F172A', desc: 'Accent Color for badges, CTA highlights' },
    { name: 'Soft Cyan', value: '#22D3EE', text: '#0F172A', desc: 'Secondary Accent for flash deals & interactive states' },
    { name: 'Warm White', value: '#F9FAFB', text: '#0F172A', desc: 'Neutral container background' },
    { name: 'Pure White', value: '#FFFFFF', text: '#0F172A', desc: 'Card background and structural blocks' },
    { name: 'Canvas BG', value: '#FCFCFC', text: '#0F172A', desc: 'Main application body background' },
    { name: 'Near Black', value: '#0F172A', text: '#FFFFFF', desc: 'Primary Typography, heavy headers' },
    { name: 'Muted Slate', value: '#64748B', text: '#FFFFFF', desc: 'Secondary Body text, grid lines' },
    { name: 'Modern Green (Success)', value: '#10B981', text: '#FFFFFF', desc: 'Order placed, checkout success' },
    { name: 'Soft Orange (Warning)', value: '#F59E0B', text: '#FFFFFF', desc: 'Low stock alerts' },
    { name: 'Modern Red (Error)', value: '#EF4444', text: '#FFFFFF', desc: 'Payment failed, system validations' }
  ],
  typography: {
    heading: 'Space Grotesk / Inter (Display, bold, letter-spacing: -0.03em)',
    body: 'Inter (Sans-serif, highly legible, optimized line-height)',
    code: 'JetBrains Mono (System telemetry, specifications, metadata, sizes)'
  },
  spacing: [
    { scale: 'xs', size: '4px / 0.25rem', usage: 'Subtle item padding, gap within badges' },
    { scale: 'sm', size: '8px / 0.5rem', usage: 'Badge margins, text-to-image proximity' },
    { scale: 'md', size: '16px / 1rem', usage: 'Standard grid gaps, button padding, inner cards' },
    { scale: 'lg', size: '24px / 1.5rem', usage: 'Card padding, side margin spacers, name offsets' },
    { scale: 'xl', size: '48px / 3rem', usage: 'Section headings margins, hero section content spacing' },
    { scale: 'xxl', size: '80px / 5rem', usage: 'Extreme negative breathing space for high-end feel' }
  ],
  photography: {
    description: 'Minimalist, organic high-key studio setups. Soft volumetric shadows, warm overcast lighting, products floating or positioned on brutalist concrete blocks or raw sand pedestals.',
    illustrations: 'Geometric vector art, monochrome outlines with Electric Lime accents, high-contrast typography, zero cartoon animations.'
  }
};

// Information Architecture Sitemap Nodes
export const SITEMAP: SitemapNode[] = [
  {
    name: 'DreamShelf Core Hub',
    path: '/',
    category: 'core',
    description: 'Immersive Awwwards-winning Landing Page with Bento grids & AI Assistant Launcher',
    children: [
      {
        name: 'The Catalog (All Products)',
        path: '/shop',
        category: 'core',
        description: 'Advanced dynamic filters, grid layout alternating asymmetry, multi-category indexing.',
        children: [
          { name: 'Fashion & Wardrobe', path: '/shop/fashion', category: 'core', description: 'Curated clothes' },
          { name: 'Athleisure & Gym Gear', path: '/shop/gym', category: 'core', description: 'Performance and equipment' },
          { name: 'Home Living & Decor', path: '/shop/home', category: 'core', description: 'Curated Brutalist ceramics' },
          { name: 'Gadgets & Tomorrow Tech', path: '/shop/tech', category: 'core', description: 'Futuristic gear' },
          { name: 'Skincare & Organic Beauty', path: '/shop/beauty', category: 'core', description: 'Self care' }
        ]
      },
      {
        name: 'Product Details Engine',
        path: '/product/:id',
        category: 'core',
        description: '360 degree mockup, specifications, live sizing assistant, story narrative, client reviews.'
      },
      {
        name: 'Smart Search Results',
        path: '/search',
        category: 'core',
        description: 'Real-time fuzzy query filter matching with recently viewed and trending list suggestions.'
      }
    ]
  },
  {
    name: 'Cart & checkout',
    path: '/cart',
    category: 'core',
    description: 'Subtle slide-over cart panel transitioning into single-page secure checkout.',
    children: [
      { name: 'Secure Stripe Billing', path: '/checkout', category: 'core', description: 'Promo code, gift card, address select' },
      { name: 'Receipt & Success Portal', path: '/order-success', category: 'core', description: 'Real-time order summary' },
      { name: 'Live Transit Tracker', path: '/tracking', category: 'core', description: 'Interactive shipping milestones & returns portal' }
    ]
  },
  {
    name: 'Customer Center',
    path: '/account',
    category: 'account',
    description: 'User dashboard detailing past purchases, saved wallets, addresses, and loyalty point rewards.',
    children: [
      { name: 'Profile Configuration', path: '/account/profile', category: 'account', description: 'Credentials and security options' },
      { name: 'Referrals & Referral wallet', path: '/account/referral', category: 'account', description: 'Invite system' },
      { name: 'Saved Card Vault', path: '/account/payment', category: 'account', description: 'Payment cards management' }
    ]
  },
  {
    name: 'Seller & Creator Console',
    path: '/seller-hub',
    category: 'seller',
    description: 'Unified management dashboards detailing current revenues, active listings, order statuses, and stock counts.',
    children: [
      { name: 'Upload listing', path: '/seller-hub/upload', category: 'seller', description: 'Curate product entries with variant options' },
      { name: 'Metrics & Charts', path: '/seller-hub/analytics', category: 'seller', description: 'Revenues, views, and conversion trends' }
    ]
  },
  {
    name: 'Brand Editorial',
    path: '/about',
    category: 'support',
    description: 'DreamShelf story, design aesthetic origins, sustainable initiatives, and team vision.',
    children: [
      { name: 'The DreamShelf Journal (Blog)', path: '/blog', category: 'support', description: 'Weekly lifestyle and tech roundups' },
      { name: 'Careers & Hiring', path: '/careers', category: 'support', description: 'Brutalist job specifications and core culture handbook' }
    ]
  }
];

// Interactive User Flow Steps for display
export const USER_FLOWS: UserFlowStep[] = [
  {
    id: 'F1',
    name: 'Discover & Explore',
    actor: 'User',
    description: 'Arrives on DreamShelf. Engages with the editorial hero section, horizontal product carousels, or searches using AI recommended keywords.',
    nextStepIds: ['F2', 'F3']
  },
  {
    id: 'F2',
    name: 'Intelligent Query Search',
    actor: 'System',
    description: 'Suggests items based on seasonal weather or trending items, matching tags in our index.',
    nextStepIds: ['F4']
  },
  {
    id: 'F3',
    name: 'Consult AI Shopper Assistant',
    actor: 'AI Assistant',
    description: 'User triggers Live Chat. Gemini analyzes natural styling requests and provides customized links directly to catalog items.',
    nextStepIds: ['F4', 'F1']
  },
  {
    id: 'F4',
    name: 'Interact with Curated Listing',
    actor: 'User',
    description: 'Inspects full image gallery, reviews customer feedback, toggles sizing/colors, reads product origin story.',
    nextStepIds: ['F5', 'F6']
  },
  {
    id: 'F5',
    name: 'Add to Smart Cart',
    actor: 'System',
    description: 'Punches item into Local State. Animate-in side slider reveals active subtotal and applied complimentary promotions.',
    nextStepIds: ['F7']
  },
  {
    id: 'F6',
    name: 'Bookmark in Wishlist',
    actor: 'User',
    description: 'Heart icon animates. Saves item to customer profile for future notification matching.',
    nextStepIds: ['F1']
  },
  {
    id: 'F7',
    name: 'Unified Checkout Sequence',
    actor: 'User',
    description: 'Inputs delivery details, card tokens, or applies gift card credentials. Checkout milestones indicator tracks progress.',
    nextStepIds: ['F8']
  },
  {
    id: 'F8',
    name: 'Finalize order',
    actor: 'System',
    description: 'Fires invoice generator, reduces inventory levels on the seller dashboard, and initiates order transit tracking timelines.',
    nextStepIds: ['F9']
  },
  {
    id: 'F9',
    name: 'Order Status & Post-Purchase Tracking',
    actor: 'User',
    description: 'User monitors live transit progress. Can request instant automated self-service returns or download printable PDF invoices.',
    nextStepIds: []
  }
];

// Curated High-Fidelity Products Database
export const PRODUCTS: Product[] = [];

// Curated Journal (Blog) Posts
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    name: 'The Brutalist Resurrection in Modern Living Accessories',
    category: 'Design Philosophy',
    author: 'Elena Rostova',
    date: 'July 14, 2026',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    summary: 'Why clean raw textures, concrete castings, and architectural asymmetry are replacing cheap glossy plastics in tomorrow’s living room workspaces.',
    content: [
      'The modern living environment has reached an inflection point. For decades, consumer culture pushed us toward disposable glossy objects—flawless, hyper-polished plastics that promised futurism but delivered sterile impermanence.',
      'Enter brutalist homewares. Molded from sand-mixed clay, aerated concrete, and heavy sand-blasted metals, these objects don’t hide their natural processes. They feature air bubbles, rough seams, and irregular oxidized colors.',
      'Our homes are no longer sterile tech zones; they are tactile sanctuaries. By matching high-spec organic materials with ancient artisan firing methods, we create a sensory contrast that anchors our daily screens in physical reality.'
    ]
  },
  {
    id: 'blog-2',
    name: 'Designing Beyond the Shopping Cart: The Interface of Tomorrow',
    category: 'Interface & Tech',
    author: 'Kai Aris',
    date: 'July 02, 2026',
    coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800',
    summary: 'A look into how dynamic spatial frameworks and server-driven generative AI assistants are altering the digital marketplace experience.',
    content: [
      'Digital commerce has been stuck in the generic rectangular grid era for too long. If you remove the brand logo from five major online storefronts, they look identical. The grid has become a cage.',
      'At DreamShelf, we believe online purchasing should evoke the excitement of strolling through a curated boutique. We use asymmetric bento grids that alternate layouts, letting hero imagery breathe with generous margins.',
      'Combining these layouts with a server-side LLM assistant like Gemini turns search from keyword-matching into an interactive, friendly styling conversation. You don’t just buy things; you design your lifestyle.'
    ]
  }
];

// FAQs list
export const FAQS = [
  { q: 'Is DreamShelf a furniture shop?', a: 'No. DreamShelf is an architectural, multi-category marketplace. We offer high-end fashion, high-spec gym wear, precision audio gear, brutalist home decor, limited-edition collectibles, and progressive stationery. Think of us as a boutique digital gallery for tomorrow’s lifestyle.' },
  { q: 'How does the Live AI Shopper work?', a: 'Our live chat is powered by Gemini AI. The assistant has access to our real product catalog, specifications, reviews, and design ethos. You can ask it for fashion recommendations, styling guides, specific specs, or gift consultations, and it will respond intelligently with live product links!' },
  { q: 'What are your shipping and return policies?', a: 'We offer standard delivery across the UK. Delivery takes 2–5 business days, with free delivery for orders above £100.00. If an item doesn’t fit your aesthetic, you can trigger our self-service returns portal under your order panel within 14 days of delivery for a full refund.' },
  { q: 'Can I sell my products on DreamShelf?', a: 'Absolutely! We support independent designers, artisans, and premium brands. Apply via our Seller Portal to create listing models, track real-time analytics, and access our organic customer network.' }
];

// Coupon lists
export const COUPONS = [
  { code: 'DREAM20', discount: '20% Off entire store', type: 'percentage', value: 20 },
  { code: 'AI_SHERPA_FREE', discount: 'Free delivery on all items', type: 'free_shipping', value: 4.99 },
  { code: 'SHELF_LOYAL_50', discount: '£35.00 Off orders over £150.00', type: 'fixed', value: 35 }
];


