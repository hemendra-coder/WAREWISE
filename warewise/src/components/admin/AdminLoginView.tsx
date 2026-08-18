import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { UserRole } from '../../types';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Server,
  ArrowRight,
  Store,
  UserCheck,
  Building2,
  Boxes,
  Truck,
  Package,
  FileText,
  ShoppingBag,
  User,
  UserPlus,
  KeyRound,
  Crown,
  Zap,
  Phone
} from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const {
    loginAdmin,
    loginCustomer,
    registerCustomer,
    setActivePortal,
    setActiveAdminRole
  } = useWarehouse();

  // Mode: 'ADMIN' or 'CUSTOMER'
  const [loginMode, setLoginMode] = useState<'ADMIN' | 'CUSTOMER'>('ADMIN');

  // Customer Auth Sub-tab: 'SIGNIN' or 'REGISTER'
  const [customerAuthTab, setCustomerAuthTab] = useState<'SIGNIN' | 'REGISTER'>('SIGNIN');

  // Admin State
  const [selectedAdminRole, setSelectedAdminRole] = useState<UserRole>('SUPER_ADMIN');
  const [adminEmail, setAdminEmail] = useState('hemendrasai9@gmail.com');
  const [adminPassword, setAdminPassword] = useState('manish@999');

  // Customer State
  const [customerEmail, setCustomerEmail] = useState('arnav.kumar@gmail.com');
  const [customerPassword, setCustomerPassword] = useState('customer@123');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Operational Presets for Admin
  const adminRolePresets: { role: UserRole; label: string; icon: any; email: string; desc: string }[] = [
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin (Owner)',
      icon: Shield,
      email: 'hemendrasai9@gmail.com',
      desc: 'Unrestricted master access across all 21 modules & system settings'
    },
    {
      role: 'WAREHOUSE_ADMIN',
      label: 'Store & Hub Manager',
      icon: Building2,
      email: 'manager.metro@warewise.io',
      desc: 'Warehouse operations, orders, inventory, dispatch & analytics'
    },
    {
      role: 'DISPATCHER',
      label: 'Dispatch Operator',
      icon: Truck,
      email: 'dispatch.lead@warewise.io',
      desc: 'Carrier manifests, airway bills, route planning & rider tracking'
    },
    {
      role: 'PICKER',
      label: 'Order Batcher / Picker',
      icon: Boxes,
      email: 'picker.zone1@warewise.io',
      desc: 'Wave picking queues, bin navigation & barcode verification'
    },
    {
      role: 'PACKER',
      label: 'Packing Specialist',
      icon: Package,
      email: 'packer.station4@warewise.io',
      desc: 'Packing tables, weight verification & tamper sealing'
    },
    {
      role: 'INVENTORY_MANAGER',
      label: 'Inventory Specialist',
      icon: Boxes,
      email: 'inventory.head@warewise.io',
      desc: 'Stock balances, PO receipts, cycle counts & bin mapping'
    },
    {
      role: 'OFFICIAL',
      label: 'Finance & Compliance',
      icon: FileText,
      email: 'compliance.auditor@warewise.io',
      desc: 'Tax reconciliation, audit trails, financial reports & CRM'
    }
  ];

  // Customer Presets
  const customerPresets = [
    {
      label: 'B2B Wholesale Partner',
      email: 'corporate.buy@apexlogistics.in',
      pass: 'b2b@apex99',
      icon: Building2,
      badge: 'B2B Wholesale Tier 1',
      desc: 'Access credit terms, bulk pricing tiers & commercial invoices'
    },
    {
      label: 'VIP Preferred Patron',
      email: 'vip.patron@warewise.io',
      pass: 'vip@patron2026',
      icon: Crown,
      badge: 'VIP Priority Customer',
      desc: 'Priority 2-hour dispatch, dedicated account manager & free delivery'
    },
    {
      label: 'Retail Shopper',
      email: 'arnav.kumar@gmail.com',
      pass: 'customer@123',
      icon: ShoppingBag,
      badge: 'Standard Shopper',
      desc: 'Personal e-commerce orders, tracking & order history'
    },
    {
      label: 'Guest Customer',
      email: 'guest.shopper@warewise.io',
      pass: 'guest@pass',
      icon: User,
      badge: 'Guest Access',
      desc: 'Instant express checkout & tracking without password friction'
    }
  ];

  const handleAdminRoleSelect = (preset: typeof adminRolePresets[0]) => {
    setSelectedAdminRole(preset.role);
    setAdminEmail(preset.email);
    setErrorMessage(null);
  };

  const handleCustomerPresetSelect = (preset: typeof customerPresets[0]) => {
    setCustomerEmail(preset.email);
    setCustomerPassword(preset.pass);
    setErrorMessage(null);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }

    setLoading(true);
    try {
      setActiveAdminRole(selectedAdminRole);
      const res = await loginAdmin(adminEmail.trim(), adminPassword);
      if (res.success) {
        setSuccessMessage(`Authorized: Authenticated as ${selectedAdminRole.replace('_', ' ')}`);
        setActivePortal('ADMIN');
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Authorization verification failed. Check security credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (customerAuthTab === 'SIGNIN') {
      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await loginCustomer(customerEmail.trim(), customerPassword);
        if (res.success) {
          setSuccessMessage(res.message);
          setActivePortal('CUSTOMER');
        } else {
          setErrorMessage(res.message);
        }
      } catch {
        setErrorMessage('Customer login authentication failed.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!customerName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!customerEmail.trim() || !customerEmail.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
        setErrorMessage('Please enter a valid 10-digit phone number.');
        return;
      }
      setLoading(true);
      try {
        const res = await registerCustomer(
          customerName.trim(),
          customerEmail.trim(),
          customerPhone.trim(),
          customerPassword
        );
        if (res.success) {
          setSuccessMessage(res.message);
          setActivePortal('CUSTOMER');
        } else {
          setErrorMessage(res.message);
        }
      } catch {
        setErrorMessage('Account registration failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1012] text-stone-100 flex flex-col justify-between font-sans antialiased selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden">
      {/* Background Ambient Gradient Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="h-16 border-b border-stone-800/80 px-4 sm:px-10 flex items-center justify-between bg-stone-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold font-mono text-sm shadow-md">
            WW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury italic font-bold text-lg text-stone-100 tracking-tight">
                WareWise
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono-tech text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                Security Gate
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-sans hidden sm:block">
              Enterprise Logistics OS & Online Commerce Terminal
            </p>
          </div>
        </div>

        {/* Portal Switcher Buttons in Header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoginMode('ADMIN');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all cursor-pointer ${
              loginMode === 'ADMIN'
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Staff Gate</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('CUSTOMER');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all cursor-pointer ${
              loginMode === 'CUSTOMER'
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Customer Login</span>
          </button>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-center items-center z-10">
        
        {/* Mode Selector Segmented Control Banner */}
        <div className="w-full max-w-md bg-stone-950 p-1 rounded-2xl border border-stone-800 mb-6 flex items-center shadow-lg">
          <button
            type="button"
            onClick={() => {
              setLoginMode('ADMIN');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loginMode === 'ADMIN'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Operations</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('CUSTOMER');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loginMode === 'CUSTOMER'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Portal</span>
          </button>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ================= ADMIN OPERATIONS VIEW ================= */}
          {loginMode === 'ADMIN' ? (
            <>
              {/* Left Column: Operational Role Selector (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 text-stone-300 font-mono-tech text-xs font-semibold border border-stone-700 mb-3">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>TLS 1.3 256-Bit Encrypted Terminal Session</span>
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-serif-luxury italic font-bold text-white tracking-tight">
                    Admin Operations Sign In
                  </h1>
                  <p className="text-sm text-stone-400 mt-2 font-sans leading-relaxed">
                    Select your assigned operational role to automatically populate node privileges and load sector permissions.
                  </p>
                </div>

                {/* Operational Role Selection Grid */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 tracking-wider">
                    Select Operational Access Profile:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {adminRolePresets.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = selectedAdminRole === preset.role;
                      return (
                        <button
                          key={preset.role}
                          type="button"
                          onClick={() => handleAdminRoleSelect(preset)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                              : 'bg-stone-900/80 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold font-sans flex items-center justify-between">
                              <span>{preset.label}</span>
                              {isSelected && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <p className="text-[10px] text-stone-400 font-sans line-clamp-2 leading-snug">
                              {preset.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Admin Authentication Form (5 cols) */}
              <div className="lg:col-span-5 w-full">
                <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-amber-400" />
                      <span className="font-mono-tech text-xs text-stone-300 uppercase font-bold tracking-wider">
                        Node: WH-METRO-01
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 mb-1.5">
                        Administrator Identifier / Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@warewise.io"
                          required
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 mb-1.5">
                        Security Authorization Token
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 text-[11px] text-stone-400 font-sans space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-300">Active Access Level:</span>
                        <span className="font-mono-tech font-bold text-amber-400 uppercase">
                          {selectedAdminRole.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Permissions will be strictly restricted to sector-authorized modules upon session validation.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 text-xs font-mono-tech uppercase tracking-wider"
                    >
                      {loading ? (
                        <span>Authenticating Node Credentials...</span>
                      ) : (
                        <>
                          <span>Sign In to Operations Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            /* ================= CUSTOMER PORTAL VIEW ================= */
            <>
              {/* Left Column: Customer Account Presets (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono-tech text-xs font-semibold border border-amber-500/30 mb-3">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>WareWise E-Commerce & B2B Portal</span>
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-serif-luxury italic font-bold text-white tracking-tight">
                    Customer Account Sign In
                  </h1>
                  <p className="text-sm text-stone-400 mt-2 font-sans leading-relaxed">
                    Access your consumer shopping orders, wholesale B2B price tiers, express shipment tracking, and corporate invoice management.
                  </p>
                </div>

                {/* Customer Demo Account Profiles */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 tracking-wider">
                    Quick Sign In Demo Profiles:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {customerPresets.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = customerEmail === preset.email;
                      return (
                        <button
                          key={preset.email}
                          type="button"
                          onClick={() => handleCustomerPresetSelect(preset)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                              : 'bg-stone-900/80 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold font-sans flex items-center justify-between">
                              <span>{preset.label}</span>
                              {isSelected && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <span className="inline-block text-[10px] font-mono text-amber-400 font-semibold">
                              {preset.badge}
                            </span>
                            <p className="text-[10px] text-stone-400 font-sans line-clamp-2 leading-snug">
                              {preset.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Sign In / Register Form (5 cols) */}
              <div className="lg:col-span-5 w-full">
                <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
                  
                  {/* Sign In vs Register Toggle */}
                  <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                    <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerAuthTab('SIGNIN');
                          setErrorMessage(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          customerAuthTab === 'SIGNIN'
                            ? 'bg-stone-800 text-white shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerAuthTab('REGISTER');
                          setErrorMessage(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          customerAuthTab === 'REGISTER'
                            ? 'bg-stone-800 text-white shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Register Account
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    {customerAuthTab === 'REGISTER' && (
                      <div>
                        <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="customer@example.com"
                          required
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    {customerAuthTab === 'REGISTER' && (
                      <div>
                        <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 98450 78901"
                            required
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-mono-tech uppercase font-bold text-stone-400 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 text-xs font-mono-tech uppercase tracking-wider"
                    >
                      {loading ? (
                        <span>Authenticating Account...</span>
                      ) : (
                        <>
                          <span>
                            {customerAuthTab === 'SIGNIN'
                              ? 'Sign In to Storefront'
                              : 'Create Customer Account'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setActivePortal('CUSTOMER')}
                        className="text-xs text-stone-400 hover:text-amber-400 font-sans transition-colors cursor-pointer underline underline-offset-4"
                      >
                        Continue as Guest without signing in →
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-stone-800/60 px-6 text-center text-xs text-stone-500 font-mono z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <span>WareWise Enterprise OS v4.2 • Autonomous Fulfillment & Storefront Tunnel</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> ISO 27001 Certified
          </span>
          <span>•</span>
          <span>256-Bit TLS Encryption</span>
        </div>
      </footer>
    </div>
  );
};
