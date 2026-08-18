import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  Lock,
  Server,
  FileText,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  const {
    setActiveCustomerNavTab,
    setIsAdminLoginModalOpen,
  } = useWarehouse();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Express Priority Air</div>
              <p className="text-slate-400 text-xs mt-0.5">Next-day flight sortation from Bengaluru Central Hub.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">100% Genuine Hardware</div>
              <p className="text-slate-400 text-xs mt-0.5">OEM-certified warranty & barcode-verified stock.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">30-Day Hassle-Free Returns</div>
              <p className="text-slate-400 text-xs mt-0.5">Instant RMA generation & doorstep reverse pickup.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-purple-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">24/7 AI & Engineer Support</div>
              <p className="text-slate-400 text-xs mt-0.5">Hardware architects ready for live sizing and help.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                W
              </div>
              <span className="font-bold text-lg text-white tracking-tight">WareWise Commerce</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Next-generation procurement and autonomous warehouse fulfillment platform for edge AI servers, IoT microcontrollers, robotics, and workstation gear.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>India (Bengaluru Hub)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL</span>
              </div>
            </div>
          </div>

          {/* Catalog Col */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">Products</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => setActiveCustomerNavTab('SHOP')} className="hover:text-white transition-colors cursor-pointer">Edge AI Accelerators</button></li>
              <li><button onClick={() => setActiveCustomerNavTab('SHOP')} className="hover:text-white transition-colors cursor-pointer">Robotics & SensorMatrix</button></li>
              <li><button onClick={() => setActiveCustomerNavTab('SHOP')} className="hover:text-white transition-colors cursor-pointer">QD-OLED Displays</button></li>
              <li><button onClick={() => setActiveCustomerNavTab('SHOP')} className="hover:text-white transition-colors cursor-pointer">Smart Audio Hardware</button></li>
              <li><button onClick={() => setActiveCustomerNavTab('DEALS')} className="hover:text-white transition-colors cursor-pointer">Special Deals</button></li>
            </ul>
          </div>

          {/* Customer Service Col */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">Customer Care</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => setActiveCustomerNavTab('ORDERS')} className="hover:text-white transition-colors cursor-pointer">Track Consignment</button></li>
              <li><button onClick={() => setActiveCustomerNavTab('ACCOUNT')} className="hover:text-white transition-colors cursor-pointer">Your Account</button></li>
              <li><button onClick={() => setActiveCustomerNavTab('ORDERS')} className="hover:text-white transition-colors cursor-pointer">Returns & Exchanges</button></li>
              <li><a href="#" className="hover:text-white transition-colors">GST Invoicing & Billing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Rates & Policies</a></li>
            </ul>
          </div>

          {/* Legal & Security Col */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-mono">Security & Operations</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Commerce</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hardware Warranty Terms</a></li>
              <li className="pt-2">
                {/* Secure Staff Portal Gate Trigger */}
                <button
                  onClick={() => setIsAdminLoginModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[10px] border border-slate-700 transition-colors cursor-pointer"
                >
                  <Server className="w-3 h-3" />
                  <span>Staff & Warehouse Portal</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
        <div>© 2026 WareWise Technologies Inc. All rights reserved. Registered in Bengaluru, India.</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-400">
            <CreditCard className="w-3.5 h-3.5" />
            <span>UPI, NetBanking, Visa, Mastercard, RuPay</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
