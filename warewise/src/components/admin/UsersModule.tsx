import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { UserRole } from '../../types';
import { Users, ShieldCheck, Key, Lock, CheckCircle2, UserPlus, UserCheck } from 'lucide-react';

export const UsersModule: React.FC = () => {
  const { currentUser, switchUser } = useWarehouse();

  const userRolesList: Array<{
    role: UserRole;
    name: string;
    title: string;
    email: string;
    badge: string;
    permissions: string[];
  }> = [
    {
      role: 'SUPER_ADMIN',
      name: 'Sarah Chen',
      title: 'Head of Global Logistics & AI Systems',
      email: 'sarah.chen@warewise.ai',
      badge: 'Full Root Privileges',
      permissions: ['All 15 Modules', 'Override Allocation', 'Reorder PO Transmit', 'User Role Management', 'Audit Purge & Export'],
    },
    {
      role: 'WAREHOUSE_MANAGER',
      name: 'Marcus Vance',
      title: 'Regional Hub Director',
      email: 'marcus.vance@warewise.ai',
      badge: 'Facility Operations',
      permissions: ['Command Center', 'Inventory POs', 'Orders Lifecycle', 'Staff Balancing', 'Carrier Waves'],
    },
    {
      role: 'INVENTORY_MANAGER',
      name: 'Amina Al-Mansoor',
      title: 'Chief Inventory Strategist',
      email: 'amina.mansoor@warewise.ai',
      badge: 'Stock & Replenishment',
      permissions: ['Inventory Module', 'Allocation Matrix', 'Warehouse Bins', 'Reorder Triggers'],
    },
    {
      role: 'FULFILLMENT_OPERATOR',
      name: 'Vikram Mehta',
      title: 'Senior Floor Lead & Master Picker',
      email: 'vikram.mehta@warewise.ai',
      badge: 'Floor Operations',
      permissions: ['Smart Picking Map', 'Packing Station Scan', 'QC Checklists', 'Incident Logging'],
    },
    {
      role: 'DISPATCH_OPERATOR',
      name: 'Devon Brooks',
      title: 'Carrier Dock Logistics Lead',
      email: 'devon.brooks@warewise.ai',
      badge: 'Outbound Logistics',
      permissions: ['Dock Scheduling', 'Wave Manifest Generation', 'Carrier Handshake', 'Driver Handoff'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold">
              MODULE 12 // Governance
            </span>
          </div>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
            Users & Role Permission Matrix
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed font-sans pt-1">
            Granular access governance across Super Admins, Warehouse Directors, Inventory Leads, Floor Operators, and Dispatchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-mono-tech font-medium flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>RBAC Status: Enforced</span>
          </span>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {userRolesList.map((u) => {
          const isCurrent = currentUser.role === u.role;
          return (
            <div
              key={u.role}
              className={`p-6 rounded-2xl border transition-all space-y-4 shadow-lux flex flex-col justify-between ${
                isCurrent
                  ? 'bg-stone-50/80 border-stone-900 ring-1 ring-stone-900/10'
                  : 'bg-white border-[#E7E5E0] hover:border-stone-400'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-stone-100 text-stone-700 font-bold border border-stone-200">
                    {u.badge}
                  </span>
                  {isCurrent && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono-tech bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ACTIVE SESSION</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif-luxury font-bold text-lg text-stone-900">{u.name}</h3>
                  <div className="text-xs text-stone-600 font-mono-tech mt-0.5">{u.title}</div>
                  <div className="text-[11px] text-stone-400 font-mono-tech">{u.email}</div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#F0EFEA]">
                  <div className="text-[10px] font-mono-tech uppercase text-stone-500 font-semibold tracking-wider">AUTHORIZED PRIVILEGES:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {u.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[10.5px] font-mono-tech text-stone-700"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => switchUser(u.role)}
                  className={`w-full py-2.5 rounded-xl text-xs font-mono-tech font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                  }`}
                >
                  {isCurrent ? 'Current Session Active' : `Switch Role: ${u.role}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
