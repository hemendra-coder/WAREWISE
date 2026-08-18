import React, { useState, useMemo } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  GitFork,
  Zap,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Boxes,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Layers,
  Building2,
  Check,
  Cpu,
  BarChart3,
  Sliders,
  ChevronRight,
  X,
  FileText,
  Lock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ZoneRebalanceRecommendation {
  id: string;
  sku: string;
  productName: string;
  image: string;
  sourceZone: string;
  targetZone: string;
  sourceBin: string;
  targetBin: string;
  transferQty: number;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  confidenceScore: number;
  reasoning: string;
  speedupImpact: string;
  distanceSavedMeters: number;
  status: 'PROPOSED' | 'EXECUTED' | 'DISMISSED';
}

export const AllocationModule: React.FC = () => {
  const {
    orders,
    products,
    applyReallocation,
    advanceOrderStatus,
    setActiveAdminModule,
    setSelectedOrderId,
    addAuditLog,
    currentUser
  } = useWarehouse();

  // Selected order pair for cross-order reservation borrowing
  const [selectedTargetOrderId] = useState('ORD-WW-1042');
  const [selectedDonorOrderId] = useState('ORD-WW-1047');
  const [reallocQty, setReallocQty] = useState(3);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isScanningZones, setIsScanningZones] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [simulationDiff, setSimulationDiff] = useState<any | null>(null);

  // Multi-step Confirmation Dialog State
  const [pendingReallocation, setPendingReallocation] = useState<{
    type: 'ZONE_TRANSFER' | 'BULK_INTER_ORDER';
    data: any;
  } | null>(null);

  const [confirmationStep, setConfirmationStep] = useState<1 | 2>(1);
  const [operatorConfirmationChecked, setOperatorConfirmationChecked] = useState(false);
  const [reallocationReasonNotes, setReallocationReasonNotes] = useState('Authorized operational stock rebalancing to prevent SLA cutoff breach.');

  const targetOrder = orders.find((o) => o.id === selectedTargetOrderId);
  const donorOrder = orders.find((o) => o.id === selectedDonorOrderId);
  const heroProduct = products.find((p) => p.sku === 'SKU-NC-900') || products[0];

  // Live Zone Rebalance AI Recommendations
  const [recommendations, setRecommendations] = useState<ZoneRebalanceRecommendation[]>([
    {
      id: 'REBAL-REC-01',
      sku: 'SKU-NC-900',
      productName: 'Neural Processor X1 Pro',
      image: heroProduct.image,
      sourceZone: 'Zone B (Bulk Reserve)',
      targetZone: 'Zone A (Forward Pick Face)',
      sourceBin: 'B-04-2',
      targetBin: 'A-01-1',
      transferQty: 45,
      priority: 'URGENT',
      confidenceScore: 99.2,
      reasoning: 'Order surge +180% predicted in next 2 hours. Zone A pick face down to 4 units (SLA breach risk in 18 mins).',
      speedupImpact: '+68% Picker Speedup • Eliminates 18 Pending SLA Breaches',
      distanceSavedMeters: 240,
      status: 'PROPOSED'
    },
    {
      id: 'REBAL-REC-02',
      sku: 'SKU-AR-400',
      productName: 'Aura Smart Glasses Gen2',
      image: products.find((p) => p.sku === 'SKU-AR-400')?.image || products[1]?.image || heroProduct.image,
      sourceZone: 'Zone D (Inbound Cross-Dock)',
      targetZone: 'Zone A (Forward Pick Face)',
      sourceBin: 'D-01-A',
      targetBin: 'A-03-2',
      transferQty: 30,
      priority: 'HIGH',
      confidenceScore: 96.8,
      reasoning: 'Newly received shipment sitting in Zone D staging while 12 customer orders are queued in allocation hold.',
      speedupImpact: 'Bypasses 24hr Putaway Delay • Enables Same-Day Courier Flight',
      distanceSavedMeters: 180,
      status: 'PROPOSED'
    },
    {
      id: 'REBAL-REC-03',
      sku: 'SKU-QU-800',
      productName: 'Quantum Power Cell 100W',
      image: products.find((p) => p.sku === 'SKU-QU-800')?.image || products[2]?.image || heroProduct.image,
      sourceZone: 'Zone A (Forward Pick Face)',
      targetZone: 'Zone C (Secondary Buffer Vault)',
      sourceBin: 'A-02-3',
      targetBin: 'C-01-2',
      transferQty: 25,
      priority: 'MEDIUM',
      confidenceScore: 92.1,
      reasoning: 'Zone A-02 rack experiencing 94% aisle congestion during peak shift.',
      speedupImpact: 'Reduces Aisle Traffic Congestion Index by 42%',
      distanceSavedMeters: 95,
      status: 'PROPOSED'
    }
  ]);

  // Initiate Multi-step Confirmation Dialog
  const handleInitiateZoneTransfer = (rec: ZoneRebalanceRecommendation) => {
    setPendingReallocation({
      type: 'ZONE_TRANSFER',
      data: rec
    });
    setConfirmationStep(1);
    setOperatorConfirmationChecked(false);
  };

  const handleInitiateInterOrderReallocation = () => {
    setPendingReallocation({
      type: 'BULK_INTER_ORDER',
      data: {
        targetOrderId: selectedTargetOrderId,
        donorOrderId: selectedDonorOrderId,
        sku: 'SKU-NC-900',
        qty: reallocQty,
        targetOrder,
        donorOrder
      }
    });
    setConfirmationStep(1);
    setOperatorConfirmationChecked(false);
  };

  // Final Commit after Step 2 Confirmation
  const handleFinalCommitReallocation = () => {
    if (!pendingReallocation) return;

    if (pendingReallocation.type === 'ZONE_TRANSFER') {
      const rec = pendingReallocation.data as ZoneRebalanceRecommendation;
      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, status: 'EXECUTED' } : r))
      );

      addAuditLog({
        actor: currentUser.name || 'System Administrator',
        role: currentUser.role || 'SUPER_ADMIN',
        action: 'BULK_ZONE_REALLOCATION_CONFIRMED',
        target: `${rec.sku} (${rec.productName})`,
        details: `Confirmed transfer of ${rec.transferQty} units from ${rec.sourceZone} (${rec.sourceBin}) to ${rec.targetZone} (${rec.targetBin}). Reason: ${reallocationReasonNotes}`
      });

      setScanMessage(`✓ Bulk Reallocation Confirmed & Executed: ${rec.transferQty}x ${rec.sku} moved to ${rec.targetZone}.`);
    } else if (pendingReallocation.type === 'BULK_INTER_ORDER') {
      applyReallocation(selectedTargetOrderId, selectedDonorOrderId, 'SKU-NC-900', reallocQty);
      advanceOrderStatus(selectedTargetOrderId, 'PICKING');

      addAuditLog({
        actor: currentUser.name || 'System Administrator',
        role: currentUser.role || 'SUPER_ADMIN',
        action: 'BULK_INTER_ORDER_REALLOCATION_CONFIRMED',
        target: `Target Order #${selectedTargetOrderId}  Donor Order #${selectedDonorOrderId}`,
        details: `Borrowed ${reallocQty} units of SKU-NC-900. Target Order #${selectedTargetOrderId} advanced to PICKING. Reason: ${reallocationReasonNotes}`
      });

      setScanMessage(`✓ Bulk Inter-Order Reallocation Confirmed: Borrowed ${reallocQty} units for Order #${selectedTargetOrderId}!`);
    }

    setPendingReallocation(null);
    setTimeout(() => setScanMessage(null), 4000);
  };

  // Run AI Rebalancing Scan Simulation
  const handleRunZoneScan = () => {
    setIsScanningZones(true);
    setTimeout(() => {
      setIsScanningZones(false);
      setScanMessage('AI Multi-Zone Inventory Scan Complete! 3 optimal rebalancing opportunities identified across Zones A, B, C & D.');
      setTimeout(() => setScanMessage(null), 4000);
    }, 1200);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationDiff({
        targetBefore: 'Partial (7/10) — 35m SLA Cutoff Violation Risk',
        targetAfter: 'Fully Allocated (10/10) — 0min SLA Violation Risk',
        donorBefore: 'Allocated (3/3) — 38h Delivery SLA Window',
        donorAfter: 'Re-supplied by Inbound Flight (+50 units) in 8h',
        confidence: '98.4%',
      });
    }, 500);
  };

  return (
    <div className="space-y-6 text-[#1A1A1A] font-sans antialiased">
      {/* Header Banner */}
      <div className="bg-[#1C1917] text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold bg-purple-500 text-stone-950 border border-purple-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>SAFEGUARDED BULK REALLOCATION ENGINE</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Multi-Step Preview Confirmation Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury italic font-bold text-white tracking-tight">
              Warehouse Zone Stock Rebalancing & Allocation Suite
            </h1>
            <p className="text-xs text-stone-400 font-sans mt-1 max-w-2xl">
              All bulk stock reallocations and zone transfers require multi-step summary verification and operator safety approval before state mutation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunZoneScan}
              disabled={isScanningZones}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-purple-200 ${isScanningZones ? 'animate-spin' : ''}`} />
              <span>{isScanningZones ? 'Scanning Warehouse Zones...' : 'Run AI Multi-Zone Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3.5 bg-stone-900 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-mono flex items-center gap-2 shadow-md animate-fadeIn">
          <Check className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Warehouse Zone Capacity & Inventory Health Heatmap */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
              Warehouse Multi-Zone Stock Level Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">Real-Time Sensor Feed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span>Zone A (Forward Pick Face)</span>
              </span>
              <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">88% Capacity</span>
            </div>
            <div className="text-xl font-bold text-stone-900">1,420 / 1,600 Units</div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full w-[88%]" />
            </div>
            <div className="text-[10px] text-stone-500 font-mono flex justify-between">
              <span>Status: Needs Fast-Mover Deposit</span>
              <strong className="text-red-600">High Turnover</strong>
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Zone B (Bulk Reserve Racks)</span>
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">54% Capacity</span>
            </div>
            <div className="text-xl font-bold text-stone-900">4,320 / 8,000 Units</div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[54%]" />
            </div>
            <div className="text-[10px] text-stone-500 font-mono flex justify-between">
              <span>Status: Healthy Bulk Buffer</span>
              <strong className="text-emerald-700">Optimal</strong>
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Zone C (Secure Buffer Vault)</span>
              </span>
              <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">32% Capacity</span>
            </div>
            <div className="text-xl font-bold text-stone-900">640 / 2,000 Units</div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[32%]" />
            </div>
            <div className="text-[10px] text-stone-500 font-mono flex justify-between">
              <span>Status: Low Congestion</span>
              <strong className="text-blue-700">Available</strong>
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Zone D (Inbound Cross-Dock)</span>
              </span>
              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">72% Capacity</span>
            </div>
            <div className="text-xl font-bold text-stone-900">860 / 1,200 Units</div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[72%]" />
            </div>
            <div className="text-[10px] text-stone-500 font-mono flex justify-between">
              <span>Status: Pending Putaway</span>
              <strong className="text-amber-700">Staged</strong>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Rebalancing Action Suggestions */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-stone-900 uppercase font-mono-tech tracking-wider">
              AI-Suggested Automatic Stock Rebalancing Actions
            </h3>
          </div>
          <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
            {recommendations.filter((r) => r.status === 'PROPOSED').length} Action Candidates
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isExecuted = rec.status === 'EXECUTED';

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border transition-all ${
                  isExecuted
                    ? 'bg-emerald-50/60 border-emerald-300 text-stone-800'
                    : 'bg-stone-50 border-stone-200 text-stone-900 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={rec.image} alt={rec.productName} className="w-12 h-12 object-cover rounded-xl border border-stone-300 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            rec.priority === 'URGENT'
                              ? 'bg-red-600 text-white'
                              : rec.priority === 'HIGH'
                              ? 'bg-purple-600 text-white'
                              : 'bg-stone-700 text-white'
                          }`}
                        >
                          {rec.priority} REBALANCE
                        </span>
                        <span className="text-xs font-mono text-stone-500">{rec.sku}</span>
                        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          {rec.confidenceScore}% AI Confidence
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">{rec.productName}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{rec.reasoning}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 shrink-0 font-mono text-xs">
                    <div className="bg-white p-2.5 border border-stone-200 rounded-lg text-center min-w-32">
                      <div className="text-[9px] text-stone-500 uppercase font-bold">Transfer Move</div>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {rec.transferQty}x {rec.sourceBin} ➔ {rec.targetBin}
                      </div>
                      <div className="text-[9px] text-stone-500">{rec.sourceZone} ➔ {rec.targetZone}</div>
                    </div>

                    <div className="bg-white p-2.5 border border-stone-200 rounded-lg text-center min-w-32">
                      <div className="text-[9px] text-stone-500 uppercase font-bold">Fulfillment Speedup</div>
                      <div className="font-bold text-emerald-700 mt-0.5">-{rec.distanceSavedMeters}m Travel</div>
                      <div className="text-[9px] text-stone-500">{rec.speedupImpact}</div>
                    </div>

                    <div>
                      {isExecuted ? (
                        <span className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>TRANSFER EXECUTED</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInitiateZoneTransfer(rec)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
                          <span>Initiate Bulk Reallocation ➔</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Order Reservation Borrowing / Reallocation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif-luxury font-bold text-lg text-stone-900 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-stone-900" />
              <span>Cross-Order Reservation Borrowing Pair Match</span>
            </h3>

            {/* Target Order Card */}
            <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-tech bg-amber-500 text-stone-950 font-bold uppercase">
                  RECIPIENT / TARGET ORDER (HIGH SLA RISK)
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cutoff in 34 mins</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-serif-luxury font-bold text-base text-white">{targetOrder?.id}</div>
                  <div className="text-stone-400 font-sans">{targetOrder?.customerName} ({targetOrder?.customerTier})</div>
                </div>
                <div className="text-right">
                  <div className="text-stone-300">Needs: <strong className="text-white">10x {heroProduct.name}</strong></div>
                  <div className="text-stone-400">Free in Bin A-02-1: 7 Units</div>
                  <div className="text-amber-400 font-bold">Deficit: -3 Units</div>
                </div>
              </div>
            </div>

            {/* Donor Candidate */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-600 text-white font-bold">
                    #1 RANKED DONOR ORDER
                  </span>
                  <span className="font-mono font-bold text-stone-900 text-sm">{donorOrder?.id}</span>
                </div>
                <span className="text-xs font-mono text-stone-700 font-bold">Match Confidence: 98.4%</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-3 bg-white border border-stone-200 rounded-lg">
                  <div className="text-stone-500 text-[10px]">RESERVED STOCK</div>
                  <div className="text-stone-900 font-bold text-sm mt-0.5">3 Units</div>
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-lg">
                  <div className="text-stone-500 text-[10px]">DELIVERY SLA</div>
                  <div className="text-stone-900 font-bold text-sm mt-0.5">38 Hours</div>
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-lg">
                  <div className="text-stone-500 text-[10px]">INBOUND FLIGHT</div>
                  <div className="text-stone-900 font-bold text-sm mt-0.5">8 Hours</div>
                </div>
              </div>

              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                <strong>Why Order #1047 is safe to borrow from:</strong> Borrowing 3 units creates zero delivery delay because the supplier shipment of 50 units arrives 30 hours ahead of Order #1047's packing cutoff.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation & Execution Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif-luxury font-bold text-lg text-stone-900">
              Reallocation Control & Digital Simulation
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-stone-600 block mb-1 font-bold uppercase">TRANSFER QUANTITY</label>
                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    value={reallocQty}
                    onChange={(e) => setReallocQty(Number(e.target.value))}
                    className="flex-1 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-bold text-base text-stone-900 w-16 text-center">
                    {reallocQty} Units
                  </span>
                </div>
              </div>

              <button
                onClick={runSimulation}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-purple-600" />
                <span>Simulate Digital Twin Impact</span>
              </button>

              {simulationDiff && (
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5 text-xs font-mono">
                  <div className="text-purple-950 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-700" />
                    <span>Digital Twin Simulation Verified ({simulationDiff.confidence})</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Order #1042: </span>
                    <span className="text-stone-900 font-bold">{simulationDiff.targetAfter}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Donor #1047: </span>
                    <span className="text-stone-900 font-bold">{simulationDiff.donorAfter}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleInitiateInterOrderReallocation}
                  disabled={targetOrder?.allocationStatus === 'FULLY_ALLOCATED'}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    targetOrder?.allocationStatus === 'FULLY_ALLOCATED'
                      ? 'bg-stone-200 text-stone-700 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {targetOrder?.allocationStatus === 'FULLY_ALLOCATED' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reallocation Executed & Synced</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-200" />
                      <span>Review & Commit Inter-Order Reallocation ➔</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================================
          🛡️ MULTI-STEP CONFIRMATION DIALOG MODAL (BULK REALLOCATION)
      ========================================================================================= */}
      {pendingReallocation && (
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
                <span className="p-1.5 bg-amber-500 text-stone-950 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    Multi-Step Confirmation Safeguard • Step {confirmationStep} of 2
                  </div>
                  <h3 className="text-base font-serif-luxury font-bold italic text-white">
                    Confirm Bulk Reallocation Operation
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPendingReallocation(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* STEP 1: IMPACT SUMMARY PREVIEW */}
              {confirmationStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Impact Summary Preview:</strong> Please review the exact inventory adjustments and zone transfers below before proceeding to operator confirmation.
                    </span>
                  </div>

                  {pendingReallocation.type === 'ZONE_TRANSFER' && (
                    <div className="space-y-3 font-mono">
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Target Item & SKU</div>
                        <div className="font-bold text-stone-900 text-sm">
                          {pendingReallocation.data.productName} ({pendingReallocation.data.sku})
                        </div>
                        <div className="text-stone-600 text-[11px]">
                          Reason: {pendingReallocation.data.reasoning}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Source Origin</div>
                          <div className="font-bold text-red-600 mt-1">-{pendingReallocation.data.transferQty} Units</div>
                          <div className="text-[10px] text-stone-600">{pendingReallocation.data.sourceZone} ({pendingReallocation.data.sourceBin})</div>
                        </div>

                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Destination Zone</div>
                          <div className="font-bold text-emerald-600 mt-1">+{pendingReallocation.data.transferQty} Units</div>
                          <div className="text-[10px] text-stone-600">{pendingReallocation.data.targetZone} ({pendingReallocation.data.targetBin})</div>
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 font-bold">
                        Fulfillment Speedup: {pendingReallocation.data.speedupImpact}
                      </div>
                    </div>
                  )}

                  {pendingReallocation.type === 'BULK_INTER_ORDER' && (
                    <div className="space-y-3 font-mono">
                      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="text-[10px] font-bold text-stone-500 uppercase">Inter-Order Reservation Transfer</div>
                        <div className="text-stone-900 font-bold">
                          Borrowing {pendingReallocation.data.qty} units of {pendingReallocation.data.sku}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Donor Order (Deducted)</div>
                          <div className="font-bold text-red-700 mt-1">#{pendingReallocation.data.donorOrderId}</div>
                          <div className="text-[10px] text-stone-600">Re-supplied in 8h by inbound flight</div>
                        </div>

                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="text-[10px] text-stone-500 uppercase font-bold">Recipient Order (Allocated)</div>
                          <div className="font-bold text-emerald-700 mt-1">#{pendingReallocation.data.targetOrderId}</div>
                          <div className="text-[10px] text-stone-600">Advanced to PICKING (0 SLA cutoff risk)</div>
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
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                      <span>OPERATOR SECURITY CREDENTIALS</span>
                      <span>{currentUser.role}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{currentUser.name || 'System Administrator'}</div>
                    <div className="text-[10px] text-stone-400">Hub: WH-METRO-01 • Workstation ID: WS-ADM-01</div>
                  </div>

                  <div className="space-y-1.5 font-mono">
                    <label className="text-xs font-bold text-stone-800 uppercase block">
                      Audit Reason & Authorizing Note:
                    </label>
                    <textarea
                      value={reallocationReasonNotes}
                      onChange={(e) => setReallocationReasonNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 font-sans focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <label className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={operatorConfirmationChecked}
                      onChange={(e) => setOperatorConfirmationChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-purple-950">
                      I have reviewed the summary preview and confirm this bulk inventory reallocation change is correct and authorized.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setPendingReallocation(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                {confirmationStep === 1 ? (
                  <button
                    onClick={() => setConfirmationStep(2)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to Operator Security Sign-Off</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalCommitReallocation}
                    disabled={!operatorConfirmationChecked}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Commit Bulk Reallocation</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
