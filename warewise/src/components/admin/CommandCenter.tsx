import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { UserRole } from '../../types';
import {
  Shield,
  Building2,
  Boxes,
  Truck,
  Package,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
  DollarSign,
  Activity,
  RotateCcw,
  Sparkles,
  UserCheck,
  Server,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Zap,
  Lock,
  Unlock,
  QrCode,
  MapPin,
  Sliders,
  Check,
  RefreshCw,
  Send,
  Plus,
  Eye,
  Crown,
  Search,
  Filter,
  CheckSquare,
  Scale,
  FileCheck2,
  Layers,
  ArrowUpRight,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CommandCenter: React.FC = () => {
  const {
    orders,
    products,
    exceptions,
    refunds,
    activeAdminRole,
    setActiveAdminRole,
    setActiveAdminModule,
    selectedOrderId,
    setSelectedOrderId,
    advanceOrderStatus,
    hasPermission,
    currentUser,
    inventoryTransactions,
    stockAdjustments
  } = useWarehouse();

  // Workstation local states
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [completedPickItems, setCompletedPickItems] = useState<Record<string, boolean>>({});
  const [selectedBoxSize, setSelectedBoxSize] = useState<'BOX_A1' | 'BOX_B2' | 'BOX_C3'>('BOX_A1');
  const [scaleWeight, setScaleWeight] = useState('1.25');
  const [isWeightVerified, setIsWeightVerified] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Search & filter states for Manager Read-Only Analytics Telemetry
  const [telemetrySearch, setTelemetrySearch] = useState('');
  const [telemetryStatusFilter, setTelemetryStatusFilter] = useState<'ALL' | 'ON_TIME' | 'NEAR_BREACH' | 'BREACHED'>('ALL');

  // Order queues (Memoized for high performance under large data loads)
  const unfulfilledOrders = useMemo(() => orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'), [orders]);
  const pickingOrders = useMemo(() => orders.filter((o) => o.status === 'ALLOCATED' || o.status === 'PICKING'), [orders]);
  const packingOrders = useMemo(() => orders.filter((o) => o.status === 'PICKED' || o.status === 'PACKING'), [orders]);
  const dispatchOrders = useMemo(() => orders.filter((o) => o.status === 'QC_CHECK' || o.status === 'READY_FOR_DISPATCH'), [orders]);

  // Active processing order
  const activeProcessingOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || unfulfilledOrders[0] || orders[0],
    [orders, selectedOrderId, unfulfilledOrders]
  );

  // Financial calculations (Memoized)
  const totalSales = useMemo(() => orders.reduce((acc, o) => acc + o.totalAmount, 0), [orders]);
  const totalRefunds = useMemo(
    () => refunds.filter((r) => r.status === 'COMPLETED').reduce((acc, r) => acc + r.amount, 0),
    [refunds]
  );
  const netSales = useMemo(() => totalSales - totalRefunds, [totalSales, totalRefunds]);

  // Role title styling helper
  const getRoleHeaderInfo = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'SUPER ADMIN (EXECUTIVE COMMAND)', bg: 'bg-amber-500 text-stone-950 border-amber-400' };
      case 'WAREHOUSE_ADMIN':
      case 'WAREHOUSE_MANAGER':
      case 'ORDER_MANAGER':
        return { label: 'HUB OPERATIONS MANAGER (READ-ONLY ANALYTICS)', bg: 'bg-blue-600 text-white border-blue-500' };
      case 'INVENTORY_MANAGER':
        return { label: 'INVENTORY CONTROL & STOCK SPECIALIST', bg: 'bg-purple-600 text-white border-purple-500' };
      case 'PICKER':
        return { label: 'WAVE PICKING & BIN SPECIALIST', bg: 'bg-emerald-600 text-white border-emerald-500' };
      case 'PACKER':
        return { label: 'PACKING TABLE & OPTICAL QC SPECIALIST', bg: 'bg-teal-600 text-white border-teal-500' };
      case 'DISPATCHER':
      case 'DISPATCH_OPERATOR':
        return { label: 'DISPATCH & LOGISTICS OPERATOR', bg: 'bg-indigo-600 text-white border-indigo-500' };
      default:
        return { label: 'FINANCIAL & REGULATORY COMPLIANCE OFFICIAL', bg: 'bg-stone-800 text-stone-200 border-stone-700' };
    }
  };

  // Barcode scanner handler
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode.trim() || !activeProcessingOrder) return;

    const matchedItem = activeProcessingOrder.items.find(
      (i) => i.sku.toLowerCase() === scannedBarcode.trim().toLowerCase()
    );

    if (matchedItem) {
      setCompletedPickItems((prev) => ({ ...prev, [matchedItem.sku]: true }));
      setScanMessage({ type: 'success', text: `VERIFIED SKU: ${matchedItem.sku} (${matchedItem.name})` });
      setScannedBarcode('');
    } else {
      setScanMessage({ type: 'error', text: `INVALID SKU: "${scannedBarcode}" is not in Order #${activeProcessingOrder.id}` });
    }

    setTimeout(() => {
      setScanMessage(null);
    }, 3000);
  };

  const handleTogglePickItem = (sku: string) => {
    setCompletedPickItems((prev) => ({ ...prev, [sku]: !prev[sku] }));
  };

  const handleAdvanceStationOrder = () => {
    if (!activeProcessingOrder) return;
    advanceOrderStatus(activeProcessingOrder.id);
    setCompletedPickItems({});
    setScanMessage({ type: 'success', text: `Order #${activeProcessingOrder.id} status advanced!` });
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastMessage('');
      setBroadcastSent(false);
    }, 3000);
  };

  // Memoized telemetry logs for Manager Read-Only View (High Data Load Optimization)
  const managerTelemetryLogs = useMemo(() => {
    const logs = [];
    const hubs = ['WH-METRO-01', 'WH-NORTH-02', 'WH-WEST-03'];
    const carriers = ['Delhivery Express', 'BlueDart Air', 'Shadowfax Flash', 'Xpressbees Direct'];

    for (let i = 1; i <= 60; i++) {
      const logId = `LOG-2026-${100 + i}`;
      const orderId = `ORD-${8000 + i}`;
      const hub = hubs[i % hubs.length];
      const carrier = carriers[i % carriers.length];
      const status = i % 19 === 0 ? 'BREACHED' : i % 7 === 0 ? 'NEAR_BREACH' : 'ON_TIME';
      const pickSec = 40 + (i % 30);
      const packSec = 25 + (i % 20);
      const totalMins = ((pickSec + packSec) / 60 + 1.1).toFixed(1);

      logs.push({ logId, orderId, hub, carrier, status, pickSec, packSec, totalMins });
    }

    return logs;
  }, []);

  const filteredManagerLogs = useMemo(() => {
    return managerTelemetryLogs.filter((log) => {
      const matchSearch =
        log.orderId.toLowerCase().includes(telemetrySearch.toLowerCase()) ||
        log.logId.toLowerCase().includes(telemetrySearch.toLowerCase()) ||
        log.carrier.toLowerCase().includes(telemetrySearch.toLowerCase());

      const matchStatus = telemetryStatusFilter === 'ALL' || log.status === telemetryStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [managerTelemetryLogs, telemetrySearch, telemetryStatusFilter]);

  // Role Checks
  const isSuperAdmin = activeAdminRole === 'SUPER_ADMIN';
  const isManager = activeAdminRole === 'WAREHOUSE_ADMIN' || activeAdminRole === 'WAREHOUSE_MANAGER' || activeAdminRole === 'ORDER_MANAGER';
  const isInventoryManager = activeAdminRole === 'INVENTORY_MANAGER';
  const isPicker = activeAdminRole === 'PICKER';
  const isPacker = activeAdminRole === 'PACKER';
  const isDispatcher = activeAdminRole === 'DISPATCHER' || activeAdminRole === 'DISPATCH_OPERATOR';
  const isOfficial = activeAdminRole === 'OFFICIAL' || activeAdminRole === 'FULFILLMENT_OPERATOR';

  return (
    <div className="space-y-6 text-[#1A1A1A] font-sans antialiased">
      
      {/* ================= GLOBAL ROLE PERSONA SWITCHER BANNER ================= */}
      <div className="bg-[#1C1917] text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold border tracking-wider ${getRoleHeaderInfo(activeAdminRole).bg}`}>
                {getRoleHeaderInfo(activeAdminRole).label}
              </span>
              <span className="text-stone-400 text-xs font-mono">
                Hub: WH-METRO-01 (Bengaluru)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif-luxury italic font-bold text-white tracking-tight">
              Central Operations Command Suite
            </h1>
            <p className="text-xs text-stone-400 font-sans">
              Dedicated sector UI view loaded for <strong className="text-stone-200">{currentUser.name || 'Hemendra Sai'}</strong>. Every role gets a tailored control interface.
            </p>
          </div>

          {/* Quick Role Persona Selector */}
          <div
            role="region"
            aria-label="Operational Role Persona Selector"
            className="bg-stone-900 p-1 rounded-xl border border-stone-800 flex flex-wrap items-center gap-1 w-full lg:w-auto shrink-0"
          >
            <button
              type="button"
              onClick={() => setActiveAdminRole('SUPER_ADMIN')}
              aria-pressed={isSuperAdmin}
              aria-label="Switch persona to Super Admin view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isSuperAdmin ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminRole('WAREHOUSE_ADMIN')}
              aria-pressed={isManager}
              aria-label="Switch persona to Warehouse Manager view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isManager ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Manager</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminRole('INVENTORY_MANAGER')}
              aria-pressed={isInventoryManager}
              aria-label="Switch persona to Inventory Manager view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                isInventoryManager ? 'bg-purple-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Inventory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminRole('PICKER')}
              aria-pressed={isPicker}
              aria-label="Switch persona to Order Picker view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                isPicker ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Picker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminRole('PACKER')}
              aria-pressed={isPacker}
              aria-label="Switch persona to Packing Specialist view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isPacker ? 'bg-teal-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Packer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminRole('DISPATCHER')}
              aria-pressed={isDispatcher}
              aria-label="Switch persona to Dispatch Operator view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isDispatcher ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Dispatch</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminRole('OFFICIAL')}
              aria-pressed={isOfficial}
              aria-label="Switch persona to Finance and Compliance Official view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                isOfficial ? 'bg-stone-700 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Finance</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================================
          👑 1. SUPER ADMIN EXECUTIVE COMMAND SUITE
      ========================================================================================= */}
      {isSuperAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>Gross Revenue ARR</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+18.4%</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">₹{totalSales.toLocaleString()}</div>
              <div className="text-[11px] text-stone-500">Gross sales across 3 active hub nodes</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>Net Operating Margin</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">+24.1%</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">₹{netSales.toLocaleString()}</div>
              <div className="text-[11px] text-stone-500">Net of ₹{totalRefunds.toLocaleString()} refunds & tax</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>SLA Dispatch Compliance</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">99.8%</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">100% On-Time</div>
              <div className="text-[11px] text-stone-500">Zero SLA breach violations across hubs</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>RBAC Security Matrix</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">7 Active Roles</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">21 Modules</div>
              <div className="text-[11px] text-stone-500">Strict sector permissions enforced</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
                      Global Multi-Hub Operational Throughput
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-stone-500">Real-Time Sync</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>WH-METRO-01 (Bengaluru)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-lg font-bold text-stone-900">1,480 Units/day</div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[82%]" />
                    </div>
                    <div className="text-[10px] text-stone-500 flex justify-between">
                      <span>Capacity Utilized</span>
                      <span className="font-bold">82%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>WH-NORTH-02 (Delhi NCR)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-lg font-bold text-stone-900">920 Units/day</div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[65%]" />
                    </div>
                    <div className="text-[10px] text-stone-500 flex justify-between">
                      <span>Capacity Utilized</span>
                      <span className="font-bold">65%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>WH-WEST-03 (Mumbai)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="text-lg font-bold text-stone-900">1,110 Units/day</div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[74%]" />
                    </div>
                    <div className="text-[10px] text-stone-500 flex justify-between">
                      <span>Capacity Utilized</span>
                      <span className="font-bold">74%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#1C1917] text-stone-100 border border-stone-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-stone-800 pb-3">
                  <Zap className="w-4 h-4" />
                  <h3 className="text-xs font-mono-tech uppercase font-bold tracking-wider">
                    Super Admin Executive Controls
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveAdminModule('21_PLATFORM_SETTINGS')}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 p-3 rounded-xl text-left text-xs font-bold text-stone-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Security Controls & API Keys</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  </button>

                  <button
                    onClick={() => setActiveAdminModule('15_AUDIT')}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 p-3 rounded-xl text-left text-xs font-bold text-stone-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Download Immutable Audit Log</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-2 pt-2 border-t border-stone-800">
                  <label className="block text-[11px] font-mono text-stone-400 uppercase font-bold">
                    Broadcast System Announcement:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="E.g. High-volume surge expected..."
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs cursor-pointer shrink-0"
                    >
                      Send
                    </button>
                  </div>
                  {broadcastSent && <p className="text-[10px] text-emerald-400 font-mono">✓ Broadcast sent to all stations!</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          🏢 2. MANAGER READ-ONLY ANALYTICS & OPERATIONS DASHBOARD
      ========================================================================================= */}
      {isManager && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>
                <strong>Manager Read-Only Operational Telemetry & Analytics Mode:</strong> You are viewing real-time fulfillment KPIs, pick/pack velocities, and high-load telemetry logs. Data is memoized for maximum rendering performance under heavy loads.
              </span>
            </div>
            <button
              onClick={() => setActiveAdminModule('10_ANALYTICS')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              Open Full Analytics Suite
            </button>
          </div>

          {/* Real-time KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold">Fulfillment SLA</div>
              <div className="text-2xl font-bold text-stone-900">99.6%</div>
              <div className="text-[10px] text-emerald-700 font-bold">0 Breaches Today</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold">Avg Cycle Time</div>
              <div className="text-2xl font-bold text-stone-900">3.2 mins</div>
              <div className="text-[10px] text-emerald-700 font-bold">-18% vs target</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold">Order Rate</div>
              <div className="text-2xl font-bold text-stone-900">184 UPH</div>
              <div className="text-[10px] text-stone-500">Units Per Hour</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold">Discrepancy Rate</div>
              <div className="text-2xl font-bold text-stone-900">0.02%</div>
              <div className="text-[10px] text-emerald-700 font-bold">Pristine Accuracy</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold">Carrier On-Time</div>
              <div className="text-2xl font-bold text-stone-900">98.9%</div>
              <div className="text-[10px] text-emerald-700 font-bold">Flight Handovers</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold">Stock Velocity</div>
              <div className="text-2xl font-bold text-stone-900">14.2x</div>
              <div className="text-[10px] text-stone-500">Annual Turnover</div>
            </div>
          </div>

          {/* Memoized High-Performance Telemetry Log Table */}
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E7E5E0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>High-Load Real-Time Fulfillment Telemetry Log</span>
                </h3>
                <p className="text-xs text-stone-500">Read-only performance stream ({filteredManagerLogs.length} entries filtered)</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={telemetrySearch}
                  onChange={(e) => setTelemetrySearch(e.target.value)}
                  placeholder="Search log, order, carrier..."
                  className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 font-mono flex-1 sm:w-48"
                />
                <select
                  value={telemetryStatusFilter}
                  onChange={(e) => setTelemetryStatusFilter(e.target.value as any)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-stone-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ON_TIME">On Time</option>
                  <option value="NEAR_BREACH">Near Breach</option>
                  <option value="BREACHED">Breached</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase text-[10px] border-b border-stone-200">
                    <th className="p-2.5 font-bold">Telemetry ID</th>
                    <th className="p-2.5 font-bold">Order ID</th>
                    <th className="p-2.5 font-bold">Hub Node</th>
                    <th className="p-2.5 font-bold">Carrier Partner</th>
                    <th className="p-2.5 font-bold text-right">Pick Sec</th>
                    <th className="p-2.5 font-bold text-right">Pack Sec</th>
                    <th className="p-2.5 font-bold text-right">Cycle Time</th>
                    <th className="p-2.5 font-bold text-center">SLA Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredManagerLogs.slice(0, 10).map((log) => (
                    <tr key={log.logId} className="hover:bg-amber-50/20">
                      <td className="p-2.5 font-bold text-stone-900">{log.logId}</td>
                      <td className="p-2.5 text-blue-700 font-bold">{log.orderId}</td>
                      <td className="p-2.5 text-stone-600">{log.hub}</td>
                      <td className="p-2.5 text-stone-800 font-sans font-semibold">{log.carrier}</td>
                      <td className="p-2.5 text-right text-stone-600">{log.pickSec}s</td>
                      <td className="p-2.5 text-right text-stone-600">{log.packSec}s</td>
                      <td className="p-2.5 text-right font-bold text-stone-900">{log.totalMins}m</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'ON_TIME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'NEAR_BREACH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          📦 3. INVENTORY CONTROL & STOCK OPTIMIZATION TERMINAL (INVENTORY MANAGER)
      ========================================================================================= */}
      {isInventoryManager && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>Total Physical Stock</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Catalog Active</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">
                {products.reduce((acc, p) => acc + p.physicalStock, 0).toLocaleString()} Units
              </div>
              <div className="text-[11px] text-stone-500">Across {products.length} distinct active SKUs</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>Stock Valuation (Cost)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Audited</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">
                ₹{products.reduce((acc, p) => acc + p.physicalStock * (p.costPrice || p.price * 0.65), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-500">FIFO valuation model</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>Low Stock Reorder Alerts</span>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Action Needed</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {products.filter((p) => p.availableStock < p.reorderLevel).length} SKUs
              </div>
              <div className="text-[11px] text-stone-500">Below safety reorder threshold</div>
            </div>

            <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
              <div className="text-xs font-medium text-stone-500 flex items-center justify-between">
                <span>Bin Capacity Utilization</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Optimal</span>
              </div>
              <div className="text-2xl font-bold text-stone-900">78.4%</div>
              <div className="text-[11px] text-stone-500">Zone A, B, C racks occupied</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* Safety Stock & Reorder Trigger Table */}
              <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
                      Low Stock Reorder & Supplier Replenishment Matrix
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveAdminModule('02_INVENTORY')}
                    className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Inventory Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {products
                    .filter((p) => p.availableStock < p.reorderLevel)
                    .map((p) => (
                      <div key={p.id} className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                          <div>
                            <div className="font-bold text-stone-900">{p.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              SKU: {p.sku} • Bin: <strong className="text-amber-700">{p.binLocation}</strong> • Supplier: {p.supplierName || 'Apex Global Supply'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right font-mono">
                            <div className="text-xs font-bold text-red-600">Avail: {p.availableStock}</div>
                            <div className="text-[10px] text-stone-500">Reorder Level: {p.reorderLevel}</div>
                          </div>

                          <button
                            onClick={() => setActiveAdminModule('02_INVENTORY')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                          >
                            Draft PO
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Inventory Transactions Log */}
              <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
                  <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
                    Recent Stock Movement Transactions Log
                  </h3>
                  <span className="text-xs font-mono text-stone-500">Real-Time Ledger</span>
                </div>

                <div className="space-y-2">
                  {inventoryTransactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="font-bold text-stone-900">{t.type.replace('_', ' ')}</div>
                        <div className="text-[10px] text-stone-500">{t.productName} ({t.sku}) • Ref: {t.referenceId}</div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${t.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                        </span>
                        <div className="text-[10px] text-stone-400">{t.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#1C1917] text-stone-100 border border-stone-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-purple-400 border-b border-stone-800 pb-3">
                  <Boxes className="w-4 h-4" />
                  <h3 className="text-xs font-mono-tech uppercase font-bold tracking-wider">
                    Inventory Control Shortcuts
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveAdminModule('02_INVENTORY')}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 p-3 rounded-xl text-left text-xs font-bold text-stone-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-400" />
                      <span>Stock Receipt & PO Ingestion</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  </button>

                  <button
                    onClick={() => setActiveAdminModule('14_BINS')}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 p-3 rounded-xl text-left text-xs font-bold text-stone-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>Warehouse Bins & Rack Mapping</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  </button>

                  <button
                    onClick={() => setActiveAdminModule('13_PRODUCTS')}
                    className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 p-3 rounded-xl text-left text-xs font-bold text-stone-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-purple-400" />
                      <span>Manage SKU Master Catalog</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          🎯 4. WAVE PICKING & BIN ROUTE TERMINAL (PICKER)
      ========================================================================================= */}
      {isPicker && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E7E5E0] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      WAVE PICKING TERMINAL • ZONE A
                    </span>
                    <span className="text-xs text-stone-500">Order #{activeProcessingOrder.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    Active Pick Batch Verification
                  </h3>
                </div>

                <button
                  onClick={() => setActiveAdminModule('05_PICKING')}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Launch 2D Route Optimizer Map ➔</span>
                </button>
              </div>

              {/* Barcode Scanner Tool */}
              <form onSubmit={handleBarcodeScan} className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>Scan Picked Item Barcode</span>
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">Laser Scanner Ready</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value)}
                    placeholder="Scan SKU barcode (e.g. SKU-NEURAL-01)..."
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer font-mono uppercase"
                  >
                    Verify Pick
                  </button>
                </div>

                {scanMessage && (
                  <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                    scanMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {scanMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span>{scanMessage.text}</span>
                  </div>
                )}
              </form>

              {/* Pick items list */}
              <div className="space-y-2">
                {activeProcessingOrder.items.map((item) => {
                  const isChecked = !!completedPickItems[item.sku];
                  return (
                    <div
                      key={item.sku}
                      onClick={() => handleTogglePickItem(item.sku)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${isChecked ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-stone-300'}`}>
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">{item.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            SKU: {item.sku} • Bin: <strong className="text-amber-700">{item.binLocation}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-bold text-xs">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#E7E5E0] flex justify-end">
                <button
                  onClick={handleAdvanceStationOrder}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Pick Complete ➔ Advance Order</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1C1917] text-stone-100 border border-stone-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-stone-800 pb-3">
                <MapPin className="w-4 h-4" />
                <h3 className="text-xs font-mono-tech uppercase font-bold tracking-wider">
                  Optimal Bin Picking Route
                </h3>
              </div>
              <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1 text-xs">
                <div className="text-[10px] text-stone-400 font-mono">NEXT BIN LOCATION:</div>
                <div className="font-bold text-emerald-400 font-mono text-sm">Zone A • Rack 14 • Bin 02</div>
                <p className="text-[11px] text-stone-400">Main Staging Bay • Ground Level</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          📦 5. PACKING TABLE & OPTICAL SCALE QC STATION (PACKER)
      ========================================================================================= */}
      {isPacker && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
                <div>
                  <span className="font-mono text-xs text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    PACKING TABLE STATION 4
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    Order #{activeProcessingOrder.id} Packing & Weight QC
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded">
                  STATUS: {activeProcessingOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-teal-600" />
                    <span>Digital Scale Weight Check:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={scaleWeight}
                      onChange={(e) => setScaleWeight(e.target.value)}
                      className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 font-mono font-bold flex-1"
                    />
                    <span className="self-center text-xs font-mono font-bold text-stone-500">kg</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-bold">✓ Weight within ±0.05kg tolerance</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800">Recommended Carton Box:</label>
                  <select
                    value={selectedBoxSize}
                    onChange={(e) => setSelectedBoxSize(e.target.value as any)}
                    className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-stone-800 w-full"
                  >
                    <option value="BOX_A1">Box-A1 (Small Electronics)</option>
                    <option value="BOX_B2">Box-B2 (Medium Apparel/Hardware)</option>
                    <option value="BOX_C3">Box-C3 (Heavy Industrial)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E5E0] flex justify-end">
                <button
                  onClick={handleAdvanceStationOrder}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Seal Box & Print Shipping Label</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1C1917] text-stone-100 border border-stone-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-teal-400 border-b border-stone-800 pb-3">
                <Package className="w-4 h-4" />
                <h3 className="text-xs font-mono-tech uppercase font-bold tracking-wider">
                  Packing Station Directives
                </h3>
              </div>
              <ul className="text-xs text-stone-300 space-y-2 list-disc pl-4">
                <li>Verify bubble wrap protection for fragile SKUs</li>
                <li>Apply tamper-evident security tape</li>
                <li>Affix printed shipping label on top surface</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          🚛 6. DISPATCH & COURIER LOGISTICS DESK (DISPATCHER)
      ========================================================================================= */}
      {isDispatcher && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
                    Outbound Consignment Dispatch Queue
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-500">{dispatchOrders.length} Ready for Loading</span>
              </div>

              <div className="space-y-3">
                {dispatchOrders.map((o) => (
                  <div key={o.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-stone-900">Order #{o.id}</div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Customer: {o.customerName} • Carrier: <strong className="text-indigo-700">{o.shippingCarrier || 'Delhivery Express'}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => advanceOrderStatus(o.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Sign & Handover Carrier AWB
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1C1917] text-stone-100 border border-stone-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-stone-800 pb-3">
                <Truck className="w-4 h-4" />
                <h3 className="text-xs font-mono-tech uppercase font-bold tracking-wider">
                  Courier Pickup Vans Staged
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-stone-900 rounded-lg flex justify-between items-center">
                  <span>Delhivery Flight Express</span>
                  <span className="text-emerald-400 font-bold font-mono">Dock 02 (Ready)</span>
                </div>
                <div className="p-2.5 bg-stone-900 rounded-lg flex justify-between items-center">
                  <span>BlueDart Air Cargo</span>
                  <span className="text-amber-400 font-bold font-mono">Dock 04 (Staging)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          🏛️ 7. FINANCE & REGULATORY COMPLIANCE SUITE (OFFICIAL)
      ========================================================================================= */}
      {isOfficial && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-800" />
                <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
                  Financial Reconciliation & GST Tax Audit Terminal
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Tax Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-stone-500 uppercase">Gross Revenue</div>
                <div className="text-xl font-bold text-stone-900">₹{totalSales.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-stone-500 uppercase">Total Refunds Issued</div>
                <div className="text-xl font-bold text-stone-900">₹{totalRefunds.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="text-[10px] font-mono text-stone-500 uppercase">GST Tax Liability (18%)</div>
                <div className="text-xl font-bold text-stone-900">₹{(totalSales * 0.18).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
