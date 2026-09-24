import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';
import CountdownTimer from './CountdownTimer';
import { products as fallbackProducts } from '../../data/products';

const API_BASE = 'http://localhost:5000/api/v1';

const BestDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveDeals = async () => {
    try {
      const res = await fetch(`${API_BASE}/deals/active`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setDeals(json.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Backend API offline or unreachable, fallback gracefully
    }

    // Check localStorage for admin created/updated deals first
    try {
      const savedAdminDeals = localStorage.getItem('dukaan_admin_deals');
      if (savedAdminDeals) {
        const parsed = JSON.parse(savedAdminDeals);
        const activeAdminDeals = parsed.filter((d) => d.isActive !== false);

        if (activeAdminDeals.length > 0) {
          const resolvedDeals = activeAdminDeals.map((deal) => {
            // Resolve products if stored as ID strings
            const resolvedProducts = (deal.products || [])
              .map((p) => {
                if (typeof p === 'object' && p !== null) return p;
                return fallbackProducts.find((fp) => String(fp.id) === String(p) || String(fp._id) === String(p));
              })
              .filter(Boolean);

            return {
              ...deal,
              products: resolvedProducts.length > 0 ? resolvedProducts : fallbackProducts.slice(0, 4),
            };
          });

          setDeals(resolvedDeals);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore storage read errors
    }

    // Fallback deal structure if backend deals aren't seeded or reachable
    const dealItems = fallbackProducts.filter((p) => p.tags?.includes('deal') || p.tags?.includes('flashSale'));
    const nextWeek = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
    setDeals([
      {
        _id: 'fallback-deal-1',
        title: 'Deals of the Day',
        description: 'Exclusive limited time discounts on customer top-rated items!',
        discountPercentage: 50,
        endDate: nextWeek,
        products: dealItems,
        isActive: true,
      },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveDeals();

    // Listen for storage updates so admin deal updates reflect immediately
    const handleStorageChange = (e) => {
      if (e.key === 'dukaan_admin_deals') {
        fetchActiveDeals();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading || deals.length === 0) return null;

  return (
    <section className="container-page py-8">
      {deals.map((deal) => {
        // Normalize products array (whether populated objects or frontend products)
        const dealProducts = (deal.products || []).filter(Boolean);
        if (dealProducts.length === 0) return null;

        return (
          <div
            key={deal._id || deal.title}
            className="mb-8 card-surface rounded-2xl p-4 sm:p-6 border border-saffron-500/30 bg-gradient-to-br from-saffron-500/5 via-transparent to-brand-500/5 relative overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-ink/10 dark:border-paper/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-saffron-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={12} /> {deal.discountPercentage ? `UP TO ${deal.discountPercentage}% OFF` : 'LIMITED TIME'}
                  </span>
                  <span className="text-xs font-semibold text-ink/60 dark:text-paper/60 uppercase tracking-wide">
                    Best Deals
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink dark:text-paper">
                  {deal.title}
                </h2>
                {deal.description && (
                  <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 mt-0.5">
                    {deal.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-paper dark:bg-ink p-2 rounded-xl border border-ink/10 dark:border-paper/10">
                  <span className="text-xs font-semibold text-ink/70 dark:text-paper/70">
                    DEAL ENDS IN:
                  </span>
                  <CountdownTimer
                    endDate={deal.endDate}
                    onExpire={() => fetchActiveDeals()}
                  />
                </div>
                <Link
                  to="/products"
                  className="text-xs font-bold text-brand-500 hover:text-brand-600 inline-flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Product Rail / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {dealProducts.slice(0, 6).map((product, idx) => (
                <ProductCard key={product._id || product.id || idx} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default BestDeals;
