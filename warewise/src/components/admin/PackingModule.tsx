import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  PackageCheck,
  CheckCircle2,
  Box,
  Scale,
  Barcode,
  ArrowRight,
  Sparkles,
  Check,
  Layers
} from 'lucide-react';

export const PackingModule: React.FC = () => {
  const { orders, completePackOrder, advanceOrderStatus, setActiveAdminModule } = useWarehouse();
  const [boxType, setBoxType] = useState('BX-L-04 (Corrugated Heavy Duty)');
  const [dunnageType, setDunnageType] = useState('Biodegradable Air Cushion');
  const [feedback, setFeedback] = useState<string | null>(null);

  const packingOrders = useMemo(
    () => orders.filter((o) => ['PACKING', 'PICKING', 'APPROVED', 'STOCK_ALLOCATED'].includes(o.status)),
    [orders]
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    packingOrders[0]?.id || orders[0]?.id || 'ORD-WW-1042'
  );

  const activeOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || packingOrders[0] || orders[0],
    [orders, selectedOrderId, packingOrders]
  );

  const totalQuantity = useMemo(
    () => activeOrder?.items.reduce((acc, item) => acc + item.quantity, 0) || 1,
    [activeOrder]
  );

  const calculatedWeight = useMemo(
    () => Math.max(0.85, totalQuantity * 0.48),
    [totalQuantity]
  );

  const handleCompletePacking = () => {
    if (!activeOrder) return;
    completePackOrder(activeOrder.id, boxType, calculatedWeight);
    advanceOrderStatus(activeOrder.id, 'QC_CHECK');
    setFeedback(`Order ${activeOrder.id} packed & tamper-sealed. Staged for QC inspection.`);

    const remaining = packingOrders.filter((o) => o.id !== activeOrder.id);
    if (remaining.length > 0) {
      setSelectedOrderId(remaining[0].id);
    }

    setTimeout(() => {
      setFeedback(null);
      setActiveAdminModule('07_QC');
    }, 1200);
  };

  const cartonOptions = [
    { id: 'BX-S-01', name: 'BX-S-01 (EcoBox Small)', dim: '220 x 160 x 120 mm' },
    { id: 'BX-L-04', name: 'BX-L-04 (Corrugated Heavy Duty)', dim: '360 x 280 x 220 mm' },
    { id: 'BX-XL-09', name: 'BX-XL-09 (Master Carton)', dim: '540 x 420 x 360 mm' },
  ];

  const dunnageOptions = [
    'Biodegradable Air Cushion',
    'Kraft Honeycomb Paper Wrap',
    'Anti-Static ESD Foam Sheet',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1">
            Volumetric Packaging & Barcoding
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Packing Station Workbench
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5">
            Automated carton sizing, void-fill optimization, optical weight validation, and shipping labels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 text-xs font-mono-tech font-medium flex items-center gap-2">
            <Box className="w-3.5 h-3.5 text-stone-700" />
            <span>Station Pack-02 (Active)</span>
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-stone-900 text-white text-xs font-mono-tech flex items-center justify-between shadow-lux animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </span>
          <span className="text-[10px] text-stone-400">TRANSFERRING TO QC...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Packing Task & Product Verification */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7E5E0]">
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-5 h-5 text-stone-900" />
                <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
                  Active Parcel: {activeOrder?.id}
                </h3>
              </div>
              <span className="text-xs font-mono-tech text-stone-600 bg-stone-100 px-3 py-1 rounded-md font-medium">
                Operator: Priya Sharma
              </span>
            </div>

            {/* Product Card */}
            <div className="bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold flex items-center justify-between">
                <span>Verify Packed Contents</span>
                <span className="text-stone-900 font-bold">{activeOrder?.items.length} Line Item(s)</span>
              </div>

              <div className="space-y-2.5">
                {activeOrder?.items.map((item) => (
                  <div
                    key={item.sku}
                    className="p-3 bg-white border border-[#E7E5E0] rounded-xl flex items-center justify-between gap-3 text-xs font-mono-tech"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="font-serif-luxury font-bold text-stone-900 text-sm">{item.name}</div>
                        <div className="text-stone-500 text-[11px]">
                          SKU: <strong className="text-stone-900">{item.sku}</strong> • Qty: <strong className="text-stone-900">{item.quantity}</strong>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] bg-stone-900 text-white font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>VERIFIED ({item.quantity}/{item.quantity})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Selection */}
            <div className="bg-[#F5F4F0] border border-[#E7E5E0] rounded-xl p-4 space-y-3 font-mono-tech text-xs">
              <div className="flex items-center justify-between text-stone-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  <span>Volumetric Cartonization Suggestion</span>
                </span>
                <span className="text-stone-600 font-medium">99.1% Volume Efficiency</span>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Select Corrugated Carton:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {cartonOptions.map((carton) => (
                    <button
                      key={carton.id}
                      type="button"
                      onClick={() => setBoxType(carton.name)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        boxType === carton.name
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <div className="font-bold text-[11px] truncate">{carton.id}</div>
                      <div className={`text-[9px] mt-0.5 ${boxType === carton.name ? 'text-stone-300' : 'text-stone-500'}`}>
                        {carton.dim}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E7E5E0]">
                <div className="text-[10px] text-stone-500 uppercase font-semibold">Select Protective Dunnage:</div>
                <div className="flex flex-wrap gap-2">
                  {dunnageOptions.map((dunnage) => (
                    <button
                      key={dunnage}
                      type="button"
                      onClick={() => setDunnageType(dunnage)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        dunnageType === dunnage
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {dunnage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sensors (Scale & Barcode) */}
            <div className="grid grid-cols-2 gap-3 font-mono-tech text-xs">
              <div className="p-3.5 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-stone-700" />
                  <div>
                    <div className="text-stone-500 text-[10px]">WEIGHT SCALE</div>
                    <div className="text-stone-900 font-bold text-xs">{calculatedWeight.toFixed(2)} kg (Live Sensor)</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-3.5 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-stone-700" />
                  <div>
                    <div className="text-stone-500 text-[10px]">SHIPPING LABEL</div>
                    <div className="text-stone-900 font-bold text-xs">#LBL-{activeOrder?.id || 'EXP'}</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <button
              onClick={handleCompletePacking}
              className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Seal Parcel & Forward to QC Inspection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Packing Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux space-y-4">
            <div className="text-xs font-mono-tech uppercase font-bold text-stone-900 pb-2 border-b border-[#E7E5E0] flex items-center justify-between">
              <span>Packing Queue ({packingOrders.length})</span>
              <span className="text-stone-500">Bay 2 Active</span>
            </div>

            <div className="space-y-2.5 font-mono-tech text-xs max-h-96 overflow-y-auto pr-1">
              {packingOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    order.id === activeOrder?.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-[#FBFBF9] border-[#E7E5E0] hover:border-stone-400 text-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs ${order.id === activeOrder?.id ? 'text-white' : 'text-stone-900'}`}>
                      {order.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold ${
                      order.id === activeOrder?.id ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-800'
                    }`}>
                      {order.priorityTier}
                    </span>
                  </div>
                  <div className={`font-sans text-xs mt-1 ${order.id === activeOrder?.id ? 'text-stone-200' : 'text-stone-700'}`}>
                    {order.customerName}
                  </div>
                  <div className={`text-[11px] mt-1 flex justify-between ${order.id === activeOrder?.id ? 'text-stone-300' : 'text-stone-500'}`}>
                    <span>{order.items.length} Item(s)</span>
                    <span className={`font-bold ${order.id === activeOrder?.id ? 'text-white' : 'text-stone-900'}`}>
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

