import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  ShoppingBag, 
  Sparkles, 
  RotateCcw, 
  Play, 
  ChevronRight, 
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GlobalPortalNav: React.FC = () => {
  const { 
    activePortal, 
    setActivePortal, 
    currentUser, 
    switchUser, 
    heroStep, 
    runHeroSimulationStep, 
    resetSimulationData,
    metrics
  } = useWarehouse();

  const [showHeroMenu, setShowHeroMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const heroSteps = [
    { step: 1, title: '01. Ingest Urgent Order #1042', desc: 'VIP enterprise order with 35m SLA countdown' },
    { step: 2, title: '02. Detect Shortage & Rank Donors', desc: '7 in stock vs 10 needed for NeoCore X9; Order #1047 identified' },
    { step: 3, title: '03. Execute Smart Reallocation', desc: 'Transfers 3 units to #1042 and begins picking' },
    { step: 4, title: '04. Handle Missing Item Exception', desc: 'Reroutes picker to overflow Bin B-07-1' },
    { step: 5, title: '05. Pass Quality Control Inspection', desc: 'Optical barcode & weight check verified' },
    { step: 6, title: '06. Resolve Dispatch Bottleneck', desc: 'Reassigns packer to Dock 03 & releases wave' },
    { step: 7, title: '07. Customer Live Transparency', desc: 'Switches to customer portal with full fulfillment timeline' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#E7E5E0] text-[#1C1917] select-none transition-colors">
      {/* Top Value / Status Strip */}
      <div className="border-b border-[#E7E5E0] bg-[#F2EFE9] px-4 sm:px-8 py-1.5 text-[11px] font-mono-tech flex items-center justify-between text-stone-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
            <span className="font-semibold text-stone-900 tracking-wider">WH-METRO-01</span>
            <span className="opacity-30">/</span>
            <span className="text-stone-600">Operations OS</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1C1917] text-[#F8F7F4] text-[9px] font-mono-tech tracking-widest uppercase font-bold hidden sm:inline-flex">
            AUTO-THROUGHPUT: {metrics.pickingRatePerHour}/HR
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-stone-500">
            Active Wave: <strong className="text-stone-900 font-medium">Flight Wave 03</strong>
          </span>
          {metrics.criticalSlaCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white font-medium text-[10px] tracking-wide font-mono-tech uppercase">
              {metrics.criticalSlaCount} SLA At Risk
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActivePortal('CUSTOMER')}
          className="flex items-baseline gap-2 cursor-pointer group"
        >
          <span className="font-serif-luxury font-semibold italic text-2xl sm:text-3xl tracking-tight text-stone-900 block leading-none group-hover:text-stone-700 transition-colors">
            Skanvi.
          </span>
          <span className="text-[9px] font-mono-tech uppercase tracking-widest text-stone-400 hidden sm:inline">
            // Logistics OS
          </span>
        </div>

        {/* View Switcher: Storefront vs Operations OS */}
        <nav className="flex items-center bg-[#EAE6DE] p-1 rounded-xl border border-[#E7E5E0] text-xs font-medium">
          <button
            id="portal-switch-customer"
            onClick={() => setActivePortal('CUSTOMER')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg transition-all cursor-pointer font-mono-tech text-xs tracking-wider uppercase ${
              activePortal === 'CUSTOMER'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <button
            id="portal-switch-admin"
            onClick={() => setActivePortal('ADMIN')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg transition-all cursor-pointer font-mono-tech text-xs tracking-wider uppercase ${
              activePortal === 'ADMIN'
                ? 'bg-[#1C1917] text-white shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Operations OS</span>
            {metrics.criticalSlaCount > 0 && activePortal !== 'ADMIN' && (
              <span className="w-2 h-2 rounded-full bg-terracotta animate-ping" />
            )}
          </button>
        </nav>

        {/* Quick Actions & Tour */}
        <div className="flex items-center gap-3">
          {/* Judge Guided Scenario Walkthrough */}
          <div className="relative">
            <button
              id="hero-demo-trigger-btn"
              onClick={() => setShowHeroMenu(!showHeroMenu)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E7E5E0] text-stone-900 text-xs font-mono-tech font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden sm:inline">Scenario Tour</span>
              {heroStep > 0 && (
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center font-bold">
                  {heroStep}
                </span>
              )}
            </button>

            {/* Dropdown Menu for Guided Steps */}
            <AnimatePresence>
              {showHeroMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-[#E7E5E0] rounded-2xl shadow-xl p-4 z-50 text-xs"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2 font-serif-luxury font-bold text-sm text-stone-900">
                      <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                      <span>7-Step Autonomous Tour</span>
                    </div>
                    <button
                      onClick={() => {
                        resetSimulationData();
                        setShowHeroMenu(false);
                      }}
                      className="flex items-center gap-1 text-[11px] font-mono-tech text-stone-400 hover:text-stone-900 transition-colors cursor-pointer uppercase"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 font-sans">
                    {heroSteps.map((s) => (
                      <button
                        key={s.step}
                        onClick={() => {
                          runHeroSimulationStep(s.step);
                          setShowHeroMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 border cursor-pointer ${
                          heroStep === s.step
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : heroStep > s.step
                            ? 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                            : 'bg-white border-transparent hover:border-stone-200 text-stone-500'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            {heroStep > s.step && <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 shrink-0" />}
                            <span>{s.title}</span>
                          </div>
                          <div className={`text-[11px] mt-0.5 ${heroStep === s.step ? 'text-stone-300' : 'text-stone-500'}`}>
                            {s.desc}
                          </div>
                        </div>
                        <Play className={`w-3.5 h-3.5 mt-1 shrink-0 ${heroStep === s.step ? 'text-white' : 'text-stone-400'}`} />
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => {
                        const next = heroStep >= 7 ? 1 : heroStep + 1;
                        runHeroSimulationStep(next);
                      }}
                      className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-terracotta text-white font-mono-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <span>{heroStep === 0 ? 'Start Walkthrough' : `Next Step (${heroStep + 1}/7)`}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-[#E7E5E0] rounded-xl text-stone-800 transition-all cursor-pointer shadow-sm text-xs"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:inline font-mono-tech text-xs uppercase tracking-wider text-stone-700 font-semibold">{currentUser.name}</span>
            </button>

            <AnimatePresence>
              {showRoleMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-[#E7E5E0] rounded-2xl shadow-xl p-2 z-50 text-xs"
                >
                  <div className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-400 px-3 py-2 border-b border-stone-100 mb-1 font-bold">
                    Switch Profile
                  </div>
                  {(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_MANAGER', 'FULFILLMENT_OPERATOR', 'DISPATCH_OPERATOR', 'CUSTOMER'] as const).map(
                    (role) => (
                      <button
                        key={role}
                        onClick={() => {
                          switchUser(role);
                          setShowRoleMenu(false);
                          if (role === 'CUSTOMER') {
                            setActivePortal('CUSTOMER');
                          } else {
                            setActivePortal('ADMIN');
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer font-mono-tech ${
                          currentUser.role === role
                            ? 'bg-stone-100 text-stone-900 font-bold'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xs uppercase">{role.replace(/_/g, ' ')}</span>
                        {currentUser.role === role && <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
