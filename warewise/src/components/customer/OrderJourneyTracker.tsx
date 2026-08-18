import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  ShieldCheck, 
  Truck, 
  Store, 
  Sparkles, 
  UserCheck, 
  RotateCcw, 
  ChevronRight,
  Phone,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderJourneyTrackerProps {
  order: Order;
  onAdvanceStage?: (orderId: string) => void;
  onResetStage?: (orderId: string) => void;
  compact?: boolean;
}

export interface JourneyStage {
  key: string;
  name: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  eta: string;
  detail: string;
}

export const ORDER_JOURNEY_STAGES: JourneyStage[] = [
  {
    key: 'CONFIRMED',
    name: 'Order Confirmed',
    subtext: 'Payment verified & order queued',
    icon: Store,
    eta: 'T+0m',
    detail: 'Order received and digital payment confirmed. Inventory reserved.'
  },
  {
    key: 'PREPARING',
    name: 'Preparing',
    subtext: 'Precision pick & optical scan',
    icon: ShieldCheck,
    eta: 'T+15m',
    detail: 'Items retrieved from inventory and verified with high-precision optical scan.'
  },
  {
    key: 'PACKED',
    name: 'Packed & Sealed',
    subtext: 'Eco-cushioned tamper seal',
    icon: Package,
    eta: 'T+45m',
    detail: 'Consolidated into recyclable protective packaging with tamper-evident seal.'
  },
  {
    key: 'SHIPPED',
    name: 'Shipped (In Transit)',
    subtext: 'Express airway network',
    icon: Truck,
    eta: 'T+2h',
    detail: 'Handed over to carrier flight wave. Airway bill active.'
  },
  {
    key: 'OUT_FOR_DELIVERY',
    name: 'Out for Delivery',
    subtext: 'Courier on final mile route',
    icon: Navigation,
    eta: 'Today by 18:00',
    detail: 'Assigned to delivery rider. Live routing to your doorstep.'
  },
  {
    key: 'DELIVERED',
    name: 'Delivered',
    subtext: 'Handed over with OTP verification',
    icon: UserCheck,
    eta: 'Completed',
    detail: 'Package safely delivered and verified with doorstep receipt.'
  }
];

export const mapOrderStatusToStageIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'CREATED':
    case 'PENDING_APPROVAL':
    case 'APPROVED':
    case 'PRIORITIZED':
      return 0; // Confirmed
    case 'ALLOCATED':
    case 'PICKING':
    case 'PICKED':
      return 1; // Preparing
    case 'PACKING':
    case 'PACKED':
    case 'QC_CHECK':
      return 2; // Packed
    case 'READY_FOR_DISPATCH':
    case 'DISPATCHED':
      return 3; // Shipped
    case 'IN_TRANSIT':
      return 4; // Out for Delivery
    case 'DELIVERED':
      return 5; // Delivered
    case 'CANCELLED':
      return -1;
    default:
      return 1;
  }
};

