import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product } from '../../types';
import {
  Cpu,
  Bot,
  Headphones,
  Eye,
  Zap,
  Server,
  Smartphone,
  Laptop,
  Home,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

export const CategoryBrowseView: React.FC = () => {
  const {
    products,
    setSelectedCategoryFilter,
    setActiveCustomerNavTab,
    addToCart,
    setIsCartOpen,
    setSelectedProductId
  } = useWarehouse();

  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const categoryDefinitions = [
    {
      id: 'ALL',
      name: 'All Categories',
      icon: Layers,
      count: products.length,
      desc: 'Complete catalog of enterprise & consumer hardware'
    },
    {
      id: 'Edge Computing',
      name: 'Edge Computing & AI Accelerators',
      icon: Cpu,
      count: products.filter((p) => p.category === 'Edge Computing').length,
      desc: 'Tensor inference boards, neural processing modules & industrial compute'
    },
    {
      id: 'Computers & Laptops',
      name: 'Computers & Workstations',
      icon: Laptop,
      count: products.filter((p) => p.category === 'Computers & Laptops').length,
      desc: 'Pro workstations, high-throughput developer laptops & servers'
    },
    {
      id: 'Mobiles & 5G',
      name: 'Mobiles & 5G Devices',
      icon: Smartphone,
      count: products.filter((p) => p.category === 'Mobiles & 5G').length,
      desc: 'Titanium flagships, periscope zoom optics & satellite links'
    },
    {
      id: 'Robotics & IoT',
      name: 'Robotics & IoT Sensors',
      icon: Bot,
      count: products.filter((p) => p.category === 'Robotics & IoT').length,
      desc: 'LoRaWAN mesh nodes, telemetry gateways & robotic controllers'
    },
    {
      id: 'Smart Audio',
      name: 'Smart Audio & Acoustic Lab',
      icon: Headphones,
      count: products.filter((p) => p.category === 'Smart Audio').length,
      desc: 'Studio reference monitors, beryllium dynamic drivers & planar magnetic'
    },
    {
      id: 'Displays & Vision',
      name: 'Displays & Vision Optics',
      icon: Eye,
      count: products.filter((p) => p.category === 'Displays & Vision').length,
      desc: 'Color-calibrated OLED panels, ultrawide curves & machine vision cameras'
    },
    {
      id: 'Smart Home & Living',
      name: 'Smart Home & Automation',
      icon: Home,
      count: products.filter((p) => p.category === 'Smart Home & Living').length,
      desc: 'LiDAR autonomous robotic vacuums, climate controllers & smart hubs'
    },
    {
      id: 'Power & Energy',
      name: 'Power & Energy Storage',
      icon: Zap,
      count: products.filter((p) => p.category === 'Power & Energy').length,
      desc: 'Solid-state backup batteries, bidirectional GaN inverters & solar arrays'
    },
    {
      id: 'Daily Essentials',
      name: 'Daily Tech Essentials',
      icon: Server,
      count: products.filter((p) => p.category === 'Daily Essentials').length,
      desc: '240W multi-port GaN chargers, braided cables & pro accessories'
    },
  ];

  const displayedProducts = products.filter((p) => {
    if (selectedCat === 'ALL') return true;
    return p.category === selectedCat;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Category Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 text-white shadow-lux relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-mono-tech uppercase tracking-wider text-stone-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>DISCOVERY MATRIX // ALL CATEGORIES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold tracking-tight">
            Curated Hardware Taxonomy
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans">
            Every category is physically partitioned and temperature-controlled across WH-METRO-01 zones for zero-latency pick routes and same-day dispatch.
          </p>
        </div>
      </div>

      {/* Category Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryDefinitions.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCat === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                  : 'bg-white text-stone-900 border-[#E7E5E0] hover:border-stone-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-mono-tech px-2.5 py-1 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {cat.count} SKUs
                </span>
              </div>

              <div>
                <h3 className="font-serif-luxury font-bold text-base tracking-tight mb-1">
                  {cat.name}
                </h3>
                <p
                  className={`text-xs leading-relaxed font-sans line-clamp-2 ${
                    isSelected ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {cat.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1 text-xs font-mono-tech font-bold uppercase tracking-wider">
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtered Products Display */}
      <div className="space-y-4 pt-4 border-t border-[#E7E5E0]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif-luxury font-bold text-stone-900">
              {selectedCat === 'ALL' ? 'All Hardware Products' : `${selectedCat} Selection`}
            </h2>
            <p className="text-xs text-stone-500 font-mono-tech">
              Showing {displayedProducts.length} verified available units
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-white border border-[#E7E5E0] hover:border-stone-400 transition-all flex flex-col justify-between space-y-4 shadow-lux group"
            >
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
                  onClick={() => setSelectedProductId(p.id)}
                  className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer font-sans"
                >
                  Inspect
                </button>
                <button
                  onClick={() => {
                    addToCart(p, 1);
                    setIsCartOpen(true);
                  }}
                  className="py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
