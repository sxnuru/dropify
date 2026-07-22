/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, CartItem } from '../types';
import { PRODUCTS } from '../data';
import { 
  Truck, ArrowLeftRight, CheckCircle2, FileText, 
  ChevronRight, Calendar, Package, Printer, CreditCard
} from 'lucide-react';

interface OrderTrackingProps {
  onBackToShop: () => void;
  activeOrder?: Order; // Current order if just checked out
}

export default function OrderTracking({ onBackToShop, activeOrder }: OrderTrackingProps) {
  // Creating a default mock order if none was completed in the session
  const mockOrder: Order = {
    id: 'DS-4812a-2026',
    items: [
      {
        id: 'ds-001-Charcoal-M',
        product: PRODUCTS[0], // AeroWeave
        quantity: 1,
        selectedColor: 'Charcoal',
        selectedSize: 'M'
      },
      {
        id: 'ds-005-Earthy Clay-Standard',
        product: PRODUCTS[4], // Terracotta Vase
        quantity: 1,
        selectedColor: 'Earthy Clay',
        selectedSize: 'Standard'
      }
    ],
    subtotal: 280,
    discount: 56, // 20%
    tax: 17.92,
    shipping: 0,
    total: 241.92,
    status: 'out_for_delivery',
    trackingNumber: 'TR_DHL_982405812',
    estimatedDelivery: 'July 20 - July 22',
    shippingAddress: {
  fullName: 'Emily Johnson',
  street: '221 Baker Street',
  city: 'London',
  state: 'Greater London',
  zipCode: 'NW1 6XE',
  country: 'United Kingdom',
  phone: '+44 7700 900123'
},
    paymentMethod: 'Visa ending in 4242',
    date: '2026-07-15',
    events: [
      { title: 'Parcel Dispatched from Hub', description: 'Departed sorting facility in Seattle North Port.', time: '04:12 AM Today', done: true },
      { title: 'In Transit to Regional Carrier', description: 'Package routed through regional transit networks.', time: '10:30 PM Yesterday', done: true },
      { title: 'Awaiting Courier Sorting', description: 'Item accepted and cataloged at central sorting dock.', time: '02:15 PM Yesterday', done: true },
      { title: 'Order Confirmed & Printed', description: 'Payment authorized, invoice finalized, packaging completed.', time: '05:58 AM July 15', done: true }
    ]
  };

  const currentOrder = activeOrder || mockOrder;
  const [activeTab, setActiveTab] = useState<'tracker' | 'history' | 'returns'>('tracker');
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);
  
  // Return form state
  const [returnItem, setReturnItem] = useState('');
  const [returnReason, setReturnReason] = useState('Sizing mismatch');
  const [returnSuccess, setReturnSuccess] = useState(false);

  const triggerInvoiceDownload = () => {
    setInvoiceDownloaded(true);
    setTimeout(() => setInvoiceDownloaded(false), 3000);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnItem) return;
    setReturnSuccess(true);
  };

  return (
    <div id="order-tracking-root" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden font-sans">
      
      {/* Sub tabs header */}
      <div className="bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-widest block">Customer Operations</span>
            <h2 className="text-xl md:text-3xl font-bold font-sans mt-0.5">Delivery & Returns</h2>
          </div>

          <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700/50">
            {(['tracker', 'history', 'returns'] as const).map((tab) => (
              <button
                id={`tracking-tab-${tab}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'tracker' && 'Live Status'}
                {tab === 'history' && 'Order History'}
                {tab === 'returns' && 'Return Portal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container panels */}
      <div className="p-6 md:p-10 bg-slate-50/50">
        
        {/* TAB 1: LIVE SHIPMENT TRACKER */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Shipment Milestones Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">TRACKING NUMBER</span>
                  <h3 className="font-mono font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" /> {currentOrder.trackingNumber}
                  </h3>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED ARRIVAL</span>
                  <span className="font-sans font-bold text-slate-900 text-xs">{currentOrder.estimatedDelivery}</span>
                </div>
              </div>

              {/* Graphical Steps */}
              <div className="grid grid-cols-4 gap-2 relative">
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -z-10" />
                <div 
                  className="absolute top-4 left-6 h-1 bg-blue-500 -z-10 transition-all duration-1000"
                  style={{
                    width: 
                      currentOrder.status === 'processing' ? '12%' :
                      currentOrder.status === 'shipped' ? '45%' :
                      currentOrder.status === 'out_for_delivery' ? '78%' : '100%'
                  }}
                />

                {[
                  { label: 'Confirmed', desc: 'Processing Order', active: true },
                  { label: 'In Transit', desc: 'Dispatched Hub', active: currentOrder.status !== 'processing' },
                  { label: 'Out for Delivery', desc: 'Regional Carrier', active: currentOrder.status === 'out_for_delivery' || currentOrder.status === 'delivered' },
                  { label: 'Delivered', desc: 'Signed Arrived', active: currentOrder.status === 'delivered' }
                ].map((step, idx) => (
                  <div id={`step-bubble-${idx}`} key={idx} className="text-center space-y-2">
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                      step.active 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step.active ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <span className="font-sans font-bold text-slate-900 block text-[10px]">{step.label}</span>
                      <span className="text-slate-400 block text-[9px] font-mono leading-tight">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking events detailed */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h4 className="font-sans font-bold text-slate-900 text-xs uppercase tracking-wider">Shipping Updates</h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {currentOrder.events.map((ev, index) => (
                    <div id={`tracking-event-${index}`} key={index} className="relative flex flex-col md:flex-row md:items-center justify-between gap-2">
                      {/* Checkpoint bullet */}
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full" />
                      <div>
                        <span className="font-sans font-bold text-slate-800 text-xs block">{ev.title}</span>
                        <p className="text-slate-500 text-xs mt-0.5">{ev.description}</p>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded self-start md:self-auto">{ev.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoice & Shipping Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h4 className="font-sans font-bold text-slate-950 text-xs uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Shipping & Delivery Details
                </h4>
                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">SHIPPING COURIER</span>
                    <span className="font-sans font-bold text-slate-800">DHL Express Standard (Carbon-Neutral)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">SHIPPING ADDRESS</span>
                    <span className="font-sans font-medium text-slate-800 block">{currentOrder.shippingAddress.fullName}</span>
                    <span className="text-slate-500 block">{currentOrder.shippingAddress.street}</span>
                    <span className="text-slate-500 block">{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">PAYMENT METHOD</span>
                    <span className="font-sans font-medium text-slate-800">{currentOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <button 
                  id="dl-invoice-btn"
                  onClick={triggerInvoiceDownload}
                  className="w-full py-2.5 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" /> PRINT ORDER INVOICE
                </button>

                {invoiceDownloaded && (
                  <div id="invoice-dl-alert" className="bg-blue-50 text-blue-800 text-[10px] p-2.5 rounded-lg text-center font-semibold font-mono uppercase tracking-wide border border-blue-100">
                    PDF INVOICE GENERATED!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 bg-slate-55/20">
              <h3 className="font-sans font-bold text-slate-800 text-sm">Order History</h3>
              <p className="text-slate-400 text-[11px] font-sans">Access all past orders, invoices, and shipping details.</p>
            </div>
            
            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Order Date</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-[10px] font-semibold">DS-4812a-2026</td>
                    <td className="p-4 font-mono text-[10px]">2026-07-15</td>
                    <td className="p-4">
                      <span className="font-semibold block">AeroWeave Knit Blazer (Charcoal, M)</span>
                      <span className="text-slate-400 text-[10px] font-mono">1 other item attached</span>
                    </td>
                    <td className="p-4 text-slate-500">Cash on Delivery (COD)</td>
                    <td className="p-4 font-mono font-bold text-slate-900">£153.60</td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        IN TRANSIT
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-[10px] font-semibold">DS-20914-2026</td>
                    <td className="p-4 font-mono text-[10px]">2026-06-12</td>
                    <td className="p-4">
                      <span className="font-semibold block">Soma Squalane Glow Nectar (50ml)</span>
                    </td>
                    <td className="p-4 text-slate-500">Cash on Delivery (COD)</td>
                    <td className="p-4 font-mono font-bold text-slate-900">£29.00</td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        DELIVERED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SELF-SERVICE RETURNS PORTAL */}
        {activeTab === 'returns' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm max-w-2xl mx-auto animate-fadeIn">
            <h2 className="font-sans text-xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-blue-600" /> Returns & Refunds
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">If you are not completely satisfied with your purchase, returns are simple and free under our 14-day return policy.</p>

            <form onSubmit={handleReturnSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Select Item to Return</label>
                <select 
                  required
                  value={returnItem}
                  onChange={(e) => setReturnItem(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose an item from recent orders...</option>
                  <option value="ds-001">DS-4812a: AeroWeave Knit Blazer (Charcoal, M) - £115.00</option>
                  <option value="ds-005">DS-4812a: Brutalist Terracotta Pedestal Vase - £45.00</option>
                  <option value="ds-006">DS-20914: Soma Squalane Glow Nectar - £29.00</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Reason for Return</label>
                <select 
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
                >
                  <option value="Sizing mismatch">Physical sizing / fit issue</option>
                  <option value="Aesthetic mismatch">Aesthetic did not match my space / wardrobe direction</option>
                  <option value="Arrived damaged">Item arrived with surface scratches or transit damage</option>
                  <option value="Delayed shipping">Expedited delivery timeline was compromised</option>
                </select>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 font-sans text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-800 block text-xs mb-1">Standard pickup terms</span>
                We will dispatch a courier with a pre-printed label to collect the parcel from your registered shipping address within 48 hours. Zero printer or labels needed from you. Your refund triggers instantly upon first carrier scan.
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md">
                SUBMIT RETURN REQUEST
              </button>
            </form>

            {returnSuccess && (
              <div id="return-success-alert" className="mt-5 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <span className="font-bold block">Return Request Authorized & Confirmed!</span>
                  <p className="font-mono text-[10px] leading-relaxed">Your collection slip **SL_RET_49204_A** has been issued. A carrier courier will retrieve the box on **July 18** between **9:00 AM - 1:00 PM**.</p>
                  <button className="px-3 py-1 bg-white border border-blue-200 rounded font-mono font-bold text-[9px] text-blue-800 hover:bg-blue-100">
                    PRINT RETURN LABEL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
