import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  ShieldCheck, 
  Terminal, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Lock, 
  Eye, 
  Truck, 
  Boxes, 
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const PlatformEntryScreen: React.FC = () => {
  const { setActivePortal, switchUser } = useWarehouse();
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'CUSTOMER'>('ADMIN');
  
  // Admin form state
  const [adminEmail, setAdminEmail] = useState('sarah.chen@warewise.ai');
  const [adminPassword, setAdminPassword] = useState('••••••••••••');
  
  // Customer form state
  const [customerEmail, setCustomerEmail] = useState('srivenkatakishoren@gmail.com');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchUser('SUPER_ADMIN');
    setActivePortal('ADMIN');
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchUser('CUSTOMER');
    setActivePortal('CUSTOMER');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 flex flex-col justify-between relative overflow-hidden">
      {/* Top Bar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10 border-b border-[#E7E5E0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-serif-luxury font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-luxury font-bold text-lg tracking-tight text-stone-900">SKANVI</h1>
              <span className="px-2 py-0.5 text-[9px] font-mono-tech uppercase font-bold bg-stone-100 text-stone-700 border border-stone-200 rounded-md">
                v3.7 OS
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-mono-tech uppercase tracking-wider">Autonomous Fulfillment & Commerce</p>
          </div>
        </div>

        {/* Global Quick Switcher */}
        <div className="flex items-center gap-1 bg-[#EFECE6] p-1 rounded-xl border border-[#E7E5E0]">
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Operations OS
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMER')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'CUSTOMER'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Storefront
          </button>
        </div>
      </header>

      {/* Main Dual Gateways */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Mission Statement */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-mono-tech uppercase font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Event → Analysis → Decision → Action → Result</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-serif-luxury font-bold tracking-tight text-stone-900 leading-[1.1]">
              The autonomous warehouse that determines what happens next.
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed font-sans max-w-lg">
              SKANVI powers high-stakes fulfillment with autonomous shortage reallocation, dynamic SLA priority scoring, AI-optimized picker rerouting, and a pristine customer shopping experience with live operational transparency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#E7E5E0] rounded-2xl shadow-lux space-y-1.5">
                <div className="flex items-center gap-2 text-stone-900 text-xs font-bold font-mono-tech uppercase">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Smart Reallocation</span>
                </div>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  Protects critical delivery cutoffs by resolving inventory conflicts across donor reservations in real-time.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E7E5E0] rounded-2xl shadow-lux space-y-1.5">
                <div className="flex items-center gap-2 text-stone-900 text-xs font-bold font-mono-tech uppercase">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>99.4% SLA Delivery</span>
                </div>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  Deep post-purchase transparency with live picker and QC telemetry shared directly with customers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Portal Login Container */}
          <div className="lg:col-span-6">
            {activeTab === 'ADMIN' ? (
              /* ADMIN MISSION-CONTROL LOGIN */
              <div className="bg-white border border-[#E7E5E0] p-8 rounded-3xl shadow-lux space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EFEA]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-900">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury font-bold text-base text-stone-900">Operations Command Login</h3>
                      <p className="text-[11px] font-mono-tech text-stone-500 uppercase">Hub Node: WH-METRO-01 (Bengaluru)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-mono-tech bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1.5 font-bold uppercase">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono-tech uppercase tracking-wider text-stone-600 mb-1.5 font-semibold">
                      Operator / Admin Identifier
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-[#FAFAF9] border border-[#E7E5E0] rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-900 font-mono-tech"
                      placeholder="operator@warewise.ai"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tech uppercase tracking-wider text-stone-600 mb-1.5 font-semibold">
                      Security Passphrase
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-[#FAFAF9] border border-[#E7E5E0] rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-900 font-mono-tech"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="rounded border-[#E7E5E0] text-stone-900 focus:ring-0" />
                      <span>Maintain Session Token</span>
                    </label>
                    <span className="text-stone-700 hover:text-stone-900 cursor-pointer font-medium">Hardware Key Sync</span>
                  </div>

                  <button
                    type="submit"
                    id="admin-login-submit-btn"
                    className="w-full py-3 bg-stone-900 hover:bg-black text-white font-medium text-xs tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer shadow-sm"
                  >
                    <span>Enter Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Role Fast-Logins for Demo */}
                <div className="pt-4 border-t border-[#F0EFEA]">
                  <div className="text-[10px] font-mono-tech uppercase tracking-wider text-stone-500 mb-2 font-semibold">
                    Demo Access Presets:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        switchUser('SUPER_ADMIN');
                        setActivePortal('ADMIN');
                      }}
                      className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-[11px] text-stone-900 text-center font-mono-tech font-semibold transition-colors cursor-pointer"
                    >
                      Super Admin
                    </button>
                    <button
                      onClick={() => {
                        switchUser('WAREHOUSE_MANAGER');
                        setActivePortal('ADMIN');
                      }}
                      className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-[11px] text-stone-800 text-center font-mono-tech font-semibold transition-colors cursor-pointer"
                    >
                      Warehouse Mgr
                    </button>
                    <button
                      onClick={() => {
                        switchUser('INVENTORY_MANAGER');
                        setActivePortal('ADMIN');
                      }}
                      className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-[11px] text-stone-800 text-center font-mono-tech font-semibold transition-colors cursor-pointer"
                    >
                      Inventory Mgr
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* CUSTOMER COMMERCE LOGIN */
              <div className="bg-white border border-[#E7E5E0] p-8 rounded-3xl shadow-lux space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EFEA]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-900">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury font-bold text-base text-stone-900">SKANVI Storefront</h3>
                      <p className="text-[11px] font-mono-tech text-stone-500 uppercase">Curated Tech & Real-Time Tracking</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-mono-tech uppercase font-bold bg-stone-100 text-stone-800 border border-stone-200 rounded-md">
                    Direct Store
                  </span>
                </div>

                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono-tech uppercase tracking-wider text-stone-600 mb-1.5 font-semibold">
                      Email or Mobile Number
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-[#FAFAF9] border border-[#E7E5E0] rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-900 font-mono-tech"
                      placeholder="you@domain.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    id="customer-login-submit-btn"
                    className="w-full py-3 bg-stone-900 hover:bg-black text-white font-medium text-xs tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Start Shopping Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchUser('CUSTOMER');
                      setActivePortal('CUSTOMER');
                    }}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-stone-700 hover:text-stone-900 text-xs font-mono-tech font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Continue as Guest Shopper</span>
                  </button>
                </form>

                <div className="pt-4 border-t border-[#F0EFEA] flex items-center justify-between text-xs text-stone-600 font-mono-tech">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-time Hub Stock</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Stage Telemetry</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto w-full p-6 text-center text-xs text-stone-500 font-mono-tech border-t border-[#E7E5E0] flex flex-wrap justify-between items-center gap-4">
        <div>SKANVI v3.7 • Autonomous Logistics & Unified Commerce OS</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shared Real-Time Multi-Location State Active</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

