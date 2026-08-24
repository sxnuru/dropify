import React, { useState } from 'react';
import { Package, Search, Truck, ArrowLeft } from 'lucide-react';
import OrderTracking from './OrderTracking';

interface TrackOrderViewProps {
  onBackToHome: () => void;
}

export default function TrackOrderView({ onBackToHome }: TrackOrderViewProps) {
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsLoading(true);
    setError('');
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(trackingId.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch order.');
      }

      // Convert API response to the format OrderTracking expects
      const formattedOrder = {
        id: data.id,
        trackingNumber: data.tracking_id,
        items: data.items.map((i: any) => ({
          product: { name: i.product_name, category: 'Product' },
          selectedColor: i.selected_color,
          selectedSize: i.selected_size,
          quantity: i.quantity,
          price: i.unit_price,
        })),
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        shipping: data.shipping_cost,
        total: data.total,
        status: data.order_status,
        estimatedDelivery: 'Standard Delivery', // Adjust if needed
        shippingAddress: data.shipping_address,
        paymentMethod: data.payment_method,
        date: new Date(data.created_at).toLocaleDateString(),
        events: [
          { name: 'Order Placed', description: 'Order confirmed', time: new Date(data.created_at).toLocaleString(), done: true },
          ...(data.order_status !== 'pending' && data.order_status !== 'confirmed' ? [{ name: 'Shipped', description: 'Dispatched from hub', time: '', done: true }] : []),
          ...(data.order_status === 'delivered' ? [{ name: 'Delivered', description: 'Package arrived', time: '', done: true }] : []),
        ],
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        paymentStatus: data.payment_status,
        fulfillmentStatus: data.fulfillment_status,
      };

      setOrderData(formattedOrder);
    } catch (err: any) {
      setError(err.message || 'Error finding tracking ID.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[600px] animate-fadeIn font-sans">
      <button 
        onClick={onBackToHome}
        className="group flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-950 font-bold uppercase tracking-wider mb-6 transition-all cursor-pointer"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform duration-200"><ArrowLeft className="w-4 h-4"/></span>
        <span>Back to Home</span>
      </button>

      {!orderData ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 md:p-12 text-center max-w-2xl mx-auto relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -z-10" />
           
           <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8" />
           </div>
           
           <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Track Your Order</h2>
           <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
             Enter your unique Tracking ID below to see live updates, tracking history, and estimated delivery times.
           </p>

           <form onSubmit={handleTrackOrder} className="max-w-md mx-auto space-y-4">
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search className="h-5 w-5 text-slate-400" />
               </div>
               <input
                 type="text"
                 value={trackingId}
                 onChange={(e) => setTrackingId(e.target.value)}
                 className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono font-medium transition-all"
                 placeholder="e.g. ORD-2026-X7K92P"
                 required
               />
             </div>
             
             <button
               type="submit"
               disabled={isLoading || !trackingId.trim()}
               className="w-full py-4 bg-slate-950 hover:bg-blue-600 text-white font-sans font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 uppercase tracking-widest"
             >
               {isLoading ? (
                 <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Searching...
                 </>
               ) : (
                 <>
                  <Truck className="w-5 h-5" /> Track Package
                 </>
               )}
             </button>
           </form>

           {error && (
             <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium animate-fadeIn">
               {error}
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tracking Results</h2>
            <button
               onClick={() => setOrderData(null)}
               className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
             >
               Track Another Order
             </button>
          </div>
          <OrderTracking 
            activeOrder={orderData} 
            onBackToShop={() => setOrderData(null)}
          />
        </div>
      )}
    </div>
  );
}
