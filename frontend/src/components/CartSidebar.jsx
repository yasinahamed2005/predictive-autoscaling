import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from './ui/PriceTag';
import AuthModal from './AuthModal';

const CartSidebar = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartSubtotal } = useCart();
  const { currentUser, setPendingIntent } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (currentUser) {
      setIsCartOpen(false);
      navigate('/checkout');
    } else {
      setPendingIntent({ type: 'CHECKOUT' });
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-ink-soft z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-ink/10 dark:border-paper/10">
                <h2 className="text-xl font-display font-extrabold text-ink dark:text-paper flex items-center gap-2">
                  <ShoppingBag className="text-brand-500" size={22} /> Your Cart ({cartItems.length})
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                  className="p-2 hover:bg-ink/5 dark:hover:bg-paper/10 rounded-full text-ink/70 dark:text-paper/70"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-ink/40 dark:text-paper/40 text-center py-12">
                    <ShoppingBag size={48} className="mb-3 opacity-40 text-brand-500" />
                    <p className="font-bold text-base text-ink dark:text-paper mb-1">Your cart is empty</p>
                    <p className="text-xs mb-4">Discover great products and add items to your cart.</p>
                    <Link
                      to="/products"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const itemId = item._id || item.id;
                    return (
                      <motion.div
                        key={itemId}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex gap-3 bg-ink/[0.03] dark:bg-paper/5 p-3 rounded-2xl border border-ink/10 dark:border-paper/10"
                      >
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-ink/10" />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-ink dark:text-paper line-clamp-1">{item.name}</h3>
                          <div className="flex justify-between items-end mt-1">
                            <span className="text-brand-500 font-mono font-bold text-sm">{formatINR(item.price)}</span>
                            <div className="flex items-center gap-2 bg-white dark:bg-ink rounded-lg p-1 border border-ink/10 dark:border-paper/10">
                              <button
                                onClick={() => updateQuantity(itemId, -1)}
                                disabled={(item.quantity || 1) <= 1}
                                aria-label="Decrease quantity"
                                className="p-1 hover:bg-ink/5 dark:hover:bg-paper/10 rounded disabled:opacity-30"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity || 1}</span>
                              <button
                                onClick={() => updateQuantity(itemId, 1)}
                                aria-label="Increase quantity"
                                className="p-1 hover:bg-ink/5 dark:hover:bg-paper/10 rounded"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(itemId)}
                              aria-label={`Remove ${item.name}`}
                              className="text-rose-500 hover:text-rose-600 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-ink/10 dark:border-paper/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-ink/60 dark:text-paper/60 text-xs font-semibold">Subtotal</span>
                  <span className="text-2xl font-bold font-mono text-brand-500">{formatINR(cartSubtotal)}</span>
                </div>
                <button
                  onClick={handleCheckoutClick}
                  disabled={cartItems.length === 0}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <span>Checkout Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please login to continue checkout."
      />
    </>
  );
};

export default CartSidebar;
