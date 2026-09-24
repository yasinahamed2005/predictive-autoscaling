import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children, onToast }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?._id || currentUser?.id || currentUser?.email || 'guest';
  const storageKey = `dukaan_cart_${userId}`;

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // When user changes, load their cart or merge guest cart
  useEffect(() => {
    try {
      const userSaved = localStorage.getItem(`dukaan_cart_${userId}`);
      let userCart = userSaved ? JSON.parse(userSaved) : [];

      if (userId !== 'guest') {
        const guestSaved = localStorage.getItem('dukaan_cart_guest');
        if (guestSaved) {
          const guestCart = JSON.parse(guestSaved);
          // Merge guest cart items into user cart without duplicates
          guestCart.forEach((guestItem) => {
            const gid = String(guestItem._id || guestItem.id);
            const existingIdx = userCart.findIndex((u) => String(u._id || u.id) === gid);
            if (existingIdx >= 0) {
              userCart[existingIdx].quantity += guestItem.quantity || 1;
            } else {
              userCart.push(guestItem);
            }
          });
          localStorage.removeItem('dukaan_cart_guest');
        }
      }
      setCartItems(userCart);
    } catch {
      setCartItems([]);
    }
  }, [userId]);

  // Save cart state whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  const addToCart = useCallback((product, options = {}) => {
    setCartItems((prev) => {
      const pid = String(product._id || product.id);
      const existing = prev.find((item) => String(item._id || item.id) === pid);
      if (existing) {
        return prev.map((item) =>
          String(item._id || item.id) === pid
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (!options.silent) {
      setIsCartOpen(true);
      onToast?.(`Added ${product.name} to cart`);
    }
  }, [onToast]);

  const updateQuantity = useCallback((id, delta) => {
    const targetId = String(id);
    setCartItems((prev) =>
      prev.map((item) => {
        if (String(item._id || item.id) === targetId) {
          const newQuantity = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    const targetId = String(id);
    setCartItems((prev) => prev.filter((item) => String(item._id || item.id) !== targetId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const resetCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resetCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
