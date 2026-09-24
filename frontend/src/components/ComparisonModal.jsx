import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, ShoppingCart, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import ImageWithFallback from './ui/ImageWithFallback';
import RatingStars from './ui/RatingStars';
import PriceTag from './ui/PriceTag';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';

const ComparisonModal = () => {
  const { compareItems, toggleCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useComparison();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCompareOpen) {
        setIsCompareOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompareOpen, setIsCompareOpen]);

  if (compareItems.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Compare Bar */}
      {!isCompareOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-16 md:bottom-6 right-4 z-40 bg-ink dark:bg-paper text-paper dark:text-ink px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
        >
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-amber-400" />
            <span className="text-xs font-bold">
              Compare ({compareItems.length}/4)
            </span>
          </div>
          <div className="flex items-center gap-1">
            {compareItems.map((item) => (
              <ImageWithFallback
                key={item._id || item.id}
                src={item.image || item.images?.[0]?.url}
                alt={item.name}
                fallbackText={item.name}
                className="w-7 h-7 rounded-lg object-cover border border-white/30"
              />
            ))}
          </div>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1"
          >
            Compare Now <ArrowRight size={13} />
          </button>
          <button
            onClick={clearCompare}
            className="p-1 text-white/60 dark:text-ink/60 hover:text-white dark:hover:text-ink"
            aria-label="Clear comparison"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Full Comparison Modal */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl card-surface rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-ink/10 dark:border-paper/10">
                <div className="flex items-center gap-2">
                  <Scale className="text-brand-500" size={24} />
                  <h2 className="text-xl font-display font-extrabold text-ink dark:text-paper">
                    Product Comparison
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearCompare}
                    className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Clear all
                  </button>
                  <button
                    onClick={() => setIsCompareOpen(false)}
                    className="p-2 rounded-full hover:bg-ink/10 dark:hover:bg-paper/10 text-ink/70 dark:text-paper/70"
                    aria-label="Close comparison modal"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="p-3 w-40 text-xs font-bold uppercase text-ink/40 dark:text-paper/40 bg-ink/[0.02]">
                        Feature
                      </th>
                      {compareItems.map((item) => (
                        <th key={item._id || item.id} className="p-3 min-w-[200px] align-top relative">
                          <button
                            onClick={() => toggleCompare(item)}
                            className="absolute top-2 right-2 p-1 rounded-full text-rose-500 hover:bg-rose-500/10"
                            title="Remove product"
                          >
                            <X size={16} />
                          </button>
                          <div className="text-center pt-2">
                            <ImageWithFallback
                              src={item.image || item.images?.[0]?.url}
                              alt={item.name}
                              fallbackText={item.name}
                              className="w-24 h-24 mx-auto rounded-xl object-cover mb-2 border border-ink/10"
                            />
                            <h3 className="text-xs font-bold line-clamp-2 text-ink dark:text-paper mb-1">
                              {item.name}
                            </h3>
                            <PriceTag price={item.price} mrp={item.mrp} size="sm" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-ink/10 dark:divide-paper/10 text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-ink/60 dark:text-paper/60 bg-ink/[0.02]">Rating</td>
                      {compareItems.map((item) => (
                        <td key={item._id || item.id} className="p-3 text-center">
                          <RatingStars rating={item.rating || item.ratingAvg || 4.2} count={item.ratingCount || 100} />
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-ink/60 dark:text-paper/60 bg-ink/[0.02]">Brand</td>
                      {compareItems.map((item) => (
                        <td key={item._id || item.id} className="p-3 text-center font-semibold capitalize text-ink dark:text-paper">
                          {typeof item.brand === 'object' ? item.brand?.name : item.brand || 'Dukaan'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-ink/60 dark:text-paper/60 bg-ink/[0.02]">Category</td>
                      {compareItems.map((item) => (
                        <td key={item._id || item.id} className="p-3 text-center font-semibold capitalize text-ink dark:text-paper">
                          {typeof item.category === 'object' ? item.category?.name : item.category || 'General'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-ink/60 dark:text-paper/60 bg-ink/[0.02]">Stock Status</td>
                      {compareItems.map((item) => {
                        const stock = item.stock !== undefined ? item.stock : 25;
                        return (
                          <td key={item._id || item.id} className="p-3 text-center font-semibold">
                            {stock > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                <CheckCircle2 size={13} /> In Stock ({stock})
                              </span>
                            ) : (
                              <span className="text-rose-500 inline-flex items-center gap-1">
                                <AlertTriangle size={13} /> Out of Stock
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-ink/60 dark:text-paper/60 bg-ink/[0.02]">Description</td>
                      {compareItems.map((item) => (
                        <td key={item._id || item.id} className="p-3 text-ink/80 dark:text-paper/80 leading-relaxed text-left">
                          {item.description || 'High quality product available at Dukaan.'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 font-semibold text-ink/60 dark:text-paper/60 bg-ink/[0.02]">Action</td>
                      {compareItems.map((item) => (
                        <td key={item._id || item.id} className="p-3 text-center">
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded-full text-xs transition-colors inline-flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart size={14} /> Add to Cart
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ComparisonModal;
