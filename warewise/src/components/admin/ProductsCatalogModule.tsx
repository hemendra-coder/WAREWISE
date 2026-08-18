import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductsCatalogModule: React.FC = () => {
  const { products, saveProduct, deleteProduct, hasPermission } = useWarehouse();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.binLocation.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

    if (!matchesSearch || !matchesCat) return false;
    if (activeTab === 'ACTIVE') return p.availableStock > 0;
    if (activeTab === 'DRAFT') return p.availableStock === 0;
    return true;
  });

  const handleOpenNewModal = () => {
    const newSkuNumber = Math.floor(100 + Math.random() * 900);
    const newProd: Product = {
      id: `prod-custom-${Date.now()}`,
      name: '',
      sku: `SKU-WMS-${newSkuNumber}`,
      category: 'Electronics',
      price: 4999,
      originalPrice: 5999,
      rating: 4.8,
      reviewsCount: 1,
      availableStock: 50,
      reservedStock: 0,
      damagedStock: 0,
      safetyStock: 10,
      reorderThreshold: 15,
      leadTimeDays: 3,
      incomingStock: 0,
      dailyDemand: 12,
      health: 'HEALTHY',
      binLocation: 'A-01-1',
      zone: 'Zone A (High Velocity)',
      warehouseId: 'WH-METRO-01',
      deliveryConfidence: 98,
      aiVerdict: 'Verified catalog item.',
      pros: ['Pristine quality'],
      cons: [],
      tags: ['New SKU'],
      fastDeliveryAvailable: true,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      description: '',
      specs: { Dimensions: '15 x 10 x 5 cm', Weight: '0.45 kg' },
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsNewProduct(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim() || !editingProduct.sku.trim()) {
      setFeedback({ type: 'error', message: 'Product name and SKU are required.' });
      return;
    }

    saveProduct(editingProduct);
    setFeedback({
      type: 'success',
      message: `Product ${editingProduct.sku} (${editingProduct.name}) saved successfully.`,
    });
    setEditingProduct(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteProduct = (sku: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete SKU ${sku} (${name})?`)) {
      deleteProduct(sku);
      setFeedback({ type: 'success', message: `Product ${sku} removed.` });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-5 text-[#1A1A1A]">
      {/* Top Shopify Products Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Products</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your store catalog, pricing, SKUs, and inventory across locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer">
            Export
          </button>
          <button className="px-3.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm cursor-pointer">
            Import
          </button>
          <button
            onClick={handleOpenNewModal}
            className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border border-[#E1E3E5] rounded-xl shadow-sm overflow-hidden">
        {/* Tabs & Search Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 border-b border-[#E1E3E5] bg-[#FBFBFB]">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium scrollbar-none">
            {(['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  activeTab === tab
                    ? 'bg-stone-200 text-stone-900 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 bg-white border border-stone-300 rounded-lg pl-8 pr-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-700 focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E1E3E5] bg-[#FAFBFB] text-stone-500 font-medium">
                <th className="py-2.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-stone-300 cursor-pointer" />
                </th>
                <th className="py-2.5 px-3 font-medium">Product</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Inventory</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium text-right">Price</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E3E5]">
              {filteredProducts.map((p) => {
                const totalStock = p.availableStock + p.reservedStock;
                const isHealthy = p.availableStock > p.safetyStock;

                return (
                  <tr key={p.sku} className="hover:bg-[#F6F6F7] transition-colors">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-stone-300 cursor-pointer" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded border border-stone-200 object-cover shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            SKU: {p.sku} • Bin: {p.binLocation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isHealthy ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-900">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-stone-900">
                      {p.availableStock} in stock at 1 location
                    </td>
                    <td className="py-3 px-3 text-stone-600 font-medium whitespace-nowrap">
                      {p.category}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900 whitespace-nowrap">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.sku, p.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 text-[#1A1A1A] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-lg font-bold text-stone-900">
                  {isNewProduct ? 'Add Product' : `Edit Product — ${editingProduct.sku}`}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="font-semibold text-stone-700 block mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category: e.target.value })
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Available Inventory</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.availableStock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          availableStock: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Bin Location</label>
                    <input
                      type="text"
                      value={editingProduct.binLocation}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, binLocation: e.target.value })
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A1A1A] text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
