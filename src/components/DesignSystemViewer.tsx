/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DESIGN_TOKENS, SITEMAP, USER_FLOWS } from '../data';
import { 
  Compass, Cpu, Layers, Minimize2, Check, RefreshCw, AlertCircle, 
  Layers3, Eye, FileCode, CheckCircle2, ShoppingBag, CreditCard
} from 'lucide-react';

export default function DesignSystemViewer() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'sitemap' | 'flows' | 'wireframes' | 'playground' | 'handoff'>('tokens');
  const [successToast, setSuccessToast] = useState(false);
  const [selectedWireframe, setSelectedWireframe] = useState<'home' | 'product' | 'checkout'>('home');

  const triggerToast = () => {
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div id="design-system-root" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Design System Header */}
      <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-lime-800/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-300 tracking-wider uppercase mb-4">
              <Compass className="w-3.5 h-3.5 animate-spin" /> Brand Identity & Specs
            </div>
            <h1 className="font-sans text-3xl md:text-5xl font-bold tracking-tight mb-2">
              DreamShelf Design System
            </h1>
            <p className="text-slate-400 font-sans max-w-xl text-sm md:text-base">
              Explore the core architectural design tokens, interactive components, user journeys, wireframe blueprints, and developer handoff guidelines.
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 font-mono text-xs text-slate-300 backdrop-blur-md self-start md:self-auto">
            <div>PROJECT: DreamShelf Marketplace</div>
            <div>SPEC VER: 4.12.0 (Stable)</div>
            <div>GRID SYSTEM: 12-Column Responsive</div>
            <div>THEME: Luxury Minimalist Organic</div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mt-8 md:mt-12 border-t border-slate-800 pt-6">
          {(['tokens', 'sitemap', 'flows', 'wireframes', 'playground', 'handoff'] as const).map((tab) => (
            <button
              id={`ds-tab-${tab}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-medium tracking-wide transition-all uppercase ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/20'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent hover:border-slate-700'
              }`}
            >
              {tab === 'tokens' && 'Design Tokens'}
              {tab === 'sitemap' && 'Information Architecture'}
              {tab === 'flows' && 'User Flow Diagrams'}
              {tab === 'wireframes' && 'Wireframe Blueprints'}
              {tab === 'playground' && 'Interactive Playground'}
              {tab === 'handoff' && 'Developer Handoff'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="p-6 md:p-12 bg-slate-50/50">
        
        {/* TAB 1: DESIGN TOKENS */}
        {activeTab === 'tokens' && (
          <div className="space-y-12">
            <div>
              <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight mb-2">Color Palette Tokens</h2>
              <p className="text-slate-500 text-sm max-w-2xl mb-6">
                Our palette is carefully weighted to reflect luxury, clean organic tones, and energetic futuristic prompts. Everything rests on soft warm whites.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {DESIGN_TOKENS.colors.map((color, idx) => (
                  <div id={`token-color-${idx}`} key={idx} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between space-y-4">
                    <div 
                      className="w-full h-24 rounded-xl border border-slate-100 flex items-end justify-end p-2.5"
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md font-mono text-[10px] text-white font-medium tracking-wider">
                        {color.value}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-slate-900">{color.name}</h3>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              {/* Typography Specs */}
              <div>
                <h2 className="font-sans text-xl font-bold text-slate-900 tracking-tight mb-4">Typography Standards</h2>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                  <div>
                    <span className="font-mono text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Display Font Family</span>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-sans mt-1">Space Grotesk</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">Used for brand logo, top headers, massive titles, and luxury callouts. Styled with heavy weights and tight tracking.</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Body & Interface Font Family</span>
                    <h3 className="text-xl font-medium text-slate-900 font-sans mt-1">Inter</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">Highly legible, beautiful standard system sans-serif. Used for product descriptions, filters, and user dashboard layouts.</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Technical & Telemetry Family</span>
                    <h3 className="text-sm font-semibold text-emerald-800 font-mono mt-1">JetBrains Mono</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">Used for product specifications keys, shipping tracking numbers, variant counts, and price tags.</p>
                  </div>
                </div>
              </div>

              {/* Spacing & Layout Scales */}
              <div>
                <h2 className="font-sans text-xl font-bold text-slate-900 tracking-tight mb-4">Spacing Scale (4px Base Grid)</h2>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden">
                  <div className="space-y-4">
                    {DESIGN_TOKENS.spacing.map((s, idx) => (
                      <div id={`token-spacing-${idx}`} key={idx} className="flex items-center gap-4 text-xs">
                        <span className="font-mono w-12 font-bold text-slate-900 uppercase">{s.scale}</span>
                        <span className="font-mono text-emerald-600 w-28 bg-emerald-50 px-2 py-0.5 rounded text-center">{s.size}</span>
                        <span className="text-slate-500 font-sans leading-normal flex-1">{s.usage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo & Illustration Guidelines */}
            <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-lime-500/10 rounded-full blur-2xl" />
              <h3 className="font-sans font-bold text-lg text-white mb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-lime-400" /> Suggested Content Styling & Art Direction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm font-sans">
                <div>
                  <h4 className="font-semibold text-lime-300 font-mono text-xs uppercase tracking-wider mb-1">Product Photography Style</h4>
                  <p className="text-emerald-200/90 text-xs leading-relaxed">{DESIGN_TOKENS.photography.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lime-300 font-mono text-xs uppercase tracking-wider mb-1">Illustration Direction</h4>
                  <p className="text-emerald-200/90 text-xs leading-relaxed">{DESIGN_TOKENS.photography.illustrations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INFORMATION ARCHITECTURE SITEMAP */}
        {activeTab === 'sitemap' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight mb-2">Platform Sitemap & Information Architecture</h2>
              <p className="text-slate-500 text-sm max-w-2xl mb-6">
                Our user architecture separates transactional flows, brand editorials, creative shopping discovery, and personal creator analytics cleanly.
              </p>
            </div>

            {/* Sitemap Visual Tree */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SITEMAP.map((node, i) => (
                <div id={`sitemap-card-${i}`} key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                      node.category === 'core' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      node.category === 'account' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      node.category === 'seller' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-50 text-slate-700 border border-slate-100'
                    }`}>
                      {node.category}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">ROUTE: {node.path}</span>
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-slate-900 text-base">{node.name}</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{node.description}</p>
                  </div>
                  {node.children && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Sub-Nodes & Routes</span>
                      <div className="space-y-2">
                        {node.children.map((child, cIdx) => (
                          <div id={`sitemap-child-${i}-${cIdx}`} key={cIdx} className="bg-slate-50/80 hover:bg-emerald-50/40 p-2.5 rounded-lg border border-slate-100/50 transition-all">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-slate-800 font-sans">{child.name}</span>
                              <span className="font-mono text-[9px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">{child.path}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{child.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: USER FLOWS */}
        {activeTab === 'flows' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight mb-2">Integrated User Experience Flows</h2>
              <p className="text-slate-500 text-sm max-w-2xl mb-6">
                Trace a client’s digital footprints from initial ambient landing up to post-purchase self-service shipment monitoring and AI stylist routing.
              </p>
            </div>

            {/* Steps Timeline Grid */}
            <div className="space-y-4">
              {USER_FLOWS.map((flow, idx) => (
                <div id={`user-flow-${flow.id}`} key={idx} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                    <span className="w-12 h-12 rounded-full bg-slate-900 text-white font-mono text-sm font-bold flex items-center justify-center">
                      {flow.id}
                    </span>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 font-bold block">{flow.actor}</span>
                      <h3 className="font-sans font-bold text-slate-900 text-sm">{flow.title}</h3>
                    </div>
                  </div>
                  <div className="flex-1 md:border-l md:border-slate-100 md:pl-6 flex flex-col justify-between">
                    <p className="text-slate-500 text-xs leading-relaxed">{flow.description}</p>
                    {flow.nextStepIds.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 font-mono text-[10px]">
                        <span className="text-slate-400">NEXT SEQUENCES:</span>
                        {flow.nextStepIds.map((n) => (
                          <span key={n} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">{n}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WIREFRAME BLUEPRINTS */}
        {activeTab === 'wireframes' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight mb-1">Blueprint Wireframes</h2>
                <p className="text-slate-500 text-sm max-w-xl">
                  Low-fidelity spatial layouts demonstrating our deliberate bento box alignments, grid hierarchies, and breathing spacing ratios before high-fidelity skins are mapped.
                </p>
              </div>
              <div className="flex gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-xl">
                {(['home', 'product', 'checkout'] as const).map((frame) => (
                  <button
                    id={`wireframe-btn-${frame}`}
                    key={frame}
                    onClick={() => setSelectedWireframe(frame)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                      selectedWireframe === frame
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {frame === 'home' && 'Editorial Home'}
                    {frame === 'product' && 'Detailed Product'}
                    {frame === 'checkout' && 'Secure Checkout'}
                  </button>
                ))}
              </div>
            </div>

            {/* Wireframe Viewer Canvas */}
            <div className="bg-slate-100 border border-slate-200/60 rounded-3xl p-4 md:p-8 min-h-[500px] flex items-center justify-center font-mono">
              <div className="bg-white border-2 border-dashed border-slate-300 w-full max-w-4xl rounded-2xl p-6 md:p-8 space-y-8 text-slate-400 text-xs">
                
                {/* Visual Header */}
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                  <span className="font-bold text-slate-800 text-sm">[DREAMSHELF HEADER MODULE]</span>
                  <div className="flex gap-4">
                    <span>[Search Area]</span>
                    <span>[Cart (0)]</span>
                    <span>[Profile]</span>
                  </div>
                </div>

                {selectedWireframe === 'home' && (
                  <div className="space-y-6">
                    {/* Hero area */}
                    <div className="border-2 border-slate-200 rounded-xl p-8 bg-slate-50 text-center min-h-[160px] flex flex-col justify-center items-center">
                      <span className="font-bold text-slate-600 mb-1">[EDITORIAL HERO BANNER]</span>
                      <span className="text-[10px] text-slate-400">Large typography, organic asymmetrical layout, floating callouts</span>
                    </div>

                    {/* Bento section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border-2 border-slate-200 rounded-xl p-4 min-h-[120px] bg-slate-50 flex items-center justify-center">
                        <span>[BENTO GRID 1: Category Highlight]</span>
                      </div>
                      <div className="border-2 border-slate-200 rounded-xl p-4 min-h-[120px] bg-slate-50 flex items-center justify-center md:col-span-2">
                        <span>[BENTO GRID 2: Hot Flash Deal Timer]</span>
                      </div>
                    </div>

                    {/* Carousel area */}
                    <div className="border-2 border-slate-200 rounded-xl p-6 bg-slate-50 min-h-[140px] flex flex-col justify-between">
                      <span className="font-bold text-slate-600">[HORIZONTAL CAROUSEL SLIDER - AI RECOMMENDATIONS]</span>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="border border-slate-200 p-2 text-center bg-white text-[10px]">[ITEM 1]</div>
                        <div className="border border-slate-200 p-2 text-center bg-white text-[10px]">[ITEM 2]</div>
                        <div className="border border-slate-200 p-2 text-center bg-white text-[10px]">[ITEM 3]</div>
                        <div className="border border-slate-200 p-2 text-center bg-white text-[10px]">[ITEM 4]</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedWireframe === 'product' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                      <div className="border-2 border-slate-200 rounded-xl min-h-[250px] bg-slate-50 flex items-center justify-center">
                        <span>[LARGE IMAGE CONTAINER / 360 VIEWER]</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border border-slate-200 h-16 bg-slate-50 flex items-center justify-center text-[10px]">[THUMB 1]</div>
                        <div className="border border-slate-200 h-16 bg-slate-50 flex items-center justify-center text-[10px]">[THUMB 2]</div>
                        <div className="border border-slate-200 h-16 bg-slate-50 flex items-center justify-center text-[10px]">[THUMB 3]</div>
                      </div>
                    </div>

                    {/* Product Specs info */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-slate-600 block">[BRAND LABEL]</span>
                        <span className="font-bold text-slate-800 text-lg">[PRODUCT NAME TITLE]</span>
                        <span className="text-emerald-700 text-base font-bold block mt-1">[$PRICE.00]</span>
                      </div>
                      <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-2">
                        <span>[VARIANT SELECTORS]</span>
                        <div className="flex gap-2">
                          <span className="border border-slate-300 px-2 py-1 bg-white">[COLOR A]</span>
                          <span className="border border-slate-300 px-2 py-1 bg-white">[COLOR B]</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span>[ADD TO CART BUTTON CTA]</span>
                        <div className="h-10 bg-slate-800 rounded text-white flex items-center justify-center font-bold text-[10px]">
                          BUY NOW SECURE CHECKOUT
                        </div>
                      </div>
                      <div className="text-[10px] leading-relaxed border-t border-dashed border-slate-200 pt-3">
                        <span>[PRODUCT BIOGRAPHY STORY]</span>
                        <p className="mt-1">Narrative storytelling tracing material origins, ethical factories, and designer inspiration points.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedWireframe === 'checkout' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order progression */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                        <span className="font-bold text-slate-600 block mb-2">[MILESTONE PROGRESS INDICATOR]</span>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-emerald-500" />
                        </div>
                      </div>
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
                        <span className="font-bold text-slate-600">[SHIPPING ADDRESS SELECTION]</span>
                        <div className="border border-slate-200 p-2 bg-white rounded">[ADDRESS SELECT: ACTIVE DEFAULT]</div>
                      </div>
                      <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
                        <span className="font-bold text-slate-600">[STRIPE TOKEN SECURE CARD INPUT]</span>
                        <div className="h-10 border border-slate-200 bg-white rounded flex items-center px-3 text-[10px]">
                          Cardholder Name | Card Number | MM/YY | CVC
                        </div>
                      </div>
                    </div>

                    {/* Basket summary */}
                    <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-4">
                      <span className="font-bold text-slate-600 block">[SHOPPING BAG (2)]</span>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between"><span>Subtotal:</span><span>$534.00</span></div>
                        <div className="flex justify-between"><span>Promotion DREAM20:</span><span className="text-emerald-700">-$106.80</span></div>
                        <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold">
                          <span>Total to Pay:</span><span>$427.20</span>
                        </div>
                      </div>
                      <div className="h-10 bg-emerald-800 text-white font-bold rounded flex items-center justify-center text-[10px]">
                        PLACE SECURE ORDER ($427.20)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PLAYGROUND */}
        {activeTab === 'playground' && (
          <div className="space-y-12">
            <div>
              <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight mb-2">Interactive Component Library</h2>
              <p className="text-slate-500 text-sm max-w-2xl mb-6">
                Test our highly reactive UI components live. Press triggers to fire toasts, view animated buttons, examine modal dialogs, and review card hover lifting states.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Buttons and CTAs */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Buttons & Action Triggers
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-5 py-2.5 bg-slate-900 text-white font-sans text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-all shadow-md active:scale-95">
                    Luxury Dark CTA
                  </button>
                  <button className="px-5 py-2.5 bg-emerald-600 text-white font-sans text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                    Primary Emerald Action
                  </button>
                  <button className="px-5 py-2.5 bg-white text-slate-800 font-sans text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
                    Minimalist Outlined
                  </button>
                  <button className="px-5 py-2.5 bg-lime-400 text-slate-950 font-sans text-xs font-bold rounded-xl hover:bg-lime-500 transition-all shadow-sm active:scale-95">
                    Electric Accent CTA
                  </button>
                </div>
              </div>

              {/* Status Indicators & Toasts */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <AlertCircle className="w-4 h-4 text-emerald-600" /> Notifications & Toast Feedback
                </h3>
                <div className="space-y-4">
                  <button 
                    onClick={triggerToast}
                    className="w-full py-2.5 bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-50 hover:text-emerald-800 transition-all"
                  >
                    TRIGGER SYSTEM SUCCESS TOAST
                  </button>

                  {successToast && (
                    <div id="test-toast" className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg border border-slate-800 animate-bounce">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold block text-white font-sans">Payment Token Synced</span>
                        <span className="text-slate-400 font-mono text-[10px]">ID: tr_stripe_4812a</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skeletons & Loaders */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" /> Loading Skeletons & Placeholders
                </h3>
                <div className="space-y-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-32 bg-slate-100 rounded-xl w-full" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>

              {/* Badges, Dropdowns & Inputs */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Form Inputs & Badges
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Interactive Promo Code Input</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="ENTER COUPON CODE" 
                        defaultValue="DREAM20"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 uppercase"
                      />
                      <span className="absolute right-2.5 top-2.5 bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                        20% OFF
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 bg-lime-100 text-lime-800 text-[10px] font-mono font-bold rounded-full border border-lime-200 uppercase tracking-wide">
                      LIMITED FLASH DEAL
                    </span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-[10px] font-mono font-bold rounded-full border border-cyan-200 uppercase tracking-wide">
                      AI RECOMMENDED
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-[10px] font-mono font-bold rounded-full border border-red-200 uppercase tracking-wide">
                      LOW STOCK (2 LEFT)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: HANDOFF */}
        {activeTab === 'handoff' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight mb-2">Developer Handoff Guide</h2>
              <p className="text-slate-500 text-sm max-w-2xl mb-6">
                Direct variables and component layouts mapped cleanly. Directly copy variables to set up your styles.
              </p>
            </div>

            <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 md:p-8 font-mono text-xs overflow-x-auto space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4 text-white">
                <FileCode className="w-5 h-5 text-lime-400" />
                <span className="font-bold font-sans">CSS Theme Declarations (Tailwind @theme configuration)</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300">
{`@import "tailwindcss";

@theme {
  /* Premium Typography configuration */
  --font-sans: "Space Grotesk", "Inter", ui-sans-serif, system-ui;
  --font-mono: "JetBrains Mono", monospace;

  /* Curated Color tokens */
  --color-emerald-primary: #064E3B; /* Deep organic emerald */
  --color-teal-soft: #14B8A6;       /* Clean organic highlight */
  --color-lime-accent: #84CC16;     /* High-impact CTAs */
  --color-cyan-flash: #22D3EE;      /* Flash sales indicators */
  --color-neutral-warm: #F9FAFB;    /* Soft backdrop whites */
  --color-canvas-bg: #FCFCFC;       /* Main site background */
  --color-near-black: #0F172A;      /* Heavy typographic ink */

  /* Spacing Scale (4px increments) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 48px;
  --spacing-xxl: 80px;

  /* Soft Elegant Shadows */
  --shadow-premium-sm: 0 2px 8px -2px rgba(15, 23, 42, 0.04);
  --shadow-premium-md: 0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.02);
  --shadow-premium-lg: 0 20px 48px -8px rgba(15, 23, 42, 0.08), 0 4px 16px -4px rgba(15, 23, 42, 0.04);
}`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h4 className="font-sans font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" /> Desktop Viewport Target (1440px)
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Utilizes fluid containers with maximum constraints (`w-full max-w-7xl mx-auto px-6 md:px-12`). Alternate asymmetrical grids of 3 or 4 columns to create premium magazine-style layouts and negative breathing channels.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h4 className="font-sans font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                  <Layers3 className="w-4 h-4 text-emerald-600" /> Mobile Sizing Target (375px)
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Reduces multi-column asymmetric layouts dynamically down to single or two-column grids. Eliminates massive horizontal gaps while keeping text sizes highly readable and touch selectors at a minimum of 44px height.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
