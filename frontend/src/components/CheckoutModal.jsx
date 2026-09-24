import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MapPin, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import { formatINR } from './ui/PriceTag';
import { useAuth } from '../context/AuthContext';

const CheckoutModal = ({ isOpen, onClose, total, onCheckout }) => {
  const { currentUser, addActivity } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const addresses = currentUser?.addresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    pincode: '',
  });

  useEffect(() => {
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id || defaultAddr.id);
      setFormData({
        fullName: defaultAddr.fullName || currentUser?.name || '',
        phone: defaultAddr.phone || currentUser?.phone || '',
        addressLine: `${defaultAddr.line1}, ${defaultAddr.city}, ${defaultAddr.state}`,
        pincode: defaultAddr.pincode || '',
      });
    } else if (currentUser) {
      setFormData({
        fullName: currentUser.name || '',
        phone: currentUser.phone || '',
        addressLine: '',
        pincode: '',
      });
    }
  }, [currentUser, defaultAddr, isOpen]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id || addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: `${addr.line1}, ${addr.city}, ${addr.state}`,
      pincode: addr.pincode,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create Order Record Activity
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      action: 'Order Placed',
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Processing',
      total: total,
      address: `${formData.fullName}, ${formData.addressLine} - ${formData.pincode} (Ph: ${formData.phone})`,
      paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery',
      items: ['Purchased items snapshot'],
    };

    if (addActivity) {
      addActivity(newOrder);
    }

    setIsSuccess(true);
    setTimeout(() => {
      onCheckout();
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white dark:bg-ink-soft rounded-2xl z-[70] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="text-emerald-500 mb-3" size={56} />
                <h3 className="text-xl font-display font-extrabold text-ink dark:text-paper">
                  Order Placed Successfully!
                </h3>
                <p className="text-ink/60 dark:text-paper/60 text-xs mt-1 max-w-xs">
                  Thank you for shopping with Dukaan. We've sent an order confirmation to your email.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-ink/10 dark:border-paper/10">
                  <h2 className="text-lg font-display font-bold text-ink dark:text-paper flex items-center gap-2">
                    <ShieldCheck className="text-brand-500" size={20} /> Secure Checkout
                  </h2>
                  <button onClick={onClose} aria-label="Close checkout" className="p-1.5 hover:bg-ink/5 dark:hover:bg-paper/10 rounded-full">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Saved Addresses Section */}
                  {addresses.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-ink/40 dark:text-paper/40 mb-1.5">
                        Select Saved Delivery Address
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {addresses.map((a) => {
                          const aid = a._id || a.id;
                          const selected = selectedAddressId === aid;
                          return (
                            <div
                              key={aid}
                              onClick={() => handleSelectAddress(a)}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                                selected
                                  ? 'border-brand-500 bg-brand-500/10 font-semibold'
                                  : 'border-ink/15 dark:border-paper/20 hover:bg-ink/5'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-ink dark:text-paper">{a.label}: {a.fullName}</span>
                                {a.isDefault && (
                                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-ink/70 dark:text-paper/70 truncate mt-0.5">
                                {a.line1}, {a.city} - {a.pincode}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="fullName" className="text-xs font-semibold text-ink/70 dark:text-paper/70">Full Name</label>
                      <input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-xs font-semibold text-ink/70 dark:text-paper/70">Mobile</label>
                      <input
                        id="phone"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="addressLine" className="text-xs font-semibold text-ink/70 dark:text-paper/70">Delivery Address</label>
                    <input
                      id="addressLine"
                      required
                      placeholder="House No, Street, Area, City, State"
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      className="w-full mt-1 rounded-xl border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincode" className="text-xs font-semibold text-ink/70 dark:text-paper/70">Pincode</label>
                    <input
                      id="pincode"
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full mt-1 rounded-xl border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1.5">Payment Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`p-3 rounded-xl border text-xs font-bold cursor-pointer flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === 'razorpay'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                            : 'border-ink/15 dark:border-paper/20 text-ink/70 dark:text-paper/70'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="razorpay"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="sr-only"
                        />
                        <CreditCard size={18} /> Razorpay (Cards / UPI)
                      </label>

                      <label
                        className={`p-3 rounded-xl border text-xs font-bold cursor-pointer flex flex-col items-center gap-1 transition-colors ${
                          paymentMethod === 'cod'
                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                            : 'border-ink/15 dark:border-paper/20 text-ink/70 dark:text-paper/70'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="sr-only"
                        />
                        <Truck size={18} /> Cash on Delivery
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-ink/10 dark:border-paper/10">
                    <span className="text-xs text-ink/60 dark:text-paper/60 font-semibold">Total Amount</span>
                    <span className="text-xl font-bold font-mono text-brand-500">{formatINR(total)}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-colors text-sm shadow-md"
                  >
                    {paymentMethod === 'razorpay' ? 'Proceed to Razorpay Payment' : 'Confirm Cash on Delivery Order'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
