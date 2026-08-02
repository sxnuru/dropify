/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BrandsPage.tsx
 * A premium, minimalist artisan brand directory for DreamShelf.
 */

import React, { useMemo } from 'react';
import { Award, ShieldCheck, CornerDownRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface BrandsPageProps {
  onNavigateToShopWithBrand: (brand: string) => void;
  availableBrands: string[];
  onBackToHome?: () => void;
  productsList: Product[];
}

export default function BrandsPage({ onNavigateToShopWithBrand, availableBrands, onBackToHome, productsList }: BrandsPageProps) {
  const brandDetails = useMemo(() => {
    return availableBrands.map((brandName) => {
      // Find a sample product in productsList
      const sample = productsList.find((p) => p.brand.toLowerCase() === brandName.toLowerCase());
      
      // Known brands content fallbacks
      const knownBrands: Record<string, { origin: string; philosophy: string; focus: string }> = {
        'Aether Studio': {
          origin: 'Copenhagen, Denmark',
          philosophy: 'Modular wardrobe architecture built on computerised looms with zero structural waist.',
          focus: 'Premium Apparel & Wardrobes'
        },
        'Soma Audio': {
          origin: 'Kyoto, Japan',
          philosophy: 'Pristine soundscapes encased in sand-blasted titanium and bio-cellulose acoustic chambers.',
          focus: 'High-Fidelity Acoustics'
        },
        'NORD': {
          origin: 'Oslo, Norway',
          philosophy: 'Artisan double-faced cashmere sewn by hand over 14 hours per piece to defy temporal trends.',
          focus: 'High-End Outerwear'
        },
        'Atmos Gym': {
          origin: 'Portland, USA',
          philosophy: 'Zero-gravity athletic meshes engineered from ocean-recovered carbon fiber fabrics.',
          focus: 'Technical Activewear'
        },
        'Terracotta Lab': {
          origin: 'Siena, Italy',
          philosophy: 'Brutalist clay ceramics fired in traditional wood kilns with volcanic mineral glazes.',
          focus: 'Spatial Design & Objects'
        },
        'Obsidian Care': {
          origin: 'Seoul, South Korea',
          philosophy: 'Cold-pressed bioactive seed oils and marine extracts tailored to skin thermal indices.',
          focus: 'Organic Thermal Skincare'
        },
        'Chronos Scribe': {
          origin: 'Geneva, Switzerland',
          philosophy: 'Heavy brass writing instruments crafted on high-precision micro-mechanic watchmaking lathes.',
          focus: 'High-Precision Stationery'
        },
        'Solstice Glass': {
          origin: 'Murano, Italy',
          philosophy: 'Hand-blown structural silicate vessels capture natural solar light spectrum offsets.',
          focus: 'Silicate Living Objects'
        }
      };

      const match = knownBrands[brandName] || {
        origin: 'Artisan Workshop',
        philosophy: `Curated ${sample?.category || 'lifestyle'} pieces crafted with precision and dedication.`,
        focus: sample ? `${sample.category} & ${sample.subcategory}` : 'General Catalog'
      };

      const initials = brandName.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || 'BS';

      return {
        name: brandName,
        origin: match.origin,
        philosophy: match.philosophy,
        established: '2026',
        focus: match.focus,
        initials
      };
    });
  }, [availableBrands, productsList]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Navigation */}
      <button 
        onClick={onBackToHome}
        className="group flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-slate-950 font-bold uppercase tracking-wider transition-all cursor-pointer"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
        <span>Back to Home</span>
      </button>

      {/* Editorial Header */}
      <div className="border-b border-slate-100 pb-6">
        <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest block">PARTNERSHIPS</span>
        <h1 className="font-sans text-3xl md:text-5xl font-extrabold text-slate-950 tracking-tight mt-1">
          Artisan Creator Directory
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-sans mt-2 max-w-2xl leading-relaxed">
          We collaborate exclusively with avant-garde studios, watchmakers, and sustainable mills that share our dedication to design purity, durable quality, and environmental accountability.
        </p>
      </div>

      {/* Featured Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-blue-300 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> 100% Guaranteed Authenticity
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Direct Atelier Sourcing</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Every creation displayed on DreamShelf is shipped directly from the brand’s original workshop. There are no intermediary distribution warehouses or reseller markups—enabling perfect quality control and certified carbon-neutral waybills.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-400" /> Inspected Quality</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-400" /> Digital Tokens</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-blue-400" /> Direct-to-Client Courier</span>
          </div>
        </div>
      </div>
      {/* Brand Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandDetails.map((b) => {
          return (
            <div 
              id={`brand-card-${b.name.toLowerCase().replace(/\s+/g, '-')}`}
              key={b.name} 
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between hover:border-slate-200/50 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-base font-sans font-bold tracking-tight shadow-sm">
                      {b.initials}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-slate-900 text-base">{b.name}</h3>
                      <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">{b.origin}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full">EST. {b.established}</span>
                </div>
                
                <p className="text-slate-500 text-xs leading-relaxed font-sans min-h-10">
                  {b.philosophy}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-50">
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-500" />
                  <span className="uppercase font-bold text-slate-500">FOCUS:</span>
                  <span className="text-slate-600 font-semibold">{b.focus}</span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onNavigateToShopWithBrand(b.name)}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-sans font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-slate-100 cursor-pointer"
                >
                  EXPLORE THE COLLECTION <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
