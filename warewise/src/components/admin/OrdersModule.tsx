import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { OrderStatus } from '../../types';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  ChevronDown,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  Truck,
  User,
  Package,
  FileText,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OrdersModule: React.FC = () => {
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    advanceOrderStatus,
    products,
    createManualOrder,
    processRefund
  } = useWarehouse();

  // Filter tabs matching Shopify Admin Image 2
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'UNFULFILLED' | 'UNPAID' | 'OPEN' | 'CLOSED' | 'RETURN_REQUESTS' | 'LOCAL_DELIVERY'
  >('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All locations');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dateRange, setDateRange] = useState('30 days');

  // Manual Order State
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [newQty, setNewQty] = useState(1);

  // Selected Order (Memoized)
  const activeOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  // Filtering (Memoized for high performance under large order volumes)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === 'UNFULFILLED') {
        return (
          o.status === 'CREATED' ||
          o.status === 'APPROVED' ||
          o.status === 'ALLOCATED' ||
          o.status === 'PICKING' ||
          o.status === 'PACKING' ||
          o.status === 'QC_CHECK'
        );
      }
      if (activeTab === 'UNPAID') return o.paymentStatus === 'PENDING';
      if (activeTab === 'OPEN') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
      if (activeTab === 'CLOSED') return o.status === 'DELIVERED' || o.status === 'CANCELLED';
      if (activeTab === 'RETURN_REQUESTS') return o.rmaStatus === 'RMA_REQUESTED';
      return true;
    });
  }, [orders, searchQuery, activeTab]);

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === selectedSku) || products[0];
    if (!prod) return;

    createManualOrder({
      customerName: newCustName || 'Guy Hawkins',
      customerEmail: newCustEmail || 'guy.hawkins@example.com',
      items: [
        {
          sku: prod.sku,
          name: prod.name,
          quantity: newQty,
          price: prod.price,
          allocatedQty: newQty,
          binLocation: prod.binLocation,
          image: prod.imageUrl,
        },
      ],
      shippingAddress: 'Plot 42, Outer Ring Road, Indiranagar, Bengaluru, KA 560038',
      priorityTier: 'NORMAL',
    });

    setShowCreateModal(false);
    setNewCustName('');
    setNewCustEmail('');
  };

  const getPaymentStatusPill = (status?: string, paid?: boolean) => {
    if (status === 'REFUNDED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-100 text-purple-800">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Refunded
        </span>
      );
    }
    if (paid || status === 'COMPLETED' || status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-stone-200/70 text-stone-800">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
          Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Payment pending
      </span>
    );
  };

  const getFulfillmentStatusPill = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Fulfilled
          </span>
        );
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-900">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            In transit
          </span>
        );
      case 'READY_FOR_DISPATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-orange-100 text-orange-900">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
            On hold
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-yellow-100 text-yellow-900">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
            Unfulfilled
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Shopify Orders Title & Primary Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">Orders</h1>
          <div className="relative">
            <button
              onClick={() =>
                setLocationFilter(
                  locationFilter === 'All locations' ? 'WH-METRO-01 Hub' : 'All locations'
                )
              }
              className="flex items-center gap-1 text-sm font-semibold text-stone-700 hover:text-stone-900 px-2 py-1 rounded-md hover:bg-stone-200/60 cursor-pointer"
            >
              <span>: {locationFilter}</span>
              <ChevronDown className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer">
            Export
          </button>
          <button className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer flex items-center gap-1">
            <span>More actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold hover:bg-stone-800 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create order</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Bar matching Image 2 Sparklines */}
      <div className="bg-white border border-[#E1E3E5] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="relative">
            <button
              onClick={() => setDateRange(dateRange === '30 days' ? '7 days' : '30 days')}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer"
            >
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">Live Sync • WH-METRO-01</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-x divide-stone-100">
          {/* Orders */}
          <div className="px-2">
            <div className="text-xs text-stone-500 font-medium">Orders</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-900">1,271</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">▲ 45%</span>
            </div>
            {/* Sparkline simulation */}
            <div className="flex items-end gap-1 h-5 mt-2">
              {[40, 65, 30, 80, 95, 50, 75, 100, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-sky-400 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Ordered items */}
          <div className="px-4">
            <div className="text-xs text-stone-500 font-medium">Ordered items</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-900">31</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">▲ 29%</span>
            </div>
            <div className="flex items-end gap-1 h-5 mt-2">
              {[30, 40, 70, 50, 90, 80, 60, 95, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-sky-300 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Returned items */}
          <div className="px-4">
            <div className="text-xs text-stone-500 font-medium">Returned items</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-900">6</span>
              <span className="text-xs font-semibold text-amber-600 flex items-center">▲ 11%</span>
            </div>
            <div className="flex items-end gap-1 h-5 mt-2">
              {[20, 30, 15, 45, 20, 50, 30, 40, 25].map((h, i) => (
                <div key={i} className="flex-1 bg-amber-300 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Fulfilled orders */}
          <div className="px-4">
            <div className="text-xs text-stone-500 font-medium">Fulfilled orders</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-900">41</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">▲ 11%</span>
            </div>
            <div className="flex items-end gap-1 h-5 mt-2">
              {[50, 60, 80, 40, 90, 75, 85, 95, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-400 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Delivered orders */}
          <div className="px-4">
            <div className="text-xs text-stone-500 font-medium">Delivered orders</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-stone-900">22</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">▲ 45%</span>
            </div>
            <div className="flex items-end gap-1 h-5 mt-2">
              {[30, 50, 40, 70, 60, 85, 90, 95, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Shopify Orders Table Container matching Image 2 */}
      <div className="bg-white border border-[#E1E3E5] rounded-xl shadow-sm overflow-hidden space-y-0">
        {/* Filter Tabs & Tool Icons Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-4 py-2.5 border-b border-[#E1E3E5] bg-[#FBFBFB]">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium scrollbar-none py-1">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span>All</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            <button
              onClick={() => setActiveTab('UNFULFILLED')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'UNFULFILLED'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              Unfulfilled
            </button>

            <button
              onClick={() => setActiveTab('UNPAID')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'UNPAID'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              Unpaid
            </button>

            <button
              onClick={() => setActiveTab('OPEN')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'OPEN'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              Open
            </button>

            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'CLOSED'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              Closed
            </button>

            <button
              onClick={() => setActiveTab('RETURN_REQUESTS')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === 'RETURN_REQUESTS'
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              Return requests
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className="px-2 py-1.5 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
              title="Add view"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Tool Icons Right */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-white border border-stone-300 rounded-lg pl-8 pr-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <button
              className="p-1.5 bg-white border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer"
              title="Filter"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              className="p-1.5 bg-white border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 cursor-pointer"
              title="Sort"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E1E3E5] bg-[#FAFBFB] text-stone-500 font-medium">
                <th className="py-2.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-stone-300 cursor-pointer" />
                </th>
                <th className="py-2.5 px-3 font-medium">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-stone-900">
                    <span>Order</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Customer</th>
                <th className="py-2.5 px-3 font-medium text-right">Total</th>
                <th className="py-2.5 px-3 font-medium">Payment status</th>
                <th className="py-2.5 px-3 font-medium">Fulfillment status</th>
                <th className="py-2.5 px-3 font-medium text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E3E5]">
              {filteredOrders.map((order) => {
                const totalItemQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                const isSelected = order.id === activeOrder?.id;

                return (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setShowDetailModal(true);
                    }}
                    className={`hover:bg-[#F6F6F7] transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-stone-300 cursor-pointer" />
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{order.id}</span>
                      <MessageSquare className="w-3 h-3 text-stone-400" />
                    </td>
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      {order.createdAt || 'Today at 6:55 a.m'}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-900 whitespace-nowrap">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-stone-900 whitespace-nowrap">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getPaymentStatusPill(order.paymentStatus, true)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getFulfillmentStatusPill(order.status)}
                    </td>
                    <td className="py-3 px-3 text-right text-stone-600 font-medium whitespace-nowrap">
                      {totalItemQty} {totalItemQty === 1 ? 'item' : 'items'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal / Drawer matching Shopify Detail Page */}
      <AnimatePresence>
        {showDetailModal && activeOrder && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-3xl bg-[#F6F6F7] h-full overflow-y-auto p-6 space-y-6 text-[#1A1A1A] shadow-2xl border-l border-stone-300"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-300">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-stone-900">{activeOrder.id}</h2>
                  {getPaymentStatusPill(activeOrder.paymentStatus, true)}
                  {getFulfillmentStatusPill(activeOrder.status)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => advanceOrderStatus(activeOrder.id)}
                    className="px-3.5 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Advance Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Order Info & Rider Journey Banner */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-500">Order placed</div>
                    <div className="text-sm font-semibold text-stone-900 mt-0.5">
                      {activeOrder.createdAt || 'Today at 6:55 a.m'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-500">Target Hub</div>
                    <div className="text-sm font-semibold text-stone-900 mt-0.5">WH-METRO-01</div>
                  </div>
                </div>

                {/* Animated Rider Journey Progress */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-600 animate-bounce" />
                      Fulfillment Pipeline Journey
                    </span>
                    <span className="font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                      STAGE: {activeOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-center pt-2">
                    {['CREATED', 'ALLOCATED', 'PICKING', 'PACKING', 'QC', 'DISPATCHED', 'DELIVERED'].map(
                      (st, idx) => {
                        const isCurrent = activeOrder.status === st;
                        return (
                          <div
                            key={st}
                            className={`p-1 rounded ${
                              isCurrent
                                ? 'bg-amber-500 text-stone-900 font-bold'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {st}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items Card */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="text-sm font-bold text-stone-900">Unfulfilled Items ({activeOrder.items.length})</h3>
                  <span className="text-xs text-stone-500 font-mono">Bin Staging</span>
                </div>

                <div className="space-y-3">
                  {activeOrder.items.map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover border border-stone-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-stone-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                            SKU: {item.sku} • Bin: {item.binLocation}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          Qty: {item.quantity} (Allocated: {item.allocatedQty})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary Financials */}
                <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span>₹{activeOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping (Air Express)</span>
                    <span>₹0 (Free)</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                    <span>Total Paid</span>
                    <span>₹{activeOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-stone-900">Customer Details</h3>
                <div className="text-xs space-y-1 text-stone-700 font-sans">
                  <div className="font-semibold text-stone-900">{activeOrder.customerName}</div>
                  <div className="text-stone-500">{activeOrder.customerEmail}</div>
                  <div className="text-stone-600 mt-2">{activeOrder.shippingAddress}</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200 text-[#1A1A1A]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-lg font-bold text-stone-900">Create Draft Order</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Guy Hawkins"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. guy.hawkins@example.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Select Product SKU</label>
                  <select
                    value={selectedSku}
                    onChange={(e) => setSelectedSku(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.name} ({p.sku}) - ₹{p.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A1A1A] text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Create & Confirm Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