export const OrderJourneyTracker: React.FC<OrderJourneyTrackerProps> = ({
  order,
  onAdvanceStage,
  onResetStage,
  compact = false
}) => {
  const currentStageIndex = mapOrderStatusToStageIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  // Rider position calculation (percentage 0% to 100%)
  const stageCount = ORDER_JOURNEY_STAGES.length;
  const progressPercent = isCancelled 
    ? 0 
    : Math.max(0, Math.min(100, (currentStageIndex / (stageCount - 1)) * 100));

  const currentStage = ORDER_JOURNEY_STAGES[Math.max(0, currentStageIndex)] || ORDER_JOURNEY_STAGES[0];

  return (
    <div className="w-full bg-white border border-[#E7E5E0] rounded-2xl p-5 sm:p-7 shadow-sm select-none transition-all">
      {/* Header & Status Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-[#E7E5E0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury italic font-bold text-lg sm:text-xl text-stone-900">
                Interactive Fulfillment Journey
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#F2EFE9] text-stone-800 font-mono-tech text-[10px] font-bold uppercase tracking-wider">
                Live Courier Telemetry
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans">
              Tracking Order <span className="font-mono-tech font-bold text-stone-800">{order.id}</span> • Delivery to <span className="font-semibold text-stone-800">{order.destinationCity || 'Bengaluru'}</span>
            </p>
          </div>
        </div>

        {/* Live Status Pill & Interactive Advance CTA */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {isCancelled ? (
            <span className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-mono-tech text-xs font-bold uppercase">
              Order Cancelled
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-white font-mono-tech text-xs font-bold uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{currentStage.name}</span>
              </span>

              {onAdvanceStage && currentStageIndex < stageCount - 1 && (
                <button
                  type="button"
                  onClick={() => onAdvanceStage(order.id)}
                  className="px-3 py-1 bg-[#F2EFE9] hover:bg-stone-900 hover:text-white text-stone-800 border border-[#E7E5E0] rounded-full text-[11px] font-mono-tech font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  title="Simulate next journey milestone"
                >
                  <span>Advance Stage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {onResetStage && currentStageIndex >= stageCount - 1 && (
                <button
                  type="button"
                  onClick={() => onResetStage(order.id)}
                  className="px-3 py-1 bg-[#F2EFE9] hover:bg-stone-900 hover:text-white text-stone-800 border border-[#E7E5E0] rounded-full text-[11px] font-mono-tech font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  title="Replay journey from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SIGNATURE VISUAL RIDER JOURNEY TRACK */}
      <div className="py-8 relative">
        {/* Background Track Line */}
        <div className="relative mx-4 sm:mx-8 h-3 bg-[#EAE6DE] rounded-full overflow-visible">
          {/* Active Progress Fill Line */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-stone-900 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          />

          {/* Dotted Road Markings */}
          <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-1.5 h-0.5 bg-white rounded-full" />
            ))}
          </div>

          {/* SIGNATURE MOVING BIKE / RIDER VECTOR COMPONENT */}
          {!isCancelled && (
            <motion.div
              className="absolute -top-11 z-20 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
              initial={{ left: '0%' }}
              animate={{ left: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 14 }}
            >
              <div className="-translate-x-1/2 flex flex-col items-center">
                {/* Floating Rider Avatar / Icon Tooltip */}
                <div className="px-2 py-0.5 rounded-full bg-stone-900 text-white font-mono-tech text-[9px] font-bold tracking-wider uppercase shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>{currentStage.eta}</span>
                </div>

                {/* Custom Vector Electric Courier Bike & Rider */}
                <div className="w-12 h-10 bg-white rounded-xl border border-stone-800 shadow-lg p-1 flex items-center justify-center relative">
                  <svg
                    viewBox="0 0 48 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-stone-900"
                  >
                    {/* Rear Wheel */}
                    <circle cx="10" cy="26" r="7" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="10" cy="26" r="2.5" fill="currentColor" />
                    {/* Front Wheel */}
                    <circle cx="38" cy="26" r="7" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="38" cy="26" r="2.5" fill="currentColor" />
                    {/* Bike Frame */}
                    <path
                      d="M10 26 L22 26 L29 16 L38 26 M22 26 L25 14 L20 14"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Handlebar */}
                    <path
                      d="M27 12 L30 15"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Cargo Parcel Box on Rear */}
                    <rect
                      x="4"
                      y="12"
                      width="10"
                      height="9"
                      rx="1.5"
                      fill="#E27B58"
                      stroke="#1C1917"
                      strokeWidth="1.5"
                    />
                    {/* Courier Rider Torso & Helmet */}
                    <circle cx="21" cy="7" r="3.5" fill="#1C1917" />
                    <path
                      d="M19 11 C19 11 23 11 26 15"
                      stroke="#1C1917"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Glowing ground shadow */}
                  <span className="absolute -bottom-1 w-8 h-1 bg-stone-900/20 rounded-full blur-[1px]" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage Checkpoint Milestone Beacons */}
          <div className="absolute inset-0 -top-2 flex items-center justify-between pointer-events-none">
            {ORDER_JOURNEY_STAGES.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stg.key}
                  className="relative -translate-x-1/2 first:translate-x-0 last:translate-x-0"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isPast
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-white border-stone-900 text-stone-900 ring-4 ring-stone-900/10 shadow-sm'
                        : 'bg-[#F2EFE9] border-[#D6D2C4] text-stone-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="font-mono-tech text-[10px] font-bold">
                        0{idx + 1}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Labels Responsive Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ORDER_JOURNEY_STAGES.map((stage, idx) => {
            const isPast = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`p-3.5 rounded-xl border transition-all space-y-1.5 ${
                  isCurrent
                    ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                    : isPast
                    ? 'bg-stone-50 border-[#E7E5E0] text-stone-800'
                    : 'bg-[#FAFAF9] border-[#E7E5E0] text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : isPast ? 'text-stone-700' : 'text-stone-300'}`} />
                  <span className={`text-[10px] font-mono-tech font-bold uppercase tracking-wider ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                    {stage.eta}
                  </span>
                </div>

                <div className={`font-serif-luxury font-bold text-xs sm:text-[13px] leading-tight ${isCurrent ? 'text-white' : 'text-stone-900'}`}>
                  {stage.name}
                </div>

                <div className={`text-[10px] font-sans leading-tight line-clamp-2 ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                  {stage.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver & Courier Contact Card (When Out for Delivery) */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-[#E7E5E0] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-tech">
          <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#E7E5E0] space-y-1">
            <div className="text-[10px] text-stone-500 uppercase font-bold">Delivery Partner</div>
            <div className="text-stone-900 font-bold text-xs sm:text-sm">
              {order.carrier || 'BlueDart Air Express'}
            </div>
            <div className="text-stone-500 text-[10px]">AWB: {order.trackingNumber || 'BD-AIR-9042-IN'}</div>
          </div>

          <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#E7E5E0] space-y-1">
            <div className="text-[10px] text-stone-500 uppercase font-bold">Estimated Handover</div>
            <div className="text-stone-900 font-bold text-xs sm:text-sm">
              Today by 18:00 IST
            </div>
            <div className="text-emerald-700 text-[10px] font-bold">Guaranteed On-Time Delivery</div>
          </div>

          <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#E7E5E0] space-y-1">
            <div className="text-[10px] text-stone-500 uppercase font-bold">Secure Delivery PIN</div>
            <div className="text-stone-900 font-bold text-xs sm:text-sm tracking-widest">
              4 8 2 9
            </div>
            <div className="text-stone-500 text-[10px]">Share with rider at handover</div>
          </div>
        </div>
      )}
    </div>
  );
};
