import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, ChevronRight, Zap } from 'lucide-react';
import { getProductById, products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import RatingStars from '../components/ui/RatingStars';
import PriceTag from '../components/ui/PriceTag';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import PincodeChecker from '../components/ui/PincodeChecker';
import ProductRail from '../components/home/ProductRail';
import AuthModal from '../components/AuthModal';
import { Helmet } from '../components/Helmet';
import { PageSkeleton } from '../components/ui/Skeleton';

const ProductDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const product = getProductById(id);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { currentUser, setPendingIntent } = useAuth();
  const { trackView, recentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    if (product) trackView(product);
  }, [product?.id]);

  if (loading) return <PageSkeleton />;

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-display font-bold mb-2">Product not found</h1>
        <Link to="/products" className="text-brand-500 font-semibold">Back to shopping</Link>
      </div>
    );
  }

  const similar = products.filter((p) => p.category === product.category && p.id !== product.id);
  const wishlisted = isWishlisted(product.id);

  const handleBuyNow = () => {
    if (currentUser) {
      addToCart(product, { silent: true });
      navigate('/checkout');
    } else {
      setPendingIntent({ type: 'BUY_NOW', product });
      setShowAuthModal(true);
    }
  };

  const handleToggleWishlist = () => {
    if (currentUser) {
      toggleWishlist(product);
    } else {
      setPendingIntent({ type: 'WISHLIST', product });
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Helmet title={`${product.name} — Dukaan`} description={product.description} />
      <div className="container-page py-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-ink/50 dark:text-paper/50 mb-6">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${product.category}`} className="hover:text-brand-500 capitalize">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-ink dark:text-paper line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square rounded-2xl overflow-hidden bg-ink/[0.03] dark:bg-paper/5 border border-ink/10 dark:border-paper/10">
            <ImageWithFallback src={product.image} alt={product.name} fallbackText={product.name} className="w-full h-full object-cover" />
          </motion.div>

          <div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-1 capitalize">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink dark:text-paper mb-2">{product.name}</h1>
            <RatingStars rating={product.rating} count={product.ratingCount} />
            <div className="mt-4"><PriceTag price={product.price} mrp={product.mrp} size="lg" /></div>
            <p className="text-ink/60 dark:text-paper/60 mt-4 leading-relaxed text-sm sm:text-base">{product.description}</p>

            <p className={`mt-4 text-sm font-semibold ${product.stock > 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
              {product.stock > 10 ? '✓ In stock' : `Only ${product.stock} left — order soon`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors shadow-md text-xs sm:text-sm"
              >
                <ShoppingCart size={18} /> Add to cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-3.5 px-6 rounded-full transition-colors shadow-md text-xs sm:text-sm"
              >
                <Zap size={18} /> Buy Now
              </button>
              <button
                onClick={handleToggleWishlist}
                aria-pressed={wishlisted}
                aria-label="Toggle wishlist"
                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-full border border-ink/15 dark:border-paper/20 hover:bg-ink/5 dark:hover:bg-paper/10 transition-colors mx-auto sm:mx-0"
              >
                <Heart size={20} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>

            {/* Pincode & Delivery Availability Widget */}
            <div className="mt-6">
              <PincodeChecker />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 text-xs text-ink/60 dark:text-paper/60">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-ink/[0.03] dark:bg-paper/5">
                <Truck size={18} className="text-brand-500" /> Fast Delivery
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-ink/[0.03] dark:bg-paper/5">
                <RotateCcw size={18} className="text-brand-500" /> 7-Day Returns
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-ink/[0.03] dark:bg-paper/5">
                <ShieldCheck size={18} className="text-brand-500" /> Secure Payment
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please login to complete your order."
      />

      {similar.length > 0 && <ProductRail eyebrow="You might also like" title="Similar Products" products={similar} />}
      {recentlyViewed.length > 1 && (
        <ProductRail eyebrow="Continue browsing" title="Recently Viewed" products={recentlyViewed.filter((p) => p.id !== product.id)} />
      )}
    </>
  );
};

export default ProductDetails;
