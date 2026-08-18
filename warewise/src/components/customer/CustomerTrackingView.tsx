import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { OrderJourneyTracker } from './OrderJourneyTracker';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  MapPin,
  Sparkles,
  ArrowRight,
  User,
  Radio,
  FileText,
  HelpCircle,
  RotateCcw,
  Search,
  ChevronRight,
  Phone,
  MessageSquare
} from 'lucide-react';

export const CustomerTrackingView: React.FC = () => {
  const { 
    orders, 
    selectedOrderId, 
    setSelectedOrderId, 
    setIsAiChatOpen,
    setActiveCustomerNavTab 
  } = useWarehouse();
  
  const [searchTrackingInput, setSearchTrackingInput] = useState('');

  // Find customer's active order (default to selected or first order)
  const activeOrder = 
    orders.find((o) => o.id === selectedOrderId) || 
    orders.find((o) => o.id.includes(searchTrackingInput.trim().toUpperCase())) ||
    orders[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Header & Order Selector Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-[#E7E5E0] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-stone-900 text-white rounded-xl shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-luxury italic font-bold text-stone-900 text-xl sm:text-2xl tracking-tight">
              Live Order Telemetry & Delivery Journey
            </h1>
            <p className="text-xs text-stone-500 font-sans">
              Real-time consignment tracking powered by autonomous fulfillment
            </p>
          </div>
        </div>

        {/* Order Switcher Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono-tech text-stone-500 uppercase font-semibold">
            Active Orders:
          </span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3 py-1.5 text-xs font-mono-tech font-bold uppercase rounded-lg transition-all cursor-pointer ${
                activeOrder?.id === o.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-[#F2EFE9] text-stone-700 hover:text-stone-900 hover:bg-stone-200 border border-[#E7E5E0]'
              }`}
            >
              {o.id}
            </button>
          ))}
        </div>
      </div>

      {activeOrder ? (
        <div className="space-y-6">
          {/* SIGNATURE READ-ONLY ORDER JOURNEY & MOVING RIDER TRACKER */}
          <OrderJourneyTracker
            order={activeOrder}
          />

          {/* Delivery Details & Order Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Parcel Line Items (7 cols) */}
            <div className="lg:col-span-7 p-6 bg-white border border-[#E7E5E0] rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E0]">
                <h3 className="font-serif-luxury italic font-bold text-lg text-stone-900">
                  Consignment Line Items ({activeOrder.items.length})
                </h3>
                <span className="text-xs font-mono-tech font-bold text-stone-800">
                  Total: ₹{activeOrder.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3 font-sans">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.sku}
                    className="p-3.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg border border-stone-200 shrink-0 bg-white p-1"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 text-xs truncate">
                          {item.name}
                        </div>
                        <div className="text-stone-500 text-[11px] font-mono-tech">
                          SKU: {item.sku} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-stone-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase font-mono-tech">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Safe Transparency Note */}
              <div className="p-4 bg-[#F2EFE9] border border-[#E7E5E0] rounded-xl text-xs text-stone-700 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-stone-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block font-mono-tech uppercase text-stone-900">
                    Fulfillment Assurance:
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Your shipment is protected under the WareWise Express Guarantee with zero-defect optical inspection and thermal-protected shockproof packaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Destination & Delivery Info (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Shipping Address Card */}
              <div className="p-6 bg-white border border-[#E7E5E0] rounded-2xl shadow-sm space-y-4 text-xs font-mono-tech">
                <h3 className="font-serif-luxury italic font-bold text-lg text-stone-900">
                  Delivery Destination
                </h3>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl">
                    <div className="text-stone-500 text-[10px] uppercase font-bold">Recipient</div>
                    <div className="text-stone-900 font-bold mt-0.5 font-sans">
                      {activeOrder.shippingAddress?.name || activeOrder.customerName}
                    </div>
                    <div className="text-stone-600 text-[11px] font-sans mt-0.5">
                      {activeOrder.shippingAddress?.street || 'Prestige Tech Cloud, Phase 2'}
                    </div>
                    <div className="text-stone-600 text-[11px] font-sans">
                      {activeOrder.shippingAddress?.city || activeOrder.destinationCity}, {activeOrder.shippingAddress?.state || 'Karnataka'} - {activeOrder.shippingAddress?.pincode || '560066'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl">
                    <div className="text-stone-500 text-[10px] uppercase font-bold">Tracking Reference</div>
                    <div className="text-stone-900 font-bold text-sm mt-0.5">
                      {activeOrder.trackingNumber || 'BD-AIR-9042-IN'}
                    </div>
                    <div className="text-stone-500 text-[10px] font-sans mt-0.5">
                      Carrier: {activeOrder.carrier || 'BlueDart Air Express'}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAiChatOpen(true)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-mono-tech font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Ask AI Assistant About Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCustomerNavTab('ORDERS')}
                    className="w-full py-2.5 bg-[#F2EFE9] hover:bg-[#EAE6DE] text-stone-800 font-mono-tech font-semibold text-xs uppercase tracking-wider rounded-xl border border-[#E7E5E0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span>View Full Order Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="font-serif-luxury italic font-bold text-lg text-stone-900">
            No Orders Found
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Place an order from our catalog to experience real-time interactive tracking with our delivery rider.
          </p>
          <button
            onClick={() => setActiveCustomerNavTab('SHOP')}
            className="px-5 py-2.5 bg-stone-900 text-white font-mono-tech font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
};
