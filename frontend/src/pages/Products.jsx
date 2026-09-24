import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Filter, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Helmet } from '../components/Helmet';
import { products as allProducts } from '../data/products';
import { categories as categoryList, megaMenu } from '../data/categories';
import { brands as brandList } from '../data/brands';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  const activeSub = searchParams.get('sub') || 'all';
  const activeBrand = searchParams.get('brand') || 'all';
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeRating = searchParams.get('rating') || '0';
  const activeDiscount = searchParams.get('discount') || '0';
  const activeInStock = searchParams.get('inStock') === 'true';
  const sortOption = searchParams.get('sort') || 'featured';

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [searchParams]);

  const updateFilter = (key, value) => {
    if (value === 'all' || value === '' || value === false || value === 0) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      // Category filter
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;

      // Brand filter
      if (activeBrand !== 'all' && p.brand !== activeBrand) return false;

      // Price filter
      if (activeMinPrice && p.price < Number(activeMinPrice)) return false;
      if (activeMaxPrice && p.price > Number(activeMaxPrice)) return false;

      // Rating filter
      if (Number(activeRating) > 0 && (p.rating || 4) < Number(activeRating)) return false;

      // Discount filter
      const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
      if (Number(activeDiscount) > 0 && discount < Number(activeDiscount)) return false;

      // In stock filter
      const stock = p.stock !== undefined ? p.stock : 25;
      if (activeInStock && stock <= 0) return false;

      return true;
    });
  }, [activeCategory, activeBrand, activeMinPrice, activeMaxPrice, activeRating, activeDiscount, activeInStock]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    switch (sortOption) {
      case 'price-low-high':
        return data.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return data.sort((a, b) => b.price - a.price);
      case 'rating':
        return data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount':
        return data.sort((a, b) => {
          const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
      case 'newest':
        return data.sort((a, b) => b.id - a.id);
      default:
        return data;
    }
  }, [filtered, sortOption]);

  const activeCatName = categoryList.find((c) => c.id === activeCategory)?.name || 'All Products';

  const FilterSidebar = () => (
    <div className="space-y-6 text-xs sm:text-sm">
      <div className="flex items-center justify-between pb-3 border-b border-ink/10 dark:border-paper/10">
        <span className="font-display font-extrabold text-ink dark:text-paper flex items-center gap-1.5 text-base">
          <Filter size={16} /> Filters
        </span>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold text-ink dark:text-paper mb-2 uppercase text-[11px] tracking-wider text-ink/50 dark:text-paper/50">
          Category
        </h4>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilter('category', 'all')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeCategory === 'all'
                  ? 'bg-brand-500 text-white font-bold'
                  : 'hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/80 dark:text-paper/80'
              }`}
            >
              All Categories
            </button>
          </li>
          {categoryList.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => updateFilter('category', c.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                  activeCategory === c.id
                    ? 'bg-brand-500 text-white font-bold'
                    : 'hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/80 dark:text-paper/80'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h4 className="font-bold text-ink dark:text-paper mb-2 uppercase text-[11px] tracking-wider text-ink/50 dark:text-paper/50">
          Brand
        </h4>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilter('brand', 'all')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeBrand === 'all'
                  ? 'bg-brand-500 text-white font-bold'
                  : 'hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/80 dark:text-paper/80'
              }`}
            >
              All Brands
            </button>
          </li>
          {brandList.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => updateFilter('brand', b.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                  activeBrand === b.id
                    ? 'bg-brand-500 text-white font-bold'
                    : 'hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/80 dark:text-paper/80'
                }`}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-bold text-ink dark:text-paper mb-2 uppercase text-[11px] tracking-wider text-ink/50 dark:text-paper/50">
          Price Range (₹)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={activeMinPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-lg px-2.5 py-1.5 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-ink/40 dark:text-paper/40">-</span>
          <input
            type="number"
            placeholder="Max"
            value={activeMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-lg px-2.5 py-1.5 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="font-bold text-ink dark:text-paper mb-2 uppercase text-[11px] tracking-wider text-ink/50 dark:text-paper/50">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-ink/5 dark:hover:bg-paper/10 cursor-pointer text-xs"
            >
              <input
                type="radio"
                name="rating"
                checked={Number(activeRating) === stars}
                onChange={() => updateFilter('rating', stars)}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-ink dark:text-paper">{stars}★ & above</span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <h4 className="font-bold text-ink dark:text-paper mb-2 uppercase text-[11px] tracking-wider text-ink/50 dark:text-paper/50">
          Discount
        </h4>
        <div className="space-y-1">
          {[50, 30, 10].map((disc) => (
            <label
              key={disc}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-ink/5 dark:hover:bg-paper/10 cursor-pointer text-xs"
            >
              <input
                type="radio"
                name="discount"
                checked={Number(activeDiscount) === disc}
                onChange={() => updateFilter('discount', disc)}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-ink dark:text-paper">{disc}% or more</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-2 border-t border-ink/10 dark:border-paper/10">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink dark:text-paper">
          <input
            type="checkbox"
            checked={activeInStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
            className="rounded text-brand-500 focus:ring-brand-500"
          />
          Exclude Out of Stock
        </label>
      </div>
    </div>
  );

  return (
    <>
      <Helmet title={`${activeCatName} — Dukaan`} description={`Shop ${activeCatName} at Dukaan — best prices, fast delivery.`} />
      <div className="container-page py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper">{activeCatName}</h1>
            <p className="text-xs text-ink/50 dark:text-paper/50">
              Showing {sorted.length} products
            </p>
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-bold border border-ink/15 dark:border-paper/20 rounded-full px-3.5 py-2 text-ink dark:text-paper"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10 sticky top-24">
            <FilterSidebar />
          </aside>

          {/* Mobile Filter Modal */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-ink-soft p-6 overflow-y-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-ink/10 dark:border-paper/10">
                  <span className="font-display font-bold text-base">Filter Products</span>
                  <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar />
              </motion.div>
            </div>
          )}

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 bg-ink/[0.02] dark:bg-paper/[0.02] p-3 rounded-xl border border-ink/10 dark:border-paper/10">
              <span className="text-xs text-ink/60 dark:text-paper/60 font-semibold">
                Sort By:
              </span>
              <select
                value={sortOption}
                onChange={(e) => updateFilter('sort', e.target.value)}
                aria-label="Sort products"
                className="bg-transparent text-xs font-bold text-ink dark:text-paper outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20 card-surface rounded-2xl border border-ink/10 dark:border-paper/10">
                <p className="text-base font-bold text-ink dark:text-paper mb-2">No products match your filters</p>
                <p className="text-xs text-ink/50 dark:text-paper/50 mb-4">Try clearing some of your active filter selections.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {sorted.map((p) => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
