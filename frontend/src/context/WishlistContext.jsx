import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children, onToast }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?._id || currentUser?.id || currentUser?.email || null;

  const [wishlist, setWishlist] = useState(() => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`dukaan_wishlist_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // When current user changes (login/logout), load/reset user wishlist
  useEffect(() => {
    if (!userId) {
      setWishlist([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`dukaan_wishlist_${userId}`);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, [userId]);

  // Persist user wishlist whenever it updates
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`dukaan_wishlist_${userId}`, JSON.stringify(wishlist));
    }
  }, [wishlist, userId]);

  const isWishlisted = useCallback(
    (id) => {
      const targetId = String(id);
      return wishlist.some((p) => String(p._id || p.id) === targetId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      const targetId = String(product._id || product.id);
      setWishlist((prev) => {
        const exists = prev.some((p) => String(p._id || p.id) === targetId);
        if (exists) {
          onToast?.(`Removed ${product.name} from wishlist`);
          return prev.filter((p) => String(p._id || p.id) !== targetId);
        }
        onToast?.(`Added ${product.name} to wishlist`);
        return [...prev, product];
      });
    },
    [onToast]
  );

  const resetWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        toggleWishlist,
        resetWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
