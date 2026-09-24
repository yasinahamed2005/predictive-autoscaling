import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Scale, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import RatingStars from './ui/RatingStars';
import PriceTag from './ui/PriceTag';
import ImageWithFallback from './ui/ImageWithFallback';
import QuickViewModal from './QuickViewModal';
import AuthModal from './AuthModal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useComparison } from '../context/ComparisonContext';

const ProductCard = ({ product, className = '' }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { currentUser, setPendingIntent } = useAuth();
  const { toggleCompare, isInCompare } = useComparison();

  const [showQuickView, setShowQuickView] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productId = product._id || product.id;
  const wishlisted = isWishlisted(productId);
  const compared = isInCompare(productId);

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const stock = product.stock !== undefined ? product.stock : 25;
  const imageSrc = product.image || product.images?.[0]?.url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentUser) {
      toggleWishlist(product);
    } else {
      setPendingIntent({ type: 'WISHLIST', product });
      setShowAuthModal(true);
    }
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  const handleOpenQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35 }}
        className={`card-surface group relative flex flex-col overflow-hidden hover:shadow-card-hover transition-all duration-300 border border-ink/10 dark:border-paper/10 rounded-2xl ${className}`}
      >
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {discount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {discount}% OFF
            </span>
          )}
          {stock <= 5 && stock > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Only {stock} left
            </span>
          )}
        </div>

        {/* Top Right Action Buttons (Wishlist & Compare) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-ink/80 backdrop-blur flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-ink transition-colors"
          >
            <Heart size={15} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-ink/60 dark:text-paper/60'} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleToggleCompare}
            aria-label="Add to comparison"
            title="Compare product"
            className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center shadow-md transition-colors ${
              compared
                ? 'bg-brand-500 text-white'
                : 'bg-white/90 dark:bg-ink/80 text-ink/60 dark:text-paper/60 hover:bg-white dark:hover:bg-ink'
            }`}
          >
            <Scale size={14} />
          </motion.button>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-ink/[0.03] dark:bg-paper/5">
          <Link to={`/product/${productId}`} className="block w-full h-full">
            <ImageWithFallback
              src={imageSrc}
              alt={product.name}
              fallbackText={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Hover Quick View Overlay Button */}
          <button
            onClick={handleOpenQuickView}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-ink/90 text-ink dark:text-paper hover:bg-brand-500 hover:text-white backdrop-blur text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye size={13} /> Quick View
          </button>
        </div>

        {/* Details Content */}
        <div className="p-3.5 flex flex-col gap-1.5 flex-1">
          <Link to={`/product/${productId}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-ink dark:text-paper line-clamp-2 min-h-[2.5em] hover:text-brand-500 transition-colors">
              {product.name}
            </h3>
          </Link>

          <RatingStars rating={product.rating || product.ratingAvg || 4.2} count={product.ratingCount || 85} />
          <PriceTag price={product.price} mrp={product.mrp} size="sm" />

          {/* Add to cart Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`mt-auto pt-2 w-full inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold py-2 px-3 rounded-full transition-all duration-300 ${
              addedSuccess
                ? 'bg-emerald-600 text-white shadow-md'
                : stock <= 0
                ? 'bg-ink/20 dark:bg-paper/20 text-ink/40 dark:text-paper/40 cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check size={15} /> Added!
              </>
            ) : stock <= 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart size={15} /> Add to cart
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Auth Modal for Wishlist Gatekeeping */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please login to save items to your wishlist."
      />

      {/* Quick View Modal instance */}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};

export default ProductCard;
