import React from 'react';

export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const PriceTag = ({ price, mrp, size = 'md', className = '' }) => {
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };
  return (
    <div className={`flex items-baseline gap-2 flex-wrap font-mono ${className}`}>
      <span className={`font-bold text-ink dark:text-paper ${sizes[size]}`}>{formatINR(price)}</span>
      {mrp && mrp > price && (
        <>
          <span className="text-ink/40 dark:text-paper/40 line-through text-xs">{formatINR(mrp)}</span>
          <span className="text-leaf-600 dark:text-leaf-500 text-xs font-semibold">{discount}% off</span>
        </>
      )}
    </div>
  );
};

export default PriceTag;
