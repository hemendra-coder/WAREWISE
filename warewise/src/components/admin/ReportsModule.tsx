import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Clock,
  Layers,
  ArrowDownToLine,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const {
    products,
    orders,
    exceptions,
    auditLogs,
    stockReceipts,
    stockAdjustments,
    inventoryTransactions,
    metrics
  } = useWarehouse();

  const [reportType, setReportType] = useState<'INVENTORY_VALUATION' | 'ORDER_FULFILLMENT' | 'EXCEPTION_AUDIT' | 'TRANSACTIONS_LOG'>('INVENTORY_VALUATION');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Calculations for reports
  const totalValuation = products.reduce((acc, p) => acc + p.price * (p.availableStock + p.reservedStock), 0);
  const totalPhysicalUnits = products.reduce((acc, p) => acc + p.availableStock + p.reservedStock + p.damagedStock, 0);
  const onTimeOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'DISPATCHED').length;
  const slaCompliance = orders.length > 0 ? Math.round((onTimeOrders / orders.length) * 100) : 98;

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'INVENTORY_VALUATION') {
      csvContent += 'SKU,Product Name,Category,Bin Location,Available Stock,Reserved Stock,Damaged Stock,Unit Price (INR),Total Value (INR),Health Status\n';
      products.forEach((p) => {
        const line = `"${p.sku}","${p.name}","${p.category}","${p.binLocation}",${p.availableStock},${p.reservedStock},${p.damagedStock},${p.price},${p.price * (p.availableStock + p.reservedStock)},"${p.health}"`;
        csvContent += line + '\n';
      });
    } else if (reportType === 'ORDER_FULFILLMENT') {
      csvContent += 'Order ID,Customer,Status,Priority Score,Item Count,Total (INR),Created At,Carrier,Tracking Number\n';
      orders.forEach((o) => {
        const line = `"${o.id}","${o.customerName}","${o.status}",${o.priorityScore},${o.items.length},${o.totalAmount},"${o.createdAt}","${o.carrierName || 'N/A'}","${o.trackingNumber || 'N/A'}"`;
        csvContent += line + '\n';
      });
    } else if (reportType === 'EXCEPTION_AUDIT') {
      csvContent += 'Exception ID,Order ID,SKU,Product,Type,Severity,Status,Location,Reported By,Impact\n';
      exceptions.forEach((e) => {
        const line = `"${e.id}","${e.orderId}","${e.sku}","${e.productName}","${e.type}","${e.severity}","${e.status}","${e.affectedLocation || 'N/A'}","${e.reportedBy}","${e.impactAnalysis}"`;
        csvContent += line + '\n';
      });
    } else {
      csvContent += 'Transaction ID,SKU,Product,Type,Quantity Change,Physical Stock After,Available Stock After,Reference ID,Operator,Timestamp\n';
      inventoryTransactions.forEach((t) => {
        const line = `"${t.id}","${t.sku}","${t.productName}","${t.type}",${t.quantityChange},${t.physicalStockAfter},${t.availableStockAfter},"${t.referenceId}","${t.operator}","${t.timestamp}"`;
        csvContent += line + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WareWise_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(`Exported ${reportType.replace(/_/g, ' ')} CSV successfully.`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportJSON = () => {
    let dataToExport: any = {};
    if (reportType === 'INVENTORY_VALUATION') {
      dataToExport = { generatedAt: new Date().toISOString(), products, valuation: totalValuation };
    } else if (reportType === 'ORDER_FULFILLMENT') {
      dataToExport = { generatedAt: new Date().toISOString(), orders, metrics };
    } else if (reportType === 'EXCEPTION_AUDIT') {
      dataToExport = { generatedAt: new Date().toISOString(), exceptions, auditLogs };
    } else {
      dataToExport = { generatedAt: new Date().toISOString(), inventoryTransactions, stockReceipts, stockAdjustments };
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `WareWise_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(`Exported ${reportType.replace(/_/g, ' ')} JSON file successfully.`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-stone-700" />
            <span>Compliance, Reconciliation & Governance</span>
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Operations Reports & Data Export Engine
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5 max-w-2xl leading-relaxed">
            Generate auditor-ready CSV and JSON data exports for ledger balancing, order SLAs, cycle count adjustments, and transaction histories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-stone-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-mono-tech font-semibold transition-all cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4 text-stone-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono-tech text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold">Total Stock Valuation</div>
          <div className="text-2xl font-serif-luxury font-bold text-stone-900">
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">{totalPhysicalUnits} physical units in hub</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold">SLA Adherence</div>
          <div className="text-2xl font-serif-luxury font-bold text-stone-900">
            {metrics.dispatchAdherencePercent}%
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">Flight courier cutoff target: 98%</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold">Audit Trail Events</div>
          <div className="text-2xl font-serif-luxury font-bold text-stone-900">
            {auditLogs.length}
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">Immutable operator logs</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold">Ledger Transactions</div>
          <div className="text-2xl font-serif-luxury font-bold text-stone-900">
            {inventoryTransactions.length}
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">Physical movements recorded</div>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-[#E7E5E0] shadow-lux">
        {[
          { id: 'INVENTORY_VALUATION', label: 'Inventory Valuation & Balance' },
          { id: 'ORDER_FULFILLMENT', label: 'Order SLA & Fulfillment Velocity' },
          { id: 'EXCEPTION_AUDIT', label: 'Incidents & Quality Exceptions' },
          { id: 'TRANSACTIONS_LOG', label: 'Raw Inventory Transactions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              reportType === tab.id
                ? 'bg-stone-900 text-white font-semibold shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preview Table Container */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl shadow-lux overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E5E0] flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold uppercase text-stone-900">
              Live Preview: {reportType.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-[11px] font-mono-tech text-stone-500">
            Showing top records for export validation
          </span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'INVENTORY_VALUATION' && (
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-[#F5F4F0] border-b border-[#E7E5E0] text-[10px] text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU / Product</th>
                  <th className="py-3 px-4">Bin Location</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Reserved</th>
                  <th className="py-3 px-4">Damaged</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Valuation (INR)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FBFBF9]">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{p.sku}</div>
                      <div className="text-[11px] text-stone-500 font-sans truncate max-w-xs">{p.name}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-700 font-semibold">{p.binLocation}</td>
                    <td className="py-3 px-4 text-emerald-800 font-bold">{p.availableStock}</td>
                    <td className="py-3 px-4 text-stone-600">{p.reservedStock}</td>
                    <td className="py-3 px-4 text-rose-700">{p.damagedStock}</td>
                    <td className="py-3 px-4 text-stone-800">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-stone-900 font-bold">
                      ₹{((p.availableStock + p.reservedStock) * p.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-800 font-semibold">
                        {p.health}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'ORDER_FULFILLMENT' && (
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-[#F5F4F0] border-b border-[#E7E5E0] text-[10px] text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Carrier & Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FBFBF9]">
                    <td className="py-3 px-4 font-bold text-stone-900">{o.id}</td>
                    <td className="py-3 px-4 text-stone-700">{o.customerName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-900 font-semibold">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">{o.priorityScore}</td>
                    <td className="py-3 px-4 text-stone-600">{o.items.length} SKUs</td>
                    <td className="py-3 px-4 text-stone-900 font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-stone-600">
                      {o.carrierName ? `${o.carrierName} (${o.trackingNumber})` : 'Pending dispatch wave'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'EXCEPTION_AUDIT' && (
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-[#F5F4F0] border-b border-[#E7E5E0] text-[10px] text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">SKU / Item</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reported By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {exceptions.map((e) => (
                  <tr key={e.id} className="hover:bg-[#FBFBF9]">
                    <td className="py-3 px-4 font-bold text-stone-900">{e.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{e.sku}</div>
                      <div className="text-[11px] text-stone-500 truncate max-w-xs">{e.productName}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-700">{e.type}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-white">
                        {e.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-800 font-semibold">{e.status}</td>
                    <td className="py-3 px-4 text-stone-600">{e.affectedLocation || 'N/A'}</td>
                    <td className="py-3 px-4 text-stone-700">{e.reportedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'TRANSACTIONS_LOG' && (
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-[#F5F4F0] border-b border-[#E7E5E0] text-[10px] text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">SKU / Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Qty Change</th>
                  <th className="py-3 px-4">Avail Stock After</th>
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {inventoryTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FBFBF9]">
                    <td className="py-3 px-4 font-bold text-stone-900">{t.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{t.sku}</div>
                      <div className="text-[11px] text-stone-500 truncate max-w-xs">{t.productName}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">{t.type}</td>
                    <td className={`py-3 px-4 font-bold ${t.quantityChange >= 0 ? 'text-emerald-800' : 'text-stone-900'}`}>
                      {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-bold">{t.availableStockAfter}</td>
                    <td className="py-3 px-4 text-stone-600">{t.referenceId}</td>
                    <td className="py-3 px-4 text-stone-700">{t.operator}</td>
                    <td className="py-3 px-4 text-stone-500">{t.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
