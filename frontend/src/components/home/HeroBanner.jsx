import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Zap, ShoppingBag, Home as HomeIcon, Tag } from 'lucide-react';
import ImageWithFallback from '../ui/ImageWithFallback';

const defaultSlides = [
  {
    id: 'default-1',
    badge: 'Festive Season Sale',
    badgeIcon: Sparkles,
    title: 'Everything you need, delivered fast.',
    subtitle: 'Groceries, fashion, electronics & more at unbeatable prices. Free delivery on orders over ₹499.',
    ctaText: 'Shop Now',
    ctaLink: '/products?category=electronics',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/products',
    bgGradient: 'from-brand-900 via-brand-800 to-brand-700',
    accentColor: 'bg-marigold-500 text-slate-950 hover:bg-marigold-400 font-black',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    fallbackText: 'Electronics Sale Banner',
  },
  {
    id: 'default-2',
    badge: 'Fresh Grocery Sale',
    badgeIcon: Zap,
    title: 'Farm Fresh Organic Essentials',
    subtitle: 'Get up to 30% OFF on fresh avocados, berries, dairy, and daily essentials straight to your door.',
    ctaText: 'Shop Now',
    ctaLink: '/products?category=grocery',
    secondaryCtaText: 'View Pantry Deals',
    secondaryCtaLink: '/products?category=grocery',
    bgGradient: 'from-emerald-900 via-teal-900 to-emerald-800',
    accentColor: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-black',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    fallbackText: 'Fresh Groceries Banner',
  },
  {
    id: 'default-3',
    badge: 'Fashion Trends 2026',
    badgeIcon: ShoppingBag,
    title: 'Style Up with Top Brands',
    subtitle: 'Flat 40% OFF on Nike sneakers, kurtas, unisex denim jackets & sportswear collection.',
    ctaText: 'Shop Now',
    ctaLink: '/products?category=fashion',
    secondaryCtaText: 'Shop Footwear',
    secondaryCtaLink: '/products?category=fashion',
    bgGradient: 'from-indigo-950 via-purple-950 to-slate-900',
    accentColor: 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-black',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    fallbackText: 'Fashion Trends Banner',
  },
  {
    id: 'default-4',
    badge: 'Home & Kitchen Mega Sale',
    badgeIcon: HomeIcon,
    title: 'Modernize Your Living Space',
    subtitle: 'Philips air fryers, non-stick cookware, and luxury home furnishings starting from ₹499.',
    ctaText: 'Shop Now',
    ctaLink: '/products?category=home',
    secondaryCtaText: 'Explore Kitchen',
    secondaryCtaLink: '/products?category=home',
    bgGradient: 'from-amber-950 via-orange-900 to-red-950',
    accentColor: 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-black',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    fallbackText: 'Home & Kitchen Banner',
  },
];

const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
  }
  // ImgBB webpage links (e.g., https://ibb.co/qYdZ2KYz) are HTML viewer pages, not direct image files.
  // Direct ImgBB images start with https://i.ibb.co/...
  if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
    return 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';
  }
  return url;
};

const HeroBanner = () => {
  const [slides, setSlides] = useState(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const loadDynamicBanners = useCallback(async () => {
    let customSlides = [];

    // 1. Try local storage for admin created deals
    try {
      const savedAdminDeals = localStorage.getItem('dukaan_admin_deals');
      if (savedAdminDeals) {
        const parsed = JSON.parse(savedAdminDeals);
        const activeDeals = parsed.filter((d) => d.isActive !== false);
        
        customSlides = activeDeals.map((deal, idx) => ({
          id: deal._id || `admin-deal-${idx}`,
          badge: `${deal.discountPercentage || 25}% OFF Festive Offer`,
          badgeIcon: Tag,
          title: deal.title || 'Special Promotional Offer',
          subtitle: deal.description || 'Celebrate with exclusive discounts on selected products!',
          ctaText: 'Shop Now',
          ctaLink: '/products',
          secondaryCtaText: 'View All Offers',
          secondaryCtaLink: '/products',
          bgGradient: 'from-purple-950 via-indigo-900 to-slate-900',
          accentColor: 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-black',
          image: sanitizeImageUrl(deal.banner),
          fallbackText: deal.title || 'Promotional Sale Banner',
        }));
      }
    } catch (e) {}

    // 2. Combine Admin deals with default slides
    if (customSlides.length > 0) {
      setSlides([...customSlides, ...defaultSlides]);
    } else {
      setSlides(defaultSlides);
    }
  }, []);

  useEffect(() => {
    loadDynamicBanners();

    window.addEventListener('storage', loadDynamicBanners);
    window.addEventListener('dukaan_deals_updated', loadDynamicBanners);

    return () => {
      window.removeEventListener('storage', loadDynamicBanners);
      window.removeEventListener('dukaan_deals_updated', loadDynamicBanners);
    };
  }, [loadDynamicBanners]);

  const nextSlide = useCallback(() => {
    setSlides((currentSlides) => {
      setCurrent((prev) => (prev + 1) % currentSlides.length);
      return currentSlides;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setSlides((currentSlides) => {
      setCurrent((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
      return currentSlides;
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const slide = slides[current] || slides[0];
  const BadgeIcon = slide.badgeIcon || Sparkles;

  return (
    <section
      className="relative overflow-hidden bg-slate-900 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      aria-label="Promotional Banner Carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] bg-gradient-to-r ${slide.bgGradient} flex items-center`}
        >
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            aria-hidden="true"
          />

          <div className="container-page relative z-10 py-10 sm:py-16 grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 border border-white/20">
                <BadgeIcon size={14} className="text-amber-300" /> {slide.badge}
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold leading-tight mb-4 text-white">
                {slide.title}
              </h1>
              <p className="text-white/80 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={slide.ctaLink}
                  className={`inline-flex items-center gap-2 ${slide.accentColor} font-bold px-6 py-3 rounded-full transition-transform active:scale-95 shadow-lg`}
                >
                  {slide.ctaText} <ArrowRight size={16} />
                </Link>
                <Link
                  to={slide.secondaryCtaLink}
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-3 rounded-full hover:bg-white/10 transition-colors"
                >
                  {slide.secondaryCtaText}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[320px] group">
                <ImageWithFallback
                  src={slide.image}
                  alt={slide.title}
                  fallbackText={slide.fallbackText}
                  className="w-full h-[320px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next controls */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur flex items-center justify-center transition-all opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur flex items-center justify-center transition-all opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
