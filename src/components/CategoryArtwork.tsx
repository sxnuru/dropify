/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { getProductImage, isFallbackImage } from '../utils/image';

// ─── DreamShelf Emerald Design Tokens ────────────────────────────────────────
const EM        = 'rgba(16,185,129,1)';    // emerald-500 (doodle stroke)
const EM_GLOW   = 'rgba(16,185,129,0.28)'; // spotlight centre
const EM_GLOW2  = 'rgba(16,185,129,0.08)'; // spotlight mid ring
const BG_CARD   = '#0D1321';               // deep navy
const BG_INNER  = '#080C16';               // deepest centre

// ─── Per-category hero image paths ──────────────────────────────────────────
// Fixed studio photography — never changes based on Firestore.
type CatKey = 'fashion' | 'electronics' | 'sports' | 'home' | 'toys' | 'health' | 'food' | 'other';

const HERO_IMG: Record<CatKey, string> = {
  fashion:     '/cat_fashion.png',
  electronics: '/cat_electronics.png',
  sports:      '/cat_sports.png',
  home:        '/cat_home.png',
  toys:        '/cat_toys.png',
  health:      '/cat_health.png',
  food:        '/cat_food.png',
  other:       '/cat_other.png',
};

// ─── Per-category SVG doodle patterns ────────────────────────────────────────
// Rendered at 10% opacity in DreamShelf emerald — pure texture.
// viewBox="0 0 300 300"

