import React, { useState } from 'react';
import { useWarehouse, AdminModuleKey } from '../../context/WarehouseContext';
import { UserRole } from '../../types';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import { PerformanceMonitor } from '../common/PerformanceMonitor';
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  Megaphone,
  Percent,
  CreditCard,
  TrendingUp,
  Truck,
  AlertTriangle,
  Settings,
  Store,
  Search,
  Bell,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserCheck,
  Sparkles,
  Inbox,
  Boxes,
  FileText,
  Bot,
  BrainCircuit,
  Lock,
  Layers,
  HelpCircle,
  Plus,
  Sun,
  Moon,
  Activity,
  Gauge,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShopifyNavItem {
  key: AdminModuleKey;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeType?: 'danger' | 'neutral' | 'active';
  subItems?: { label: string; key: AdminModuleKey }[];
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeAdminModule,
    setActiveAdminModule,
    metrics,
    exceptions,
    supportTickets,
    activeAdminRole,
    setActiveAdminRole,
    hasPermission,
    currentUser,
    setIsAdminLoggedIn,
    logoutAdmin,
    setActivePortal,
    isDarkMode,
    toggleDarkMode,
  } = useWarehouse();

  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({
    ORDERS: true,
    PRODUCTS: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreHub, setSelectedStoreHub] = useState('WH-METRO-01 Hub (Bengaluru)');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [isPerfMonitorOpen, setIsPerfMonitorOpen] = useState(false);
  const [simulatedCrash, setSimulatedCrash] = useState(false);

  const storeHubs = [
    { id: 'WH-METRO-01', name: 'WareWise Central Metro', location: 'WH-METRO-01 Hub (Bengaluru)' },
    { id: 'WH-NORTH-02', name: 'WareWise North Region', location: 'WH-NORTH-02 Hub (Delhi NCR)' },
    { id: 'WH-WEST-03', name: 'WareWise West Region', location: 'WH-WEST-03 Hub (Mumbai)' },
  ];

  const toggleExpand = (catKey: string) => {
    setExpandedNav((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const unresolvedExceptions = exceptions.filter((e) => e.status !== 'RESOLVED').length;
  const openTicketsCount = supportTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  const roleOptions: { role: UserRole; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin' },
    { role: 'WAREHOUSE_ADMIN', label: 'Store Manager' },
    { role: 'DISPATCHER', label: 'Dispatch Operator' },
    { role: 'PICKER', label: 'Order Batcher / Picker' },
    { role: 'PACKER', label: 'Packing Specialist' },
    { role: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
    { role: 'OFFICIAL', label: 'Finance & Compliance' },
  ];

  return (
    <div className="min-h-screen bg-[#F1F2F4] dark:bg-[#0F1012] text-[#1A1A1A] dark:text-[#F3F4F6] flex flex-col font-sans antialiased transition-colors duration-200">
      {/* WCAG 2.1 AA Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-stone-950 focus:font-bold focus:rounded-lg font-mono text-xs shadow-2xl focus:outline-none focus:ring-2 focus:ring-stone-950"
      >
        Skip to main content
      </a>

      {/* Top Shopify Global Header Bar */}
      <header
        role="banner"
        aria-label="Global Warehouse Header Bar"
        className="h-14 bg-[#1A1A1A] text-white px-4 flex items-center justify-between border-b border-[#2C2C2C] shrink-0 sticky top-0 z-50"
      >
        <div className="flex items-center gap-4">
          {/* Store Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-[#2D3033] border border-white/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                W
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-white flex items-center gap-1">
                  WareWise Store
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </div>
                <div className="text-[10px] text-stone-400 font-mono">{selectedStoreHub.split(' ')[0]}</div>
              </div>
            </button>

            {showStoreDropdown && (
              <div className="absolute top-11 left-0 w-64 bg-[#2C2C2E] border border-stone-700 rounded-xl shadow-xl overflow-hidden z-50 text-xs">
                <div className="p-2.5 bg-stone-900 border-b border-stone-800 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  Active Warehouse Hub Nodes
                </div>
                {storeHubs.map((hub) => (
                  <div
                    key={hub.id}
                    onClick={() => {
                      setSelectedStoreHub(hub.location);
                      setShowStoreDropdown(false);
                    }}
                    className={`p-2.5 hover:bg-stone-800 cursor-pointer transition-colors flex items-center justify-between ${
                      selectedStoreHub === hub.location ? 'text-amber-400 font-bold bg-stone-800/60' : 'text-stone-300'
                    }`}
                  >
                    <div>
                      <div>{hub.name}</div>
                      <div className="text-[10px] text-stone-400">{hub.location}</div>
                    </div>
                    {selectedStoreHub === hub.location && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-stone-700">|</span>

          {/* Quick View Public Storefront Button */}
          <button
            type="button"
            onClick={() => setActivePortal('CUSTOMER')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
            title="Open Customer Front Storefront"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Online Storefront</span>
            <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block relative">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders, products, customers, or SKUs (⌘K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2C2C2E] border border-stone-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">
              ⌘K
            </span>
          </div>

          {/* Live Search Modal Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-[#2C2C2E] border border-stone-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-2">
              <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider px-2 py-1">
                Quick Navigation Results
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveAdminModule('03_ORDERS');
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 rounded hover:bg-stone-800 text-stone-200 flex items-center justify-between cursor-pointer"
                >
                  <span>Orders matching "{searchQuery}"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveAdminModule('13_PRODUCTS');
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 rounded hover:bg-stone-800 text-stone-200 flex items-center justify-between cursor-pointer"
                >
                  <span>Products & SKUs matching "{searchQuery}"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setActiveAdminModule('19_CUSTOMERS');
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 rounded hover:bg-stone-800 text-stone-200 flex items-center justify-between cursor-pointer"
                >
                  <span>Customer records matching "{searchQuery}"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Admin Utilities */}
        <div className="flex items-center gap-3">
          {/* Performance & Health Telemetry HUD Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsPerfMonitorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2C2C2E] hover:bg-[#38383B] text-amber-300 font-mono text-[11px] font-semibold border border-stone-700 transition-all cursor-pointer shadow-xs shrink-0"
            title="Open Performance Monitor & Bug Diagnostic Console"
          >
            <Activity className="w-3.5 h-3.5 text-[#E27B58] animate-pulse" />
            <span className="hidden sm:inline">99.8% Health</span>
            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">60 FPS</span>
          </button>

          {/* Dark Mode Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to Light Mode for day operations' : 'Switch to Dark Mode for low-light warehouse environments'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode (Reduces eye strain for warehouse staff in low-light environments)'}
            className="p-2 rounded-lg bg-[#2C2C2E] hover:bg-white/10 text-stone-300 hover:text-white transition-all cursor-pointer border border-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 flex items-center justify-center shrink-0"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-stone-300 hover:text-amber-300" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveAdminModule('16_ALERTS')}
            className="relative p-2 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Alerts & Telemetry"
          >
            <Bell className="w-4 h-4" />
            {unresolvedExceptions > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#1A1A1A]" />
            )}
          </button>

          {/* Network Connection Status Listener & Offline Queue Pill */}
          <NetworkStatusBanner />

          {/* Role Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#2C2C2E] px-2.5 py-1 rounded-lg border border-stone-700">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={activeAdminRole}
              onChange={(e) => setActiveAdminRole(e.target.value as UserRole)}
              className="bg-transparent text-xs text-stone-200 font-medium focus:outline-none cursor-pointer"
            >
              {roleOptions.map((r) => (
                <option key={r.role} value={r.role} className="bg-[#1A1A1A] text-white">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Logged in user profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-stone-900 font-bold text-xs flex items-center justify-center">
              HS
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-white leading-none">{currentUser?.name || 'Hemendra Sai'}</div>
              <div className="text-[10px] text-amber-400 font-mono leading-tight mt-0.5 uppercase tracking-wider">{activeAdminRole.replace('_', ' ')}</div>
            </div>
            <button
              onClick={() => logoutAdmin()}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              title="Sign Out to Login Page"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Temporary Pre-Publish Role Switcher Block Banner */}
      <div className="bg-[#1C1917] text-stone-300 border-b border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Temp Dev Simulator</span>
          </span>
          <span className="font-sans font-semibold text-stone-200">
            Active Operational Role:
          </span>
        </div>

        {/* Quick Role Switch Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {roleOptions.map((r) => {
            const isActive = activeAdminRole === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => setActiveAdminRole(r.role)}
                className={`px-3 py-1 rounded-md font-mono-tech text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-xs border border-amber-400'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/70'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Shell: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Shopify Left Navigation Sidebar */}
        <aside
          role="navigation"
          aria-label="Warehouse Admin Modules Navigation"
          className="w-60 bg-[#1E1F21] text-stone-300 border-r border-[#2D2F33] shrink-0 flex flex-col justify-between overflow-y-auto"
        >
          <div className="p-3 space-y-6">
            {/* Primary Main Menu */}
            <div className="space-y-1" role="list">
              {/* Home */}
              <button
                onClick={() => setActiveAdminModule('01_COMMAND')}
                aria-current={activeAdminModule === '01_COMMAND' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                  activeAdminModule === '01_COMMAND'
                    ? 'bg-[#303134] text-white font-semibold shadow-sm'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 shrink-0 text-stone-300" />
                <span>Home</span>
              </button>

              {/* Orders Group */}
              <div>
                <button
                  onClick={() => {
                    setActiveAdminModule('03_ORDERS');
                    toggleExpand('ORDERS');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeAdminModule === '03_ORDERS' || activeAdminModule === '08_DISPATCH'
                      ? 'bg-[#303134] text-white font-semibold'
                      : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Inbox className="w-4 h-4 shrink-0 text-stone-300" />
                    <span>Orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {metrics.criticalSlaCount > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {metrics.criticalSlaCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform ${
                        expandedNav.ORDERS ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedNav.ORDERS && (
                  <div className="ml-7 mt-1 pl-2 border-l border-stone-800 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => setActiveAdminModule('03_ORDERS')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:text-white cursor-pointer ${
                        activeAdminModule === '03_ORDERS' ? 'text-amber-400 font-semibold' : 'text-stone-400'
                      }`}
                    >
                      All Orders ({metrics.activeOrdersCount})
                    </button>
                    <button
                      onClick={() => setActiveAdminModule('08_DISPATCH')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:text-white cursor-pointer ${
                        activeAdminModule === '08_DISPATCH' ? 'text-amber-400 font-semibold' : 'text-stone-400'
                      }`}
                    >
                      Fulfillment & Shipping ({metrics.readyDispatchCount})
                    </button>
                    <button
                      onClick={() => setActiveAdminModule('03_ORDERS')}
                      className="w-full text-left py-1.5 px-2 text-stone-400 hover:text-white cursor-pointer"
                    >
                      Drafts
                    </button>
                    <button
                      onClick={() => setActiveAdminModule('03_ORDERS')}
                      className="w-full text-left py-1.5 px-2 text-stone-400 hover:text-white cursor-pointer"
                    >
                      Abandoned checkouts
                    </button>
                  </div>
                )}
              </div>

              {/* Products Group */}
              <div>
                <button
                  onClick={() => {
                    setActiveAdminModule('13_PRODUCTS');
                    toggleExpand('PRODUCTS');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeAdminModule === '13_PRODUCTS' || activeAdminModule === '02_INVENTORY'
                      ? 'bg-[#303134] text-white font-semibold'
                      : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 shrink-0 text-stone-300" />
                    <span>Products</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-500 transition-transform ${
                      expandedNav.PRODUCTS ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedNav.PRODUCTS && (
                  <div className="ml-7 mt-1 pl-2 border-l border-stone-800 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => setActiveAdminModule('13_PRODUCTS')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:text-white cursor-pointer ${
                        activeAdminModule === '13_PRODUCTS' ? 'text-amber-400 font-semibold' : 'text-stone-400'
                      }`}
                    >
                      Catalog & SKUs
                    </button>
                    <button
                      onClick={() => setActiveAdminModule('02_INVENTORY')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:text-white cursor-pointer ${
                        activeAdminModule === '02_INVENTORY' ? 'text-amber-400 font-semibold' : 'text-stone-400'
                      }`}
                    >
                      Inventory Balances
                    </button>
                    <button
                      onClick={() => setActiveAdminModule('13_PRODUCTS')}
                      className="w-full text-left py-1.5 px-2 text-stone-400 hover:text-white cursor-pointer"
                    >
                      Collections
                    </button>
                    <button
                      onClick={() => setActiveAdminModule('13_PRODUCTS')}
                      className="w-full text-left py-1.5 px-2 text-stone-400 hover:text-white cursor-pointer"
                    >
                      Transfers & POs
                    </button>
                  </div>
                )}
              </div>

              {/* Customers */}
              <button
                onClick={() => setActiveAdminModule('19_CUSTOMERS')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeAdminModule === '19_CUSTOMERS'
                    ? 'bg-[#303134] text-white font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 shrink-0 text-stone-300" />
                  <span>Customers</span>
                </div>
                {openTicketsCount > 0 && (
                  <span className="bg-stone-700 text-stone-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {openTicketsCount}
                  </span>
                )}
              </button>

              {/* Marketing & Promotions */}
              <button
                onClick={() => setActiveAdminModule('18_COMMERCE_SUITE')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeAdminModule === '18_COMMERCE_SUITE'
                    ? 'bg-[#303134] text-white font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0 text-stone-300" />
                <span>Marketing & Promos</span>
              </button>

              {/* Discounts */}
              <button
                onClick={() => setActiveAdminModule('18_COMMERCE_SUITE')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-[#2A2B2E] hover:text-white cursor-pointer"
              >
                <Percent className="w-4 h-4 shrink-0 text-stone-300" />
                <span>Discounts</span>
              </button>

              {/* Finances */}
              <button
                onClick={() => setActiveAdminModule('10_ANALYTICS')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeAdminModule === '10_ANALYTICS'
                    ? 'bg-[#303134] text-white font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0 text-stone-300" />
                <span>Finances</span>
              </button>

              {/* Analytics */}
              <button
                onClick={() => setActiveAdminModule('10_ANALYTICS')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-stone-300 hover:bg-[#2A2B2E] hover:text-white cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-stone-300" />
                <span>Analytics</span>
              </button>

              {/* Fulfillment & Floor Ops */}
              <button
                onClick={() => setActiveAdminModule('08_DISPATCH')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeAdminModule === '08_DISPATCH'
                    ? 'bg-[#303134] text-white font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4 shrink-0 text-stone-300" />
                <span>Fulfillment & Dispatch</span>
              </button>

              {/* Exceptions & Risks */}
              <button
                onClick={() => setActiveAdminModule('09_EXCEPTIONS')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeAdminModule === '09_EXCEPTIONS'
                    ? 'bg-[#303134] text-white font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Exceptions</span>
                </div>
                {unresolvedExceptions > 0 && (
                  <span className="bg-amber-500 text-stone-900 font-bold text-[10px] px-1.5 py-0.5 rounded">
                    {unresolvedExceptions}
                  </span>
                )}
              </button>

              {/* AI Copilot */}
              <button
                onClick={() => setActiveAdminModule('11_COPILOT')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeAdminModule === '11_COPILOT'
                    ? 'bg-[#303134] text-white font-semibold'
                    : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>AI Copilot</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1 rounded">
                  v3.7
                </span>
              </button>
            </div>

            {/* Sales Channels Section */}
            <div className="pt-3 border-t border-[#2D2F33] space-y-2">
              <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider px-3">
                Sales channels
              </div>

              <button
                type="button"
                onClick={() => setActivePortal('CUSTOMER')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-[#2A2B2E] hover:text-white group cursor-pointer"
                title="Switch to Customer Front Storefront"
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-stone-400 group-hover:text-amber-400" />
                  <span>Online Store</span>
                </div>
                <ExternalLink className="w-3 h-3 text-stone-500" />
              </button>

              <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-stone-400">
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4 text-stone-500" />
                  <span>Point of Sale</span>
                </div>
                <span className="text-[9px] font-mono bg-stone-800 px-1 rounded text-stone-400">POS-01</span>
              </div>
            </div>
          </div>

          {/* Bottom Sidebar Settings */}
          <div className="p-3 border-t border-[#2D2F33] bg-[#18191B] space-y-1">
            <button
              onClick={() => setActiveAdminModule('21_PLATFORM_SETTINGS')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                activeAdminModule === '21_PLATFORM_SETTINGS'
                  ? 'bg-[#303134] text-white'
                  : 'text-stone-300 hover:bg-[#2A2B2E] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-stone-400" />
                <span>Settings</span>
              </div>
              {!hasPermission('21_PLATFORM_SETTINGS') && (
                <Lock className="w-3.5 h-3.5 text-stone-500" title="Super Admin Only" />
              )}
            </button>
          </div>
        </aside>

        {/* Right Main Admin Body Canvas */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          aria-label="Active Warehouse Module Workspace"
          className="flex-1 overflow-y-auto bg-[#F1F2F4] dark:bg-[#121316] p-4 sm:p-6 lg:p-8 focus:outline-none transition-colors duration-200"
        >
          <motion.div
            key={activeAdminModule}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {simulatedCrash ? (
              (() => {
                throw new Error('Simulated Execution Exception triggered by Performance & Bug Diagnostic Console');
              })()
            ) : (
              children
            )}
          </motion.div>
        </main>
      </div>

      {/* Performance & Bug Telemetry HUD Console */}
      <PerformanceMonitor
        isOpen={isPerfMonitorOpen}
        onClose={() => setIsPerfMonitorOpen(false)}
        onSimulateBugCrash={() => setSimulatedCrash(true)}
      />
    </div>
  );
};
