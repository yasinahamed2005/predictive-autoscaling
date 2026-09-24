import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';
const AuthContext = createContext(null);

export const AuthProvider = ({ children, onToast }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Pending intent for guest actions (CHECKOUT, BUY_NOW, WISHLIST)
  const [pendingIntent, setPendingIntentState] = useState(() => {
    try {
      const saved = localStorage.getItem('dukaan_pending_intent');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setPendingIntent = useCallback((intent) => {
    setPendingIntentState(intent);
    if (intent) {
      localStorage.setItem('dukaan_pending_intent', JSON.stringify(intent));
    } else {
      localStorage.removeItem('dukaan_pending_intent');
    }
  }, []);

  const clearPendingIntent = useCallback(() => {
    setPendingIntentState(null);
    localStorage.removeItem('dukaan_pending_intent');
  }, []);

  const persistUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      const users = JSON.parse(localStorage.getItem('dukaan_users') || '[]');
      const updatedUsers = users.map((u) => (u.email === user.email ? user : u));
      if (!users.some((u) => u.email === user.email)) {
        updatedUsers.push(user);
      }
      localStorage.setItem('dukaan_users', JSON.stringify(updatedUsers));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  const login = (user, token) => {
    persistUser(user);
    if (token) {
      localStorage.setItem('dukaan_access_token', token);
    }
    onToast?.(`Welcome back, ${user.name}!`);
  };

  const signup = async (userData) => {
    // Ensure role is ALWAYS customer for public registration
    const payload = { ...userData, role: 'customer' };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const createdUser = json.data?.user || payload;
        const accessToken = json.data?.accessToken;
        login(createdUser, accessToken);
        return { success: true, user: createdUser };
      } else {
        const errJson = await res.json();
        return { success: false, message: errJson.message || 'Registration failed' };
      }
    } catch {
      // Standalone dev fallback when API is offline
      const users = JSON.parse(localStorage.getItem('dukaan_users') || '[]');
      if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
        return { success: false, message: 'An account with this email already exists' };
      }
      const newCustomer = {
        id: `cust_${Date.now()}`,
        _id: `cust_${Date.now()}`,
        ...payload,
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      users.push(newCustomer);
      localStorage.setItem('dukaan_users', JSON.stringify(users));
      login(newCustomer);
      return { success: true, user: newCustomer };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }

    setCurrentUser(null);
    clearPendingIntent();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('dukaan_access_token');
    localStorage.removeItem('dukaan_admin_orders');
    onToast?.('Logged out successfully');
  };

  // Address management methods
  const addAddress = (address) => {
    if (!currentUser) return;
    const newAddr = {
      _id: `addr_${Date.now()}`,
      id: `addr_${Date.now()}`,
      isDefault: (currentUser.addresses || []).length === 0,
      ...address,
    };
    const updatedAddresses = [...(currentUser.addresses || []), newAddr];
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    persistUser(updatedUser);
    onToast?.('Address added successfully');
  };

  const updateAddress = (addressId, addressData) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).map((a) =>
      (a._id || a.id) === addressId ? { ...a, ...addressData } : a
    );
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    persistUser(updatedUser);
    onToast?.('Address updated');
  };

  const deleteAddress = (addressId) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).filter(
      (a) => (a._id || a.id) !== addressId
    );
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    persistUser(updatedUser);
    onToast?.('Address deleted');
  };

  const setDefaultAddress = (addressId) => {
    if (!currentUser) return;
    const updatedAddresses = (currentUser.addresses || []).map((a) => ({
      ...a,
      isDefault: (a._id || a.id) === addressId,
    }));
    const updatedUser = { ...currentUser, addresses: updatedAddresses };
    persistUser(updatedUser);
    onToast?.('Default address updated');
  };

  const addActivity = (activity) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, activities: [activity, ...(currentUser.activities || [])] };
    persistUser(updatedUser);
  };

  const updateOrderStatus = (activityId, status, action) => {
    if (!currentUser) return;
    const updatedActivities = (currentUser.activities || []).map((a) =>
      a.id === activityId ? { ...a, status, action } : a
    );
    persistUser({ ...currentUser, activities: updatedActivities });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        pendingIntent,
        setPendingIntent,
        clearPendingIntent,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        addActivity,
        updateOrderStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
