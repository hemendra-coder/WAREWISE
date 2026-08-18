import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Check,
  Sparkles
} from 'lucide-react';

export const QCModule: React.FC = () => {
  const { orders, advanceOrderStatus, logException, setActiveAdminModule } = useWarehouse();
  const [skuMatch, setSkuMatch] = useState(true);
  const [packagingIntact, setPackagingIntact] = useState(true);
  const [cosmeticPristine, setCosmeticPristine] = useState(true);
  const [labelLegible, setLabelLegible] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const qcQueue = orders.filter((o) =>
    ['QC_CHECK', 'PACKING', 'READY_FOR_DISPATCH', 'STOCK_ALLOCATED'].includes(o.status)
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    qcQueue[0]?.id || orders[0]?.id || 'ORD-WW-1042'
  );

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || qcQueue[0] || orders[0];
  const primaryItem = activeOrder?.items[0];

  const handlePassQc = (orderId: string) => {
    advanceOrderStatus(orderId, 'READY_FOR_DISPATCH');
    setFeedback(`Order ${orderId} passed optical QC inspection. Transferred to Outbound Dock 03.`);

    const remaining = qcQueue.filter((o) => o.id !== orderId);
    if (remaining.length > 0) {
      setSelectedOrderId(remaining[0].id);
    }

    setTimeout(() => {
      setFeedback(null);
      setActiveAdminModule('08_DISPATCH');
    }, 1200);
  };

  const handleFailQc = (orderId: string) => {
    logException({
      type: 'DAMAGED_GOODS',
      severity: 'HIGH',
      affectedOrderId: orderId,
      affectedSku: activeOrder?.items[0]?.sku || 'SKU-NC-900',
      description: `QC Inspection failed on ${orderId}: Packaging deformity detected at audit bench.`,
      recommendedAction: 'Quarantine parcel to Return-to-Vendor bay & reallocate replacement unit.',
    });
    setFeedback(`Order ${orderId} flagged with defect exception. Quarantined for inspection.`);

    const remaining = qcQueue.filter((o) => o.id !== orderId);
    if (remaining.length > 0) {
      setSelectedOrderId(remaining[0].id);
    }

    setTimeout(() => {
      setFeedback(null);
      setActiveAdminModule('09_EXCEPTIONS');
    }, 1200);
  };

  const handleSelectAllChecks = () => {
    setSkuMatch(true);
    setPackagingIntact(true);
    setCosmeticPristine(true);
    setLabelLegible(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1">
            Quality Assurance & Optical Inspection
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Quality Control & Defect Quarantine
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5">
            Multi-point inspection checklist, barcode scan authentication, and exception logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 text-xs font-mono-tech font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-700" />
            <span>Facility Pass Rate: 99.2%</span>
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-stone-900 text-white text-xs font-mono-tech flex items-center justify-between shadow-lux animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </span>
          <span className="text-[10px] text-stone-400">TELEMETRY UPDATED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QC Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold flex items-center justify-between px-1">
            <span>QC Audit Queue ({qcQueue.length})</span>
            <span className="text-stone-900">Bench QC-01</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {qcQueue.map((order) => {
              const item = order.items[0];
              const isSelected = order.id === activeOrder?.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-stone-900 shadow-lux-lg ring-1 ring-stone-900'
                      : 'bg-[#FBFBF9] border-[#E7E5E0] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech font-bold text-stone-900 text-xs">{order.id}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-tech bg-stone-100 text-stone-800 font-medium">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-[#E7E5E0]">
                    <img
                      src={item?.image}
                      alt={item?.name}
                      className="w-10 h-10 rounded-md object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-serif-luxury font-bold text-xs text-stone-900 truncate">{item?.name}</div>
                      <div className="text-[10px] text-stone-500">{order.customerName}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-500 font-mono-tech flex items-center justify-between pt-1 border-t border-[#E7E5E0]">
                    <span>Priority: {order.priorityTier}</span>
                    <span className="text-stone-900 font-bold">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Multi-Point Inspection Checklist */}
        {activeOrder && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7E5E0]">
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className="w-5 h-5 text-stone-900" />
                  <h3 className="font-serif-luxury font-bold text-xl text-stone-900">Audit Parcel: {activeOrder.id}</h3>
                </div>
                <span className="text-xs font-mono-tech text-stone-600 bg-stone-100 px-3 py-1 rounded-md font-medium">
                  Inspector: Sarah Chen (Senior QA)
                </span>
              </div>

              {/* Product Card */}
              {primaryItem && (
                <div className="p-4 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl flex items-center gap-4">
                  <img
                    src={primaryItem.image}
                    alt={primaryItem.name}
                    className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-mono-tech text-stone-500 font-medium">VERIFYING CONTENTS</div>
                    <div className="font-serif-luxury font-bold text-lg text-stone-900">{primaryItem.name}</div>
                    <div className="text-xs font-mono-tech text-stone-600">
                      SKU: <strong className="text-stone-900">{primaryItem.sku}</strong> • Quantity: <strong className="text-stone-900">{primaryItem.quantity} Units</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 4-Point Mandatory Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-tech uppercase text-stone-500 font-semibold">
                  <span>Mandatory Inspection Checkpoints</span>
                  <button
                    type="button"
                    onClick={handleSelectAllChecks}
                    className="text-stone-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-stone-700" />
                    <span>Check All (Pass)</span>
                  </button>
                </div>

                <div className="space-y-2 font-mono-tech text-xs">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-[#F5F4F0] border border-[#E7E5E0] cursor-pointer hover:bg-stone-100 transition-colors">
                    <span className="text-stone-900">1. SKU Barcode Verification (#{primaryItem?.sku || 'NC900-8849-B2'})</span>
                    <input
                      type="checkbox"
                      checked={skuMatch}
                      onChange={(e) => setSkuMatch(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-[#F5F4F0] border border-[#E7E5E0] cursor-pointer hover:bg-stone-100 transition-colors">
                    <span className="text-stone-900">2. Anti-Static ESD Packaging & Cushioning</span>
                    <input
                      type="checkbox"
                      checked={packagingIntact}
                      onChange={(e) => setPackagingIntact(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-[#F5F4F0] border border-[#E7E5E0] cursor-pointer hover:bg-stone-100 transition-colors">
                    <span className="text-stone-900">3. Cosmetic Condition & Zero Physical Scratches</span>
                    <input
                      type="checkbox"
                      checked={cosmeticPristine}
                      onChange={(e) => setCosmeticPristine(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-[#F5F4F0] border border-[#E7E5E0] cursor-pointer hover:bg-stone-100 transition-colors">
                    <span className="text-stone-900">4. Thermal Shipping Label Legibility & QR Hash</span>
                    <input
                      type="checkbox"
                      checked={labelLegible}
                      onChange={(e) => setLabelLegible(e.target.checked)}
                      className="w-4 h-4 accent-stone-900 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono-tech">
                <button
                  onClick={() => handleFailQc(activeOrder.id)}
                  className="py-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-stone-600" />
                  <span>Flag Defect & Quarantine</span>
                </button>

                <button
                  onClick={() => handlePassQc(activeOrder.id)}
                  className="py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-stone-300" />
                  <span>Pass QC & Stage to Dock 03</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

