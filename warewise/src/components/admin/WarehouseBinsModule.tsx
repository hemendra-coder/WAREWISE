import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { WarehouseBin, Product } from '../../types';
import {
  Grid3X3,
  MapPin,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  X,
  Plus
} from 'lucide-react';

export const WarehouseBinsModule: React.FC = () => {
  const { bins, products, updateBinOccupancy } = useWarehouse();
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchBin, setSearchBin] = useState('');
  const [activeBinDetail, setActiveBinDetail] = useState<WarehouseBin | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const zones = ['ALL', 'Zone A', 'Zone B', 'Zone C', 'Buffer'];

  const filteredBins = bins.filter((bin) => {
    const matchesZone =
      selectedZone === 'ALL' ||
      (selectedZone === 'Buffer' ? bin.isBuffer : bin.zone.includes(selectedZone));
    const matchesSearch =
      bin.id.toLowerCase().includes(searchBin.toLowerCase()) ||
      bin.aisle.toLowerCase().includes(searchBin.toLowerCase()) ||
      bin.zone.toLowerCase().includes(searchBin.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const getProductsInBin = (binId: string): Product[] => {
    return products.filter((p) => p.binLocation === binId || p.alternateBinLocation === binId);
  };

  const handleCycleCountTrigger = (binId: string) => {
    setFeedback(`Cycle count task scheduled for Bin ${binId}. Staff auditor assigned.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1 flex items-center gap-2">
            <Grid3X3 className="w-3.5 h-3.5 text-stone-700" />
            <span>Physical Topology & Volumetric Occupancy</span>
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Warehouse Zones, Aisles & Bin Coordinates
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5 max-w-2xl leading-relaxed">
            Monitor real-time bin volumetric fill levels, velocity tier classifications, weight constraints, and assign SKUs across storage aisles.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Bin (e.g. A-02-1)..."
            value={searchBin}
            onChange={(e) => setSearchBin(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FBFBF9] border border-[#E7E5E0] text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-mono-tech"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono-tech text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Zone Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              selectedZone === zone
                ? 'bg-stone-900 text-white font-semibold shadow-sm'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E7E5E0]'
            }`}
          >
            {zone === 'ALL' ? 'All Warehouse Zones' : zone}
          </button>
        ))}
      </div>

      {/* Bin Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBins.map((bin) => {
          const occupancyPct = Math.round((bin.currentOccupancy / bin.capacity) * 100);
          const binProducts = getProductsInBin(bin.id);
          const isFull = occupancyPct >= 90;

          return (
            <div
              key={bin.id}
              onClick={() => setActiveBinDetail(bin)}
              className="p-5 rounded-2xl border border-[#E7E5E0] bg-white shadow-lux hover:shadow-lux-lg transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-stone-100 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                    <Grid3X3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono-tech font-bold text-base text-stone-900">{bin.id}</span>
                    <div className="text-[10px] text-stone-500 font-mono-tech">
                      Aisle {bin.aisle} • Shelf {bin.shelf}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono-tech font-bold ${
                    bin.isBuffer
                      ? 'bg-stone-200 text-stone-800'
                      : isFull
                      ? 'bg-terracotta text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {bin.isBuffer ? 'BUFFER BIN' : bin.zone.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono-tech">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Fill Capacity:</span>
                  <span className="text-stone-900 font-bold">
                    {bin.currentOccupancy} / {bin.capacity} units ({occupancyPct}%)
                  </span>
                </div>

                <div className="w-full bg-[#E7E5E0] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      occupancyPct > 85 ? 'bg-stone-900' : 'bg-stone-700'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              {/* Stored SKUs Preview */}
              <div className="pt-2 border-t border-[#E7E5E0] text-xs font-mono-tech">
                <div className="text-[10px] text-stone-400 uppercase font-semibold mb-1">Stored Inventory</div>
                {binProducts.length > 0 ? (
                  <div className="space-y-1">
                    {binProducts.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-[11px] text-stone-700">
                        <span className="font-semibold truncate max-w-[180px]">{p.name}</span>
                        <span className="text-stone-500">{p.availableStock} free</span>
                      </div>
                    ))}
                    {binProducts.length > 2 && (
                      <div className="text-[10px] text-stone-400">+{binProducts.length - 2} more SKUs</div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 italic">Empty Staging Bin (Ready for inward receipt)</div>
                )}
              </div>

              <div className="text-[10px] font-mono-tech text-stone-500 pt-2 border-t border-[#E7E5E0] flex items-center justify-between">
                <span>Velocity: <strong>{bin.velocityTier}</strong></span>
                <span>Max Wt: <strong>{bin.maxWeightKg} kg</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bin Detail Modal */}
      {activeBinDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-900 text-white">
                  <Grid3X3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
                    Bin {activeBinDetail.id}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono-tech">
                    {activeBinDetail.zone} • Aisle {activeBinDetail.aisle}, Shelf {activeBinDetail.shelf}, Tier {activeBinDetail.tier}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveBinDetail(null)}
                className="text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
              <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-200 space-y-0.5">
                <div className="text-stone-400 text-[10px] uppercase font-semibold">Occupancy</div>
                <div className="text-base font-bold text-stone-900">
                  {activeBinDetail.currentOccupancy} / {activeBinDetail.capacity} Units
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBF9] border border-stone-200 space-y-0.5">
                <div className="text-stone-400 text-[10px] uppercase font-semibold">Weight Limit</div>
                <div className="text-base font-bold text-stone-900">
                  Max {activeBinDetail.maxWeightKg} kg
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono-tech font-bold text-stone-900 uppercase">
                Assigned SKUs in this Bin
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getProductsInBin(activeBinDetail.id).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-stone-200 bg-[#FBFBF9] flex items-center justify-between text-xs font-mono-tech"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover border border-stone-200" />
                      <div>
                        <div className="font-bold text-stone-900">{prod.name}</div>
                        <div className="text-[10px] text-stone-500">{prod.sku}</div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-stone-900">
                      {prod.availableStock} Free / {prod.reservedStock} Held
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs font-mono-tech">
              <button
                onClick={() => {
                  handleCycleCountTrigger(activeBinDetail.id);
                  setActiveBinDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold cursor-pointer"
              >
                Schedule Cycle Count
              </button>
              <button
                onClick={() => setActiveBinDetail(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
