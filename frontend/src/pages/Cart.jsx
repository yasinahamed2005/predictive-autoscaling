import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../components/ui/PriceTag';
import CheckoutModal from '../components/CheckoutModal';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal } = useCart();
  const { currentUser, addActivity } = useAuth();
  const showToast = useToast();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const shipping = cartSubtotal > 499 || cartSubtotal === 0 ? 0 : 49;
  const total = cartSubtotal + shipping;

  const handleCheckout = () => {
    if (currentUser) {
      addActivity({
        id: Date.now(), action: 'Placed an order', date: new Date().toLocaleDateString('en-IN'),
        status: 'Processing', items: [...cartItems], total,
      });
    }
    clearCart();
    showToast('Order placed successfully!');
  };

  return (
    <>
      <Helmet title="My Cart — Dukaan" />
      <div className="container-page py-8">
        <h1 className="text-2xl font-display font-bold text-ink dark:text-paper mb-6">My Cart</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 text-ink/50 dark:text-paper/50">
            <ShoppingBag size={40} className="mb-3 opacity-50" />
            <p className="mb-4">Your cart is empty.</p>
            <Link to="/products" className="text-brand-500 font-semibold">Start shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="card-surface flex gap-4 p-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-medium text-ink dark:text-paper line-clamp-1">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="text-rose-500 shrink-0"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-mono font-bold text-ink dark:text-paper">{formatINR(item.price * (item.quantity || 1))}</span>
                      <div className="flex items-center gap-3 bg-ink/[0.04] dark:bg-paper/10 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1} aria-label="Decrease quantity" className="p-1 disabled:opacity-30"><Minus size={14} /></button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity" className="p-1"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-surface p-5 h-fit sticky top-24">
              <h2 className="font-display font-bold text-ink dark:text-paper mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink/60 dark:text-paper/60"><span>Subtotal</span><span className="font-mono">{formatINR(cartSubtotal)}</span></div>
                <div className="flex justify-between text-ink/60 dark:text-paper/60"><span>Delivery</span><span className="font-mono">{shipping === 0 ? 'FREE' : formatINR(shipping)}</span></div>
                <div className="border-t border-ink/10 dark:border-paper/10 pt-2 flex justify-between font-bold text-ink dark:text-paper"><span>Total</span><span className="font-mono">{formatINR(total)}</span></div>
              </div>
              <button onClick={() => setCheckoutOpen(true)} className="w-full mt-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full">
                Proceed to checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} total={total} onCheckout={handleCheckout} />
    </>
  );
};

export default Cart;
