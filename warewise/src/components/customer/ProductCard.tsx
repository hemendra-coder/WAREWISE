import React from 'react';
import { Product } from '../../types';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  Check,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const {
    cart,
    addToCart,
    updateCartQty,
    wishlist,
    toggleWishlist,
    addToComparison,
    comparisonList,
  } = useWarehouse();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isInWishlist = wishlist.includes(product.id);
  const isInComparison = comparisonList.some((p) => p.id === product.id);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isLowStock = product.availableStock > 0 && product.availableStock <= 5;
  const isOutOfStock = product.availableStock === 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col h-full overflow-hidden group relative"
    >
      {/* Top Badges & Wishlist Trigger */}
      <div className="relative p-3 bg-slate-50/60 border-b border-slate-100 flex items-center justify-center overflow-hidden">
        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-xs hover:bg-white transition-all z-10 cursor-pointer ${
            isInWishlist ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded shadow-xs z-10">
            {discountPercent}% OFF
          </div>
        )}

        {/* Image Thumbnail */}
        <div
          onClick={() => onSelect(product)}
          className="w-full h-48 flex items-center justify-center cursor-pointer overflow-hidden p-2"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="text-blue-600 font-semibold">{product.category}</span>
            <span className="font-mono text-slate-400">{product.sku}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Star Ratings */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold ml-1 text-slate-800">{product.rating}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 text-[11px]">
              ({product.reviewsCount?.toLocaleString() || 28} reviews)
            </span>
          </div>

          {/* Price Section */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock & Delivery Signals */}
          <div className="space-y-1 pt-1 text-[11px]">
            {isOutOfStock ? (
              <span className="text-red-600 font-semibold">Currently Out of Stock</span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-semibold">
                Only {product.availableStock} left in stock - order soon
              </span>
            ) : (
              <div className="flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>In Stock • Dispatches in 2 hrs</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-slate-600">
              <Truck className="w-3 h-3 text-blue-600 shrink-0" />
              <span>
                {product.fastDeliveryAvailable
                  ? 'FREE Express Air Delivery Tomorrow'
                  : 'Standard Delivery within 2-3 Days'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {cartItem ? (
            <div className="flex items-center justify-between w-full bg-blue-50 border border-blue-200 rounded-lg p-1">
              <button
                type="button"
                onClick={() => updateCartQty(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center bg-white text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-bold transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-blue-900">
                {cartItem.quantity} in cart
              </span>
              <button
                type="button"
                onClick={() => updateCartQty(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center bg-white text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-bold transition-colors cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product, 1)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelect(product)}
            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
