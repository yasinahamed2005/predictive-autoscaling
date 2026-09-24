import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Scale, CheckCircle2, AlertTriangle, ShieldCheck, Truck, Zap } from 'lucide-react';
import ImageWithFallback from './ui/ImageWithFallback';
import RatingStars from './ui/RatingStars';
import PriceTag from './ui/PriceTag';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';

const QuickViewModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useComparison();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id || product.id);
  const compared = isInCompare(product._id || product.id);

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const stock = product.stock !== undefined ? product.stock : 25;
  const imageSrc = product.image || product.images?.[0]?.url;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-3xl card-surface rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-ink/10 dark:hover:bg-paper/10 text-ink/70 dark:text-paper/70 transition-colors"
            aria-label="Close Quick View"
          >
            <X size={20} />
          </button>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-ink/[0.03] dark:bg-paper/5 aspect-square border border-ink/10 dark:border-paper/10">
              {discount > 0 && (
                <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  {discount}% OFF
                </span>
              )}
              <ImageWithFallback
                src={imageSrc}
                alt={product.name}
                fallbackText={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
                {typeof product.category === 'object' ? product.category?.name : product.category || 'Product'}
              </span>

              <h2 className="text-xl sm:text-2xl font-display font-bold text-ink dark:text-paper mb-2">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <RatingStars rating={product.rating || product.ratingAvg || 4.3} count={product.ratingCount || 120} />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {stock > 0 ? (
                    <>
                      <CheckCircle2 size={13} /> In Stock ({stock})
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} className="text-rose-500" /> Out of stock
                    </>
                  )}
                </span>
              </div>

              <div className="mb-4">
                <PriceTag price={product.price} mrp={product.mrp} size="lg" />
              </div>

              <p className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 mb-6 leading-relaxed">
                {product.description || 'Premium quality product sourced and delivered with care.'}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-ink/70 dark:text-paper/70">Quantity:</span>
                <div className="flex items-center border border-ink/15 dark:border-paper/20 rounded-full px-3 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 font-bold text-sm text-ink/70 dark:text-paper/70 hover:text-brand-500"
                  >
                    -
                  </button>
                  <span className="px-3 font-semibold text-sm text-ink dark:text-paper">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2 font-bold text-sm text-ink/70 dark:text-paper/70 hover:text-brand-500"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    onClose();
                  }}
                  className="flex-1 bg-marigold-500 hover:bg-marigold-600 text-ink font-bold py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={16} /> Buy Now
                </button>
              </div>

              {/* Wishlist & Compare Quick Actions */}
              <div className="flex items-center justify-between border-t border-ink/10 dark:border-paper/10 pt-4 mt-auto">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    wishlisted ? 'text-rose-500 font-bold' : 'text-ink/60 dark:text-paper/60 hover:text-rose-500'
                  }`}
                >
                  <Heart size={16} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
                  {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>

                <button
                  onClick={() => toggleCompare(product)}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    compared ? 'text-brand-500 font-bold' : 'text-ink/60 dark:text-paper/60 hover:text-brand-500'
                  }`}
                >
                  <Scale size={16} />
                  {compared ? 'In Comparison' : 'Add to Compare'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
