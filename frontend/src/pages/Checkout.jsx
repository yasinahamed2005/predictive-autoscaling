import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Plus, CheckCircle2, CreditCard, Truck, ArrowLeft, Tag, ShoppingBag, Check } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../components/ui/PriceTag';
import AddressBook from '../components/profile/AddressBook';

const CheckoutContent = () => {
  const { currentUser, addActivity, addAddress } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const showToast = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const addresses = currentUser?.addresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id || defaultAddr.id);
    }
  }, [defaultAddr]);

  const selectedAddr = addresses.find((a) => (a._id || a.id) === selectedAddressId) || defaultAddr;

  // Order Calculations
  const mrpTotal = cartItems.reduce((sum, item) => sum + (item.mrp || item.price * 1.3) * (item.quantity || 1), 0);
  const mrpDiscount = Math.max(0, mrpTotal - cartSubtotal);
  const deliveryFee = cartSubtotal >= 499 || cartItems.length === 0 ? 0 : 40;
  const tax = Math.round(cartSubtotal * 0.05);
  const finalTotal = Math.max(0, cartSubtotal + deliveryFee + tax - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'DUKAAN10' || couponCode.toUpperCase() === 'WELCOME100') {
      const disc = Math.round(cartSubtotal * 0.1);
      setDiscountAmount(disc);
      setCouponApplied(true);
      showToast(`Coupon ${couponCode.toUpperCase()} applied! Saved ${formatINR(disc)}`);
    } else {
      showToast('Invalid coupon code. Try DUKAAN10');
    }
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    addAddress(formData);
    setShowAddressForm(false);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!selectedAddr && !formData.line1) {
      showToast('Please select or add a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty');
      navigate('/products');
      return;
    }

    const orderId = `DKN-${Math.floor(100000 + Math.random() * 900000)}`;

    const deliveryAddressString = selectedAddr
      ? `${selectedAddr.fullName}, ${selectedAddr.line1} ${selectedAddr.line2 ? `, ${selectedAddr.line2}` : ''}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode} (Mobile: ${selectedAddr.phone})`
      : `${formData.fullName}, ${formData.line1}, ${formData.city}, ${formData.state} - ${formData.pincode} (Mobile: ${formData.phone})`;

    const newOrder = {
      id: orderId,
      action: 'Order Placed',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      total: finalTotal,
      address: deliveryAddressString,
      paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery',
      items: cartItems.map((item) => `${item.name} × ${item.quantity || 1}`),
    };

    if (addActivity) {
      addActivity(newOrder);
    }

    // Save to local admin orders cache for fulfillment tracking
    const adminOrders = JSON.parse(localStorage.getItem('dukaan_admin_orders') || '[]');
    adminOrders.unshift({
      id: orderId,
      customerName: currentUser?.name || 'Customer',
      customerEmail: currentUser?.email || '',
      date: new Date().toLocaleDateString(),
      total: finalTotal,
      paymentStatus: paymentMethod === 'razorpay' ? 'PAID' : 'PENDING (COD)',
      paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
      orderStatus: 'Confirmed',
      address: deliveryAddressString,
      items: cartItems.map((i) => `${i.name} (${i.quantity || 1})`),
    });
    localStorage.setItem('dukaan_admin_orders', JSON.stringify(adminOrders));

    clearCart();
    navigate(`/order-success/${orderId}`);
  };

  return (
    <>
      <Helmet title="Checkout — Dukaan" />
      <div className="container-page py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/cart" className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/70 dark:text-paper/70">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper flex items-center gap-2">
                <ShieldCheck className="text-brand-500" size={24} /> Secure Checkout
              </h1>
              <p className="text-xs text-ink/60 dark:text-paper/60">
                Complete your order details and delivery preference
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck size={14} /> 256-Bit SSL Encrypted
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="card-surface p-12 text-center rounded-2xl border border-ink/10 dark:border-paper/10">
            <ShoppingBag size={48} className="mx-auto mb-3 text-brand-500 opacity-40" />
            <h3 className="text-lg font-bold text-ink dark:text-paper mb-1">Your cart is empty</h3>
            <p className="text-xs text-ink/60 dark:text-paper/60 mb-4">Please add items to your cart before proceeding to checkout.</p>
            <Link to="/products" className="bg-brand-500 text-white font-bold text-xs px-6 py-3 rounded-full inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Delivery Address Section */}
              <div className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                    <MapPin className="text-brand-500" size={18} /> 1. Delivery Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm((s) => !s)}
                    className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> {showAddressForm ? 'Select Saved Address' : 'Add New Address'}
                  </button>
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleAddAddressSubmit} className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      {['Home', 'Work', 'Other'].map((lbl) => (
                        <button
                          type="button"
                          key={lbl}
                          onClick={() => setFormData({ ...formData, label: lbl })}
                          className={`flex-1 py-1 rounded-xl text-xs font-bold border transition-colors ${
                            formData.label === lbl
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'border-ink/15 dark:border-paper/20 text-ink dark:text-paper'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                      />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Mobile Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none font-mono"
                      />
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Flat, House No., Building"
                      value={formData.line1}
                      onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                      />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2 rounded-full transition-colors"
                    >
                      Save & Use Address
                    </button>
                  </form>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6 text-ink/50 dark:text-paper/50">
                    <p className="text-xs mb-3">No saved addresses found. Please add a delivery address to proceed.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-brand-500 text-white font-bold text-xs px-4 py-2 rounded-full"
                    >
                      + Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {addresses.map((a) => {
                      const aid = a._id || a.id;
                      const isSelected = selectedAddressId === aid;
                      return (
                        <div
                          key={aid}
                          onClick={() => setSelectedAddressId(aid)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'border-brand-500 bg-brand-500/[0.03] shadow-sm'
                              : 'border-ink/10 dark:border-paper/10 hover:border-ink/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                            isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink/30'
                          }`}>
                            {isSelected && <Check size={10} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-ink dark:text-paper">{a.fullName}</span>
                              <span className="text-[10px] font-bold bg-ink/5 dark:bg-paper/10 px-2 py-0.5 rounded-full">
                                {a.label}
                              </span>
                              {a.isDefault && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-ink/70 dark:text-paper/70 mt-1">
                              {a.line1} {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - <strong>{a.pincode}</strong>
                            </p>
                            <p className="text-[11px] text-ink/50 dark:text-paper/50 mt-0.5">Mobile: {a.phone}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Payment Options Section */}
              <div className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10">
                <h3 className="text-base font-display font-bold text-ink dark:text-paper mb-4 flex items-center gap-2">
                  <CreditCard className="text-brand-500" size={18} /> 2. Payment Options
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col gap-2 transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-brand-500 bg-brand-500/[0.04] shadow-sm'
                        : 'border-ink/10 dark:border-paper/10 hover:bg-ink/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ink dark:text-paper flex items-center gap-1.5">
                        <CreditCard size={16} className="text-brand-500" /> Razorpay Secure
                      </span>
                      <input
                        type="radio"
                        name="payOpt"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="accent-brand-500"
                      />
                    </div>
                    <p className="text-[11px] text-ink/60 dark:text-paper/60 leading-relaxed">
                      UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, Net Banking & Wallets.
                    </p>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col gap-2 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-brand-500 bg-brand-500/[0.04] shadow-sm'
                        : 'border-ink/10 dark:border-paper/10 hover:bg-ink/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ink dark:text-paper flex items-center gap-1.5">
                        <Truck size={16} className="text-emerald-500" /> Cash on Delivery
                      </span>
                      <input
                        type="radio"
                        name="payOpt"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-brand-500"
                      />
                    </div>
                    <p className="text-[11px] text-ink/60 dark:text-paper/60 leading-relaxed">
                      Pay cash or UPI upon delivery at your doorstep.
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-6">
              <div className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10 sticky top-24">
                <h3 className="text-base font-display font-bold text-ink dark:text-paper mb-4 pb-3 border-b border-ink/10 dark:border-paper/10">
                  Order Summary ({cartItems.length} items)
                </h3>

                {/* Items preview list */}
                <div className="max-h-48 overflow-y-auto space-y-2.5 mb-4 pr-1 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                        <span className="truncate font-semibold text-ink dark:text-paper">{item.name}</span>
                        <span className="text-ink/40 font-mono">×{item.quantity || 1}</span>
                      </div>
                      <span className="font-mono font-bold text-ink dark:text-paper">
                        {formatINR(item.price * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-4">
                  <div className="flex-1 flex items-center gap-1.5 border border-ink/15 dark:border-paper/20 rounded-xl px-2.5 py-1.5 bg-ink/[0.02]">
                    <Tag size={14} className="text-brand-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. DUKAAN10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-transparent text-xs outline-none uppercase font-mono text-ink dark:text-paper"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3 border-t border-ink/10 dark:border-paper/10 text-xs">
                  <div className="flex justify-between text-ink/60 dark:text-paper/60">
                    <span>Items Total (MRP)</span>
                    <span className="font-mono">{formatINR(mrpTotal)}</span>
                  </div>
                  {mrpDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Product Discount</span>
                      <span className="font-mono">-{formatINR(mrpDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink/60 dark:text-paper/60">
                    <span>Delivery Charge</span>
                    <span className="font-mono">
                      {deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatINR(deliveryFee)}
                    </span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span className="font-mono">-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink/60 dark:text-paper/60">
                    <span>Estimated GST Tax (5%)</span>
                    <span className="font-mono">{formatINR(tax)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-ink dark:text-paper pt-3 border-t border-ink/10 dark:border-paper/10">
                    <span>Total Payable</span>
                    <span className="text-xl font-mono text-brand-500">{formatINR(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full mt-5 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-colors text-sm shadow-md active:scale-[0.98]"
                >
                  {paymentMethod === 'razorpay' ? 'Proceed to Pay with Razorpay' : 'Place Cash on Delivery Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Checkout = () => (
  <ProtectedRoute>
    <CheckoutContent />
  </ProtectedRoute>
);

export default Checkout;
