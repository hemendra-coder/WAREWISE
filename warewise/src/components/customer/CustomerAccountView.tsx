import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { CustomerAddress } from '../../types';
import {
  User,
  MapPin,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Package,
  Heart,
  Key,
  LogOut,
  AlertCircle
} from 'lucide-react';

export const CustomerAccountView: React.FC = () => {
  const {
    currentUser,
    updateCustomerProfile,
    customerAddresses,
    addCustomerAddress,
    editCustomerAddress,
    deleteCustomerAddress,
    orders,
    wishlist,
    setActiveCustomerNavTab,
    logoutCustomer,
  } = useWarehouse();

  // Profile Editor state
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98450 78901');
  const [company, setCompany] = useState(currentUser.company || 'AeroTech Systems Pvt Ltd');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Address Manager modal/form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState(currentUser.name);
  const [addrPhone, setAddrPhone] = useState(currentUser.phone || '+91 98450 78901');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrState, setAddrState] = useState('Karnataka');
  const [addrPincode, setAddrPincode] = useState('560066');
  const [addrType, setAddrType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name: name.trim(),
      phone: phone.trim(),
      company: company.trim(),
    });
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const handleOpenEditAddress = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrType(addr.type);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrStreet.trim() || !addrPincode.trim()) return;

    if (editingAddressId) {
      editCustomerAddress(editingAddressId, {
        name: addrName.trim(),
        phone: addrPhone.trim(),
        street: addrStreet.trim(),
        city: addrCity.trim(),
        state: addrState.trim(),
        pincode: addrPincode.trim(),
        type: addrType,
      });
    } else {
      addCustomerAddress({
        name: addrName.trim(),
        phone: addrPhone.trim(),
        street: addrStreet.trim(),
        city: addrCity.trim(),
        state: addrState.trim(),
        pincode: addrPincode.trim(),
        type: addrType,
        isDefault: customerAddresses.length === 0,
      });
    }

    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Account Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.name}</h1>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.company || 'Individual Procurement Account'}</span>
            </div>
          </div>
        </div>

        {/* Metric Quick Stats */}
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={() => setActiveCustomerNavTab('ORDERS')}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center cursor-pointer transition-colors"
          >
            <div className="text-lg font-bold text-slate-900">{orders.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Orders Placed</div>
          </button>

          <button
            onClick={() => setActiveCustomerNavTab('WISHLIST')}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center cursor-pointer transition-colors"
          >
            <div className="text-lg font-bold text-rose-600">{wishlist.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Saved Items</div>
          </button>

          <button
            onClick={logoutCustomer}
            className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 text-center cursor-pointer transition-colors"
            title="Sign out of customer portal"
          >
            <LogOut className="w-5 h-5 mx-auto mb-0.5" />
            <div className="text-[11px] font-semibold">Sign Out</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Profile Settings & Saved Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Personal Info & Company Details (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div>
            <h2 className="font-bold text-base text-slate-900">Personal & Business Profile</h2>
            <p className="text-xs text-slate-500">Update your contact information for dispatch & GST billing</p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile information successfully updated.</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Primary login identifier cannot be edited</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Contact</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Right Col: Saved Delivery Addresses (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Saved Delivery Addresses</h2>
              <p className="text-xs text-slate-500">Manage locations for instant one-click order fulfillment</p>
            </div>
            {!showAddressForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setAddrStreet('');
                  setShowAddressForm(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {showAddressForm ? (
            /* Address Form */
            <form onSubmit={handleAddressSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  placeholder="Street / Unit / Building"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Address List */
            <div className="space-y-3">
              {customerAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white text-xs space-y-1.5 flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{addr.name}</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          Default Address
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{addr.street}</p>
                    <p className="text-slate-700 font-medium">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-slate-500 text-[11px] font-mono">{addr.phone}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit address"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {customerAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteCustomerAddress(addr.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
