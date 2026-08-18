import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Order, OrderStatus } from '../../types';
import { OrderJourneyTracker } from './OrderJourneyTracker';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  RotateCcw,
  XCircle,
  Search,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Check,
  Building2,
  Calendar,
  Download
} from 'lucide-react';

export const CustomerOrdersView: React.FC = () => {
  const {
    orders,
    selectedTrackingOrderId,
    setSelectedTrackingOrderId,
    cancelCustomerOrder,
    requestCustomerReturn,
    addToCart,
    products,
    setActiveCustomerNavTab
  } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Found better price elsewhere');

  // Return Modal State
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnSku, setReturnSku] = useState('');
  const [returnType, setReturnType] = useState<'REFUND' | 'EXCHANGE'>('REFUND');
  const [returnReason, setReturnReason] = useState('Specification mismatch with hardware project');
  const [returnEvidenceNote, setReturnEvidenceNote] = useState('');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState(false);

  // Invoice Modal State
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'ACTIVE') {
      return !['DELIVERED', 'CANCELLED'].includes(o.status);
    }
    if (filterTab === 'DELIVERED') {
      return o.status === 'DELIVERED';
    }
    if (filterTab === 'CANCELLED') {
      return o.status === 'CANCELLED';
    }
    return true;
  });

  const selectedOrder = orders.find((o) => o.id === selectedTrackingOrderId) || filteredOrders[0] || orders[0];

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    cancelCustomerOrder(cancelModalOrder.id, cancelReason);
    setCancelModalOrder(null);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder || !returnSku) return;
    requestCustomerReturn(returnModalOrder.id, returnSku, `${returnReason}: ${returnEvidenceNote}`, returnType);
    setReturnSuccessMsg(true);
    setTimeout(() => {
      setReturnSuccessMsg(false);
      setReturnModalOrder(null);
    }, 2000);
  };

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => {
      const fullProduct = products.find((p) => p.id === item.productId);
      if (fullProduct) {
        addToCart(fullProduct, item.quantity);
      }
    });
    setActiveCustomerNavTab('CART');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn select-none">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury italic font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Your Orders & Consignments
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Track real-time courier milestones, manage deliveries, and request returns
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID or item name..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7E5E0] rounded-xl text-xs font-mono-tech focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#E7E5E0] text-xs font-mono-tech uppercase font-bold gap-4 sm:gap-8 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Orders (${orders.length})` },
          { id: 'ACTIVE', label: `In Fulfillment (${orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length})` },
          { id: 'DELIVERED', label: `Delivered (${orders.filter((o) => o.status === 'DELIVERED').length})` },
          { id: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              filterTab === tab.id
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Orders List (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E7E5E0] p-8 text-center space-y-3 shadow-xs">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <div className="text-xs text-stone-500 font-sans">
                No orders found matching your criteria.
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const isCancelled = order.status === 'CANCELLED';
              const isDelivered = order.status === 'DELIVERED';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedTrackingOrderId(order.id)}
                  className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer text-xs space-y-3 ${
                    isSelected
                      ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-md'
                      : 'border-[#E7E5E0] hover:border-stone-400 shadow-xs'
                  }`}
                >
                  {/* Order Top Line */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono-tech font-bold text-stone-900">{order.id}</span>
                      <span className="text-[11px] text-stone-500 ml-2 font-mono-tech">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-mono-tech font-bold uppercase rounded-full ${
                        isCancelled
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isDelivered
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-900 text-white shadow-xs'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Items Preview Thumbnails */}
                  <div className="flex items-center gap-2.5">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-xl bg-[#F8F7F4] border border-[#E7E5E0] p-1 flex items-center justify-center shrink-0"
                      >
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-[#EAE6DE] text-stone-700 font-mono-tech font-bold text-xs flex items-center justify-center">
                        +{order.items.length - 3}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pl-1">
                      <div className="font-semibold text-stone-900 truncate font-sans">
                        {order.items[0]?.name}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono-tech">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ₹{order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2.5 border-t border-[#E7E5E0] flex items-center justify-between text-[11px] font-mono-tech">
                    <span className="text-stone-500 font-medium">{order.paymentMethod || 'UPI Paid'}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyAgain(order);
                        }}
                        className="text-stone-900 hover:text-terracotta font-bold uppercase transition-colors cursor-pointer"
                      >
                        Buy Again
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInvoiceModalOrder(order);
                        }}
                        className="text-stone-500 hover:text-stone-900 font-semibold cursor-pointer"
                      >
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Order Interactive Tracker & Details (7 cols) */}
        {selectedOrder && (
          <div className="lg:col-span-7 space-y-6">
            {/* SIGNATURE READ-ONLY MOVING RIDER JOURNEY */}
            <OrderJourneyTracker
              order={selectedOrder}
            />

            {/* Order Details & Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 space-y-6 shadow-sm">
              {/* Order Header & Top Level Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E0]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif-luxury italic font-bold text-xl text-stone-900">
                      Order Summary // {selectedOrder.id}
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 font-mono-tech mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* State-Dependent Order Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => setCancelModalOrder(selectedOrder)}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-mono-tech font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-red-200 cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}

                  {selectedOrder.status === 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setReturnModalOrder(selectedOrder);
                        setReturnSku(selectedOrder.items[0]?.sku || '');
                      }}
                      className="px-3.5 py-1.5 bg-[#F2EFE9] hover:bg-[#EAE6DE] text-stone-800 font-mono-tech font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-[#E7E5E0] cursor-pointer"
                    >
                      Request Return / Replacement
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setInvoiceModalOrder(selectedOrder)}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-mono-tech font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3">
                <h3 className="font-mono-tech font-bold text-xs text-stone-700 uppercase tracking-wider">
                  Consignment Items ({selectedOrder.items.length})
                </h3>
                <div className="divide-y divide-[#E7E5E0] border border-[#E7E5E0] rounded-2xl overflow-hidden text-xs">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="p-3.5 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded-xl bg-[#F8F7F4] border border-[#E7E5E0] p-1 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 font-sans">{item.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono-tech">
                            SKU: {item.sku} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono-tech">
                        <div className="font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">
                          In Consignment
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination & Payment Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E7E5E0] space-y-1">
                  <div className="font-mono-tech font-bold text-stone-900 uppercase text-[11px]">Delivery Address</div>
                  <div className="text-stone-800 font-semibold">{selectedOrder.shippingAddress?.name || selectedOrder.customerName}</div>
                  <div className="text-stone-600 text-[11px]">{selectedOrder.shippingAddress?.street}</div>
                  <div className="text-stone-600 text-[11px]">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </div>
                </div>

                <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E7E5E0] space-y-1.5 font-mono-tech">
                  <div className="font-bold text-stone-900 uppercase text-[11px]">Payment Breakdown</div>
                  <div className="flex justify-between text-stone-600 text-xs">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotalAmount ? selectedOrder.subtotalAmount.toLocaleString() : selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discountAmount ? (
                    <div className="flex justify-between text-emerald-700 text-xs">
                      <span>Promo Savings</span>
                      <span>-₹{selectedOrder.discountAmount.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-stone-900 text-xs pt-1 border-t border-[#E7E5E0]">
                    <span>Total Paid</span>
                    <span className="text-stone-900">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CANCEL ORDER MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E5E0] shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury italic font-bold text-lg text-stone-900">Cancel Order {cancelModalOrder.id}?</h3>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Cancelling will release reserved items and initiate an immediate full refund of{' '}
              <strong className="text-stone-900 font-mono-tech">₹{cancelModalOrder.totalAmount.toLocaleString()}</strong> to your source payment method.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs font-mono-tech">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 uppercase text-[10px]">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl font-medium"
                >
                  <option value="Found better price elsewhere">Found better price elsewhere</option>
                  <option value="Ordered by mistake / changed mind">Ordered by mistake / changed mind</option>
                  <option value="Delivery date too late for project deadline">Delivery date too late for project deadline</option>
                  <option value="Billing address change needed">Billing address change needed</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                >
                  Confirm Cancellation & Refund
                </button>
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2.5 bg-[#F2EFE9] hover:bg-[#EAE6DE] text-stone-800 font-semibold rounded-xl cursor-pointer"
                >
                  Keep Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN / REPLACEMENT MODAL */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E5E0] shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury italic font-bold text-lg text-stone-900">Request Return or Replacement</h3>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {returnSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Return Request Submitted!</span>
                </div>
                <p>Courier pickup scheduled for tomorrow. Refund or replacement will initiate upon collection.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs font-mono-tech">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase text-[10px]">Select Item for Return</label>
                  <select
                    value={returnSku}
                    onChange={(e) => setReturnSku(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl text-xs"
                  >
                    {returnModalOrder.items.map((i) => (
                      <option key={i.sku} value={i.sku}>
                        {i.name} (SKU: {i.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase text-[10px]">Resolution Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReturnType('REFUND')}
                      className={`p-2.5 rounded-xl border text-center font-bold uppercase cursor-pointer ${
                        returnType === 'REFUND'
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-[#E7E5E0] bg-[#F8F7F4] text-stone-700'
                      }`}
                    >
                      Direct Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnType('EXCHANGE')}
                      className={`p-2.5 rounded-xl border text-center font-bold uppercase cursor-pointer ${
                        returnType === 'EXCHANGE'
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-[#E7E5E0] bg-[#F8F7F4] text-stone-700'
                      }`}
                    >
                      Free Replacement
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase text-[10px]">Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl text-xs"
                  >
                    <option value="Damaged in transit">Damaged in transit</option>
                    <option value="Defective component">Defective component</option>
                    <option value="Specification mismatch with hardware project">Specification mismatch with hardware project</option>
                    <option value="Wrong product received">Wrong product received</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase text-[10px]">Additional Notes / Evidence</label>
                  <textarea
                    rows={2}
                    value={returnEvidenceNote}
                    onChange={(e) => setReturnEvidenceNote(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl text-xs"
                    placeholder="Provide details about the issue..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                  >
                    Submit Return Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnModalOrder(null)}
                    className="px-4 py-2.5 bg-[#F2EFE9] hover:bg-[#EAE6DE] text-stone-800 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAX INVOICE MODAL */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E5E0] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
              <div>
                <span className="font-serif-luxury italic font-bold text-xl text-stone-900">
                  WareWise Commercial Invoice
                </span>
                <p className="text-[11px] font-mono-tech text-stone-500">
                  GST Tax Invoice • {invoiceModalOrder.id}
                </p>
              </div>
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono-tech">
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-[#F8F7F4] rounded-xl border border-[#E7E5E0]">
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Billed To:</div>
                  <div className="font-bold text-stone-900 mt-0.5">{invoiceModalOrder.shippingAddress?.name || invoiceModalOrder.customerName}</div>
                  <div className="text-stone-600 text-[11px] font-sans">{invoiceModalOrder.shippingAddress?.city}, {invoiceModalOrder.shippingAddress?.pincode}</div>
                </div>
                <div className="text-right">
                  <div className="text-stone-400 uppercase text-[10px]">Payment Method:</div>
                  <div className="font-bold text-stone-900 mt-0.5">{invoiceModalOrder.paymentMethod || 'UPI / NetBanking'}</div>
                  <div className="text-emerald-700 text-[10px] font-bold">STATUS: PAID</div>
                </div>
              </div>

              <div className="divide-y divide-[#E7E5E0] border border-[#E7E5E0] rounded-xl overflow-hidden">
                {invoiceModalOrder.items.map((item) => (
                  <div key={item.sku} className="p-3 flex justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-stone-500 text-[10px]">SKU: {item.sku} × {item.quantity}</div>
                    </div>
                    <div className="font-bold text-stone-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-[#F8F7F4] flex justify-between font-bold text-stone-900">
                  <span>Grand Total (All Taxes Included)</span>
                  <span>₹{invoiceModalOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Invoice for order ${invoiceModalOrder.id} downloaded.`);
                  setInvoiceModalOrder(null);
                }}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
