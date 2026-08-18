import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Search,
  Terminal,
  ShoppingBag,
  Heart,
  Truck,
  Layers,
  Sparkles,
  Zap,
  User,
  Scale,
  X,
  ArrowRight,
  Package
} from 'lucide-react';

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    products,
    orders,
    setActiveCustomerNavTab,
    setActivePortal,
    setSelectedProductId,
    setSelectedTrackingOrderId,
    setIsCartOpen,
    setIsComparisonOpen,
    runHeroSimulationStep,
  } = useWarehouse();

  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const navigationCommands = [
    { label: 'Open Hardware Catalog', icon: ShoppingBag, tab: 'SHOP' },
    { label: 'Explore Curated Categories', icon: Layers, tab: 'CATEGORIES' },
    { label: 'View Flash Deals & Coupons', icon: Zap, tab: 'DEALS' },
    { label: 'Launch AI Hardware Concierge', icon: Sparkles, tab: 'AI_SHOP' },
    { label: 'View Saved Wishlist', icon: Heart, tab: 'WISHLIST' },
    { label: 'Track Consignments & Invoices', icon: Truck, tab: 'ORDERS' },
    { label: 'Delivery Addresses & Account', icon: User, tab: 'ACCOUNT' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-white border border-[#E7E5E0] max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[80vh]">
        {/* Search Input Top Bar */}
        <div className="p-4 border-b border-[#E7E5E0] flex items-center gap-3 bg-stone-50/70">
          <Search className="w-5 h-5 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, SKU, product, or order ID (e.g. #1042, Tensor, Laptop)..."
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none font-sans"
            autoFocus
          />
          <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-600 font-mono-tech text-[10px] uppercase font-bold">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Navigation Commands */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400 px-3">
              NAVIGATION COMMANDS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navigationCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveCustomerNavTab(cmd.tab as any);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-stone-100 flex items-center gap-3 text-left transition-colors cursor-pointer text-xs font-mono-tech text-stone-800"
                  >
                    <Icon className="w-4 h-4 text-stone-600" />
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Commands */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400 px-3">
              SYSTEM & SIMULATION COMMANDS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setActivePortal('ADMIN');
                  setIsCommandPaletteOpen(false);
                }}
                className="p-2.5 rounded-xl hover:bg-stone-100 flex items-center gap-3 text-left transition-colors cursor-pointer text-xs font-mono-tech text-stone-800"
              >
                <Terminal className="w-4 h-4 text-stone-600" />
                <span>Switch to Warehouse Admin Hub</span>
              </button>

              <button
                onClick={() => {
                  setIsComparisonOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="p-2.5 rounded-xl hover:bg-stone-100 flex items-center gap-3 text-left transition-colors cursor-pointer text-xs font-mono-tech text-stone-800"
              >
                <Scale className="w-4 h-4 text-stone-600" />
                <span>Open Hardware Compare Matrix</span>
              </button>
            </div>
          </div>

          {/* Matching Products */}
          {filteredProducts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400 px-3">
                MATCHING HARDWARE SKUS ({filteredProducts.length})
              </div>
              <div className="space-y-1">
                {filteredProducts.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                      />
                      <div>
                        <h4 className="font-serif-luxury font-bold text-xs text-stone-900">{p.name}</h4>
                        <span className="text-[11px] font-mono-tech text-stone-500">
                          SKU: {p.sku} • Bin: {p.binLocation} • ₹{p.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Orders */}
          {filteredOrders.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400 px-3">
                MATCHING ORDERS & CONSIGNMENTS ({filteredOrders.length})
              </div>
              <div className="space-y-1">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedTrackingOrderId(o.id);
                      setActiveCustomerNavTab('ORDERS');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-stone-700" />
                      <div>
                        <h4 className="font-serif-luxury font-bold text-xs text-stone-900">
                          Consignment {o.id} ({o.items.length} items)
                        </h4>
                        <span className="text-[11px] font-mono-tech text-stone-500">
                          Status: {o.status} • Total: ₹{o.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono-tech font-bold text-stone-800 flex items-center gap-1">
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
