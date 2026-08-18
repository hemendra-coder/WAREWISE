import React, { useState, useRef, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { PerformanceMonitor } from '../common/PerformanceMonitor';
import {
  ShoppingBag,
  Search,
  Truck,
  Heart,
  User,
  Sparkles,
  Layers,
  Zap,
  Tag,
  Mic,
  Camera,
  Bell,
  MapPin,
  ChevronDown,
  X,
  CheckCircle2,
  LogOut,
  SlidersHorizontal,
  Package,
  ShieldCheck,
  Sun,
  Moon,
  Activity
} from 'lucide-react';

interface CustomerHeaderProps {
  onOpenCart: () => void;
  onOpenChat: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  onOpenCart,
  onOpenChat,
}) => {
  const {
    cartCount,
    cartSubtotal,
    orders,
    wishlist,
    activeCustomerNavTab,
    setActiveCustomerNavTab,
    customerSearchQuery,
    setCustomerSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    products,
    setSelectedProductId,
    setIsVoiceSearchOpen,
    setIsImageSearchOpen,
    notifications,
    unreadNotificationCount,
    markNotificationsRead,
    currentUser,
    isAuthenticated,
    openAuthModal,
    logoutCustomer,
    customerAddresses,
    selectedAddressId,
    setIsAdminLoginModalOpen,
    setActivePortal,
    isDarkMode,
    toggleDarkMode,
  } = useWarehouse();

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPerfOpen, setIsPerfOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const activeAddress = customerAddresses.find((a) => a.id === selectedAddressId) || customerAddresses[0];

  // Search Suggestions filtered from product list
  const searchSuggestions = customerSearchQuery.trim()
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(customerSearchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const categories = [
    'All Categories',
    'Edge Computing',
    'Robotics & IoT',
    'Smart Audio',
    'Displays & Vision',
    'Power & Energy',
    'Pro Hardware',
    'Mobiles & 5G',
    'Computers & Laptops',
  ];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    if (activeCustomerNavTab !== 'SHOP') {
      setActiveCustomerNavTab('SHOP');
    }
  };

  const handleSelectSuggestion = (productId: string) => {
    setSelectedProductId(productId);
    setShowSearchSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs select-none">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-[11px]">
              Deliver to {activeAddress ? `${activeAddress.name.split(' ')[0]} - ${activeAddress.city} ${activeAddress.pincode}` : 'Select Location'}
            </span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-[11px] text-slate-400">
            Same-Day Dispatch for orders placed before 3:00 PM
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={() => setActiveCustomerNavTab('DEALS')}
            className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Today's Deals</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setActiveCustomerNavTab('ORDERS')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Track Order
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setIsPerfOpen(true)}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-mono text-[10px] text-amber-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
            title="Open Performance & Bug Telemetry HUD"
          >
            <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>99.8% System Health</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={onOpenChat}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>AI Concierge</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setActivePortal('ADMIN')}
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700"
            title="Return to Admin Operations Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Operations Portal</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveCustomerNavTab('SHOP');
              setSelectedCategoryFilter('ALL');
              setCustomerSearchQuery('');
            }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
              W
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                <span>WareWise</span>
                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-200">
                  Store
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Enterprise & Hardware</p>
            </div>
          </div>

          {/* Search Bar with Category Selector */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              {/* Category Dropdown */}
              <div className="relative hidden md:block">
                <select
                  value={selectedCategoryFilter === 'ALL' ? 'All Categories' : selectedCategoryFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCategoryFilter(val === 'All Categories' ? 'ALL' : val);
                    if (activeCustomerNavTab !== 'SHOP') setActiveCustomerNavTab('SHOP');
                  }}
                  className="h-10 pl-3 pr-8 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-l-lg border border-r-0 border-slate-300 focus:outline-none cursor-pointer appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3.5 pointer-events-none" />
              </div>

              {/* Input Field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  placeholder="Search edge AI accelerators, robotics, audio, workstations, or SKU..."
                  className="w-full h-10 pl-3.5 pr-20 bg-white border border-slate-300 rounded-l-lg md:rounded-l-none rounded-r-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {customerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSearchQuery('');
                      setShowSearchSuggestions(false);
                    }}
                    className="absolute right-14 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Voice / Image Search Triggers */}
                <div className="absolute right-2 top-2 flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setIsVoiceSearchOpen(true)}
                    className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    title="Voice Search"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImageSearchOpen(true)}
                    className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    title="Visual Search by Image"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="h-10 px-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 font-semibold rounded-r-lg border border-amber-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Matching Products & SKUs
                </div>
                <div className="divide-y divide-slate-100">
                  {searchSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.id)}
                      className="p-2.5 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="text-blue-600 font-medium">{item.category}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-800">₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Controls & Cart Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* System-Wide Dark Mode Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode (Reduces eye strain in low-light environments)'}
              className="p-2 text-slate-700 dark:text-stone-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-stone-300" aria-hidden="true" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <div ref={notifMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  markNotificationsRead();
                }}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    <span className="text-[10px] text-slate-500">Live order & price updates</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setActiveCustomerNavTab('WISHLIST')}
              className={`p-2 rounded-lg transition-colors relative cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-medium ${
                activeCustomerNavTab === 'WISHLIST'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Saved Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="text-xs font-bold text-slate-800">({wishlist.length})</span>
              )}
            </button>

            {/* Returns & Orders */}
            <button
              onClick={() => setActiveCustomerNavTab('ORDERS')}
              className="text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer hidden md:block"
            >
              <div className="text-[10px] text-slate-500 leading-none">Returns</div>
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>& Orders</span>
                {orders.length > 0 && (
                  <span className="w-4 h-4 bg-blue-100 text-blue-800 rounded-full text-[10px] flex items-center justify-center font-bold">
                    {orders.length}
                  </span>
                )}
              </div>
            </button>

            {/* Account Menu */}
            <div ref={accountMenuRef} className="relative">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('LOGIN');
                  } else {
                    setShowAccountDropdown(!showAccountDropdown);
                  }
                }}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
                  {isAuthenticated && currentUser.name ? currentUser.name.charAt(0) : <User className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="hidden lg:block">
                  <div className="text-[10px] text-slate-500 leading-none">
                    {isAuthenticated ? `Hello, ${currentUser.name.split(' ')[0]}` : 'Hello, Sign In'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-0.5">
                    <span>Account & Lists</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </button>

              {/* Account Dropdown Modal */}
              {showAccountDropdown && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-fadeIn text-xs">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100">
                    <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                    <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Customer</span>
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    <button
                      onClick={() => {
                        setActiveCustomerNavTab('ACCOUNT');
                        setShowAccountDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Your Profile & Details</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveCustomerNavTab('ORDERS');
                        setShowAccountDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Your Orders & History</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveCustomerNavTab('WISHLIST');
                        setShowAccountDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Saved Wishlist ({wishlist.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAdminLoginModalOpen(true);
                        setShowAccountDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Staff & Admin Control Center</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setShowAccountDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              id="customer-cart-header-btn"
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[10px] text-slate-400 leading-none">Cart</div>
                <div className="text-xs font-bold text-amber-300 leading-tight">
                  ₹{cartSubtotal.toLocaleString()}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Category Ribbon */}
      <nav className="bg-slate-50 border-t border-slate-200 px-4 sm:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5 text-xs font-medium whitespace-nowrap">
          <button
            onClick={() => {
              setSelectedCategoryFilter('ALL');
              setActiveCustomerNavTab('SHOP');
            }}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryFilter === 'ALL' && activeCustomerNavTab === 'SHOP'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Catalog</span>
          </button>

          {[
            'Edge Computing',
            'Robotics & IoT',
            'Smart Audio',
            'Displays & Vision',
            'Power & Energy',
            'Pro Hardware',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategoryFilter(cat);
                setActiveCustomerNavTab('SHOP');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedCategoryFilter === cat && activeCustomerNavTab === 'SHOP'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => setActiveCustomerNavTab('DEALS')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-amber-700 font-semibold ${
              activeCustomerNavTab === 'DEALS' ? 'bg-amber-100 text-amber-900' : 'hover:bg-amber-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Flash Deals</span>
          </button>

          <button
            onClick={onOpenChat}
            className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Shopping Advisor</span>
          </button>
        </div>
      </nav>

      {/* Performance & Bug Telemetry HUD Modal */}
      <PerformanceMonitor
        isOpen={isPerfOpen}
        onClose={() => setIsPerfOpen(false)}
      />
    </header>
  );
};
