import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product } from '../../types';
import {
  X,
  Scale,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Trash2,
  Sparkles,
  Truck,
  Layers
} from 'lucide-react';

export const ProductComparisonModal: React.FC = () => {
  const {
    comparisonList,
    removeFromComparison,
    clearComparison,
    isComparisonOpen,
    setIsComparisonOpen,
    addToCart,
    setIsCartOpen,
    setSelectedProductId
  } = useWarehouse();

  if (!isComparisonOpen || comparisonList.length === 0) return null;

  // Extract all unique spec keys across all products in comparison
  const allSpecKeys: string[] = Array.from(
    new Set<string>(
      comparisonList.flatMap((p) => Object.keys(p.specs || {}))
    )
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E7E5E0] max-w-5xl w-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-lg text-stone-900">
                Hardware Spec Matrix & Comparison
              </h2>
              <p className="text-xs text-stone-500 font-mono-tech">
                Comparing {comparisonList.length} of 4 items side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearComparison}
              className="px-3 py-1.5 text-xs font-mono-tech text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsComparisonOpen(false)}
              className="p-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-full text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Table Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Top Product Cards Grid */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `180px repeat(${comparisonList.length}, minmax(200px, 1fr))`
            }}
          >
            {/* Corner Cell */}
            <div className="flex flex-col justify-end p-3 text-xs font-mono-tech font-bold uppercase tracking-wider text-stone-500">
              Selected Units
            </div>

            {/* Product Column Headers */}
            {comparisonList.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 relative flex flex-col justify-between space-y-3"
              >
                <button
                  onClick={() => removeFromComparison(product.id)}
                  className="absolute top-2 right-2 p-1 text-stone-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                  title="Remove from compare"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-xl border border-stone-200 bg-white"
                  />
                  <div className="text-[10px] font-mono-tech text-stone-500 uppercase">
                    {product.category}
                  </div>
                  <h3 className="font-serif-luxury font-bold text-sm text-stone-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-base font-bold font-serif-luxury text-stone-900">
                    ₹{product.price.toLocaleString()}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      setIsCartOpen(true);
                    }}
                    className="w-full py-2 bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsComparisonOpen(false);
                      setSelectedProductId(product.id);
                    }}
                    className="w-full py-1.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-mono-tech font-semibold uppercase tracking-wider rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Key Attributes Comparison */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-stone-100/70 border-b border-stone-200 text-xs font-mono-tech font-bold uppercase tracking-wider text-stone-700">
              Warehouse Telemetry & Availability
            </div>

            {/* Warehouse Stock Health */}
            <div
              className="grid px-4 py-3 border-b border-stone-100 items-center text-xs font-mono-tech"
              style={{
                gridTemplateColumns: `180px repeat(${comparisonList.length}, minmax(200px, 1fr))`
              }}
            >
              <span className="font-bold text-stone-600 uppercase">Physical Stock</span>
              {comparisonList.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 text-stone-900 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{p.availableStock} in Bin {p.binLocation}</span>
                </div>
              ))}
            </div>

            {/* Delivery Confidence */}
            <div
              className="grid px-4 py-3 border-b border-stone-100 items-center text-xs font-mono-tech"
              style={{
                gridTemplateColumns: `180px repeat(${comparisonList.length}, minmax(200px, 1fr))`
              }}
            >
              <span className="font-bold text-stone-600 uppercase">Delivery SLA</span>
              {comparisonList.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Truck className="w-3.5 h-3.5 text-stone-700" />
                  <span>{p.deliveryConfidence}% on-time rate</span>
                </div>
              ))}
            </div>

            {/* AI Verdict */}
            <div
              className="grid px-4 py-3 border-b border-stone-100 items-start text-xs font-sans"
              style={{
                gridTemplateColumns: `180px repeat(${comparisonList.length}, minmax(200px, 1fr))`
              }}
            >
              <span className="font-bold font-mono-tech text-stone-600 uppercase pt-1">
                AI Recommendation
              </span>
              {comparisonList.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                  <div className="flex items-center gap-1 text-stone-900 font-bold mb-1 font-mono-tech text-[11px]">
                    <Sparkles className="w-3 h-3 text-stone-600" />
                    <span>VERDICT</span>
                  </div>
                  {p.aiVerdict}
                </div>
              ))}
            </div>

            {/* Technical Specifications Matrix */}
            <div className="px-4 py-3 bg-stone-100/70 border-b border-stone-200 text-xs font-mono-tech font-bold uppercase tracking-wider text-stone-700">
              Technical Specifications
            </div>

            {allSpecKeys.map((key) => (
              <div
                key={key}
                className="grid px-4 py-3 border-b border-stone-100 last:border-0 items-center text-xs font-sans hover:bg-stone-50/50"
                style={{
                  gridTemplateColumns: `180px repeat(${comparisonList.length}, minmax(200px, 1fr))`
                }}
              >
                <span className="font-semibold text-stone-600 font-mono-tech text-[11px]">{key}</span>
                {comparisonList.map((p) => (
                  <div key={p.id} className="text-stone-800 text-xs font-mono-tech">
                    {p.specs?.[key] || '—'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
