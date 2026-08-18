import React from 'react';
import { OrderStatus } from '../../types';
import { Truck, PackageCheck, Layers, Scan, Navigation, CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface OperationalFlowProps {
  status: OrderStatus;
  mode?: 'customer' | 'admin';
  slaDeadline?: string;
  carrier?: string;
  trackingNumber?: string;
  className?: string;
}

export const OPERATIONAL_STAGES = [
  { key: 'ORDER', label: 'Order Confirmed', icon: ShoppingBag, desc: 'Payment verified & ingested' },
  { key: 'ALLOCATE', label: 'Allocated', icon: Layers, desc: 'Stock reserved in bin' },
  { key: 'PICK', label: 'Picking', icon: Navigation, desc: 'Optimized 2D floor route' },
  { key: 'PACK', label: 'Packing', icon: PackageCheck, desc: 'Eco-carton scan & seal' },
  { key: 'QC', label: 'QC Audit', icon: Scan, desc: 'Optical & weight check' },
  { key: 'DISPATCH', label: 'Dispatched', icon: Truck, desc: 'Air Express flight wave' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, desc: 'Customer doorstep confirmation' },
] as const;

export function getStageIndexForStatus(status: OrderStatus): number {
  switch (status) {
    case 'CREATED':
    case 'PENDING_APPROVAL':
    case 'APPROVED':
      return 0; // ORDER
    case 'PRIORITIZED':
    case 'ALLOCATED':
      return 1; // ALLOCATE
    case 'PICKING':
    case 'PICKED':
      return 2; // PICK
    case 'PACKING':
    case 'PACKED':
      return 3; // PACK
    case 'QC_CHECK':
      return 4; // QC
    case 'READY_FOR_DISPATCH':
    case 'DISPATCHED':
    case 'IN_TRANSIT':
      return 5; // DISPATCH
    case 'DELIVERED':
      return 6; // DELIVERED
    case 'CANCELLED':
      return 0;
    default:
      return 0;
  }
}

export const OperationalFlowProgress: React.FC<OperationalFlowProps> = ({
  status,
  mode = 'admin',
  slaDeadline,
  carrier,
  trackingNumber,
  className = '',
}) => {
  const currentStageIndex = getStageIndexForStatus(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div className={`p-5 rounded-2xl border ${mode === 'admin' ? 'bg-[#F8F7F4] border-[#E7E5E0]' : 'bg-white border-slate-200 shadow-sm'} ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E7E5E0]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-mono-tech text-xs uppercase tracking-wider font-bold text-stone-900">
            OPERATIONAL PIPELINE FLOW
          </span>
        </div>
        <div className="text-xs font-mono-tech text-stone-600">
          Stage <strong className="text-stone-900">{currentStageIndex + 1}</strong> of 7: <strong className="text-stone-900">{OPERATIONAL_STAGES[currentStageIndex].label}</strong>
        </div>
      </div>

      {/* Pipeline Stage Tracker */}
      <div className="relative py-4 overflow-x-auto">
        <div className="min-w-[600px] px-4">
          {/* Connecting Line */}
          <div className="absolute top-9 left-10 right-10 h-1 bg-[#E7E5E0] -z-0">
            <motion.div
              className="h-full bg-stone-900 transition-all duration-500"
              style={{
                width: `${(currentStageIndex / (OPERATIONAL_STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stage Nodes */}
          <div className="relative z-10 flex items-center justify-between">
            {OPERATIONAL_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center group relative text-center">
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                      isCurrent
                        ? 'bg-stone-900 text-white ring-4 ring-stone-900/20 shadow-md scale-110'
                        : isCompleted
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-400 border-2 border-[#E7E5E0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />

                    {/* Delivery Vehicle Indicator on Current Stage */}
                    {isCurrent && !isCancelled && (
                      <motion.div
                        layoutId="active-vehicle"
                        className="absolute -top-7 px-2 py-0.5 bg-stone-900 text-white text-[9px] font-mono-tech uppercase font-bold rounded shadow-lg flex items-center gap-1 whitespace-nowrap"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Truck className="w-3 h-3 text-amber-400" />
                        <span>ACTIVE</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-3 space-y-0.5 max-w-[80px]">
                    <div
                      className={`text-[11px] font-mono-tech uppercase tracking-tight ${
                        isCurrent
                          ? 'font-bold text-stone-900'
                          : isCompleted
                          ? 'font-semibold text-stone-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {stage.label}
                    </div>
                    {mode === 'admin' && (
                      <div className="text-[9px] text-stone-500 leading-tight hidden sm:block">
                        {stage.desc}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Meta Details */}
      {(carrier || trackingNumber || slaDeadline) && (
        <div className="mt-4 pt-3 border-t border-[#E7E5E0] flex flex-wrap items-center justify-between text-xs font-mono-tech text-stone-600 gap-3">
          {carrier && (
            <div>
              Carrier: <strong className="text-stone-900">{carrier}</strong>
            </div>
          )}
          {trackingNumber && (
            <div>
              Tracking AWB: <strong className="text-stone-900">{trackingNumber}</strong>
            </div>
          )}
          {slaDeadline && (
            <div className="text-terracotta font-bold">
              Dispatch SLA Cutoff: {new Date(slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
