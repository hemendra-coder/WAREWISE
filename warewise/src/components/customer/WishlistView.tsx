import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Heart,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Scale,
  ArrowRight,
  Sparkles,
  Truck
} from 'lucide-react';

export const WishlistView: React.FC = () => {
  const {
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    setIsCartOpen,
    addToComparison,
    setSelectedProductId,
    setActiveCustomerNavTab
  } = useWarehouse();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      addToCart(p, 1);
    });
    setIsCartOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E0]">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-current" />
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
              Saved Hardware Wishlist ({wishlistedProducts.length})
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-mono-tech mt-1">
            Real-time price tracking and priority reservation alerts
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Bag ({wishlistedProducts.length})</span>
          </button>
        )}
      </div>

      {/* Wishlist Items Grid */}
      {wishlistedProducts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-[#E7E5E0] text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif-luxury font-bold text-lg text-stone-800">
            Your saved wishlist is currently empty
          </h3>
          <p className="text-xs text-stone-500 font-mono-tech max-w-sm mx-auto">
            Browse our hardware catalog to bookmark items, track price drops, and lock inventory allocations.
          </p>
          <button
            onClick={() => setActiveCustomerNavTab('SHOP')}
            className="px-6 py-3 bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Explore Hardware Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedProducts.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white border border-[#E7E5E0] hover:border-stone-400 transition-all flex flex-col justify-between space-y-4 shadow-lux group relative"
            >
              <button
                onClick={() => toggleWishlist(p.id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

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
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech font-bold bg-stone-900/90 text-white backdrop-blur-sm">
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

                <div className="flex items-center justify-between text-xs font-mono-tech pt-2 border-t border-[#F0EFEA]">
                  <span className="text-lg font-bold font-serif-luxury text-stone-900">
                    ₹{p.price.toLocaleString()}
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.availableStock} in Bin {p.binLocation}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => addToComparison(p)}
                  className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono-tech font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </button>
                <button
                  onClick={() => {
                    addToCart(p, 1);
                    setIsCartOpen(true);
                  }}
                  className="py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
