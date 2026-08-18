import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Exception, ExceptionSeverity } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Sparkles
} from 'lucide-react';

export const ExceptionsModule: React.FC = () => {
  const { exceptions, products, resolveException, reroutePicker, reallocateStaff } = useWarehouse();
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(exceptions[0]?.id || null);
  const [filterSeverity, setFilterSeverity] = useState<ExceptionSeverity | 'ALL'>('ALL');

  const selectedException = exceptions.find((e) => e.id === selectedExceptionId) || exceptions[0];
  const affectedProd = selectedException ? products.find((p) => p.sku === selectedException.affectedSku) || products[0] : products[0];

  const filteredExceptions = exceptions.filter((e) => {
    if (filterSeverity === 'ALL') return true;
    return e.severity === filterSeverity;
  });

  const handleExecuteResolution = (exc: Exception) => {
    if (exc.type === 'MISSING_ITEM') {
      reroutePicker(exc.id, 'OP-PK-03', 'B-07-1');
    } else if (exc.type === 'BOTTLENECK_CONGESTION') {
      reallocateStaff('DOCK-03', 2);
    } else {
      resolveException(exc.id, 'Resolved via protocol and verified by operator.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1">
            Incident Diagnosis & Automated Remediation
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Exception Resolution Engine
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5">
            Real-time incident detection, automated root-cause isolation, and single-click resolution.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FBFBF9] p-1.5 rounded-xl border border-[#E7E5E0]">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-stone-900 text-white font-semibold shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exceptions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-mono-tech uppercase text-stone-500 font-semibold flex items-center justify-between px-1">
            <span>Incident Log ({filteredExceptions.length})</span>
            <span className="text-stone-900">Telemetry Stream</span>
          </div>

          <div className="space-y-3">
            {filteredExceptions.map((exc) => {
              const isSelected = exc.id === selectedException?.id;
              const prod = products.find((p) => p.sku === exc.affectedSku) || products[0];
              return (
                <div
                  key={exc.id}
                  onClick={() => setSelectedExceptionId(exc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-stone-900 shadow-lux-lg ring-1 ring-stone-900'
                      : 'bg-[#FBFBF9] border-[#E7E5E0] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech font-bold text-xs text-stone-900">{exc.id}</span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono-tech bg-stone-100 text-stone-800 font-medium">
                        {exc.severity}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono-tech font-bold ${
                      exc.status === 'RESOLVED'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-200 text-stone-800'
                    }`}>
                      {exc.status}
                    </span>
                  </div>

                  {/* Product Box */}
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#E7E5E0]">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-md object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-serif-luxury font-bold text-xs text-stone-900 truncate">{prod.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono-tech">
                        SKU: {exc.affectedSku} • Order: {exc.affectedOrderId}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 font-sans line-clamp-2 leading-relaxed">
                    {exc.description}
                  </div>

                  <div className="text-[11px] font-mono-tech text-stone-400 flex items-center justify-between pt-1 border-t border-[#E7E5E0]">
                    <span>Type: {exc.type.replace(/_/g, ' ')}</span>
                    <span>{exc.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Incident Investigation & Remediation */}
        {selectedException && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7E5E0]">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-stone-900" />
                  <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
                    Incident Triage: {selectedException.id}
                  </h3>
                </div>

                <span className={`px-3 py-1 rounded-md text-xs font-mono-tech font-bold ${
                  selectedException.status === 'RESOLVED'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-900'
                }`}>
                  {selectedException.status}
                </span>
              </div>

              {/* Product Profile */}
              <div className="p-4 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl flex items-center gap-4">
                <img
                  src={affectedProd.image}
                  alt={affectedProd.name}
                  className="w-16 h-16 rounded-lg object-cover border border-stone-300 shrink-0"
                />
                <div>
                  <div className="text-xs font-mono-tech text-stone-500 font-semibold">AFFECTED SKU</div>
                  <div className="font-serif-luxury font-bold text-lg text-stone-900">{affectedProd.name}</div>
                  <div className="text-xs font-mono-tech text-stone-600 mt-0.5">
                    SKU: <strong className="text-stone-900">{selectedException.affectedSku}</strong> • Price: <strong className="text-stone-900">₹{affectedProd.price.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Incident Details & Root Cause */}
              <div className="space-y-3 font-mono-tech text-xs">
                <div className="p-4 bg-[#F5F4F0] border border-[#E7E5E0] rounded-xl space-y-1.5">
                  <span className="text-stone-900 font-bold uppercase text-[11px]">Incident Overview:</span>
                  <p className="text-stone-700 font-sans text-xs leading-relaxed">{selectedException.description}</p>
                </div>

                <div className="p-4 bg-[#F5F4F0] border border-[#E7E5E0] rounded-xl space-y-1.5">
                  <span className="text-stone-900 font-bold uppercase text-[11px]">Root Cause Diagnosis:</span>
                  <p className="text-stone-700 font-sans text-xs leading-relaxed">{selectedException.rootCause}</p>
                </div>

                <div className="p-4 bg-[#F5F4F0] border border-[#E7E5E0] rounded-xl space-y-1.5">
                  <span className="text-stone-900 font-bold uppercase text-[11px]">Recommended Action:</span>
                  <p className="text-stone-700 font-sans text-xs leading-relaxed">{selectedException.recommendedAction}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {selectedException.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => handleExecuteResolution(selectedException)}
                    className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-stone-300" />
                    <span>Execute Automated Remediation Protocol</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-100 border border-stone-300 text-stone-900 text-xs font-mono-tech flex items-center justify-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-stone-900" />
                    <span>Incident Resolved & Documented in Audit Log</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
