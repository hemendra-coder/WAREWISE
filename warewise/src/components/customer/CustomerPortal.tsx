import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { CustomerHeader } from './CustomerHeader';
import { CustomerFooter } from './CustomerFooter';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { CustomerAccountView } from './CustomerAccountView';
import { CustomerOrdersView } from './CustomerOrdersView';
import { CustomerTrackingView } from './CustomerTrackingView';
import { WishlistView } from './WishlistView';
import { DealsView } from './DealsView';
import { CategoryBrowseView } from './CategoryBrowseView';
import { CartDrawer } from './CartDrawer';
import { CustomerAIChat } from './CustomerAIChat';
import { VoiceSearchModal } from './VoiceSearchModal';
import { ImageSearchModal } from './ImageSearchModal';
import { ProductComparisonModal } from './ProductComparisonModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { CheckoutModal } from './CheckoutModal';
import { CustomerAuthModal } from '../auth/CustomerAuthModal';
import {
  SlidersHorizontal,
  Grid,
  List,
  Star,
  Zap,
  Tag,
  Truck,
  Heart,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Cpu,
  Bot,
  Volume2,
  Monitor,
  BatteryCharging,
  Server
} from 'lucide-react';
import { Product } from '../../types';

export const CustomerPortal: React.FC = () => {
  const {
    products,
    activeCustomerNavTab,
    setActiveCustomerNavTab,
    customerSearchQuery,
    setCustomerSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    productSortOption,
    setProductSortOption,
    priceFilterRange,
    setPriceFilterRange,
    minRatingFilter,
    setMinRatingFilter,
    inStockOnlyFilter,
    setInStockOnlyFilter,
    viewMode,
    setViewMode,
    selectedProductId,
    setSelectedProductId,
    wishlist,
    toggleWishlist,
    addToCart,
    isCartOpen,
    setIsCartOpen,
    isAiChatOpen,
    setIsAiChatOpen,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    setCheckoutStep,
  } = useWarehouse();

  // Hero carousel banner index
  const [heroSlide, setHeroSlide] = useState(0);

  const heroBanners = [
    {
      badge: 'ENTERPRISE EDGE HARDWARE',
      title: 'Autonomous Edge AI Accelerators',
      subtitle: 'Neural Compute clusters ready for immediate deployment. Pre-configured with TensorRT & CUDA 12.4.',
      cta: 'Explore Edge Compute',
      category: 'Edge Computing',
      bgClass: 'from-slate-900 via-blue-950 to-slate-900',
      accentColor: 'text-blue-400',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
    },
    {
      badge: 'ROBOTICS & EMBEDDED VISION',
      title: 'Multi-Sensor Robotics Development Kits',
      subtitle: 'Industrial LiDAR, stereoscopic optical depth cameras, and RTK-GPS integration for automation labs.',
      cta: 'Shop Robotics Hardware',
      category: 'Robotics & IoT',
      bgClass: 'from-slate-950 via-purple-950 to-slate-900',
      accentColor: 'text-purple-400',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      badge: 'COLOR-CRITICAL WORKSTATIONS',
      title: 'VisionMatrix 34" QD-OLED Master Displays',
      subtitle: '175Hz refresh rate with 99.3% DCI-P3 coverage and 0.03ms pixel response for hardware designers.',
      cta: 'View Master Displays',
      category: 'Displays & Vision',
      bgClass: 'from-slate-900 via-emerald-950 to-slate-900',
      accentColor: 'text-emerald-400',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const categories = [
    { id: 'ALL', name: 'All Products', icon: Layers, count: products.length },
    { id: 'Edge Computing', name: 'Edge Computing', icon: Cpu, count: products.filter((p) => p.category === 'Edge Computing').length },
    { id: 'Robotics & IoT', name: 'Robotics & IoT', icon: Bot, count: products.filter((p) => p.category === 'Robotics & IoT').length },
    { id: 'Smart Audio', name: 'Smart Audio', icon: Volume2, count: products.filter((p) => p.category === 'Smart Audio').length },
    { id: 'Displays & Vision', name: 'Displays & Vision', icon: Monitor, count: products.filter((p) => p.category === 'Displays & Vision').length },
    { id: 'Power & Energy', name: 'Power & Energy', icon: BatteryCharging, count: products.filter((p) => p.category === 'Power & Energy').length },
    { id: 'Pro Hardware', name: 'Pro Hardware', icon: Server, count: products.filter((p) => p.category === 'Pro Hardware').length },
  ];

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search Query
        if (
          customerSearchQuery.trim() &&
          !p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) &&
          !p.category.toLowerCase().includes(customerSearchQuery.toLowerCase()) &&
          !p.sku.toLowerCase().includes(customerSearchQuery.toLowerCase())
        ) {
          return false;
        }

        // Category
        if (selectedCategoryFilter !== 'ALL' && p.category !== selectedCategoryFilter) {
          return false;
        }

        // Price Range
        if (p.price < priceFilterRange[0] || p.price > priceFilterRange[1]) {
          return false;
        }

        // Rating
        if (minRatingFilter > 0 && p.rating < minRatingFilter) {
          return false;
        }

        // In Stock Only
        if (inStockOnlyFilter && p.availableStock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (productSortOption === 'PRICE_LOW_HIGH') return a.price - b.price;
        if (productSortOption === 'PRICE_HIGH_LOW') return b.price - a.price;
        if (productSortOption === 'RATING') return b.rating - a.rating;
        return 0; // FEATURED
      });
  }, [
    products,
    customerSearchQuery,
    selectedCategoryFilter,
    priceFilterRange,
    minRatingFilter,
    inStockOnlyFilter,
    productSortOption,
  ]);

  // Main Content Tab Renderer
  const renderTabContent = () => {
    switch (activeCustomerNavTab) {
      case 'ACCOUNT':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <CustomerAccountView />
          </div>
        );
      case 'ORDERS':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <CustomerOrdersView />
          </div>
        );
      case 'TRACKING':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <CustomerTrackingView />
          </div>
        );
      case 'WISHLIST':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <WishlistView />
          </div>
        );
      case 'DEALS':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <DealsView />
          </div>
        );
      case 'CATEGORIES':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
            <CategoryBrowseView />
          </div>
        );
      case 'SHOP':
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
            {/* Hero Banner Carousel */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <div
                className={`bg-gradient-to-r ${heroBanners[heroSlide].bgClass} p-8 sm:p-12 text-white min-h-[300px] flex flex-col justify-between transition-all duration-500 relative overflow-hidden`}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 hidden md:block pointer-events-none">
                  <img
                    src={heroBanners[heroSlide].image}
                    alt="banner background"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="max-w-xl space-y-3 z-10">
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded text-[11px] font-bold tracking-wider uppercase border border-white/20 text-slate-200">
                    {heroBanners[heroSlide].badge}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                    {heroBanners[heroSlide].title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {heroBanners[heroSlide].subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(heroBanners[heroSlide].category);
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{heroBanners[heroSlide].cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAiChatOpen(true)}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ask AI Advisor</span>
                    </button>
                  </div>
                </div>

                {/* Carousel Slide Dots */}
                <div className="flex items-center gap-2 pt-6 z-10">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        heroSlide === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Category Icons Quick Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategoryFilter === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-100 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:shadow-xs'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold leading-tight line-clamp-1">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">({cat.count})</div>
                  </button>
                );
              })}
            </div>

            {/* Main Dual-Column Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Filter Sidebar (3 cols) */}
              <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Filters</span>
                  </div>
                  {(selectedCategoryFilter !== 'ALL' ||
                    minRatingFilter > 0 ||
                    inStockOnlyFilter ||
                    customerSearchQuery.trim() !== '') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter('ALL');
                        setMinRatingFilter(0);
                        setInStockOnlyFilter(false);
                        setPriceFilterRange([0, 150000]);
                        setCustomerSearchQuery('');
                      }}
                      className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">Categories</h4>
                  <div className="space-y-1 text-xs">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(c.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCategoryFilter === c.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({c.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800">Price Brackets</h4>
                  <div className="space-y-1 text-xs">
                    {[
                      { label: 'All Prices', min: 0, max: 150000 },
                      { label: 'Under ₹5,000', min: 0, max: 5000 },
                      { label: '₹5,000 - ₹25,000', min: 5000, max: 25000 },
                      { label: '₹25,000 - ₹75,000', min: 25000, max: 75000 },
                      { label: 'Above ₹75,000', min: 75000, max: 150000 },
                    ].map((bracket, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPriceFilterRange([bracket.min, bracket.max])}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          priceFilterRange[0] === bracket.min && priceFilterRange[1] === bracket.max
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {bracket.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Rating Filter */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800">Customer Rating</h4>
                  <div className="space-y-1 text-xs">
                    {[
                      { rating: 4, label: '4 Stars & Above' },
                      { rating: 3, label: '3 Stars & Above' },
                      { rating: 0, label: 'All Ratings' },
                    ].map((r) => (
                      <button
                        key={r.rating}
                        type="button"
                        onClick={() => setMinRatingFilter(r.rating)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                          minRatingFilter === r.rating
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r.rating > 0 ? (
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="ml-1 text-[11px] text-slate-700">& up</span>
                          </div>
                        ) : (
                          <span>All Ratings</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <h4 className="font-bold text-xs text-slate-800">Availability</h4>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={inStockOnlyFilter}
                      onChange={(e) => setInStockOnlyFilter(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>In Stock Only (Ready for Allocation)</span>
                  </label>
                </div>
              </aside>

              {/* Right Product Grid (9 cols) */}
              <section className="lg:col-span-9 space-y-4">
                {/* Header Controls */}
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="text-xs text-slate-600">
                    Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> verified products
                    {selectedCategoryFilter !== 'ALL' && (
                      <span> in <strong className="text-blue-700">{selectedCategoryFilter}</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium hidden sm:inline">Sort:</span>
                      <select
                        value={productSortOption}
                        onChange={(e) => setProductSortOption(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="FEATURED">Featured Highlights</option>
                        <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                        <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                        <option value="RATING">Avg. Customer Review</option>
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setViewMode('GRID')}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          viewMode === 'GRID' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Grid View"
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('LIST')}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          viewMode === 'LIST' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="List View"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Grid / List */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm">No Matching Products Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try adjusting your search terms, price brackets, or clear filters to see full inventory.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter('ALL');
                        setMinRatingFilter(0);
                        setInStockOnlyFilter(false);
                        setCustomerSearchQuery('');
                        setPriceFilterRange([0, 150000]);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div
                    className={`grid gap-5 ${
                      viewMode === 'GRID'
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={(p) => setSelectedProductId(p.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Customer Top Header with Search & Navigation */}
      <CustomerHeader
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsAiChatOpen(true)}
      />

      {/* Main Tab Surface */}
      <main className="flex-1">
        <ErrorBoundary key={activeCustomerNavTab} sectionName={`Customer Store View: ${activeCustomerNavTab}`}>
          {renderTabContent()}
        </ErrorBoundary>
      </main>

      {/* Trust & Navigation Footer */}
      <CustomerFooter />

      {/* Global Customer Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setCheckoutStep('ADDRESS');
          setIsCheckoutModalOpen(true);
        }}
      />

      <CustomerAIChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onSelectProduct={(id) => {
          setSelectedProductId(id);
          setIsAiChatOpen(false);
        }}
      />

      <CustomerAuthModal />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />

      <VoiceSearchModal />
      <ImageSearchModal />
      <ProductComparisonModal />
      <CommandPaletteModal />

      {/* Selected Product Detail Modal */}
      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onOpenCheckout={() => {
            setSelectedProductId(null);
            setCheckoutStep('ADDRESS');
            setIsCheckoutModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
