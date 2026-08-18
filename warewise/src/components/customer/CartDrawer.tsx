import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Truck,
  Heart,
  Sparkles
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
}) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    removeFromCart,
    updateCartQty,
    clearCart,
    toggleWishlist,
    wishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    availableCoupons,
    setSelectedProductId,
  } = useWarehouse();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const discountAmount = appliedCoupon
    ? Math.min(
        appliedCoupon.maxDiscount,
        Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100)
      )
    : 0;

  const freeShippingThreshold = 2000;
  const progressToFreeShipping = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput.trim());
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Your Shopping Cart</h2>
              <p className="text-[11px] text-slate-500">{cartCount} {cartCount === 1 ? 'item' : 'items'} ready for fulfillment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-2.5 bg-blue-50/60 border-b border-blue-100 text-xs">
          {cartSubtotal >= freeShippingThreshold ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You've unlocked FREE Air Express Shipping!</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>
                  Add <strong className="text-slate-900">₹{(freeShippingThreshold - cartSubtotal).toLocaleString()}</strong> more for FREE Air Delivery
                </span>
                <span className="font-bold text-blue-700">{progressToFreeShipping}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Your cart is currently empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our verified hardware catalog, robotics components, and high-performance edge compute.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 group">
                <div
                  onClick={() => {
                    setSelectedProductId(product.id);
                    onClose();
                  }}
                  className="w-16 h-16 bg-slate-50 rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => {
                        setSelectedProductId(product.id);
                        onClose();
                      }}
                      className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer"
                    >
                      {product.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    SKU: {product.sku}
                  </div>

                  <div className="flex items-center justify-between pt-1.5">
                    <div className="text-xs font-bold text-slate-900">
                      ₹{(product.price * quantity).toLocaleString()}
                      {quantity > 1 && (
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          (₹{product.price.toLocaleString()} ea)
                        </span>
                      )}
                    </div>

                    {/* Quantity Modifier */}
                    <div className="flex items-center bg-slate-100 border border-slate-300 rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.id, quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(product.id, quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
            {/* Coupon Application */}
            <div className="space-y-1.5">
              {appliedCoupon ? (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">{appliedCoupon.code}</span>
                    <span className="text-[11px] text-emerald-700">(-₹{discountAmount.toLocaleString()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. WAREWISEAI)"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponMessage && (
                <p className={`text-[11px] ${couponMessage.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Estimated Taxes (18% GST)</span>
                <span className="text-slate-700 font-medium">
                  ₹{Math.round(Math.max(0, cartSubtotal - discountAmount) * 0.18).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Air Express Shipping</span>
                <span className="text-emerald-700 font-semibold">FREE</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-base text-blue-700">
                  ₹{(
                    Math.max(0, cartSubtotal - discountAmount) +
                    Math.round(Math.max(0, cartSubtotal - discountAmount) * 0.18)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="proceed-checkout-cta"
              type="button"
              onClick={onProceedCheckout}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
