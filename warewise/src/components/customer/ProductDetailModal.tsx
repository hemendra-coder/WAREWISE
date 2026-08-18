import React, { useState } from 'react';
import { Product } from '../../types';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Zap,
  Plus,
  Minus,
  Check,
  Share2,
  Building2,
  Lock
} from 'lucide-react';

interface ProductDetailModalProps {
  productId: string;
  onClose: () => void;
  onOpenCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId,
  onClose,
  onOpenCheckout,
}) => {
  const {
    products,
    addToCart,
    cart,
    updateCartQty,
    wishlist,
    toggleWishlist,
    submitProductReview,
    submitProductQuestion,
    setIsCheckoutModalOpen,
    setCheckoutStep,
  } = useWarehouse();

  const product = products.find((p) => p.id === productId);
  const [selectedImage, setSelectedImage] = useState<string>(product?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'SPECS' | 'REVIEWS' | 'QA' | 'AI_VERDICT'>('SPECS');

  // Review Form state
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // QA Form state
  const [newQuestion, setNewQuestion] = useState('');
  const [qaSubmitted, setQaSubmitted] = useState(false);

  if (!product) return null;

  const images = [
    product.image,
    ...(product.secondaryImages || [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80',
    ]),
  ];

  const currentImage = selectedImage || product.image;
  const isInWishlist = wishlist.includes(product.id);
  const cartItem = cart.find((item) => item.product.id === product.id);

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    submitProductReview(product.id, {
      author: reviewAuthor.trim() || 'Verified Customer',
      rating: newReviewRating,
      title: newReviewTitle.trim() || 'Great Product Experience',
      comment: newReviewComment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
    });

    setReviewSubmitted(true);
    setNewReviewTitle('');
    setNewReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const handleQaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    submitProductQuestion(product.id, newQuestion.trim());
    setQaSubmitted(true);
    setNewQuestion('');
    setTimeout(() => setQaSubmitted(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      setCheckoutStep('ADDRESS');
      setIsCheckoutModalOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto animate-fadeIn relative flex flex-col">
        {/* Header Bar with Breadcrumb */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
            <span>Store</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">{product.category}</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">{product.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative bg-slate-50 rounded-xl border border-slate-200 p-6 flex items-center justify-center h-80 sm:h-96 overflow-hidden">
              <img
                src={currentImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded shadow-xs">
                  {discountPercent}% SAVINGS
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                  isInWishlist ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg border p-1 shrink-0 transition-all cursor-pointer ${
                    currentImage === img
                      ? 'border-blue-600 ring-2 ring-blue-100 bg-white'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <img src={img} alt="preview" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Trust Signals */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>OEM Verified Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span>30-Day Hassle Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Air Express Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>GST Tax Invoice Included</span>
              </div>
            </div>
          </div>

          {/* Middle Column: Details & Tabs (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <span>{product.brand || 'WareWise Enterprise'}</span>
                <span>•</span>
                <span className="font-mono text-slate-400 font-normal">{product.sku}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="font-bold ml-1.5 text-slate-900">{product.rating}</span>
                </div>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setActiveTab('REVIEWS')}
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  {product.reviewsCount || 28} verified customer ratings
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* AI Verdict Box */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Hardware Specialist Verdict</span>
              </div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                {product.aiVerdict || 'Exceptional thermal headroom and benchmark performance for enterprise compute workloads.'}
              </p>
            </div>

            {/* Flipkart / Amazon Style Bank Offers & EMI Banner */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 fill-current" />
                <span>Available Bank Offers & EMI Savings</span>
              </div>
              <div className="space-y-1 text-[11px] text-amber-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px]">Bank Offer</span>
                  <span>10% Instant Discount up to ₹1,500 on ICICI, HDFC & SBI Credit Cards.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px]">No Cost EMI</span>
                  <span>No-Cost EMI starting from ₹{Math.round(product.price / 6).toLocaleString()}/month.</span>
                </div>
              </div>
            </div>

            {/* Detail Tabs Selector */}
            <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold pt-2">
              <button
                onClick={() => setActiveTab('SPECS')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'SPECS'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('REVIEWS')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'REVIEWS'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Reviews ({product.reviews?.length || product.reviewsCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('QA')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'QA'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Q&A ({product.qaList?.length || 4})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-3 pt-1">
              {activeTab === 'SPECS' && (
                <div className="divide-y divide-slate-100 text-xs border border-slate-100 rounded-lg overflow-hidden">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-2 p-2.5 bg-white even:bg-slate-50/50">
                      <span className="font-medium text-slate-500">{key}</span>
                      <span className="font-semibold text-slate-900">{val}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 p-2.5 bg-white">
                    <span className="font-medium text-slate-500">Dispatch Availability</span>
                    <span className="font-mono text-emerald-700 font-bold">In Stock • Ready for Same-Day Dispatch</span>
                  </div>
                </div>
              )}

              {activeTab === 'REVIEWS' && (
                <div className="space-y-4">
                  {/* Reviews List */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {(product.reviews || [
                      {
                        id: 'rev-01',
                        author: 'Dr. Arjun Mehta',
                        rating: 5,
                        date: '2 days ago',
                        title: 'Outstanding build quality and thermal management',
                        comment: 'Installed this unit in our robotics research laboratory. Seamless integration and exceptional delivery speed from Bengaluru central hub.',
                        verifiedPurchase: true,
                        helpfulCount: 14,
                      },
                      {
                        id: 'rev-02',
                        author: 'Siddharth Rao',
                        rating: 5,
                        date: '1 week ago',
                        title: 'Worth every rupee for high-precision workflows',
                        comment: 'Optical clarity and low latency performance is remarkable. Packaging was pristine with tamper-evident seal intact.',
                        verifiedPurchase: true,
                        helpfulCount: 8,
                      },
                    ]).map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900">{rev.author}</div>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="font-bold text-[11px] text-slate-800 ml-1">{rev.title}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{rev.comment}</p>
                        {rev.verifiedPurchase && (
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Hardware Purchase</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="p-3 bg-slate-100 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900">Write a Customer Review</div>
                    {reviewSubmitted && (
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded text-xs">
                        Thank you! Your review has been recorded.
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        className="p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      >
                        <option value={5}>5 Stars (Exceptional)</option>
                        <option value={4}>4 Stars (Very Good)</option>
                        <option value={3}>3 Stars (Average)</option>
                        <option value={2}>2 Stars (Below Expectation)</option>
                        <option value={1}>1 Star (Poor)</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Headline / Review Title"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                    <textarea
                      placeholder="Share your practical experience with this hardware..."
                      rows={2}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'QA' && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {(product.qaList || [
                      {
                        id: 'qa-01',
                        question: 'Is this unit compatible with Ubuntu 24.04 LTS and CUDA 12.4?',
                        askedBy: 'Robotics Team',
                        date: '3 days ago',
                        answer: 'Yes, full driver support and pre-tested CUDA binaries are certified for this SKU.',
                        answeredBy: 'WareWise Lead Engineer',
                        isAiVerified: true,
                      },
                      {
                        id: 'qa-02',
                        question: 'Does the package include high-speed interconnect cables?',
                        askedBy: 'Priya K.',
                        date: '1 week ago',
                        answer: 'Yes, 2x shielded high-bandwidth PCIe/Thunderbolt cables are included in the box.',
                        answeredBy: 'WareWise QA Team',
                        isAiVerified: true,
                      },
                    ]).map((qa) => (
                      <div key={qa.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <div className="font-semibold text-slate-900 flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">Q:</span>
                          <span>{qa.question}</span>
                        </div>
                        <div className="text-slate-700 text-[11px] flex items-start gap-1.5 pl-3 border-l-2 border-emerald-500">
                          <div>
                            <span className="font-bold text-emerald-800">A: </span>
                            {qa.answer}
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Answered by {qa.answeredBy} • {qa.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={handleQaSubmit} className="p-3 bg-slate-100 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900">Have a technical question about this product?</div>
                    {qaSubmitted && (
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded text-xs">
                        Question submitted! Our hardware specialists will respond promptly.
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Ask about specs, compatibility, power draw..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs cursor-pointer"
                    >
                      Post Question
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Buy Box (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-slate-50 rounded-2xl border border-slate-300 p-5 space-y-4 sticky top-16 shadow-sm">
              {/* Price */}
              <div>
                <span className="text-xs text-slate-500">Total Price (GST Included)</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    MRP: <span className="line-through">₹{product.originalPrice.toLocaleString()}</span>{' '}
                    <span className="text-red-600 font-bold">({discountPercent}% off)</span>
                  </div>
                )}
              </div>

              {/* Delivery Timeline */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>In Stock • Ready for Allocation</span>
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  FREE Air Express Delivery available to your address. Order within{' '}
                  <span className="font-bold text-amber-700">3 hrs 42 mins</span> for next-day dispatch.
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Max 20 units per enterprise order
                  </span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, quantity);
                  }}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now (Direct Checkout)</span>
                </button>
              </div>

              {/* Security & Support Guarantee */}
              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Secure 256-Bit Encrypted Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Priority Air Dispatch with Live Telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
