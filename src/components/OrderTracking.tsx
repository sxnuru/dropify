import { Product } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, CartItem } from '../types';
import { 
  Truck, ArrowLeftRight, CheckCircle2, FileText, 
  ChevronRight, Calendar, Package, Printer, CreditCard
} from 'lucide-react';
import StatusBadge from './StatusBadge';

interface OrderTrackingProps {
  onBackToShop: () => void;
  activeOrder?: Order; // Current order if just checked out
}
export default function OrderTracking({ onBackToShop, activeOrder }: OrderTrackingProps) {
  const currentOrder = activeOrder;
  const [activeTab, setActiveTab] = useState<'tracker' | 'history' | 'returns'>('tracker');
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);
  
  // Return form state
  const [returnItem, setReturnItem] = useState('');
  const [returnReason, setReturnReason] = useState('Sizing mismatch');
  const [returnSuccess, setReturnSuccess] = useState(false);

  const handlePrintReturnLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>DreamShelf Return Shipping Label</title>
          <style>
            body {
              font-family: sans-serif;
              color: #0f172a;
              padding: 40px;
              max-width: 500px;
              margin: 0 auto;
              border: 3px dashed #0f172a;
              border-radius: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: 2px;
            }
            .title {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 5px;
            }
            .address-section {
              margin-bottom: 25px;
              font-size: 13px;
              line-height: 1.5;
            }
            .address-label {
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              color: #64748b;
            }
            .barcode-container {
              text-align: center;
              margin: 30px 0;
            }
            .barcode {
              width: 100%;
              height: 60px;
              background: repeating-linear-gradient(
                90deg,
                #0f172a,
                #0f172a 3px,
                #fff 3px,
                #fff 7px,
                #0f172a 7px,
                #0f172a 9px,
                #fff 9px,
                #fff 13px
              );
              border-bottom: 2px solid #0f172a;
            }
            .barcode-number {
              font-family: monospace;
              font-size: 12px;
              margin-top: 8px;
              font-weight: bold;
              letter-spacing: 3px;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              margin-top: 25px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">DREAMSHELF</div>
            <div class="title">Prepaid Return Shipping Label</div>
          </div>
          
          <div class="address-section">
            <div class="address-label">From:</div>
            <strong>DreamShelf Client</strong><br/>
            Registered Shipping Address<br/>
            United Kingdom
          </div>
          
          <div class="address-section">
            <div class="address-label">To / Ship To:</div>
            <strong>DreamShelf Fulfilment Center</strong><br/>
            Unit 14B, Brutalist Logistics Park<br/>
            London, E1 6PX<br/>
            United Kingdom
          </div>

          <div class="barcode-container">
            <div class="barcode"></div>
            <div class="barcode-number">SL-RET-49204-A</div>
          </div>

          <div class="footer">
            <strong>Carrier: DHL Global Express</strong><br/>
            Keep this slip as receipt of dispatch. Print and paste securely to the package.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      
      {/* Back navigation */}
      <div className="px-6 pt-6 bg-white flex justify-start">
        <button 
          onClick={onBackToShop}
          className="group flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-slate-950 font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span>Back to Profile</span>
        </button>
      </div>

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
          !currentOrder ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-fadeIn">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider">No Active Shipment</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                There are no active orders currently set for live tracking. Place a purchase order at checkout to start monitoring standard or express shipping milestones.
              </p>
              <button 
                onClick={onBackToShop}
                className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-mono text-[10px] font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Return to Shop
              </button>
            </div>
          ) : (
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
                          <span className="font-sans font-bold text-slate-800 text-xs block">{ev.name}</span>
                          <p className="text-slate-500 text-xs mt-0.5">{ev.description}</p>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded self-start md:self-auto">{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invoice & Shipping Overview Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit space-y-6">
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
              </div>
            </div>
          )
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
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
                      <StatusBadge status="in_transit" />
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
                      <StatusBadge status="delivered" />
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
                  {activeOrder ? (
                    activeOrder.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {activeOrder.id}: {item.product.name} ({item.selectedColor}, {item.selectedSize}) - £{item.product.price.toFixed(2)}
                      </option>
                    ))
                  ) : (
                    <option disabled>No items available for return</option>
                  )}
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
                  <button 
                    onClick={handlePrintReturnLabel}
                    className="px-3 py-1 bg-white border border-blue-200 rounded font-mono font-bold text-[9px] text-blue-800 hover:bg-blue-100 cursor-pointer"
                  >
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
