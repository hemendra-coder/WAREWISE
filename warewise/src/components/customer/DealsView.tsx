import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Tag,
  Zap,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShoppingBag,
  Percent,
  TrendingDown
} from 'lucide-react';

export const DealsView: React.FC = () => {
  const {
    products,
    availableCoupons,
    applyCoupon,
    appliedCoupon,
    addToCart,
    setIsCartOpen,
    setSelectedProductId
  } = useWarehouse();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  // Products with significant original price discounts
  const dealProducts = products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (code: string) => {
    const res = applyCoupon(code);
    setApplyMessage(res.message);
    setTimeout(() => setApplyMessage(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Deals Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white shadow-lux relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-xs font-mono-tech uppercase tracking-wider text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>FLASH HARDWARE DISPATCH // LIMITED WAVE ALLOCATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold tracking-tight">
            AI-Engineered Deals & Tier-1 Coupons
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans">
            Direct-from-dock pricing applied to surplus buffer batches. Every promotional item is inspected, serial-tracked, and dispatched with full standard manufacturer warranty.
          </p>
        </div>
      </div>

      {/* Available Coupon Codes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif-luxury font-bold text-stone-900">
              Active Platform Coupons
            </h2>
            <p className="text-xs text-stone-500 font-mono-tech">
              Click apply to activate instant deductions on current and future orders
            </p>
          </div>
        </div>

        {applyMessage && (
          <div className="p-3.5 rounded-xl bg-stone-900 text-white text-xs font-mono-tech flex items-center gap-2 shadow-sm animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{applyMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableCoupons.map((coupon) => {
            const isApplied = appliedCoupon?.code === coupon.code;

            return (
              <div
                key={coupon.code}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isApplied
                    ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
                    : 'bg-white border-[#E7E5E0] hover:border-stone-400 shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-mono-tech text-xs font-bold tracking-wider">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] font-mono-tech text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{coupon.expiryDays}d left</span>
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {coupon.description}
                  </p>

                  <div className="text-[11px] font-mono-tech text-stone-500">
                    Min order: ₹{coupon.minOrderValue.toLocaleString()}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2">
                  <button
                    onClick={() => handleApply(coupon.code)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono-tech font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-900 hover:bg-black text-white'
                    }`}
                  >
                    {isApplied ? 'Activated' : 'Apply Coupon'}
                  </button>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-stone-700 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discounted Hardware Showcase */}
      <div className="space-y-4 pt-4 border-t border-[#E7E5E0]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif-luxury font-bold text-stone-900">
              Limited-Stock Clearance & Markdown Events
            </h2>
            <p className="text-xs text-stone-500 font-mono-tech">
              Save up to ₹30,000 on flagship accelerators and developer hardware
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealProducts.map((p) => {
            const savings = (p.originalPrice || 0) - p.price;
            const percentOff = Math.round((savings / (p.originalPrice || 1)) * 100);

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white border border-[#E7E5E0] hover:border-stone-400 transition-all flex flex-col justify-between space-y-4 shadow-lux group relative"
              >
                {/* Savings Pill */}
                <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-rose-600 text-white font-mono-tech font-bold text-[10px] uppercase rounded-full shadow-sm flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>{percentOff}% OFF (SAVE ₹{savings.toLocaleString()})</span>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedProductId(p.id)}
                    className="relative w-full h-48 rounded-xl overflow-hidden border border-[#E7E5E0] bg-stone-50 cursor-pointer"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech font-bold bg-white/90 backdrop-blur-sm text-stone-800 border border-[#E7E5E0]">
                      {p.category}
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => setSelectedProductId(p.id)}
                      className="font-serif-luxury font-bold text-base text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-sans line-clamp-2 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xl font-bold font-serif-luxury text-stone-900">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono-tech text-stone-400 line-through">
                      ₹{p.originalPrice?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-tech pt-2 border-t border-[#F0EFEA]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{p.availableStock} in Bin {p.binLocation}</span>
                    </span>
                    <span className="text-stone-500">
                      SLA: {p.deliveryConfidence}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setSelectedProductId(p.id)}
                    className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer font-sans"
                  >
                    Inspect Specs
                  </button>
                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      setIsCartOpen(true);
                    }}
                    className="py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Claim Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
