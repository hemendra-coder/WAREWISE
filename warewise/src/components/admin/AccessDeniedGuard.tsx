import React from 'react';
import { useWarehouse, AdminModuleKey } from '../../context/WarehouseContext';
import { UserRole } from '../../types';
import { ShieldAlert, Lock, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

interface AccessDeniedGuardProps {
  activeRole: UserRole;
  moduleKey: AdminModuleKey;
}

export const AccessDeniedGuard: React.FC<AccessDeniedGuardProps> = ({ activeRole, moduleKey }) => {
  const { setActiveAdminModule, setActiveAdminRole } = useWarehouse();

  const getModuleName = (key: AdminModuleKey): string => {
    switch (key) {
      case '01_COMMAND': return 'Command Center & Operations Dashboard';
      case '02_INVENTORY': return 'Inventory Balances & Stock Control';
      case '03_ORDERS': return 'Order Fulfillment & Management';
      case '04_ALLOCATION': return 'Batch Allocation Engine';
      case '05_PICKING': return 'Wave Picking Station & Scanners';
      case '06_PACKING': return 'Packing Tables & Tamper Seals';
      case '07_QC': return 'Optical Quality Control Inspection';
      case '08_DISPATCH': return 'Dispatch & Carrier Manifests';
      case '09_EXCEPTIONS': return 'Fulfillment Exceptions & SLA Overrides';
      case '10_ANALYTICS': return 'Financial Analytics & Profit Metrics';
      case '11_COPILOT': return 'AI Operations Co-Pilot';
      case '12_USERS': return 'User Access Rights & Staff Management';
      case '13_PRODUCTS': return 'Product Catalog & Pricing Control';
      case '14_BINS': return 'Warehouse Spatial BIN Layout';
      case '15_AUDIT': return 'Security Audit Trail Logs';
      case '16_ALERTS': return 'Real-time System Alerts & Telemetry';
      case '17_REPORTS': return 'Enterprise Compliance Reports';
      case '18_COMMERCE_SUITE': return 'Commerce Suite & Store Settings';
      case '19_CUSTOMERS': return 'Customer CRM & Segment Logs';
      case '20_INTELLIGENCE_SIM': return 'Autonomous Decision Simulator';
      case '21_PLATFORM_SETTINGS': return 'Global Platform System Settings';
      default: return 'Restricted Operations Sector';
    }
  };

  const getPermittedModulesForRole = (role: UserRole): { key: AdminModuleKey; name: string }[] => {
    switch (role) {
      case 'PICKER':
        return [
          { key: '05_PICKING', name: 'Wave Picking Station' },
          { key: '03_ORDERS', name: 'Orders Queue' },
          { key: '09_EXCEPTIONS', name: 'Exceptions' },
          { key: '14_BINS', name: 'Warehouse BIN Layout' },
        ];
      case 'PACKER':
        return [
          { key: '06_PACKING', name: 'Packing Table' },
          { key: '07_QC', name: 'Quality Control' },
          { key: '09_EXCEPTIONS', name: 'Exceptions' },
        ];
      case 'DISPATCHER':
      case 'DISPATCH_OPERATOR':
        return [
          { key: '08_DISPATCH', name: 'Dispatch & Carrier Hub' },
          { key: '03_ORDERS', name: 'All Orders' },
          { key: '09_EXCEPTIONS', name: 'Shipment Exceptions' },
        ];
      case 'INVENTORY_MANAGER':
        return [
          { key: '02_INVENTORY', name: 'Inventory Balances' },
          { key: '13_PRODUCTS', name: 'Product Catalog' },
          { key: '14_BINS', name: 'Warehouse Bins' },
          { key: '15_AUDIT', name: 'Audit Logs' },
        ];
      case 'ORDER_MANAGER':
        return [
          { key: '03_ORDERS', name: 'Orders Fulfillment' },
          { key: '04_ALLOCATION', name: 'Order Allocation' },
          { key: '09_EXCEPTIONS', name: 'Exceptions' },
          { key: '10_ANALYTICS', name: 'Order Analytics' },
        ];
      case 'OFFICIAL':
        return [
          { key: '10_ANALYTICS', name: 'Financial Analytics' },
          { key: '15_AUDIT', name: 'Compliance Audit Logs' },
          { key: '17_REPORTS', name: 'Financial Reports' },
          { key: '03_ORDERS', name: 'Orders Record' },
        ];
      default:
        return [
          { key: '01_COMMAND', name: 'Command Center' },
          { key: '03_ORDERS', name: 'Orders' },
          { key: '02_INVENTORY', name: 'Inventory' },
        ];
    }
  };

  const permittedModules = getPermittedModulesForRole(activeRole);

  return (
    <div className="p-8 sm:p-12 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white border-2 border-amber-500/30 rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-stone-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 font-mono-tech text-xs font-bold uppercase tracking-wider">
                403 Access Denied
              </span>
              <span className="text-xs font-mono-tech text-stone-500 font-semibold uppercase">
                Sector Policy Restriction
              </span>
            </div>
            <h2 className="text-2xl font-serif-luxury italic font-bold text-stone-900">
              Access Restricted to Elevated Role Rights
            </h2>
            <p className="text-xs text-stone-600 font-sans">
              Your active operational role (<span className="font-mono-tech font-bold text-stone-900 uppercase">{activeRole.replace('_', ' ')}</span>) does not possess sector clearance for <strong className="text-stone-900">{getModuleName(moduleKey)}</strong>.
            </p>
          </div>
        </div>

        {/* Details and Guidance */}
        <div className="py-6 space-y-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 text-stone-700">
            <div className="flex items-center gap-2 font-bold font-mono-tech uppercase text-stone-900">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Role-Based Access Control (RBAC) Enforced</span>
            </div>
            <p>
              To maintain audit compliance and prevent accidental cross-department modifications, each sector is strictly isolated to its assigned personnel. Super Admin or Store Manager clearance is required for platform configurations, staff management, and global financial settings.
            </p>
          </div>

          {/* Quick Access to Permitted Modules */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono-tech uppercase font-bold text-stone-800">
              Permitted Sectors For Your Role ({activeRole.replace('_', ' ')}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {permittedModules.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveAdminModule(m.key)}
                  className="p-3 bg-[#F8F7F4] hover:bg-stone-900 hover:text-white border border-[#E7E5E0] rounded-xl text-left transition-all cursor-pointer flex items-center justify-between text-xs font-semibold group shadow-xs"
                >
                  <span>{m.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Need broader clearance? Switch to Super Admin profile using the top simulator banner.</span>
          </div>
          <button
            onClick={() => setActiveAdminRole('SUPER_ADMIN')}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono-tech font-bold uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to Super Admin Clearance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