const DOODLES: Record<CatKey, React.ReactNode> = {
  fashion: (
    <>
      {/* Coat hanger */}
      <path d="M150 55 Q150 38,163 38 Q175 38,175 50 Q175 60,150 73 Q125 60,125 50 Q125 38,137 38 Q150 38,150 55Z" stroke={EM} strokeWidth="1.1" fill="none"/>
      <line x1="150" y1="73" x2="90"  y2="132" stroke={EM} strokeWidth="1.1"/>
      <line x1="150" y1="73" x2="210" y2="132" stroke={EM} strokeWidth="1.1"/>
      <line x1="90"  y1="132" x2="210" y2="132" stroke={EM} strokeWidth="1"/>
      {/* Shopping bag */}
      <rect x="208" y="180" width="56" height="66" rx="4" stroke={EM} strokeWidth="0.9" fill="none"/>
      <path d="M218 180 C218 165,232 158,236 158 C240 158,254 165,254 180" stroke={EM} strokeWidth="0.9" fill="none"/>
      {/* Sparkles */}
      <line x1="42"  y1="42"  x2="42"  y2="58"  stroke={EM} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="34"  y1="50"  x2="50"  y2="50"  stroke={EM} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="36"  y1="44"  x2="48"  y2="56"  stroke={EM} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="48"  y1="44"  x2="36"  y2="56"  stroke={EM} strokeWidth="0.7" strokeLinecap="round"/>
      {/* Stitch line */}
      <line x1="22"  y1="200" x2="100" y2="200" stroke={EM} strokeWidth="0.7" strokeDasharray="6 4"/>
      <line x1="22"  y1="215" x2="100" y2="215" stroke={EM} strokeWidth="0.5" strokeDasharray="4 6"/>
      {/* Needle */}
      <line x1="248" y1="60"  x2="260" y2="110" stroke={EM} strokeWidth="0.9" strokeLinecap="round"/>
      <circle cx="248" cy="60" r="3" stroke={EM} strokeWidth="0.8" fill="none"/>
    </>
  ),
  electronics: (
    <>
      {/* Circuit trace */}
      <path d="M35 80 L90 80 L90 118 L130 118 L130 155 L192 155 L192 195 L255 195" stroke={EM} strokeWidth="0.95" fill="none"/>
      <circle cx="90"  cy="80"  r="4.5" stroke={EM} strokeWidth="0.85" fill="none"/>
      <circle cx="130" cy="118" r="4.5" stroke={EM} strokeWidth="0.85" fill="none"/>
      <circle cx="192" cy="155" r="4.5" stroke={EM} strokeWidth="0.85" fill="none"/>
      {/* Waveform */}
      <path d="M22 228 L50 228 L60 206 L76 248 L92 214 L108 234 L124 228 L278 228" stroke={EM} strokeWidth="0.9" fill="none"/>
      {/* Lightning bolt */}
      <path d="M252 42 L240 74 L255 74 L243 106" stroke={EM} strokeWidth="1" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Headphone outline */}
      <path d="M38 130 C38 95,68 72,90 72" stroke={EM} strokeWidth="0.85" fill="none"/>
      <rect x="28"  y="130" width="18" height="26" rx="5" stroke={EM} strokeWidth="0.85" fill="none"/>
      {/* USB cable */}
      <line x1="165" y1="248" x2="245" y2="248" stroke={EM} strokeWidth="0.9"/>
      <rect x="155" y="241" width="12" height="14" rx="2" stroke={EM} strokeWidth="0.8" fill="none"/>
    </>
  ),
  sports: (
    <>
      {/* Speed lines */}
      <line x1="22" y1="65"  x2="175" y2="47"  stroke={EM} strokeWidth="1.1" strokeDasharray="18 8"/>
      <line x1="22" y1="230" x2="175" y2="250" stroke={EM} strokeWidth="1.1" strokeDasharray="18 8"/>
      {/* Chevrons */}
      <path d="M220 108 L252 150 L220 192" stroke={EM} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M240 118 L270 150 L240 182" stroke={EM} strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      {/* Mountain */}
      <path d="M35 252 L68 185 L100 218 L132 150 L168 252" stroke={EM} strokeWidth="0.9" fill="none" strokeLinejoin="round"/>
      {/* Dumbbell */}
      <line x1="38" y1="82"  x2="80"  y2="82"  stroke={EM} strokeWidth="1.1"/>
      <rect x="30"  y="74"  width="10" height="16" rx="2" stroke={EM} strokeWidth="0.85" fill="none"/>
      <rect x="80"  y="74"  width="10" height="16" rx="2" stroke={EM} strokeWidth="0.85" fill="none"/>
      {/* Water bottle */}
      <rect x="228" y="200" width="28" height="56" rx="8" stroke={EM} strokeWidth="0.9" fill="none"/>
      <rect x="231" y="192" width="22" height="12" rx="4" stroke={EM} strokeWidth="0.8" fill="none"/>
    </>
  ),
  home: (
    <>
      {/* Floor plan */}
      <rect x="56" y="55"  width="185" height="127" stroke={EM} strokeWidth="1.05" fill="none" rx="4"/>
      <line x1="56"  y1="120" x2="138" y2="120" stroke={EM} strokeWidth="0.95"/>
      <line x1="180" y1="55"  x2="180" y2="182" stroke={EM} strokeWidth="0.95"/>
      <path d="M138 120 Q162 120,162 144" stroke={EM} strokeWidth="0.85" fill="none"/>
      {/* Plant */}
      <path d="M222 218 Q240 196,258 218 Q240 238,222 218Z" stroke={EM} strokeWidth="0.85" fill="none"/>
      <path d="M240 196 Q256 182,265 196" stroke={EM} strokeWidth="0.75" fill="none"/>
      <line x1="240" y1="208" x2="240" y2="258" stroke={EM} strokeWidth="0.85"/>
      {/* Picture frame */}
      <rect x="28" y="188" width="44" height="36" rx="2" stroke={EM} strokeWidth="0.85" fill="none"/>
      <rect x="35" y="195" width="30" height="22" rx="1" stroke={EM} strokeWidth="0.6"  fill="none"/>
      {/* Chair suggestion */}
      <line x1="45"  y1="80"  x2="45"  y2="130" stroke={EM} strokeWidth="0.85"/>
      <line x1="70"  y1="80"  x2="70"  y2="130" stroke={EM} strokeWidth="0.85"/>
      <line x1="38"  y1="105" x2="78"  y2="105" stroke={EM} strokeWidth="0.85"/>
      <path d="M38 80 L78 80 L78 90 L38 90 Z" stroke={EM} strokeWidth="0.85" fill="none"/>
    </>
  ),
  toys: (
    <>
      {/* Star burst */}
      <path d="M150 40 L156 90 L205 70 L166 106 L213 120 L164 126 L172 178 L150 140 L128 178 L136 126 L87 120 L134 106 L95 70 L144 90 Z" stroke={EM} strokeWidth="0.95" fill="none"/>
      {/* Dice */}
      <rect x="32" y="218" width="46" height="46" rx="7" stroke={EM} strokeWidth="0.9" fill="none"/>
      <circle cx="45"  cy="232" r="3.5" fill={EM} opacity="0.8"/>
      <circle cx="67"  cy="250" r="3.5" fill={EM} opacity="0.8"/>
      <circle cx="45"  cy="250" r="3.5" fill={EM} opacity="0.8"/>
      {/* Controller outline */}
      <path d="M192 198 L192 236 Q192 250,208 250 L262 250 Q278 250,278 236 L278 198 Q278 184,262 184 L208 184 Q192 184,192 198Z" stroke={EM} strokeWidth="0.9" fill="none"/>
      <circle cx="258" cy="206" r="5"  stroke={EM} strokeWidth="0.7" fill="none"/>
      <circle cx="268" cy="218" r="5"  stroke={EM} strokeWidth="0.7" fill="none"/>
      {/* Cube */}
      <path d="M38 80 L68 64 L98 80 L98 118 L68 134 L38 118 Z" stroke={EM} strokeWidth="0.85" fill="none"/>
      <line x1="68" y1="64" x2="68" y2="134" stroke={EM} strokeWidth="0.7"/>
      <line x1="38" y1="80" x2="98" y2="80" stroke={EM} strokeWidth="0.7"/>
    </>
  ),
  health: (
    <>
      {/* ECG line */}
      <path d="M22 150 L68 150 L84 120 L100 182 L116 130 L132 166 L148 150 L278 150" stroke={EM} strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      {/* Plus cross */}
      <line x1="248" y1="54"  x2="248" y2="96"  stroke={EM} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="227" y1="75"  x2="269" y2="75"  stroke={EM} strokeWidth="1.4" strokeLinecap="round"/>
      {/* Lotus */}
      <path d="M198 240 Q208 218,218 240 Q208 258,198 240Z" stroke={EM} strokeWidth="0.85" fill="none"/>
      <path d="M218 240 Q228 218,238 240 Q228 258,218 240Z" stroke={EM} strokeWidth="0.85" fill="none"/>
      <path d="M238 240 Q248 218,258 240 Q248 258,238 240Z" stroke={EM} strokeWidth="0.85" fill="none"/>
      {/* Leaf */}
      <path d="M38 72 Q55 50,72 72 Q55 90,38 72Z" stroke={EM} strokeWidth="0.9" fill="none"/>
      <line x1="55" y1="62" x2="55" y2="98" stroke={EM} strokeWidth="0.85"/>
      {/* Droplets */}
      <path d="M48 135 Q48 120,56 115 Q64 120,64 135 Q64 145,56 148 Q48 145,48 135Z" stroke={EM} strokeWidth="0.8" fill="none"/>
      <path d="M68 155 Q68 143,74 139 Q80 143,80 155 Q80 162,74 165 Q68 162,68 155Z" stroke={EM} strokeWidth="0.7" fill="none"/>
    </>
  ),
  food: (
    <>
      {/* Steam curves */}
      <path d="M128 145 Q124 125,128 105 Q132 85,128 65"  stroke={EM} strokeWidth="1.05" fill="none" strokeLinecap="round"/>
      <path d="M150 148 Q146 124,150 100 Q154 76,150 52"  stroke={EM} strokeWidth="1.05" fill="none" strokeLinecap="round"/>
      <path d="M172 145 Q176 125,172 105 Q168 85,172 65"  stroke={EM} strokeWidth="1.05" fill="none" strokeLinecap="round"/>
      {/* Cup */}
      <path d="M105 148 L110 196 Q150 208,190 196 L195 148 Z" stroke={EM} strokeWidth="0.95" fill="none"/>
      <line x1="105" y1="162" x2="195" y2="162" stroke={EM} strokeWidth="0.7"/>
      {/* Coffee bean */}
      <ellipse cx="55"  cy="238" rx="16" ry="22" stroke={EM} strokeWidth="0.9" fill="none"/>
      <path d="M55 216 Q55 238,55 260" stroke={EM} strokeWidth="0.7" strokeLinecap="round"/>
      {/* Tea leaves */}
      <path d="M215 78 Q232 56,248 78 Q232 96,215 78Z" stroke={EM} strokeWidth="0.85" fill="none"/>
      <path d="M235 58 Q250 40,265 58 Q250 73,235 58Z" stroke={EM} strokeWidth="0.75" fill="none"/>
      <line x1="232" y1="68" x2="232" y2="110" stroke={EM} strokeWidth="0.8"/>
      {/* Fork */}
      <line x1="255" y1="160" x2="255" y2="228" stroke={EM} strokeWidth="0.9"/>
      <line x1="248" y1="160" x2="248" y2="182" stroke={EM} strokeWidth="0.8"/>
      <line x1="262" y1="160" x2="262" y2="182" stroke={EM} strokeWidth="0.8"/>
      <path d="M248 182 Q255 188,262 182" stroke={EM} strokeWidth="0.8" fill="none"/>
    </>
  ),
  other: (
    <>
      {/* Ribbon cross diagonals */}
      <line x1="70"  y1="70"  x2="230" y2="230" stroke={EM} strokeWidth="1.05" strokeDasharray="8 5"/>
      <line x1="230" y1="70"  x2="70"  y2="230" stroke={EM} strokeWidth="1.05" strokeDasharray="8 5"/>
      {/* Sparkle top-right */}
      <line x1="252" y1="40"  x2="252" y2="58"  stroke={EM} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="243" y1="49"  x2="261" y2="49"  stroke={EM} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="246" y1="43"  x2="258" y2="55"  stroke={EM} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="258" y1="43"  x2="246" y2="55"  stroke={EM} strokeWidth="0.7" strokeLinecap="round"/>
      {/* Sparkle bottom-left */}
      <line x1="48"  y1="242" x2="48"  y2="258" stroke={EM} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="40"  y1="250" x2="56"  y2="250" stroke={EM} strokeWidth="1.1" strokeLinecap="round"/>
      {/* Parcel box */}
      <rect x="218" y="196" width="58" height="50" rx="4" stroke={EM} strokeWidth="0.9" fill="none"/>
      <line x1="247" y1="196" x2="247" y2="246" stroke={EM} strokeWidth="0.7"/>
      <line x1="218" y1="218" x2="276" y2="218" stroke={EM} strokeWidth="0.7"/>
      {/* Question mark */}
      <path d="M37 115 Q37 97,52 97 Q67 97,67 110 Q67 120,52 124 L52 130" stroke={EM} strokeWidth="1.05" fill="none" strokeLinecap="round"/>
      <circle cx="52" cy="138" r="3" fill={EM} opacity="0.8"/>
    </>
  ),
};

