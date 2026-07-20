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
    { scale: 'lg', size: '24px / 1.5rem', usage: 'Card padding, side margin spacers, title offsets' },
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
    title: 'Discover & Explore',
    actor: 'User',
    description: 'Arrives on DreamShelf. Engages with the editorial hero section, horizontal product carousels, or searches using AI recommended keywords.',
    nextStepIds: ['F2', 'F3']
  },
  {
    id: 'F2',
    title: 'Intelligent Query Search',
    actor: 'System',
    description: 'Suggests items based on seasonal weather or trending items, matching tags in our index.',
    nextStepIds: ['F4']
  },
  {
    id: 'F3',
    title: 'Consult AI Shopper Assistant',
    actor: 'AI Assistant',
    description: 'User triggers Live Chat. Gemini analyzes natural styling requests and provides customized links directly to catalog items.',
    nextStepIds: ['F4', 'F1']
  },
  {
    id: 'F4',
    title: 'Interact with Curated Listing',
    actor: 'User',
    description: 'Inspects full image gallery, reviews customer feedback, toggles sizing/colors, reads product origin story.',
    nextStepIds: ['F5', 'F6']
  },
  {
    id: 'F5',
    title: 'Add to Smart Cart',
    actor: 'System',
    description: 'Punches item into Local State. Animate-in side slider reveals active subtotal and applied complimentary promotions.',
    nextStepIds: ['F7']
  },
  {
    id: 'F6',
    title: 'Bookmark in Wishlist',
    actor: 'User',
    description: 'Heart icon animates. Saves item to customer profile for future notification matching.',
    nextStepIds: ['F1']
  },
  {
    id: 'F7',
    title: 'Unified Checkout Sequence',
    actor: 'User',
    description: 'Inputs delivery details, card tokens, or applies gift card credentials. Checkout milestones indicator tracks progress.',
    nextStepIds: ['F8']
  },
  {
    id: 'F8',
    title: 'Finalize order',
    actor: 'System',
    description: 'Fires invoice generator, reduces inventory levels on the seller dashboard, and initiates order transit tracking timelines.',
    nextStepIds: ['F9']
  },
  {
    id: 'F9',
    title: 'Order Status & Post-Purchase Tracking',
    actor: 'User',
    description: 'User monitors live transit progress. Can request instant automated self-service returns or download printable PDF invoices.',
    nextStepIds: []
  }
];

