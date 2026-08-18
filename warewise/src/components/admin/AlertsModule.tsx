import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { WarehouseAlert } from '../../types';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AlertsModule: React.FC = () => {
  const {
    warehouseAlerts,
    acknowledgeAlert,
    resolveAlert,
    setActiveAdminModule
  } = useWarehouse();

  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREAD' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = warehouseAlerts.filter((alt) => {
    const matchesSeverity = filterSeverity === 'ALL' || alt.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || alt.status === filterStatus;
    const matchesSearch =
      alt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alt.relatedEntityId && alt.relatedEntityId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const unreadCriticalCount = warehouseAlerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'UNREAD').length;
  const warningCount = warehouseAlerts.filter((a) => a.severity === 'WARNING' && a.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-stone-700" />
            <span>Autonomous Telemetry & Anomaly Detection</span>
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Warehouse Alerts & SLA Breach Sentinel
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5 max-w-2xl leading-relaxed">
            Real-time optical anomaly detection, flight courier cutoff countdowns, bin stockouts, and operator station lag alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono-tech text-stone-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Active Polling: 100ms Telemetry</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold flex items-center justify-between">
            <span>Critical Anomalies</span>
            <ShieldAlert className="w-4 h-4 text-stone-900" />
          </div>
          <div className="text-3xl font-serif-luxury font-bold text-stone-900">
            {unreadCriticalCount}
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">Requiring immediate dispatcher review</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold flex items-center justify-between">
            <span>Throughput Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-serif-luxury font-bold text-stone-900">
            {warningCount}
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">Bench congestion & buffer warnings</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-lux space-y-1">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold flex items-center justify-between">
            <span>Total Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif-luxury font-bold text-stone-900">
            {warehouseAlerts.filter((a) => a.status === 'RESOLVED').length}
          </div>
          <div className="text-[11px] text-stone-500 font-mono-tech">Auto-calibrated or staff resolved</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E7E5E0] p-4 rounded-2xl shadow-lux flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by SKU, title, order ID..."
            className="w-full bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-mono-tech"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-stone-900 text-white font-semibold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(['ALL', 'UNREAD', 'ACKNOWLEDGED', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-stone-900 text-white font-semibold shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-12 text-center shadow-lux">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-serif-luxury text-xl font-bold text-stone-900">All Clear</h3>
            <p className="text-xs text-stone-500 font-sans mt-1">No alerts matching the selected filters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            const isResolved = alert.status === 'RESOLVED';

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-2xl p-5 shadow-lux transition-all ${
                  isResolved
                    ? 'border-[#E7E5E0] opacity-60'
                    : isCritical
                    ? 'border-stone-900 bg-stone-50/50'
                    : isWarning
                    ? 'border-amber-300'
                    : 'border-[#E7E5E0]'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-stone-900 text-white'
                          : isWarning
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase ${
                            isCritical
                              ? 'bg-stone-900 text-white'
                              : isWarning
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono-tech text-stone-500">
                          {alert.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs font-mono-tech text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.timestamp}</span>
                        </span>
                        {alert.relatedEntityId && (
                          <span className="px-2 py-0.5 rounded bg-[#F2EFE9] text-stone-800 text-[10px] font-mono-tech font-semibold">
                            Ref: {alert.relatedEntityId}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif-luxury font-bold text-base text-stone-900">
                        {alert.title}
                      </h3>
                      <p className="text-xs text-stone-600 font-sans leading-relaxed">
                        {alert.message}
                      </p>

                      {alert.suggestedAction && (
                        <div className="mt-2 text-xs font-mono-tech text-stone-800 bg-[#F8F7F4] p-2 rounded-lg border border-[#E7E5E0] inline-flex items-center gap-2">
                          <span className="text-stone-500 font-semibold uppercase text-[10px]">Suggested Action:</span>
                          <span>{alert.suggestedAction}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {alert.actionModuleKey && (
                      <button
                        onClick={() => setActiveAdminModule(alert.actionModuleKey as any)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono-tech font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Open Module</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {alert.status === 'UNREAD' && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-mono-tech font-medium transition-all cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-mono-tech font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}

                    {alert.status === 'RESOLVED' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono-tech font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
