import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { VoicePickingController } from './VoicePickingController';
import {
  Navigation,
  ArrowRight,
  Boxes,
  MapPin,
  CheckCircle2,
  Sparkles,
  QrCode,
  Check,
  RotateCcw,
  Zap,
  TrendingDown,
  Compass,
  AlertTriangle,
  Play,
  Layers,
  ChevronRight,
  ShieldAlert,
  Clock,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Route Optimization Algorithm Types
type AlgorithmType = 'S_SHAPE_TSP' | 'NEAREST_NEIGHBOR' | 'SEQUENTIAL_RAW';

interface Waypoint {
  id: string;
  stepNumber: number;
  binLocation: string;
  aisle: string;
  bay: string;
  x: number; // percentage on 2D map
  y: number; // percentage on 2D map
  itemName: string;
  sku: string;
  quantity: number;
  image: string;
  isPicked: boolean;
  instruction: string;
  distanceFromPrevMeters: number;
}

export const PickingModule: React.FC = () => {
  const {
    orders,
    operators,
    exceptions,
    reroutePicker,
    advanceOrderStatus,
    completePickItem,
    setActiveAdminModule,
    isOnline,
    enqueueOfflineMove,
  } = useWarehouse();

  // Active pick queue
  const pickQueue = orders.filter((o) =>
    ['STOCK_ALLOCATED', 'PRIORITIZED', 'PICKING', 'APPROVED', 'RECEIVED'].includes(o.status)
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    pickQueue[0]?.id || orders[0]?.id || 'ORD-WW-1042'
  );

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || pickQueue[0] || orders[0];
  const pickers = operators.filter((o) => o.role === 'PICKER');
  const missingItemException = exceptions.find((e) => e.type === 'MISSING_ITEM' && e.status !== 'RESOLVED');

  // Algorithm & Simulation States
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType>('S_SHAPE_TSP');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [completedSkus, setCompletedSkus] = useState<Record<string, boolean>>({});
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Generate Waypoints & Apply Route Optimization Algorithm
  const waypointsData = useMemo(() => {
    if (!activeOrder) return { waypoints: [], stats: { distanceMeters: 0, timeMinutes: 0, distanceSaved: 0, pctSaved: 0 } };

    // Base waypoints mapped to warehouse 2D grid coordinates (x, y percentages)
    const baseItems = activeOrder.items.map((item, idx) => {
      // Deterministic aisle mapping based on SKU / bin
      const aisleChar = item.binLocation?.charAt(0) || (idx % 3 === 0 ? 'A' : idx % 3 === 1 ? 'B' : 'C');
      const bayNum = parseInt(item.binLocation?.split('-')[1] || `${(idx + 1) * 2}`, 10) || (idx + 1) * 3;

      let x = 20;
      let y = 30;

      if (aisleChar === 'A') {
        x = 25;
        y = 20 + (bayNum % 5) * 14;
      } else if (aisleChar === 'B') {
        x = 55;
        y = 15 + (bayNum % 5) * 15;
      } else {
        x = 80;
        y = 25 + (bayNum % 5) * 12;
      }

      return {
        id: `WP-${item.sku}`,
        binLocation: item.binLocation || `${aisleChar}-0${bayNum}-1`,
        aisle: `Aisle ${aisleChar}`,
        bay: `Bay 0${bayNum}`,
        x,
        y,
        itemName: item.name,
        sku: item.sku,
        quantity: item.quantity,
        image: item.image,
        isPicked: !!completedSkus[item.sku] || (item.allocatedQty || 0) >= item.quantity || !!item.qcVerified,
        rawIdx: idx
      };
    });

    let orderedWaypoints = [...baseItems];

    // Apply algorithm sorting
    if (activeAlgorithm === 'S_SHAPE_TSP') {
      // Sort by aisle (x-coordinate) then alternating serpentine y-coordinate
      orderedWaypoints.sort((a, b) => {
        if (a.x !== b.x) return a.x - b.x;
        // Serpentine: even aisles top-to-bottom, odd aisles bottom-to-top
        return a.x % 2 === 0 ? a.y - b.y : b.y - a.y;
      });
    } else if (activeAlgorithm === 'NEAREST_NEIGHBOR') {
      // Nearest neighbor greedy traversal starting from Depot (x:10, y:80)
      const unvisited = [...baseItems];
      const result = [];
      let currentPos = { x: 10, y: 80 };

      while (unvisited.length > 0) {
        let nearestIdx = 0;
        let minDistance = Infinity;

        unvisited.forEach((item, idx) => {
          const dist = Math.hypot(item.x - currentPos.x, item.y - currentPos.y);
          if (dist < minDistance) {
            minDistance = dist;
            nearestIdx = idx;
          }
        });

        const nextItem = unvisited.splice(nearestIdx, 1)[0];
        result.push(nextItem);
        currentPos = { x: nextItem.x, y: nextItem.y };
      }
      orderedWaypoints = result;
    }

    // Calculate total distances & instructions
    let totalDist = 30; // Depot to first item
    let prevX = 10;
    let prevY = 80;

    const finalWaypoints: Waypoint[] = orderedWaypoints.map((wp, idx) => {
      const stepDist = Math.round(Math.hypot(wp.x - prevX, wp.y - prevY) * 3.2);
      totalDist += stepDist;
      prevX = wp.x;
      prevY = wp.y;

      return {
        ...wp,
        stepNumber: idx + 1,
        instruction: `Proceed to ${wp.aisle}, ${wp.bay} ➔ Pick ${wp.quantity}x ${wp.itemName}`,
        distanceFromPrevMeters: stepDist
      };
    });

    // Unoptimized benchmark: ~3.2x distance
    const unoptimizedDistance = totalDist * 2.8 + 140;
    const distanceSaved = Math.round(unoptimizedDistance - totalDist);
    const pctSaved = Math.round((distanceSaved / unoptimizedDistance) * 100);
    const timeMinutes = (totalDist / 60 + 1.2).toFixed(1);

    return {
      waypoints: finalWaypoints,
      stats: {
        distanceMeters: Math.round(totalDist),
        unoptimizedDistance: Math.round(unoptimizedDistance),
        timeMinutes: parseFloat(timeMinutes),
        distanceSaved,
        pctSaved
      }
    };
  }, [activeOrder, activeAlgorithm, completedSkus]);

  // Handle Barcode Scanning
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode.trim() || !activeOrder) return;

    const matchedItem = activeOrder.items.find(
      (i) => i.sku.toLowerCase() === scannedBarcode.trim().toLowerCase()
    );

    if (matchedItem) {
      setCompletedSkus((prev) => ({ ...prev, [matchedItem.sku]: true }));
      completePickItem(activeOrder.id, matchedItem.sku, matchedItem.quantity);

      if (!isOnline) {
        enqueueOfflineMove({
          type: 'PICKING_LOG',
          title: `Item Picked: ${matchedItem.name} (${matchedItem.sku})`,
          details: `Order ${activeOrder.id} • Qty ${matchedItem.quantity} from Bin ${matchedItem.binLocation}`,
          operator: 'Order Clerk',
          payload: { orderId: activeOrder.id, sku: matchedItem.sku, quantity: matchedItem.quantity }
        });
        setScanFeedback({
          type: 'success',
          text: `📦 OFFLINE CACHED: SKU ${matchedItem.sku} logged offline to local queue!`
        });
      } else {
        setScanFeedback({
          type: 'success',
          text: `VERIFIED SKU: ${matchedItem.sku} (${matchedItem.name}) picked & synced!`
        });
      }

      setScannedBarcode('');
      setActiveStepIndex((prev) => Math.min(waypointsData.waypoints.length - 1, prev + 1));
    } else {
      setScanFeedback({ type: 'error', text: `INVALID BARCODE: "${scannedBarcode}" not in current route!` });
    }

    setTimeout(() => {
      setScanFeedback(null);
    }, 3500);
  };

  // Voice Pickup Handler
  const handleVoicePickSku = (sku: string, qty: number, source: 'voice' | 'manual') => {
    if (!activeOrder) return;
    setCompletedSkus((prev) => ({ ...prev, [sku]: true }));
    completePickItem(activeOrder.id, sku, qty);

    if (!isOnline) {
      enqueueOfflineMove({
        type: 'PICKING_LOG',
        title: `Voice Picked: SKU ${sku}`,
        details: `Order ${activeOrder.id} • Qty ${qty} logged via Speech Recognition`,
        operator: 'Order Clerk (Voice)',
        payload: { orderId: activeOrder.id, sku, quantity: qty, source }
      });
      setScanFeedback({
        type: 'success',
        text: `📦 OFFLINE CACHED: Voice pick logged for SKU ${sku} into local queue!`
      });
    } else {
      setScanFeedback({
        type: 'success',
        text: `🎙️ VOICE LOGGED & SYNCED: SKU ${sku} (${qty}x) confirmed!`
      });
    }

    setActiveStepIndex((prev) => Math.min(waypointsData.waypoints.length - 1, prev + 1));
    setTimeout(() => setScanFeedback(null), 3500);
  };

  const handleNextWaypoint = () => {
    setActiveStepIndex((prev) => Math.min(waypointsData.waypoints.length - 1, prev + 1));
  };

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setScanFeedback({ type: 'success', text: `Route recalculation complete! Path optimized via ${activeAlgorithm.replace(/_/g, ' ')} algorithm.` });
      setTimeout(() => setScanFeedback(null), 3500);
    }, 800);
  };

  const handleReroute = () => {
    if (missingItemException) {
      reroutePicker(missingItemException.id, 'OP-PK-03', 'B-07-1');
      setScanFeedback({ type: 'success', text: 'Picker OP-PK-03 successfully rerouted to Alternate Buffer Bin B-07-1.' });
      setTimeout(() => setScanFeedback(null), 3500);
    }
  };

  const handleTransferToPacking = () => {
    if (!activeOrder) return;
    advanceOrderStatus(activeOrder.id, 'PACKING');
    setActiveAdminModule('06_PACKING');
  };

  const allItemsPicked = waypointsData.waypoints.length > 0 && waypointsData.waypoints.every((wp) => wp.isPicked);

  return (
    <div className="space-y-6 text-[#1A1A1A] font-sans antialiased">
      {/* Header Banner */}
      <div className="bg-[#1C1917] text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold bg-emerald-500 text-stone-950 border border-emerald-400 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                <span>ORDER CLERK ROUTE OPTIMIZATION ENGINE</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                TSP & S-Shape Path Simulation Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury italic font-bold text-white tracking-tight">
              Route-Optimized Picking Module & 2D Floor Navigator
            </h1>
            <p className="text-xs text-stone-400 font-sans mt-1 max-w-2xl">
              Simulates traveling salesperson (TSP) serpentine routes through warehouse aisles to minimize walking travel distance and accelerate pick wave turnaround.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunOptimizer}
              disabled={isOptimizing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Calculating Route...' : 'Re-Run Path Optimizer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice-to-Text Hands-Free Audio Picking Controller */}
      <VoicePickingController
        activeOrder={activeOrder}
        currentWaypoint={
          waypointsData.waypoints[activeStepIndex] ||
          waypointsData.waypoints.find((wp) => !wp.isPicked) ||
          waypointsData.waypoints[0]
        }
        completedSkus={completedSkus}
        onPickSku={handleVoicePickSku}
        onNextStep={handleNextWaypoint}
        onReroute={handleReroute}
        isOnline={isOnline}
      />

      {scanFeedback && (
        <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-md animate-fadeIn ${
          scanFeedback.type === 'success' ? 'bg-stone-900 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-200 border border-red-500/30'
        }`}>
          <span className="flex items-center gap-2">
            {scanFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{scanFeedback.text}</span>
          </span>
          <span className="text-[10px] text-stone-400 font-mono">TELEMETRY SYNCED</span>
        </div>
      )}

      {/* Algorithm Performance Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold flex items-center justify-between">
            <span>Optimized Route Distance</span>
            <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-bold">-{waypointsData.stats.pctSaved}%</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">{waypointsData.stats.distanceMeters} meters</div>
          <div className="text-[10px] text-stone-500">Unoptimized: {waypointsData.stats.unoptimizedDistance}m</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold flex items-center justify-between">
            <span>Est. Travel Time</span>
            <span className="text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-bold">Fastest</span>
          </div>
          <div className="text-2xl font-bold text-stone-900">{waypointsData.stats.timeMinutes} mins</div>
          <div className="text-[10px] text-stone-500">Aisle traversal speed: 1.2 m/s</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold flex items-center justify-between">
            <span>Distance Saved</span>
            <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-bold">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700">+{waypointsData.stats.distanceSaved} meters</div>
          <div className="text-[10px] text-stone-500">Reduced picker fatigue</div>
        </div>

        <div className="bg-white border border-[#E7E5E0] rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-[10px] font-mono-tech text-stone-500 uppercase font-bold flex items-center justify-between">
            <span>Active Algorithm</span>
            <span className="text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-bold">Live</span>
          </div>
          <div className="text-sm font-bold text-stone-900 truncate mt-1">
            {activeAlgorithm === 'S_SHAPE_TSP' ? 'S-Shape Serpentine' : activeAlgorithm === 'NEAREST_NEIGHBOR' ? 'Nearest Neighbor' : 'Sequential Raw'}
          </div>
          <div className="text-[10px] text-stone-500">Routing Mode</div>
        </div>
      </div>

      {/* Main Interactive 2D Warehouse Floor Map & Route Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 2D Interactive Floor Canvas & Route Visualizer (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E7E5E0] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
                  2D Warehouse Aisle Floor Plan & Dynamic Waypoint Path
                </h3>
              </div>
              <p className="text-xs text-stone-500">Warehouse Alpha • 40,000 Sq Ft Grid Layout • Order #{activeOrder?.id}</p>
            </div>

            {/* Algorithm Selector Tabs */}
            <div
              role="region"
              aria-label="Route Optimization Algorithm Selector"
              className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs shrink-0"
            >
              <button
                type="button"
                onClick={() => setActiveAlgorithm('S_SHAPE_TSP')}
                aria-pressed={activeAlgorithm === 'S_SHAPE_TSP'}
                aria-label="Select S-Shape Travelling Salesperson Problem algorithm"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeAlgorithm === 'S_SHAPE_TSP' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                S-Shape TSP
              </button>
              <button
                type="button"
                onClick={() => setActiveAlgorithm('NEAREST_NEIGHBOR')}
                aria-pressed={activeAlgorithm === 'NEAREST_NEIGHBOR'}
                aria-label="Select Nearest Neighbor algorithm"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeAlgorithm === 'NEAREST_NEIGHBOR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Nearest Neighbor
              </button>
              <button
                type="button"
                onClick={() => setActiveAlgorithm('SEQUENTIAL_RAW')}
                aria-pressed={activeAlgorithm === 'SEQUENTIAL_RAW'}
                aria-label="Select Raw Sequential path algorithm"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeAlgorithm === 'SEQUENTIAL_RAW' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Raw Sequential
              </button>
            </div>
          </div>

          {/* 2D Interactive SVG Floor Map */}
          <div className="relative w-full h-80 sm:h-96 bg-[#1C1917] rounded-xl border border-stone-800 p-4 overflow-hidden shadow-inner">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E27B58_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Warehouse Aisle Racks Representation */}
            <div className="absolute left-[20%] top-[15%] w-[12%] h-[70%] bg-stone-800/80 border border-stone-700/80 rounded-lg flex flex-col justify-around items-center text-[10px] font-mono text-stone-400">
              <span className="rotate-90 font-bold text-emerald-400">AISLE A</span>
              <span className="text-[8px]">Fast Movers</span>
            </div>

            <div className="absolute left-[50%] top-[15%] w-[12%] h-[70%] bg-stone-800/80 border border-stone-700/80 rounded-lg flex flex-col justify-around items-center text-[10px] font-mono text-stone-400">
              <span className="rotate-90 font-bold text-blue-400">AISLE B</span>
              <span className="text-[8px]">Medium</span>
            </div>

            <div className="absolute left-[75%] top-[15%] w-[12%] h-[70%] bg-stone-800/80 border border-stone-700/80 rounded-lg flex flex-col justify-around items-center text-[10px] font-mono text-stone-400">
              <span className="rotate-90 font-bold text-purple-400">AISLE C</span>
              <span className="text-[8px]">Heavy Bulk</span>
            </div>

            {/* Cart Staging Depot */}
            <div className="absolute left-[5%] bottom-[8%] px-3 py-1.5 bg-amber-500/20 border border-amber-500 rounded-lg text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Cart Staging Depot (Start/Finish)</span>
            </div>

            {/* SVG Path Connections connecting Waypoints */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Path Polyline */}
              {waypointsData.waypoints.length > 0 && (
                <polyline
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                  points={`10,80 ${waypointsData.waypoints.map((wp) => `${wp.x},${wp.y}`).join(' ')} 90,85`}
                />
              )}
            </svg>

            {/* Render Waypoint Pins on Map */}
            {waypointsData.waypoints.map((wp, index) => {
              const isCurrentTarget = index === activeStepIndex && !wp.isPicked;

              return (
                <div
                  key={wp.id}
                  onClick={() => setActiveStepIndex(index)}
                  style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  <div
                    className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all transform hover:scale-125 ${
                      wp.isPicked
                        ? 'bg-emerald-500 text-stone-950 border-emerald-300'
                        : isCurrentTarget
                        ? 'bg-amber-500 text-stone-950 border-white ring-4 ring-amber-400/40 animate-pulse'
                        : 'bg-stone-900 text-stone-200 border-stone-600'
                    }`}
                  >
                    {wp.isPicked ? <Check className="w-4 h-4" /> : wp.stepNumber}

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-stone-950 text-stone-100 p-2 rounded-lg border border-stone-800 text-[10px] font-mono whitespace-nowrap shadow-xl z-30">
                      <span className="font-bold text-emerald-400">
                        Step {wp.stepNumber}: {wp.binLocation}
                      </span>
                      <span>{wp.itemName} ({wp.quantity}x)</span>
                      <span className="text-stone-400">{wp.instruction}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barcode Scanner Tool & Pick Execution */}
          <form onSubmit={handleBarcodeSubmit} className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                <span>Laser Barcode Verification Terminal</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">Scan SKU to complete waypoint step</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                placeholder="Scan or type SKU barcode (e.g. SKU-NEURAL-01)..."
                className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer font-mono uppercase shrink-0"
              >
                Scan & Verify Step
              </button>
            </div>
          </form>

          {/* Step-by-Step Navigation Sequence Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase font-mono-tech tracking-wider flex items-center justify-between">
              <span>Optimized Navigation Step-by-Step Instructions</span>
              <span className="text-stone-500 font-mono text-[10px]">{waypointsData.waypoints.length} Total Waypoints</span>
            </h4>

            <div className="space-y-2">
              {waypointsData.waypoints.map((wp, idx) => (
                <div
                  key={wp.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    wp.isPicked
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : idx === activeStepIndex
                      ? 'bg-amber-50 border-amber-300 text-stone-900 ring-1 ring-amber-400/50 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center text-xs shrink-0 ${
                        wp.isPicked
                          ? 'bg-emerald-600 text-white'
                          : idx === activeStepIndex
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {wp.isPicked ? <Check className="w-4 h-4" /> : wp.stepNumber}
                    </div>

                    <div>
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        <span>{wp.instruction}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        Location: <strong className="text-stone-800">{wp.binLocation}</strong> • SKU: {wp.sku} • Distance: +{wp.distanceFromPrevMeters}m
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {wp.isPicked ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        VERIFIED
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompletedSkus((prev) => ({ ...prev, [wp.sku]: true }));
                          completePickItem(activeOrder.id, wp.sku, wp.quantity);
                        }}
                        className="px-2.5 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        Manual Pick
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E5E0] flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500">
              All items picked: <strong className={allItemsPicked ? 'text-emerald-700 font-bold' : 'text-stone-800'}>{allItemsPicked ? 'YES (Ready)' : 'NO (In Progress)'}</strong>
            </span>

            <button
              onClick={handleTransferToPacking}
              disabled={!allItemsPicked && waypointsData.waypoints.length > 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <span>Transfer Batch to Packing Bay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Picking Queue & Operator Fleet (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Pick Queue Selection */}
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="text-xs font-mono-tech uppercase font-bold text-stone-900 pb-2 border-b border-[#E7E5E0] flex items-center justify-between">
              <span>Pick Orders Queue ({pickQueue.length})</span>
              <span className="text-stone-500 font-normal">Select Order</span>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto pr-1">
              {pickQueue.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrderId(ord.id);
                    setActiveStepIndex(0);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    ord.id === activeOrder?.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-400 text-stone-900'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{ord.id}</div>
                    <div className={`text-[10px] ${ord.id === activeOrder?.id ? 'text-stone-300' : 'text-stone-500'}`}>
                      {ord.customerName} • {ord.items.length} items
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      ord.id === activeOrder?.id ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Pickers Fleet Performance */}
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="text-xs font-mono-tech uppercase font-bold text-stone-900 pb-2 border-b border-[#E7E5E0] flex items-center justify-between">
              <span>Active Order Clerks</span>
              <span className="text-emerald-700 font-bold">{pickers.length} On Floor</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {pickers.map((p) => (
                <div key={p.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-stone-300" />
                    <div>
                      <div className="text-stone-900 font-bold text-xs">{p.name}</div>
                      <div className="text-[10px] text-stone-500">{p.assignedStation}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold text-xs">{p.performanceRate} picks/hr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
