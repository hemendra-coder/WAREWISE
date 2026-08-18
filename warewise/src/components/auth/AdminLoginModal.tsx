import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  X,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Server,
  ArrowRight,
  Terminal,
  Cpu
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    loginAdmin,
  } = useWarehouse();

  const [adminEmail, setAdminEmail] = useState('hemendrasai9@gmail.com');
  const [adminPassword, setAdminPassword] = useState('manish@999');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAdminLoginModalOpen) return null;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setErrorMessage('Please enter valid administrator credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAdmin(adminEmail.trim(), adminPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsAdminLoginModalOpen(false);
        }, 500);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Authorization verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide">Warehouse Operations Security Gate</h3>
              <p className="text-xs text-slate-400 font-mono">Node: WH-METRO-01 (Bengaluru)</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminLoginModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-200">Restricted Administrative Area</strong>
              Access is restricted to authorized Warehouse Managers, Super Admins, and Operations staff only.
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                Staff / Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="sarah.chen@warewise.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                Security Password / Token
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Admin Role Presets */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Quick Role Credentials
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('hemendrasai9@gmail.com');
                    setAdminPassword('manish@999');
                  }}
                  className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[11px] text-amber-400">Hemendra Sai</div>
                  <div className="text-[10px] text-slate-400">Super Admin Demo</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('sarah.chen@warewise.ai');
                    setAdminPassword('AdminSec2026!');
                  }}
                  className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[11px] text-blue-400">Sarah Chen</div>
                  <div className="text-[10px] text-slate-400">Super Admin (HQ)</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('vikram.roy@warewise.ai');
                    setAdminPassword('ManagerSec2026!');
                  }}
                  className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-[11px] text-emerald-400">Vikram Roy</div>
                  <div className="text-[10px] text-slate-400">Warehouse Manager</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Authorization & Enter OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsAdminLoginModalOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Cancel & Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
