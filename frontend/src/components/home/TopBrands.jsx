import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import ImageWithFallback from '../ui/ImageWithFallback';
import { brands } from '../../data/brands';

const TopBrands = () => {
  const navigate = useNavigate();

  return (
    <section className="container-page py-6 sm:py-8">
      <SectionHeader eyebrow="Trusted names" title="Top Brands" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => navigate(`/products?brand=${b.id}`)}
            className="card-surface group flex flex-col items-center justify-center p-4 h-24 sm:h-28 rounded-xl border border-ink/10 dark:border-paper/10 hover:border-brand-500 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 text-center cursor-pointer"
            aria-label={`Shop products from ${b.name}`}
          >
            <ImageWithFallback
              src={b.logo}
              alt={b.name}
              fallbackText={b.name}
              className="max-h-10 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-xs font-semibold text-ink/70 dark:text-paper/70 group-hover:text-brand-500 mt-2 transition-colors">
              {b.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TopBrands;
