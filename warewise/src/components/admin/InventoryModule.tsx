import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { StockHealthStatus, StockReceipt, StockAdjustment } from '../../types';
import {
  Boxes,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  ArrowDownLeft,
  Sliders,
  History,
  FileCheck,
  Package,
  Layers,
  MapPin,
  ClipboardList,
  Calendar,
  X,
  ShieldCheck,
  ArrowRight,
  Lock,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InventoryModule: React.FC = () => {
  const {
    products,
    triggerReorder,
    stockReceipts,
    stockAdjustments,
    inventoryTransactions,
    recordStockReceipt,
    recordStockAdjustment,
    currentUser,
    addAuditLog,
    isOnline,
    enqueueOfflineMove,
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'RECEIPTS' | 'ADJUSTMENTS' | 'TRANSACTIONS'>('STOCK');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHealth, setFilterHealth] = useState<StockHealthStatus | 'ALL'>('ALL');

  // Modals
  const [selectedSkuForPo, setSelectedSkuForPo] = useState<string | null>(null);
  const [poQty, setPoQty] = useState(50);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Multi-step Confirmation State for Batch Inventory Updates
  const [pendingBatchOp, setPendingBatchOp] = useState<{
    type: 'STOCK_RECEIPT' | 'STOCK_ADJUSTMENT';
    data: any;
  } | null>(null);

  const [confirmationStep, setConfirmationStep] = useState<1 | 2>(1);
  const [operatorChecked, setOperatorChecked] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');

  // New Receipt Form State
  const [receiptForm, setReceiptForm] = useState({
    productId: products[0]?.id || '',
    sku: products[0]?.sku || '',
    productName: products[0]?.name || '',
    quantity: 25,
    supplier: 'NeuralSilicon Global Hub',
    referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
    binLocation: 'A-02-1',
    zone: 'Zone A (High Velocity)',
    condition: 'PRISTINE' as StockReceipt['condition'],
    notes: '',
  });

  // Adjustment Form State
  const [adjustForm, setAdjustForm] = useState({
    productId: products[0]?.id || '',
    sku: products[0]?.sku || '',
    productName: products[0]?.name || '',
    adjustmentQty: -1,
    reason: 'DAMAGED' as StockAdjustment['reason'],
    notes: '',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.binLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHealth = filterHealth === 'ALL' || p.health === filterHealth;
      return matchesSearch && matchesHealth;
    });
  }, [products, searchTerm, filterHealth]);

  const handleIssuePo = (sku: string) => {
    triggerReorder(sku, poQty);
    setFeedbackMessage(`Purchase Order PO-${Date.now().toString().slice(-6)} issued for ${poQty} units of ${sku}.`);
    setSelectedSkuForPo(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleProductSelectForReceipt = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setReceiptForm((prev) => ({
        ...prev,
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        binLocation: prod.binLocation,
        zone: prod.zone,
      }));
    }
  };

  const handleProductSelectForAdjustment = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setAdjustForm((prev) => ({
        ...prev,
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
      }));
    }
  };

  // Initiate Multi-step Receipt Confirmation
  const handleInitiateReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === receiptForm.sku);
    setPendingBatchOp({
      type: 'STOCK_RECEIPT',
      data: {
        ...receiptForm,
        unitPrice: prod?.price || 0,
        currentStock: prod?.availableStock || 0,
        newStock: (prod?.availableStock || 0) + Number(receiptForm.quantity)
      }
    });
    setConfirmationStep(1);
    setOperatorChecked(false);
    setAuditNotes(receiptForm.notes || 'Inward supplier stock receipt verified against shipping manifest.');
  };

  // Initiate Multi-step Adjustment Confirmation
  const handleInitiateAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = products.find((p) => p.sku === adjustForm.sku);
    const prevPhys = target ? target.availableStock + target.reservedStock + target.damagedStock : 0;
    const adjQty = Number(adjustForm.adjustmentQty);

    setPendingBatchOp({
      type: 'STOCK_ADJUSTMENT',
      data: {
        ...adjustForm,
        unitPrice: target?.price || 0,
        previousPhysicalQty: prevPhys,
        adjustmentQty: adjQty,
        newPhysicalQty: Math.max(0, prevPhys + adjQty)
      }
    });
    setConfirmationStep(1);
    setOperatorChecked(false);
    setAuditNotes(adjustForm.notes || 'Physical inventory cycle count adjustment.');
  };

  // Final Commit for Batch Operations
  const handleFinalCommitBatchOp = () => {
    if (!pendingBatchOp) return;

    if (pendingBatchOp.type === 'STOCK_RECEIPT') {
      recordStockReceipt({
        productId: pendingBatchOp.data.productId,
        sku: pendingBatchOp.data.sku,
        productName: pendingBatchOp.data.productName,
        quantity: Number(pendingBatchOp.data.quantity),
        supplier: pendingBatchOp.data.supplier,
        referenceNumber: pendingBatchOp.data.referenceNumber,
        importDate: new Date().toISOString().slice(0, 10),
        binLocation: pendingBatchOp.data.binLocation,
        zone: pendingBatchOp.data.zone,
        condition: pendingBatchOp.data.condition,
        operator: currentUser.name || 'System Operator',
        notes: auditNotes,
      });

      if (!isOnline) {
        enqueueOfflineMove({
          type: 'STOCK_RECEIPT',
          title: `Stock Receipt: +${pendingBatchOp.data.quantity}x ${pendingBatchOp.data.sku}`,
          details: `Supplier ${pendingBatchOp.data.supplier} • Bin ${pendingBatchOp.data.binLocation} (Ref #${pendingBatchOp.data.referenceNumber})`,
          operator: currentUser.name || 'System Operator',
          payload: pendingBatchOp.data
        });
        setShowReceiptModal(false);
        setPendingBatchOp(null);
        setFeedbackMessage(`📦 OFFLINE CACHED: Inward stock receipt for +${pendingBatchOp.data.quantity}x ${pendingBatchOp.data.sku} saved to local offline queue.`);
        setTimeout(() => setFeedbackMessage(null), 5000);
        return;
      }

      addAuditLog({
        actor: currentUser.name || 'System Operator',
        role: currentUser.role || 'INVENTORY_MANAGER',
        action: 'BATCH_STOCK_RECEIPT_CONFIRMED',
        target: `${pendingBatchOp.data.sku} (+${pendingBatchOp.data.quantity} units)`,
        details: `Inward receipt from ${pendingBatchOp.data.supplier} (PO #${pendingBatchOp.data.referenceNumber}) staged to Bin ${pendingBatchOp.data.binLocation}.`
      });

      setShowReceiptModal(false);
      setFeedbackMessage(`✓ Confirmed Stock Receipt: +${pendingBatchOp.data.quantity}x ${pendingBatchOp.data.sku} staged to Bin ${pendingBatchOp.data.binLocation}.`);
    } else if (pendingBatchOp.type === 'STOCK_ADJUSTMENT') {
      recordStockAdjustment({
        productId: pendingBatchOp.data.productId,
        sku: pendingBatchOp.data.sku,
        productName: pendingBatchOp.data.productName,
        previousPhysicalQty: pendingBatchOp.data.previousPhysicalQty,
        adjustmentQty: pendingBatchOp.data.adjustmentQty,
        newPhysicalQty: pendingBatchOp.data.newPhysicalQty,
        reason: pendingBatchOp.data.reason,
        operator: currentUser.name || 'System Operator',
        operatorRole: currentUser.role || 'INVENTORY_MANAGER',
        notes: auditNotes,
      });

      if (!isOnline) {
        enqueueOfflineMove({
          type: 'STOCK_ADJUSTMENT',
          title: `Stock Adjustment: ${pendingBatchOp.data.sku} (${pendingBatchOp.data.adjustmentQty > 0 ? '+' : ''}${pendingBatchOp.data.adjustmentQty})`,
          details: `Reason: ${pendingBatchOp.data.reason} • New Physical Stock: ${pendingBatchOp.data.newPhysicalQty}`,
          operator: currentUser.name || 'System Operator',
          payload: pendingBatchOp.data
        });
        setShowAdjustmentModal(false);
        setPendingBatchOp(null);
        setFeedbackMessage(`📦 OFFLINE CACHED: Stock adjustment for ${pendingBatchOp.data.sku} saved to local offline queue.`);
        setTimeout(() => setFeedbackMessage(null), 5000);
        return;
      }

      addAuditLog({
        actor: currentUser.name || 'System Operator',
        role: currentUser.role || 'INVENTORY_MANAGER',
        action: 'BATCH_STOCK_ADJUSTMENT_CONFIRMED',
        target: `${pendingBatchOp.data.sku} (${pendingBatchOp.data.adjustmentQty > 0 ? '+' : ''}${pendingBatchOp.data.adjustmentQty} units)`,
        details: `Physical count adjustment recorded for ${pendingBatchOp.data.sku}. Reason: ${pendingBatchOp.data.reason}`
      });

      setShowAdjustmentModal(false);
      setFeedbackMessage(`✓ Confirmed Stock Adjustment: ${pendingBatchOp.data.sku} adjusted by ${pendingBatchOp.data.adjustmentQty > 0 ? '+' : ''}${pendingBatchOp.data.adjustmentQty} units.`);
    }

    setPendingBatchOp(null);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const getHealthBadge = (health: StockHealthStatus) => {
    switch (health) {
      case 'HEALTHY':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-stone-100 text-stone-800 font-medium">HEALTHY</span>;
      case 'LOW_STOCK':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-amber-100 text-amber-900 font-semibold border border-amber-300">LOW STOCK</span>;
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-red-600 text-white font-bold">SHORTAGE RISK</span>;
      case 'OUT_OF_STOCK':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-stone-900 text-white font-bold">STOCKOUT</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-stone-100 text-stone-700">{health}</span>;
    }
  };

  return (
    <div className="space-y-6 text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1 flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5 text-stone-700" />
            <span>Inventory Management & Physical Ledger</span>
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Real-Time Stock Health & Batch Physical Movements
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5 max-w-2xl leading-relaxed">
            Record supplier stock inward receipts, perform cycle count adjustments, manage bin topologies, and inspect immutable inventory logs with multi-step confirmation safeguards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-semibold shadow-sm transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Receive Inward Stock</span>
          </button>

          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-mono-tech font-semibold transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-stone-600" />
            <span>Stock Adjustment</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900 flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Stock Health Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold">Healthy SKUs</div>
          <div className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            {products.filter((p) => p.health === 'HEALTHY').length}
          </div>
          <div className="text-[10px] font-mono-tech text-stone-500">Above reorder safety threshold</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-amber-700 font-semibold">Low Stock Warnings</div>
          <div className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            {products.filter((p) => p.health === 'LOW_STOCK').length}
          </div>
          <div className="text-[10px] font-mono-tech text-amber-800 font-bold">Replenishment PO recommended</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-red-600 font-semibold">Critical Shortages</div>
          <div className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            {products.filter((p) => p.health === 'CRITICAL' || p.health === 'OUT_OF_STOCK').length}
          </div>
          <div className="text-[10px] font-mono-tech text-red-600 font-bold">Immediate cross-dock priority</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold">Total Physical Units</div>
          <div className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900">
            {products.reduce((acc, p) => acc + p.availableStock + p.reservedStock, 0).toLocaleString()}
          </div>
          <div className="text-[10px] font-mono-tech text-stone-500">Across 14 bin racks</div>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Inventory Ledger Module Views"
        className="flex border-b border-[#E7E5E0] gap-6 text-xs font-mono-tech overflow-x-auto"
      >
        {[
          { id: 'STOCK', label: 'ALL SKUs & BIN LOCATIONS', icon: Boxes },
          { id: 'RECEIPTS', label: 'INWARD STOCK RECEIPTS', icon: ArrowDownLeft },
          { id: 'ADJUSTMENTS', label: 'PHYSICAL ADJUSTMENTS', icon: Sliders },
          { id: 'TRANSACTIONS', label: 'LEDGER TRANSACTION FEED', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id.toLowerCase()}`}
              id={`tab-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isActive
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL SKUs */}
      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU, item name, bin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E7E5E0] rounded-xl pl-9 pr-3 py-2 text-xs font-mono-tech focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-tech w-full sm:w-auto overflow-x-auto">
              <span className="text-stone-500 font-semibold shrink-0">Filter Health:</span>
              {['ALL', 'HEALTHY', 'LOW_STOCK', 'CRITICAL'].map((h) => (
                <button
                  key={h}
                  onClick={() => setFilterHealth(h as any)}
                  className={`px-3 py-1 rounded-lg border text-[10px] font-bold cursor-pointer shrink-0 ${
                    filterHealth === h
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-lux">
            <table className="w-full text-left border-collapse text-xs font-mono-tech">
              <thead>
                <tr className="bg-[#FBFBF9] border-b border-[#E7E5E0] text-stone-500 text-[10px] uppercase">
                  <th className="p-3.5 font-bold">Product & SKU</th>
                  <th className="p-3.5 font-bold">Bin / Zone Location</th>
                  <th className="p-3.5 font-bold text-center">Available</th>
                  <th className="p-3.5 font-bold text-center">Reserved</th>
                  <th className="p-3.5 font-bold text-center">Safety Stock</th>
                  <th className="p-3.5 font-bold">Health Status</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0" />
                        <div>
                          <div className="font-bold text-stone-900 font-sans">{p.name}</div>
                          <div className="text-[10px] text-stone-500">{p.sku} • ₹{p.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{p.binLocation}</div>
                      <div className="text-[10px] text-stone-500">{p.zone}</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-stone-900 text-sm">
                      {p.availableStock}
                    </td>
                    <td className="p-3.5 text-center text-stone-600">
                      {p.reservedStock}
                    </td>
                    <td className="p-3.5 text-center text-stone-500">
                      {p.safetyStock}
                    </td>
                    <td className="p-3.5">
                      {getHealthBadge(p.health)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedSkuForPo(p.sku);
                          setPoQty(Math.max(20, p.safetyStock * 2));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Reorder PO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INWARD RECEIPTS */}
      {activeTab === 'RECEIPTS' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-lux space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <h3 className="font-serif-luxury font-bold text-lg text-stone-900">Inward Stock Receipt Records</h3>
            <span className="text-xs font-mono-tech text-stone-500">{stockReceipts.length} Recorded Deliveries</span>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono-tech">
            <thead>
              <tr className="bg-[#FBFBF9] border-b border-[#E7E5E0] text-stone-500 text-[10px] uppercase">
                <th className="p-3 font-bold">Ref PO / Date</th>
                <th className="p-3 font-bold">SKU & Product</th>
                <th className="p-3 font-bold">Quantity</th>
                <th className="p-3 font-bold">Supplier</th>
                <th className="p-3 font-bold">Staged Bin</th>
                <th className="p-3 font-bold">Condition</th>
                <th className="p-3 font-bold">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E0]">
              {stockReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">
                    <div>{r.referenceNumber}</div>
                    <div className="text-[10px] text-stone-500 font-normal">{r.importDate}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-stone-900">{r.sku}</div>
                    <div className="text-[10px] text-stone-500">{r.productName}</div>
                  </td>
                  <td className="p-3 font-bold text-emerald-700">
                    +{r.quantity} units
                  </td>
                  <td className="p-3 text-stone-700">{r.supplier}</td>
                  <td className="p-3 font-bold text-stone-900">{r.binLocation}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      {r.condition}
                    </span>
                  </td>
                  <td className="p-3 text-stone-600">{r.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ADJUSTMENTS */}
      {activeTab === 'ADJUSTMENTS' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-lux space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <h3 className="font-serif-luxury font-bold text-lg text-stone-900">Physical Stock Adjustments</h3>
            <span className="text-xs font-mono-tech text-stone-500">{stockAdjustments.length} Cycle Count Corrections</span>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono-tech">
            <thead>
              <tr className="bg-[#FBFBF9] border-b border-[#E7E5E0] text-stone-500 text-[10px] uppercase">
                <th className="p-3 font-bold">Timestamp</th>
                <th className="p-3 font-bold">SKU</th>
                <th className="p-3 font-bold">Prev ➔ New Phys</th>
                <th className="p-3 font-bold">Delta</th>
                <th className="p-3 font-bold">Reason Code</th>
                <th className="p-3 font-bold">Auditor</th>
                <th className="p-3 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E0]">
              {stockAdjustments.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-900">{new Date(a.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-stone-900">{a.sku}</td>
                  <td className="p-3 text-stone-700">{a.previousPhysicalQty} ➔ <strong className="text-stone-900">{a.newPhysicalQty}</strong></td>
                  <td className="p-3 font-bold">
                    <span className={a.adjustmentQty >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                      {a.adjustmentQty > 0 ? '+' : ''}{a.adjustmentQty}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[9px] font-bold">
                      {a.reason}
                    </span>
                  </td>
                  <td className="p-3 text-stone-600">{a.operator}</td>
                  <td className="p-3 text-stone-500 text-[11px] font-sans">{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: TRANSACTIONS */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-lux space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <h3 className="font-serif-luxury font-bold text-lg text-stone-900">Immutable Ledger Feed</h3>
            <span className="text-xs font-mono-tech text-stone-500">{inventoryTransactions.length} Logged Events</span>
          </div>

          <div className="space-y-2">
            {inventoryTransactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl flex items-center justify-between text-xs font-mono-tech">
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-md ${tx.quantityChange >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {tx.quantityChange >= 0 ? <ArrowDownLeft className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </span>
                  <div>
                    <div className="font-bold text-stone-900">{tx.type} • {tx.sku}</div>
                    <div className="text-[10px] text-stone-500 font-sans">{tx.notes}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${tx.quantityChange >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {tx.quantityChange > 0 ? '+' : ''}{tx.quantityChange} units
                  </div>
                  <div className="text-[10px] text-stone-500">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Inward Stock Receipt Form */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-xl text-[#1A1A1A]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
                Receive Inward Stock Delivery
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateReceiptSubmit} className="space-y-4 text-xs font-mono-tech">
              <div>
                <label className="text-stone-600 block mb-1">Target Product / SKU</label>
                <select
                  value={receiptForm.productId}
                  onChange={(e) => handleProductSelectForReceipt(e.target.value)}
                  className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (Current: {p.availableStock} avail)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 block mb-1">Inward Quantity</label>
                  <input
                    type="number"
                    value={receiptForm.quantity}
                    onChange={(e) => setReceiptForm({ ...receiptForm, quantity: Number(e.target.value) })}
                    className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-stone-600 block mb-1">Target Staging Bin</label>
                  <input
                    type="text"
                    value={receiptForm.binLocation}
                    onChange={(e) => setReceiptForm({ ...receiptForm, binLocation: e.target.value })}
                    className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 block mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={receiptForm.supplier}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
                    className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-stone-600 block mb-1">PO / Invoice Ref</label>
                  <input
                    type="text"
                    value={receiptForm.referenceNumber}
                    onChange={(e) => setReceiptForm({ ...receiptForm, referenceNumber: e.target.value })}
                    className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-600 block mb-1">Physical Inspection Condition</label>
                <select
                  value={receiptForm.condition}
                  onChange={(e) => setReceiptForm({ ...receiptForm, condition: e.target.value as any })}
                  className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  <option value="PRISTINE">Pristine (Verified Factory Seal)</option>
                  <option value="INSPECTED">Inspected & Approved</option>
                  <option value="NEEDS_LABELING">Needs Barcode Relabeling</option>
                  <option value="PARTIAL_DAMAGE">Partial Damage (Quarantine Required)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Review Batch Receipt ➔</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock Adjustment Form */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-xl text-[#1A1A1A]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
                Record Physical Stock Adjustment
              </h3>
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateAdjustmentSubmit} className="space-y-4 text-xs font-mono-tech">
              <div>
                <label className="text-stone-600 block mb-1">Target Product / SKU</label>
                <select
                  value={adjustForm.productId}
                  onChange={(e) => handleProductSelectForAdjustment(e.target.value)}
                  className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (Current: {p.availableStock} avail)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 block mb-1">Quantity Delta (+ / -)</label>
                  <input
                    type="number"
                    value={adjustForm.adjustmentQty}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentQty: Number(e.target.value) })}
                    className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                    required
                  />
                  <span className="text-[10px] text-stone-500">e.g. -2 for damage, +5 for count find</span>
                </div>

                <div>
                  <label className="text-stone-600 block mb-1">Reason Code</label>
                  <select
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value as any })}
                    className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    <option value="DAMAGED">Damaged (Move to Quarantine)</option>
                    <option value="MISSING">Missing / Shortage</option>
                    <option value="COUNTING_CORRECTION">Cycle Count Correction</option>
                    <option value="RETURNED">Customer Return Restock</option>
                    <option value="WAREHOUSE_TRANSFER">Warehouse Transfer</option>
                    <option value="ADMINISTRATIVE_CORRECTION">Admin Correction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-600 block mb-1">Auditor Notes & Root-Cause</label>
                <input
                  type="text"
                  placeholder="Reason for discrepancy or quarantine shelf location..."
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Review Batch Adjustment ➔</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================================
          🛡️ MULTI-STEP CONFIRMATION DIALOG MODAL (BATCH INVENTORY UPDATE)
      ========================================================================================= */}
      {pendingBatchOp && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#E7E5E0] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden text-[#1A1A1A]"
          >
            {/* Modal Header */}
            <div className="bg-[#1C1917] text-stone-100 p-5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500 text-stone-950 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Multi-Step Confirmation Safeguard • Step {confirmationStep} of 2
                  </div>
                  <h3 className="text-base font-serif-luxury font-bold italic text-white">
                    Confirm Batch Inventory Mutation
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPendingBatchOp(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* STEP 1: IMPACT SUMMARY PREVIEW */}
              {confirmationStep === 1 && (
                <div className="space-y-4 font-mono">
                  <div className="p-3 bg-stone-100 border border-stone-300 text-stone-900 rounded-xl flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-700 shrink-0" />
                    <span>
                      <strong>Impact Summary Preview:</strong> Review physical ledger metrics below prior to operator sign-off.
                    </span>
                  </div>

                  {pendingBatchOp.type === 'STOCK_RECEIPT' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="text-[10px] text-stone-500 uppercase font-bold">Item & PO Reference</div>
                        <div className="font-bold text-stone-900 text-sm">
                          {pendingBatchOp.data.productName} ({pendingBatchOp.data.sku})
                        </div>
                        <div className="text-stone-600 text-[11px]">
                          Supplier: {pendingBatchOp.data.supplier} • Ref PO: #{pendingBatchOp.data.referenceNumber}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Inward Batch Size</div>
                          <div className="font-bold text-emerald-600 mt-1">+{pendingBatchOp.data.quantity} Units</div>
                          <div className="text-[10px] text-stone-600">Staged to Bin: {pendingBatchOp.data.binLocation}</div>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Physical Stock Growth</div>
                          <div className="font-bold text-stone-900 mt-1">
                            {pendingBatchOp.data.currentStock} ➔ {pendingBatchOp.data.newStock} Units
                          </div>
                          <div className="text-[10px] text-stone-600">Condition: {pendingBatchOp.data.condition}</div>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold">
                        Financial Inventory Asset Growth: +₹{(pendingBatchOp.data.quantity * pendingBatchOp.data.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {pendingBatchOp.type === 'STOCK_ADJUSTMENT' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="text-[10px] text-stone-500 uppercase font-bold">Physical Count Correction Target</div>
                        <div className="font-bold text-stone-900 text-sm">
                          {pendingBatchOp.data.productName} ({pendingBatchOp.data.sku})
                        </div>
                        <div className="text-stone-600 text-[11px]">
                          Reason Code: {pendingBatchOp.data.reason}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Quantity Adjustment Delta</div>
                          <div className={`font-bold mt-1 ${pendingBatchOp.data.adjustmentQty >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {pendingBatchOp.data.adjustmentQty > 0 ? '+' : ''}{pendingBatchOp.data.adjustmentQty} Units
                          </div>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">New Physical Stock</div>
                          <div className="font-bold text-stone-900 mt-1">
                            {pendingBatchOp.data.previousPhysicalQty} ➔ {pendingBatchOp.data.newPhysicalQty} Units
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: OPERATOR SECURITY CHECK & SIGN-OFF */}
              {confirmationStep === 2 && (
                <div className="space-y-4 font-sans">
                  <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                      <span>VERIFIED OPERATOR CREDENTIALS</span>
                      <span>{currentUser.role}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{currentUser.name || 'System Administrator'}</div>
                    <div className="text-[10px] text-stone-400">Hub: WH-METRO-01 • Workstation ID: WS-INV-02</div>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-xs font-bold text-stone-800 uppercase block">
                      Audit Notes & Verification Detail:
                    </label>
                    <textarea
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 font-sans focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <label className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={operatorChecked}
                      onChange={(e) => setOperatorChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-950">
                      I have verified the physical count documentation / inward delivery notes and confirm this inventory mutation is accurate and complete.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setPendingBatchOp(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                {confirmationStep === 1 ? (
                  <button
                    onClick={() => setConfirmationStep(2)}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Operator Security Sign-Off</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalCommitBatchOp}
                    disabled={!operatorChecked}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Commit Batch Inventory Mutation</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* PO Modal */}
      {selectedSkuForPo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
              Generate Purchase Order
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Replenishment PO for SKU <strong className="text-stone-900">{selectedSkuForPo}</strong>.
            </p>

            <div className="space-y-3 font-mono-tech text-xs">
              <div>
                <label className="text-stone-600 block mb-1">Reorder Quantity</label>
                <input
                  type="number"
                  value={poQty}
                  onChange={(e) => setPoQty(Number(e.target.value))}
                  className="w-full bg-[#FBFBF9] border border-stone-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-stone-900 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSkuForPo(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleIssuePo(selectedSkuForPo)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium cursor-pointer shadow-sm"
              >
                Confirm PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
