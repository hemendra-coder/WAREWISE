import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Truck,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Check,
  Filter,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const DispatchModule: React.FC = () => {
  const { orders, advanceOrderStatus, reallocateStaff, exceptions, setActiveAdminModule } = useWarehouse();
  const [staffReallocated, setStaffReallocated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carrierFilter, setCarrierFilter] = useState<'ALL' | 'BLUEDART' | 'DELHIVERY' | 'FEDEX'>('ALL');

  const readyOrders = useMemo(
    () => orders.filter((o) => ['READY_FOR_DISPATCH', 'QC_CHECK', 'PACKING'].includes(o.status)),
    [orders]
  );

  const bottleneckException = exceptions.find((e) => e.type === 'BOTTLENECK_CONGESTION' && e.status !== 'RESOLVED');

  const handleReallocateStaff = () => {
    reallocateStaff('DOCK-03', 2);
    setStaffReallocated(true);
    setFeedback('Reassigned 2 rapid packers to Dock-03. Congestion mitigated.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDispatchSingle = (orderId: string) => {
    advanceOrderStatus(orderId, 'DISPATCHED');
    setFeedback(`Parcel ${orderId} dispatched with outbound airway bill. Telemetry live.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDispatchAll = () => {
    if (readyOrders.length === 0) return;
    readyOrders.forEach((o) => {
      advanceOrderStatus(o.id, 'DISPATCHED');
    });
    setFeedback(`Dispatched all ${readyOrders.length} staged parcels. Manifest transferred to carriers.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1">
            Outbound Logistics & Carrier Synchrony
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Dispatch Operations & Dock Allocation
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5">
            Carrier cutoffs, flight wave staging, load balancing, and electronic manifests.
          </p>
        </div>

        <button
          onClick={handleDispatchAll}
          disabled={readyOrders.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black disabled:opacity-50 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
        >
          <Truck className="w-4 h-4 text-stone-300" />
          <span>Dispatch Wave 03 ({readyOrders.length} Parcels)</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-stone-900 text-white text-xs font-mono-tech flex items-center justify-between shadow-lux animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </span>
          <span className="text-[10px] text-stone-400">CARRIER SYNCED</span>
        </div>
      )}

      {/* Dock Capacity Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DOCK 01 */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tech font-bold text-stone-900">Dock 01 (FedEx Ground)</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-tech bg-stone-100 text-stone-700 font-medium">
              45% LOAD
            </span>
          </div>
          <div className="text-xs text-stone-500 font-mono-tech">Cutoff: 18:30 (In 4h 15m)</div>
          <div className="w-full bg-[#E7E5E0] rounded-full h-1.5 overflow-hidden">
            <div className="bg-stone-800 h-full rounded-full w-[45%]" />
          </div>
          <div className="text-[11px] font-mono-tech text-stone-500">18 parcels staged • Driver assigned</div>
        </div>

        {/* DOCK 02 */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tech font-bold text-stone-900">Dock 02 (Delhivery Air)</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-tech bg-stone-100 text-stone-700 font-medium">
              68% LOAD
            </span>
          </div>
          <div className="text-xs text-stone-500 font-mono-tech">Cutoff: 16:00 (In 1h 45m)</div>
          <div className="w-full bg-[#E7E5E0] rounded-full h-1.5 overflow-hidden">
            <div className="bg-stone-800 h-full rounded-full w-[68%]" />
          </div>
          <div className="text-[11px] font-mono-tech text-stone-500">42 parcels staged • Bay 2 ready</div>
        </div>

        {/* DOCK 03 */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tech font-bold text-stone-900">Dock 03 (BlueDart Flight VIP)</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono-tech font-bold ${
              bottleneckException && !staffReallocated
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700'
            }`}>
              {bottleneckException && !staffReallocated ? '94% CONGESTION' : '65% LOAD'}
            </span>
          </div>
          <div className="text-xs text-stone-500 font-mono-tech">Flight Cutoff: 14:45 (In 34 mins)</div>
          <div className="w-full bg-[#E7E5E0] rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full ${
              bottleneckException && !staffReallocated ? 'bg-stone-900 w-[94%]' : 'bg-stone-700 w-[65%]'
            }`} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono-tech">
            <span className="text-stone-700 font-medium">Includes VIP Express</span>
            {bottleneckException && !staffReallocated && (
              <button
                onClick={handleReallocateStaff}
                className="px-2.5 py-1 rounded-md bg-stone-900 text-white text-[10px] font-bold cursor-pointer hover:bg-black"
              >
                Reassign 2 Packers
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staged Parcels List */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-stone-900" />
            <h3 className="font-serif-luxury font-bold text-lg text-stone-900">
              Staged Outbound Parcels ({readyOrders.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-tech text-stone-500">Carrier Cutoff in 34 mins</span>
            <button
              onClick={() => setActiveAdminModule('02_ORDERS')}
              className="text-xs font-mono-tech text-stone-900 font-bold hover:underline ml-2"
            >
              View All Orders →
            </button>
          </div>
        </div>

        {readyOrders.length === 0 ? (
          <div className="p-8 text-center bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl font-mono-tech space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-stone-900">All Parcels Dispatched</div>
            <div className="text-xs text-stone-500">No pending orders staged at outbound loading docks.</div>
          </div>
        ) : (
          <div className="space-y-3 font-mono-tech text-xs">
            {readyOrders.map((order) => {
              const firstItem = order.items[0];
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-[#FBFBF9] border border-[#E7E5E0] hover:border-stone-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={firstItem?.image}
                      alt={firstItem?.name}
                      className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{order.id}</span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] bg-stone-200 text-stone-800 font-semibold">
                          {order.customerTier}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] bg-stone-100 text-stone-700 font-medium">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="font-serif-luxury font-bold text-xs text-stone-800 truncate mt-0.5">{firstItem?.name}</div>
                      <div className="text-[11px] text-stone-500">{order.customerName} • Airway #BLU-{order.id.slice(-4)}-IN</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-stone-900 font-bold text-sm">₹{order.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-stone-500 font-medium">QC Verified</div>
                    </div>
                    <button
                      onClick={() => handleDispatchSingle(order.id)}
                      className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-black text-white font-medium text-xs cursor-pointer transition-colors"
                    >
                      Dispatch Parcel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