// ─── Category key resolver ────────────────────────────────────────────────────
function getCatKey(category?: string): CatKey {
  const c = (category || '').toLowerCase();
  if (c.includes('fashion') || c.includes('apparel') || c.includes('cloth')) return 'fashion';
  if (c.includes('electr') || c.includes('tech') || c.includes('audio'))    return 'electronics';
  if (c.includes('sport') || c.includes('outdoor') || c.includes('fit'))    return 'sports';
  if (c.includes('home') || c.includes('garden') || c.includes('furniture')) return 'home';
  if (c.includes('toy') || c.includes('game') || c.includes('play'))         return 'toys';
  if (c.includes('health') || c.includes('care') || c.includes('wellness'))  return 'health';
  if (c.includes('food') || c.includes('grocer') || c.includes('pantry'))    return 'food';
  return 'other';
}

// ─── CategoryBackground (legacy / hero section) ──────────────────────────────
export interface CategoryBackgroundProps {
  category?: string;
  className?: string;
  children?: React.ReactNode;
}

export const CategoryBackground: React.FC<CategoryBackgroundProps> = ({
  category,
  className = '',
  children,
}) => {
  const key = getCatKey(category);
  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none flex items-center justify-center ${className}`}
      style={{ background: `radial-gradient(ellipse at 50% 38%, ${BG_INNER} 0%, ${BG_CARD} 100%)` }}
    >
      {/* Emerald spotlight */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: `radial-gradient(ellipse 62% 58% at 50% 40%, ${EM_GLOW} 0%, ${EM_GLOW2} 45%, transparent 72%)`,
      }}/>
      {/* Doodles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-[0.1]" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {DOODLES[key]}
      </svg>
      {children}
    </div>
  );
};

// ─── CategoryShowcaseCard (the premium bento card) ────────────────────────────
export interface CategoryShowcaseCardProps {
  category: string;
}

export const CategoryShowcaseCard: React.FC<CategoryShowcaseCardProps> = ({ category }) => {
  const key = getCatKey(category);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: '#070B14' }}
    >
      {/* ── Hero product photograph ───────────────────────────────── */}
      {!imgErr && (
        <img
          src={HERO_IMG[key]}
          alt={category}
          loading="lazy"
          decoding="async"
          onError={() => setImgErr(true)}
          className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-all duration-[420ms] ease-out group-hover:brightness-[1.08] group-hover:scale-[1.03]"
        />
      )}

      {/* ── Multi-layer dark vignette — makes image emerge from card ── */}
      {/* Radial centre-bright / edge-dark mask */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 72% 72% at 50% 46%, transparent 30%, rgba(7,11,20,0.55) 65%, rgba(7,11,20,0.92) 88%, #070B14 100%)',
      }}/>
      {/* Bottom fade — critical for text legibility + blend */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'linear-gradient(to top, #040810 0%, rgba(4,8,16,0.7) 28%, transparent 55%)',
      }}/>
      {/* Top edge fade */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(7,11,20,0.65) 0%, transparent 22%)',
      }}/>
      {/* Side fades */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'linear-gradient(to right, rgba(7,11,20,0.45) 0%, transparent 18%, transparent 82%, rgba(7,11,20,0.45) 100%)',
      }}/>

      {/* ── Emerald spotlight glow (behind the photo layers) ──────── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-60 transition-opacity duration-[420ms] group-hover:opacity-90"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(16,185,129,0.20) 0%, rgba(16,185,129,0.05) 50%, transparent 72%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Background doodles ────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-[0.07] group-hover:opacity-[0.11] transition-opacity duration-[420ms]"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {DOODLES[key]}
      </svg>
    </div>
  );
};

// ─── ProductCardImage (kept for ProductCard.tsx) ──────────────────────────────
export interface ProductCardImageProps {
  product: Product;
  className?: string;
  imageClassName?: string;
}

export const ProductCardImage: React.FC<ProductCardImageProps> = ({
  product,
  className = '',
  imageClassName = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const image = getProductImage(product);
  const showPlaceholder = hasError || isFallbackImage(image);

  if (showPlaceholder) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-500 gap-2 border border-slate-300 rounded-2xl ${className}`}>
        <span className="text-[10px] font-sans font-bold text-slate-500 tracking-wider uppercase select-none">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={product.name}
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-cover object-center relative transition-transform duration-[400ms] ease-out group-hover:scale-105 ${imageClassName}`}
      onError={() => setHasError(true)}
    />
  );
};

// ─── CategoryArtwork (backwards-compatible shim) ──────────────────────────────
export interface CategoryArtworkProps {
  category?: string;
  className?: string;
  imageClassName?: string;
  altText?: string;
  showAccents?: boolean;
}

export const CategoryArtwork: React.FC<CategoryArtworkProps> = ({ category }) => (
  <CategoryShowcaseCard category={category || 'other'} />
);

export default CategoryArtwork;
