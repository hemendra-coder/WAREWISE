import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { History, ShieldCheck, Search, Filter, ArrowRight, Clock, User, Zap, Activity } from 'lucide-react';

export const AuditModule: React.FC = () => {
  const { auditLogs } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold">
              MODULE 15 // Security & Compliance
            </span>
          </div>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
            Audit Trail & State Diff Engine
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed font-sans pt-1">
            End-to-end immutable ledger recording every autonomous reallocation, picker route override, exception resolution, and supervisor authorization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono-tech font-medium flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Integrity: Verified</span>
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E7E5E0] shadow-lux flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit ledger by actor, order ID, SKU, or action type..."
          className="w-full bg-transparent border-none text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none font-mono-tech"
        />
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-5 rounded-2xl bg-white border border-[#E7E5E0] space-y-3 hover:border-stone-400 transition-all shadow-lux font-mono-tech text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0EFEA]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-stone-100 text-stone-800 border border-stone-200 font-bold uppercase tracking-wider">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="font-bold text-stone-900 text-xs">{log.targetId}</span>
              </div>

              <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                <span className="text-stone-900 font-semibold">{log.actor}</span>
                <span>•</span>
                <span>{log.timestamp}</span>
              </div>
            </div>

            <p className="text-stone-700 font-sans text-xs leading-relaxed">{log.details}</p>

            {/* Before / After State Diffs */}
            {(log.beforeState || log.afterState) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                {log.beforeState && (
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-amber-900">
                    <span className="text-amber-700 text-[10px] uppercase font-bold tracking-wider block mb-1">STATE BEFORE:</span>
                    <pre className="whitespace-pre-wrap font-mono-tech text-[10.5px] leading-snug">
                      {typeof log.beforeState === 'object' ? JSON.stringify(log.beforeState, null, 2) : log.beforeState}
                    </pre>
                  </div>
                )}

                {log.afterState && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
                    <span className="text-emerald-700 text-[10px] uppercase font-bold tracking-wider block mb-1">STATE AFTER:</span>
                    <pre className="whitespace-pre-wrap font-mono-tech text-[10.5px] leading-snug">
                      {typeof log.afterState === 'object' ? JSON.stringify(log.afterState, null, 2) : log.afterState}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
