import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { CustomerAddress, CheckoutStep } from '../../types';
import {
  X,
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Plus,
  Building2,
  Smartphone,
  QrCode,
  PackageCheck,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const {
    cart,
    cartSubtotal,
    customerAddresses,
    addCustomerAddress,
    selectedAddressId,
    setSelectedAddressId,
    appliedCoupon,
    placeCustomerOrder,
    checkoutStep,
    setCheckoutStep,
    latestPlacedOrder,
    currentUser,
    setActiveCustomerNavTab,
  } = useWarehouse();

  // Shipping Selection
  const [shippingTier, setShippingTier] = useState<'STANDARD' | 'EXPRESS' | 'SAME_DAY'>('EXPRESS');

  // Payment Selection
  const [paymentType, setPaymentType] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('kishore.venkat@okaxis');
  const [cardHolder, setCardHolder] = useState(currentUser.name || 'Kishore Venkat');
  const [cardNumber, setCardNumber] = useState('4532 8921 4432 9901');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // New Address Form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState(currentUser.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(currentUser.phone || '+91 98450 78901');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrState, setNewAddrState] = useState('Karnataka');
  const [newAddrPincode, setNewAddrPincode] = useState('560066');
  const [newAddrType, setNewAddrType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');

  // Form Validation & Processing
  const [processingOrder, setProcessingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeAddress =
    customerAddresses.find((a) => a.id === selectedAddressId) || customerAddresses[0];

  const discountAmount = appliedCoupon
    ? Math.min(
        appliedCoupon.maxDiscount,
        Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100)
      )
    : 0;

  const shippingFee = shippingTier === 'SAME_DAY' ? 799 : shippingTier === 'EXPRESS' ? 0 : 0;
  const taxableSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.18);
  const totalAmount = taxableSubtotal + shippingFee + taxAmount;

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrStreet.trim() || !newAddrPincode.trim()) {
      setErrorMessage('Please fill in all required address fields.');
      return;
    }

    addCustomerAddress({
      name: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      street: newAddrStreet.trim(),
      city: newAddrCity.trim(),
      state: newAddrState.trim(),
      pincode: newAddrPincode.trim(),
      type: newAddrType,
      isDefault: false,
    });

    setShowNewAddressForm(false);
    setErrorMessage(null);
  };

  const handleProceedToPayment = () => {
    if (!activeAddress) {
      setErrorMessage('Please select or add a delivery address to continue.');
      return;
    }
    setErrorMessage(null);
    setCheckoutStep('PAYMENT');
  };

  const handleProceedToReview = () => {
    if (paymentType === 'UPI' && (!upiId.trim() || !upiId.includes('@'))) {
      setErrorMessage('Please enter a valid UPI ID (e.g. name@bank).');
      return;
    }
    if (paymentType === 'CARD') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter valid 3-digit CVV.');
        return;
      }
    }
    setErrorMessage(null);
    setCheckoutStep('REVIEW');
  };

  const handleExecutePlaceOrder = () => {
    if (!activeAddress) return;

    setProcessingOrder(true);
    setErrorMessage(null);

    setTimeout(() => {
      const order = placeCustomerOrder(
        {
          name: activeAddress.name,
          phone: activeAddress.phone,
          street: activeAddress.street,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
          country: 'India',
        },
        shippingTier,
        paymentType === 'UPI'
          ? `UPI (${upiId})`
          : paymentType === 'CARD'
          ? `Credit Card (ending in ${cardNumber.slice(-4)})`
          : paymentType === 'NETBANKING'
          ? `Net Banking (${selectedBank})`
          : 'Cash on Delivery',
        paymentType === 'CARD'
          ? {
              cardNumber,
              expiry: cardExpiry,
              cvv: cardCvv,
              cardHolder,
            }
          : undefined
      );

      setProcessingOrder(false);
      setCheckoutStep('CONFIRMATION');
      if (onOrderPlaced) {
        onOrderPlaced(order.id);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col animate-fadeIn relative">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              W
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 leading-tight">WareWise Secure Checkout</h2>
              <p className="text-xs text-slate-500">Autonomous Order Allocation & Delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator (Hidden on confirmation) */}
        {checkoutStep !== 'CONFIRMATION' && (
          <div className="px-6 py-3 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
              <div
                className={`flex items-center gap-1.5 ${
                  checkoutStep === 'ADDRESS'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  checkoutStep === 'ADDRESS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  1
                </span>
                <span>Address</span>
              </div>

              <div className="h-0.5 w-10 bg-slate-200" />

              <div
                className={`flex items-center gap-1.5 ${
                  checkoutStep === 'SHIPPING'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  checkoutStep === 'SHIPPING' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  2
                </span>
                <span>Shipping</span>
              </div>

              <div className="h-0.5 w-10 bg-slate-200" />

              <div
                className={`flex items-center gap-1.5 ${
                  checkoutStep === 'PAYMENT'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  checkoutStep === 'PAYMENT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  3
                </span>
                <span>Payment</span>
              </div>

              <div className="h-0.5 w-10 bg-slate-200" />

              <div
                className={`flex items-center gap-1.5 ${
                  checkoutStep === 'REVIEW'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  checkoutStep === 'REVIEW' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  4
                </span>
                <span>Review</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Step Content */}
        <div className="p-6 flex-1">
          {/* STEP 1: ADDRESS SELECTION */}
          {checkoutStep === 'ADDRESS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Select Delivery Address</h3>
                  <p className="text-xs text-slate-500">Choose where your order will be delivered</p>
                </div>
                {!showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Address Cards */}
              {!showNewAddressForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {customerAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 relative ${
                        selectedAddressId === addr.id
                          ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{addr.name}</span>
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">
                          {addr.type}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{addr.street}</p>
                      {addr.landmark && (
                        <p className="text-slate-500 text-[11px]">Landmark: {addr.landmark}</p>
                      )}
                      <div className="text-slate-700 font-medium">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono">{addr.phone}</div>

                      {selectedAddressId === addr.id && (
                        <div className="absolute top-3 right-3 text-blue-600">
                          <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* New Address Form */
                <form onSubmit={handleAddNewAddressSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-900 text-sm">Enter New Shipping Address</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        placeholder="e.g. Srivenkata Kishore"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        placeholder="+91 98450 78901"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Street Address / Building / Area</label>
                    <input
                      type="text"
                      required
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      placeholder="e.g. Flat 304, Tower B, Palm Boulevard"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newAddrState}
                        onChange={(e) => setNewAddrState(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={newAddrPincode}
                        onChange={(e) => setNewAddrPincode(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                        placeholder="560066"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Save & Use Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Deliver to: <strong className="text-slate-900">{activeAddress?.city || 'Select Address'}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('SHIPPING')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Shipping Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING SELECTION */}
          {checkoutStep === 'SHIPPING' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Choose Shipping Velocity</h3>
                <p className="text-xs text-slate-500">All shipments depart directly from Central Metro Hub WH-01</p>
              </div>

              <div className="space-y-3">
                {/* Standard */}
                <div
                  onClick={() => setShippingTier('STANDARD')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    shippingTier === 'STANDARD'
                      ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Standard Surface Delivery (2-3 Business Days)</div>
                      <div className="text-[11px] text-slate-500">All-India surface transport network</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">FREE</span>
                  </div>
                </div>

                {/* Express Air */}
                <div
                  onClick={() => setShippingTier('EXPRESS')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    shippingTier === 'EXPRESS'
                      ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Express Air Flight Wave (Next-Day Delivery)</span>
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                          RECOMMENDED
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Priority sortation at BlueDart Air cargo terminal</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">FREE</span>
                    <span className="block text-[10px] text-slate-400 line-through">₹499</span>
                  </div>
                </div>

                {/* Same-Day Priority */}
                <div
                  onClick={() => setShippingTier('SAME_DAY')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    shippingTier === 'SAME_DAY'
                      ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Priority Same-Day Enterprise SLA (Within 8 Hours)</div>
                      <div className="text-[11px] text-slate-500">Direct courier allocation from Metro Hub WH-01 to Bengaluru Urban</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">₹799</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('ADDRESS')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {checkoutStep === 'PAYMENT' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Select Payment Method</h3>
                <p className="text-xs text-slate-500">All transactions are 256-bit encrypted and tokenized</p>
              </div>

              {/* Payment Type Selector */}
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentType('UPI')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentType === 'UPI'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span>UPI Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('CARD')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentType === 'CARD'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('NETBANKING')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentType === 'NETBANKING'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('COD')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentType === 'COD'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span>Pay on Delivery</span>
                </button>
              </div>

              {/* Payment Details Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                {paymentType === 'UPI' && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">
                      Enter UPI Virtual Payment Address (VPA)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-slate-800 text-white font-semibold rounded-lg text-xs"
                      >
                        Verify VPA
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM, and all bank UPI apps.
                    </p>
                  </div>
                )}

                {paymentType === 'CARD' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentType === 'NETBANKING' && (
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentType === 'COD' && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs">
                    Pay by Cash or UPI to the delivery courier upon arrival at your doorstep.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('SHIPPING')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Order Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER REVIEW & CONFIRM */}
          {checkoutStep === 'REVIEW' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Review & Confirm Your Order</h3>
                <p className="text-xs text-slate-500">Verify your items, destination, and billing breakdown</p>
              </div>

              {/* Order Items Preview */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 divide-y divide-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-900 text-xs pb-1">Line Items ({cart.length})</div>
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded border border-slate-200 bg-white p-1 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-slate-500">Qty: {quantity} • SKU: {product.sku}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 shrink-0">
                      ₹{(product.price * quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Destination & Payment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Shipping Destination</span>
                  </div>
                  <div className="text-slate-800 font-semibold">{activeAddress?.name}</div>
                  <div className="text-slate-600">{activeAddress?.street}</div>
                  <div className="text-slate-600">
                    {activeAddress?.city}, {activeAddress?.state} {activeAddress?.pincode}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Payment & Speed</span>
                  </div>
                  <div className="text-slate-800 font-semibold">
                    Method: {paymentType === 'UPI' ? `UPI (${upiId})` : paymentType}
                  </div>
                  <div className="text-slate-600">
                    Speed: {shippingTier === 'SAME_DAY' ? 'Priority Same-Day (8h)' : 'Express Air (24h)'}
                  </div>
                  <div className="text-emerald-700 font-medium">100% Stock Allocation Verified</div>
                </div>
              </div>

              {/* Final Price Summary Box */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span>Coupon Savings ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>GST Taxes (18%)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-sm font-bold text-slate-900">
                  <span>Total Amount Due</span>
                  <span className="text-base text-blue-700">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('PAYMENT')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={processingOrder}
                  onClick={handleExecutePlaceOrder}
                  className="px-8 py-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processingOrder ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Place Order (₹{totalAmount.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ORDER CONFIRMATION / CELEBRATION */}
          {checkoutStep === 'CONFIRMATION' && latestPlacedOrder && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-xl text-slate-900">Thank You! Your Order is Confirmed</h3>
                <p className="text-xs text-slate-500">
                  Order <strong className="text-blue-700 font-mono">{latestPlacedOrder.id}</strong> has been received and scheduled for express dispatch.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-w-lg mx-auto text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Order Reference:</span>
                  <span className="font-bold text-slate-900 font-mono">{latestPlacedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-slate-900">₹{latestPlacedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-medium text-slate-800">{latestPlacedOrder.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fulfillment SLA:</span>
                  <span className="font-semibold text-emerald-700">Dispatches in &lt; 2 Hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-medium text-slate-800 truncate max-w-xs">
                    {latestPlacedOrder.shippingAddress.street}, {latestPlacedOrder.shippingAddress.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveCustomerNavTab('ORDERS');
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Track Live Consignment</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveCustomerNavTab('SHOP');
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