// Curated High-Fidelity Products Database
export const PRODUCTS: Product[] = [
  {
    id: 'ds-001',
    name: 'AeroWeave Knit Blazer',
    price: 115.00,
    originalPrice: 150.00,
    description: 'An architectural unstructured blazer knit from ultra-breathable high-twist yarn. Adapts to body temperature while maintaining an immaculately tailored silhouette.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Fashion',
    subcategory: "Men's Clothing",
    rating: 4.8,
    reviewCount: 42,
    colors: ['Charcoal', 'Alabaster', 'Warm Taupe'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 14,
    brand: 'Aether Studio',
    isFeatured: true,
    isNew: false,
    discountPercent: 23,
    isAISuggestion: true,
    productStory: 'Designed in Copenhagen, the AeroWeave represents a masterclass in modular wardrobe architecture. We stripped away standard stiff canvases and heavy shoulder padding, weaving high-twist crepe yarn on proprietary Japanese computerized looms to craft a smart coat that fits like a second skin.',
    specs: {
      Material: '72% Organic Cotton, 28% Recycled Poly-blend',
      Weave: 'High-twist structural crepe knit',
      Weight: 'Medium-lightweight 290gsm',
      Origin: 'Crafted in Kyoto, Japan',
      Care: 'Dry clean recommended, cold handwash safe'
    },
    features: [
      'Breathable heat-regulating mesh panels hidden under-arm',
      'Wrinkle-free recovery: roll it up into your carry-on, shake it, wear it',
      'Dual utility concealed phone pockets inside chest lines'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-1', username: 'Lucas Vance', rating: 5, comment: 'The finest jacket I have owned. No restrictions on movement. Travels beautifully.', date: '2026-06-12', helpfulCount: 18, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
      { id: 'rev-2', username: 'Aria Sterling', rating: 4, comment: 'Slightly roomier in the shoulders than expected, but the drape is magnificent. Beautiful Alabaster shade.', date: '2026-06-29', helpfulCount: 5, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    id: 'ds-002',
    name: 'Aethera ANC Spatial Headphones',
    price: 149.00,
    originalPrice: 179.00,
    description: 'Precision acoustics meets raw brutalist design. Features custom 40mm bio-cellulose drivers, 45dB Active Noise Cancellation, and organic leather contact pads.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Electronics',
    subcategory: 'Gadgets',
    rating: 4.9,
    reviewCount: 128,
    colors: ['Obsidian', 'Bone', 'Sage'],
    sizes: ['Universal Fit'],
    stock: 8,
    brand: 'Soma Audio',
    isFeatured: true,
    isNew: true,
    isFlashDeal: true,
    discountPercent: 12,
    productStory: 'With the Aethera Headset, we set out to build a pristine sonic sanctuary. We machined the external headband arcs from lightweight sand-blasted aerospace titanium, suspended the ear cups on frictionless magnetic pivots, and tuned our EQ signature to mirror legendary acoustic chambers.',
    specs: {
      Driver: '40mm customized bio-cellulose diaphragm',
      Frequency: '4Hz - 45,000Hz Ultra-high definition',
      ANC: 'Adaptive hybrid 45dB with transparency logic',
      Battery: 'Up to 52 hours with ANC active, 15-min flash charge yields 10 hrs',
      Connectivity: 'Bluetooth 5.3 with ultra-low latency spatial sound integration'
    },
    features: [
      'Personalized ear-canal map modeling via spatial microphone tuning',
      'Sensory ambient wear detection: music pauses instantly upon lifting earcup',
      'Interchangeable magnetic protein leather ear pillows'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-3', username: 'Kenji Sato', rating: 5, comment: 'Soundstage is incredibly wide, feels like sitting in an open room. Best material finish in the business.', date: '2026-07-04', helpfulCount: 42, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    id: 'ds-003',
    name: 'Nordic Cashmere Overcoat',
    price: 245.00,
    originalPrice: 320.00,
    description: 'Double-faced luxury overcoat handcrafted from 100% sustainably sourced Mongolian cashmere. Unlined design for fluid organic movement.',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Fashion',
    subcategory: "Women's Clothing",
    rating: 4.9,
    reviewCount: 31,
    colors: ['Oatmeal', 'Camel', 'Noir'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 5,
    brand: 'NORD',
    isFeatured: false,
    isNew: true,
    isAISuggestion: true,
    productStory: 'A timeless silhouette designed to defy temporary trends. Every single coat takes over 14 hours of artisan hand-stitching to fuse two distinct layers of long-staple Mongolian cashmere. Unbelievably soft, insulating, and drapes like fluid sculpture.',
    specs: {
      Material: '100% Hand-harvested Grade-A Mongolian Cashmere',
      Tailoring: 'Unstructured double-face artisan hand-stitch',
      Closure: 'Concealed natural horn buttons',
      Weight: 'Heavy insulating 550gsm dry insulation'
    },
    features: [
      'Double-face thermal barrier structure',
      'Concealed invisible slit pockets carved into side seam lines',
      'Slightly dropped shoulders to allow effortless layering'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-4', username: 'Helena Lind', rating: 5, comment: 'An Absolute masterpiece. It is so soft and light but feels incredibly warm in chilly weather.', date: '2026-05-18', helpfulCount: 27 }
    ]
  },
  {
    id: 'ds-004',
    name: 'Helix Smart Dumbbells (Pair)',
    price: 185.00,
    originalPrice: 240.00,
    description: 'An entire heavy rack compressed into a beautiful, sculptural pair of solid iron dumbbells. Patented rotary locking system updates weight levels instantly.',
    images: [
      'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Gym Wear',
    subcategory: 'Gym Equipment',
    rating: 4.7,
    reviewCount: 56,
    colors: ['Steel Grey', 'Matte Black'],
    sizes: ['5lb to 50lb adjustable'],
    stock: 19,
    brand: 'Apex Gym Co',
    isFeatured: true,
    isNew: false,
    discountPercent: 21,
    productStory: 'Home fitness equipment is traditionally ugly. We built Helix to live proudly in your minimalist living room. Combining a solid brass weight locking core inside sand-casted high-carbon steel plates, Helix lets you dial from 5 to 50 lbs with a satisfying, high-precision click of the solid-milled handle.',
    specs: {
      Material: 'Sand-cast high-carbon steel with matte oxide protective coat',
      Grip: 'Diamond-knurled non-slip aluminum alloy',
      WeightRange: '5 lbs to 50 lbs in 5 lb high-precision steps',
      Base: 'High-density natural cork resting dock'
    },
    features: [
      'Instant lock turn-knob system with digital visual indicator window',
      'Compact geometric footprint eliminates the need for large commercial iron racks',
      'Dampened impact polymer padding to reduce rattle and noise drops'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-5', username: 'Marcus Thorne', rating: 5, comment: 'The mechanical dial works flawlessly. No loose plates or wobble. Saved so much space in my loft.', date: '2026-07-01', helpfulCount: 12 }
    ]
  },
  {
    id: 'ds-005',
    name: 'Brutalist Terracotta Pedestal Vase',
    price: 45.00,
    description: 'An architectural vase thrown by hand in Puglia. Features a raw, sand-blasted terracotta exterior contrasted by a glassy glazed waterproof interior.',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Home Decor',
    subcategory: 'Lifestyle Products',
    rating: 4.6,
    reviewCount: 19,
    colors: ['Earthy Clay', 'Pumice Grey', 'Burnt Ochre'],
    sizes: ['Standard Medium (12" Height)'],
    stock: 22,
    brand: 'Clay & Flame',
    isFeatured: false,
    isNew: true,
    productStory: 'Fired in ancient multi-generational family wood kilns, our pedestal vase represents the raw elegance of Puglia earth. No two pieces are identical: natural iron deposits in the clay rise to the surface in the firing cycle, forming beautiful, chaotic speckled dark spots across the raw mineral skin.',
    specs: {
      Material: '100% Organic Puglia Terracotta clay',
      Firing: 'Wood-fired kiln cycled up to 1100°C',
      Texture: 'Rough sand-cast mineral slip outer, glossy interior',
      Dimensions: '12" H x 6" Base Diameter, Weight: 4.2 lbs'
    },
    features: [
      'Hand-stamped artist marker initials on the under-pedestal',
      'Fully glazed watertight inner chamber holds fresh stems safely',
      'Comes packaged inside a brutalist solid linen container box'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-6', username: 'Sofia Ross', rating: 4, comment: 'Stunning organic silhouette. Texture is rough and sandy, exactly as described. Truly feels handcrafted.', date: '2026-06-15', helpfulCount: 8 }
    ]
  },
  {
    id: 'ds-006',
    name: 'Soma Squalane Glow Nectar',
    price: 29.00,
    description: 'A revolutionary bio-fermented facial nectar that boosts deep skin elasticity and hydration. Visibly restores youth glow with single drop.',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Beauty',
    subcategory: 'Lifestyle Products',
    rating: 4.8,
    reviewCount: 94,
    colors: ['Original Formula'],
    sizes: ['50ml', '100ml Value Size'],
    stock: 45,
    brand: 'Soma Skincare',
    isFeatured: false,
    isNew: false,
    isAISuggestion: true,
    productStory: 'Ditch the standard 10-step hydration routines. Our bio-fermented Squalane Nectar mimics your skin’s natural lipid barrier, sinking in instantly to lock in moisture and lock out environmental stressors. Infused with organic rosehip seed oil and wild seaweed botanical extracts.',
    specs: {
      Volume: '50ml Recyclable Violet Glass Dropper Bottle',
      SkinType: 'Optimized for all skins: dry, combination, sensitive, oily',
      Phthalates: 'Zero synthetic perfumes, zero sulfates, zero animal testing'
    },
    features: [
      'Cold-pressed sugarcane squalane harvested through sustainable farming',
      'Ultra-stable shelf life without chemical preservatives',
      'Comes housed in an light-blocking violet glass bottle to protect potency'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-7', username: 'Isla Bennett', rating: 5, comment: 'Unbelievable hydration. My skin feels plumper and incredibly soft. A little goes a very long way!', date: '2026-07-10', helpfulCount: 15 }
    ]
  },
  {
    id: 'ds-007',
    name: 'Cybernetic Mech (Limited Run)',
    price: 125.00,
    originalPrice: 165.50,
    description: 'A premium, modular display collectible inspired by future cyberpunk streetscapes. Features 42 hand-finished magnetic articulation segments.',
    images: [
      'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Collectibles',
    subcategory: 'Toys',
    rating: 4.9,
    reviewCount: 15,
    colors: ['Neon Chrome', 'Tactical Stealth Black'],
    sizes: ['1:12 Scale Collectible (10" height)'],
    stock: 3,
    brand: 'Neo-Tokyo',
    isFeatured: true,
    isNew: true,
    discountPercent: 23,
    productStory: 'A holy grail item for sci-fi enthusiasts and display curators. Designed by visual futurist Taketo Moro, each Cybernetic Mech is serialized from 1 to 500. Formed using heavy industrial zinc alloy blocks alongside high-density magnetic socket spheres for endless premium articulation styling.',
    specs: {
      Material: 'Die-cast zinc alloy, magnetic lock nodes, impact resin plates',
      Scale: '1:12 Scale (10 inches overall standing tall)',
      Articulation: '42 separate magnetic segments with heavy resistance',
      EditionSize: 'Limited 500 units globally (Serialized certificate enclosed)'
    },
    features: [
      'Removable sand-blasted outer armor plates to show micro mechanical copper chassis skeleton',
      'Integrated soft-glow micro LED thruster ports inside calves and core',
      'Solid carbon fiber industrial weighted display stand included'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-8', username: 'Dax Kaelen', rating: 5, comment: 'Mindblown by the weight and magnetic snap quality. The hidden copper skeleton is beautifully detailed.', date: '2026-07-14', helpfulCount: 3 }
    ]
  },
  {
    id: 'ds-008',
    name: 'The Architecture of Tomorrow',
    price: 30.00,
    description: 'An elite linen-bound coffee table monograph investigating brutalist structures and carbon-negative modular homes.',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1000'
    ],
    category: 'Books',
    subcategory: 'Stationery',
    rating: 4.7,
    reviewCount: 28,
    colors: ['Linen Grey Cover', 'Monolith Black Cover'],
    sizes: ['Standard Hardcover (320 Pages)'],
    stock: 15,
    brand: 'Format Press',
    isFeatured: false,
    isNew: false,
    productStory: 'A visual archive detailing 45 revolutionary architectural projects from 12 countries. Featuring heavy 180gsm matte art paper, crisp high-definition dual-tone black and white full-page plates, and long essays by leading architectural minds on living post-2030.',
    specs: {
      Format: 'Hardbound linen wrap with custom silver embossed foil',
      Pages: '320 pages of heavyweight acid-free archival matte paper',
      Dimensions: '10" x 13" x 1.5" - Weight: 5.6 lbs'
    },
    features: [
      'Stitched lay-flat binding allows pages to lay perfectly open on tables',
      'Includes exclusive access codes to downloadable 3D CAD files of highlighted homes',
      'Printed locally with organic vegetable-based inks'
    ],
    estimatedDelivery: '2–5 business days (UK Standard Delivery)',
    reviews: [
      { id: 'rev-9', username: 'Ethan Wright', rating: 5, comment: 'The typography, layout, and heavy ink press are incredibly satisfying. Excellent inspiration for modern designers.', date: '2026-06-22', helpfulCount: 14 }
    ]
  }
];

// Curated Journal (Blog) Posts
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Brutalist Resurrection in Modern Living Accessories',
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
    title: 'Designing Beyond the Shopping Cart: The Interface of Tomorrow',
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

// Mock seller data for charts
export const SELLER_ANALYTICS = {
  monthlyRevenue: [
    { month: 'Jan', sales: 12000, organic: 8000, adReferrals: 4000 },
    { month: 'Feb', sales: 19000, organic: 13000, adReferrals: 6000 },
    { month: 'Mar', sales: 15000, organic: 10000, adReferrals: 5000 },
    { month: 'Apr', sales: 27000, organic: 21000, adReferrals: 6000 },
    { month: 'May', sales: 34000, organic: 26000, adReferrals: 8000 },
    { month: 'Jun', sales: 42000, organic: 33000, adReferrals: 9000 }
  ],
  categoryShare: [
    { name: 'Fashion & Wardrobe', percentage: 38 },
    { name: 'Home Living & Decor', percentage: 22 },
    { name: 'Electronics & Audio', percentage: 20 },
    { name: 'Performance Gym Wear', percentage: 12 },
    { name: 'Collectibles & Books', percentage: 8 }
  ],
  viewsStats: {
    totalViews: 98450,
    conversionRate: '4.2%',
    activeListings: 12,
    lowStockAlerts: 1
  }
};
