import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ShoppingBag,
  Tag,
  Percent,
  Gift,
  Award,
  Store,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Copy,
  Edit2,
  Trash2,
  DollarSign,
  Boxes,
  SlidersHorizontal,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';
import { PromotionCampaign, GiftCardRecord } from '../../types';

export const CommerceSuiteModule: React.FC = () => {
  const {
    products,
    saveProduct,
    promotions,
    savePromotion,
    deletePromotion,
    giftCards,
    issueGiftCard,
    toggleGiftCardStatus,
    loyaltyAccounts,
    adjustLoyaltyPoints,
    sellers,
    updateSellerStatus,
    bulkUpdatePrices,
    categorySchemas,
    saveCategorySchema
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'PROMOTIONS' | 'GIFT_CARDS' | 'LOYALTY' | 'SELLERS' | 'SCHEMAS' | 'BULK_PRICING'>('PROMOTIONS');
  const [promoSearch, setPromoSearch] = useState('');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // New promo form
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(15);
  const [newPromoType, setNewPromoType] = useState<PromotionCampaign['type']>('SEASONAL');

  // Gift card form
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftAmount, setGiftAmount] = useState(5000);

  // Bulk price state
  const [bulkCategory, setBulkCategory] = useState('ALL');
  const [bulkPercent, setBulkPercent] = useState(5);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoTitle) return;
    const promo: PromotionCampaign = {
      id: `PROM-${Date.now()}`,
      title: newPromoTitle,
      code: newPromoCode || undefined,
      type: newPromoType,
      discountType: 'PERCENT',
      discountValue: newPromoDiscount,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      usageCount: 0,
      tagline: `Special ${newPromoDiscount}% promotional deal on platform hardware.`,
    };
    savePromotion(promo);
    setIsPromoModalOpen(false);
    setNewPromoTitle('');
    setNewPromoCode('');
  };

  const handleIssueGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;
    const cardNo = `SKANVI-GIFT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    issueGiftCard({
      cardNumber: cardNo,
      initialBalance: giftAmount,
      currentBalance: giftAmount,
      recipientEmail,
      recipientName: recipientName || recipientEmail.split('@')[0],
      senderName: 'SKANVI Administrator',
      expiryDate: '2027-12-31',
      status: 'ACTIVE',
    });
    setIsGiftModalOpen(false);
    setRecipientEmail('');
    setRecipientName('');
  };

  const handleApplyBulkPricing = () => {
    bulkUpdatePrices(bulkCategory, bulkPercent);
    setBulkSuccessMsg(`Successfully adjusted prices by ${bulkPercent >= 0 ? '+' : ''}${bulkPercent}% for category: ${bulkCategory}`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-[#1C1917] text-white rounded-xl">
              <ShoppingBag className="w-5 h-5 text-[#E27B58]" />
            </span>
            <h1 className="font-display font-bold text-2xl text-stone-900 italic">
              Commerce & Promotion Suite
            </h1>
          </div>
          <p className="text-stone-500 text-xs">
            Manage hardware deals, coupons, gift card ledgers, customer loyalty rewards, vendor merchants, and dynamic category schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPromoModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-2 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Promotion</span>
          </button>
          <button
            onClick={() => setIsGiftModalOpen(true)}
            className="btn-secondary text-xs flex items-center gap-2 px-4 py-2"
          >
            <Gift className="w-4 h-4 text-stone-700" />
            <span>Issue Gift Card</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PROMOTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'PROMOTIONS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5 inline mr-1.5" />
          Promotions & Campaigns ({promotions.length})
        </button>
        <button
          onClick={() => setActiveTab('GIFT_CARDS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'GIFT_CARDS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Gift className="w-3.5 h-3.5 inline mr-1.5" />
          Gift Cards ({giftCards.length})
        </button>
        <button
          onClick={() => setActiveTab('LOYALTY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'LOYALTY' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 inline mr-1.5" />
          Loyalty Accounts ({loyaltyAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('SELLERS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'SELLERS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Store className="w-3.5 h-3.5 inline mr-1.5" />
          Vendors & Sellers ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('SCHEMAS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'SCHEMAS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1.5" />
          Category Schemas ({categorySchemas.length})
        </button>
        <button
          onClick={() => setActiveTab('BULK_PRICING')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'BULK_PRICING' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
          Bulk Price Engine
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'PROMOTIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((p) => (
            <div key={p.id} className="bg-white border border-[#E7E5E0] rounded-2xl p-5 shadow-sm space-y-4 relative">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold ${
                    p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {p.status}
                  </span>
                  <h3 className="font-semibold text-stone-900 text-base mt-1.5">{p.title}</h3>
                </div>
                <button
                  onClick={() => deletePromotion(p.id)}
                  className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#F8F7F4] rounded-xl p-3 border border-[#E7E5E0] space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Code:</span>
                  <strong className="font-mono text-stone-900 bg-white px-1.5 py-0.5 rounded border border-[#E7E5E0]">{p.code || 'Auto-Discount'}</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Discount:</span>
                  <strong className="text-emerald-700 font-bold">{p.discountValue}% OFF</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Valid Until:</span>
                  <strong className="text-stone-800">{p.endDate}</strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Redemptions:</span>
                  <strong className="text-stone-800">{p.usageCount} used</strong>
                </div>
              </div>

              <p className="text-stone-500 text-xs italic">{p.tagline}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'GIFT_CARDS' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] text-stone-500 font-mono-tech uppercase border-b border-[#E7E5E0]">
                <tr>
                  <th className="p-3">Card Number</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Initial</th>
                  <th className="p-3">Current Balance</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {giftCards.map((card) => (
                  <tr key={card.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">{card.cardNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-stone-900">{card.recipientName}</div>
                      <div className="text-stone-400 text-[11px]">{card.recipientEmail}</div>
                    </td>
                    <td className="p-3 font-mono">₹{card.initialBalance.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">₹{card.currentBalance.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-stone-500">{card.expiryDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold ${
                        card.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleGiftCardStatus(card.id)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {card.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOYALTY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loyaltyAccounts.map((acc) => (
            <div key={acc.customerId} className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{acc.customerName}</h3>
                  <span className="text-xs font-mono-tech text-[#E27B58] uppercase font-bold">{acc.tier}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-stone-900">{acc.pointsBalance}</div>
                  <div className="text-[10px] text-stone-400 font-mono-tech uppercase">Points</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone-500 font-mono-tech">
                  <span>Tier Progression</span>
                  <span>{acc.tierProgress}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#E27B58] h-full rounded-full" style={{ width: `${acc.tierProgress}%` }} />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => adjustLoyaltyPoints(acc.customerId, 250, 'Admin manual reward credit')}
                  className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  +250 Points
                </button>
                <button
                  onClick={() => adjustLoyaltyPoints(acc.customerId, -100, 'Admin manual correction')}
                  className="flex-1 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-[#E7E5E0] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  -100 Points
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SELLERS' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] text-stone-500 font-mono-tech uppercase border-b border-[#E7E5E0]">
                <tr>
                  <th className="p-3">Vendor / Entity</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Products</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">Fulfillment Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">
                      {s.name}
                      <div className="text-stone-400 text-[11px] font-normal">{s.city}</div>
                    </td>
                    <td className="p-3 font-semibold text-stone-800">{s.brand}</td>
                    <td className="p-3 font-mono">⭐ {s.rating}</td>
                    <td className="p-3 font-mono">{s.activeProductsCount} SKUs</td>
                    <td className="p-3 font-mono text-stone-900">{s.commissionRatePercent}%</td>
                    <td className="p-3 font-mono text-emerald-700">{s.fulfillmentScore}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold ${
                        s.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {s.status === 'PENDING_AUDIT' ? (
                        <button
                          onClick={() => updateSellerStatus(s.id, 'VERIFIED')}
                          className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Approve Merchant
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BULK_PRICING' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm max-w-xl space-y-6">
          <div>
            <h3 className="font-bold text-stone-900 text-lg mb-1">Smart Change Impact Price Adjustment</h3>
            <p className="text-stone-500 text-xs">Simulate and execute bulk catalog price revisions across entire component categories with instant audit logs.</p>
          </div>

          {bulkSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
              {bulkSuccessMsg}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Target Category</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 text-stone-900 focus:outline-none"
              >
                <option value="ALL">All Catalog Categories</option>
                <option value="Edge Computing">Edge Computing</option>
                <option value="Smart Audio">Smart Audio</option>
                <option value="Robotics & IoT">Robotics & IoT</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Price Revision Percentage (-20% to +50%)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(Number(e.target.value))}
                  className="flex-1 accent-stone-900 cursor-pointer"
                />
                <span className="font-mono text-sm font-bold w-16 text-right">
                  {bulkPercent >= 0 ? `+${bulkPercent}` : bulkPercent}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7E5E0] flex justify-end">
              <button
                onClick={handleApplyBulkPricing}
                className="btn-primary text-xs px-5 py-2.5"
              >
                Execute Bulk Price Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-stone-900 text-lg">Create New Promotion Campaign</h3>
            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Autumn Cyber Robotics Blitz"
                  value={newPromoTitle}
                  onChange={(e) => setNewPromoTitle(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Coupon Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., CYBER2026"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                  className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-4 py-2">
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Card Modal */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-stone-900 text-lg">Issue Gift Card Balance</h3>
            <form onSubmit={handleIssueGiftCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., customer@aerotech.io"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Recipient Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Marcus Vance"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 text-stone-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Gift Credit Amount (₹)</label>
                <input
                  type="number"
                  step="500"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(Number(e.target.value))}
                  className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 font-mono text-stone-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-4 py-2">
                  Issue Digital Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
