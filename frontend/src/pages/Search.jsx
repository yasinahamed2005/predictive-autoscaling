import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Helmet } from '../components/Helmet';
import { products } from '../data/products';
import { SearchX } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [q]);

  return (
    <>
      <Helmet title={`"${q}" — Search results — Dukaan`} />
      <div className="container-page py-8">
        <h1 className="text-xl font-display font-bold text-ink dark:text-paper mb-1">
          Results for <span className="text-brand-500">&ldquo;{q}&rdquo;</span>
        </h1>
        <p className="text-sm text-ink/50 dark:text-paper/50 mb-6">{results.length} products found</p>

        {results.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 text-ink/50 dark:text-paper/50">
            <SearchX size={40} className="mb-3 opacity-60" />
            <p>We couldn't find anything matching your search.</p>
            <p className="text-sm mt-1">Try a different keyword or browse categories instead.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
};

export default Search;
