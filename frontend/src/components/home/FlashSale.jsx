import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';
import CountdownTimer from './CountdownTimer';
import { getByTag } from '../../data/products';

const FlashSale = () => {
  const items = getByTag('flashSale');
  if (items.length === 0) return null;

  return (
    <section className="bg-saffron-500 py-6 sm:py-8 overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 22px)' }}
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Zap className="text-white fill-white" size={22} />
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-xs font-semibold hidden sm:inline">Ends in</span>
            <CountdownTimer hoursFromNow={5} />
            <Link to="/products" className="text-white text-xs font-bold underline underline-offset-2">View all</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {items.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
