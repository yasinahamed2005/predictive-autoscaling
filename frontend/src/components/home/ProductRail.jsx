import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard';
import SectionHeader from '../ui/SectionHeader';
import { RailSkeleton } from '../ui/Skeleton';

const ProductRail = ({ eyebrow, title, products, viewAllHref, loading = false }) => {
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className="container-page py-6 sm:py-8">
      <SectionHeader eyebrow={eyebrow} title={title} viewAllHref={viewAllHref} />
      {loading ? (
        <RailSkeleton />
      ) : (
        <div className="relative group/rail">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="hidden sm:flex absolute -left-3 top-1/3 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-ink-soft shadow-card items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>
          <div ref={scrollerRef} className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1">
            {products.map((p) => (
              <div key={p.id} className="min-w-[42%] xs:min-w-[38%] sm:min-w-[190px] md:min-w-[210px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="hidden sm:flex absolute -right-3 top-1/3 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-ink-soft shadow-card items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductRail;
