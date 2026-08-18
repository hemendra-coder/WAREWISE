import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Boxes,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NetworkStatusBanner: React.FC = () => {
  const {
    isOnline,
    toggleSimulatedNetwork,
    offlineQueue,
    syncOfflineQueue,
    clearOfflineQueue
  } = useWarehouse();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSync = async () => {
    if (!isOnline) {
      setToastMessage('⚠️ Cannot sync while offline. Please toggle Network Online first.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSyncing(true);
    const res = await syncOfflineQueue();
    setIsSyncing(false);

    setToastMessage(`✓ Successfully synced ${res.syncedCount} offline inventory moves with Cloud Ledger!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            aria-live="polite"
            className="fixed top-16 right-6 z-50 bg-stone-900 text-amber-300 border border-amber-500/50 px-4 py-2.5 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Network Status Indicator Badge */}
      <div className="flex items-center gap-2" role="region" aria-label="Network Connectivity & Sync Status">
        {/* Connection Mode Pill */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-expanded={isDrawerOpen}
          aria-haspopup="dialog"
          aria-label={isOnline ? `Network status: Online. ${offlineQueue.length} offline moves queued. Click to open queue.` : `Network status: Offline Mode. ${offlineQueue.length} offline moves queued. Click to open queue.`}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer shadow-xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isOnline
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
              : 'bg-amber-950/60 border-amber-500/60 text-amber-300 animate-pulse hover:border-amber-400'
          }`}
          title="Click to view offline queue & network status"
        >
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="hidden sm:inline">ONLINE • Cloud Ledger</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span className="font-bold">OFFLINE MODE ({offlineQueue.length})</span>
            </>
          )}

          {offlineQueue.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px]">
              {offlineQueue.length}
            </span>
          )}
        </button>

        {/* Quick Toggle Network Drop Switch for Preview / Testing */}
        <button
          type="button"
          onClick={() => toggleSimulatedNetwork()}
          aria-label={isOnline ? 'Simulate network connection drop (Switch to Offline Mode)' : 'Reconnect network connection (Switch to Online Mode)'}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            isOnline
              ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
              : 'bg-amber-500 text-stone-950 border-amber-400 hover:bg-amber-400 font-bold'
          }`}
          title={isOnline ? 'Simulate Connection Drop (Go Offline)' : 'Reconnect Network (Go Online)'}
        >
          {isOnline ? 'Drop Conn' : 'Reconnect'}
        </button>
      </div>

      {/* Offline Queue Modal Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offline-drawer-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsDrawerOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E7E5E0] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-stone-900"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl border ${
                      isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    {isOnline ? <Wifi className="w-5 h-5" aria-hidden="true" /> : <WifiOff className="w-5 h-5" aria-hidden="true" />}
                  </div>
                  <div>
                    <h3 id="offline-drawer-title" className="text-base font-bold text-stone-900">
                      Network Status & Offline Queue
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      {isOnline ? '🟢 Connected to Cloud Ledger' : '🔴 Local Storage Caching Active'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close offline queue dialog"
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Network Toggle Banner in Modal */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                <div className="font-mono">
                  <span className="text-stone-500">Current Link State: </span>
                  <strong className={isOnline ? 'text-emerald-700' : 'text-amber-800'}>
                    {isOnline ? 'ONLINE' : 'OFFLINE (SIMULATED / DROPPED)'}
                  </strong>
                </div>

                <button
                  onClick={() => toggleSimulatedNetwork()}
                  className="px-3 py-1.5 bg-stone-900 text-white font-mono font-bold rounded-lg hover:bg-black cursor-pointer"
                >
                  Toggle {isOnline ? 'Offline' : 'Online'}
                </button>
              </div>

              {/* Queue Items Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-700">
                  <span>Cached Offline Inventory Moves ({offlineQueue.length})</span>
                  {offlineQueue.length > 0 && (
                    <button
                      onClick={clearOfflineQueue}
                      className="text-red-600 hover:text-red-800 text-[11px] flex items-center gap-1 cursor-pointer font-sans font-semibold"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Queue
                    </button>
                  )}
                </div>

                {offlineQueue.length === 0 ? (
                  <div className="p-6 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto opacity-80" />
                    <p className="text-xs font-bold text-stone-800">No Offline Moves Pending Sync</p>
                    <p className="text-[11px] text-stone-500">
                      All picking logs, stock receipts, and inventory adjustments are fully synchronized with the Cloud Ledger.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {offlineQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1 font-mono"
                      >
                        <div className="flex items-center justify-between font-bold text-stone-900">
                          <span className="text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                            {item.type}
                          </span>
                          <span className="text-stone-400 text-[10px]">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="font-bold text-stone-800 font-sans">{item.title}</div>
                        <div className="text-stone-500 text-[11px]">{item.details}</div>
                        <div className="text-[10px] text-stone-400">Operator: {item.operator}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E5E0]">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={handleSync}
                  disabled={offlineQueue.length === 0 || isSyncing}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : `Sync All (${offlineQueue.length})`}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
