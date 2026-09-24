import React, { createContext, useContext, useState } from 'react';

const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children, onToast }) => {
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const toggleCompare = (product) => {
    const productId = product._id || product.id;
    const exists = compareItems.some((item) => (item._id || item.id) === productId);

    if (exists) {
      setCompareItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
      onToast?.(`Removed ${product.name} from comparison`);
    } else {
      if (compareItems.length >= 4) {
        onToast?.('You can compare a maximum of 4 products at a time');
        return;
      }
      setCompareItems((prev) => [...prev, product]);
      onToast?.(`Added ${product.name} to comparison`);
    }
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => (item._id || item.id) === productId);
  };

  const clearCompare = () => {
    setCompareItems([]);
    setIsCompareOpen(false);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareItems,
        toggleCompare,
        isInCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used within ComparisonProvider');
  return ctx;
};
