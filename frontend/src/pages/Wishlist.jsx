import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Helmet } from '../components/Helmet';
import { useWishlist } from '../context/WishlistContext';
import ProtectedRoute from '../components/ProtectedRoute';

const WishlistContent = () => {
  const { wishlist } = useWishlist();

  return (
    <>
      <Helmet title="My Wishlist — Dukaan" />
      <div className="container-page py-8">
        <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper mb-6">
          My Wishlist ({wishlist.length})
        </h1>
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 card-surface rounded-2xl border border-ink/10 dark:border-paper/10 text-ink/50 dark:text-paper/50">
            <Heart size={44} className="mb-3 text-rose-500 opacity-40" />
            <p className="text-base font-bold text-ink dark:text-paper mb-1">Your wishlist is empty</p>
            <p className="text-xs mb-4">Explore items and save your favorites to view them later.</p>
            <Link
              to="/products"
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlist.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const Wishlist = () => (
  <ProtectedRoute>
    <WishlistContent />
  </ProtectedRoute>
);

export default Wishlist;
