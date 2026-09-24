import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from '../components/Helmet';
import HeroBanner from '../components/home/HeroBanner';
import PopularCategories from '../components/home/PopularCategories';
import BestDeals from '../components/home/BestDeals';
import ProductRail from '../components/home/ProductRail';
import TopBrands from '../components/home/TopBrands';
import { getByTag } from '../data/products';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const { recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Helmet title="Dukaan — Shop Everything, Delivered Fast" description="India's friendliest online store for groceries, fashion, electronics and more." />
      
      {/* Hero Promotional Carousel */}
      <HeroBanner />

      {/* Popular Categories */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <PopularCategories />
      </motion.div>

      {/* Best Deals / Deals of the Day (MongoDB Dynamic) */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <BestDeals />
      </motion.div>

      {/* Trending Products */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <ProductRail eyebrow="Hot right now" title="Trending Products" products={getByTag('trending')} viewAllHref="/products" loading={loading} />
      </motion.div>

      {/* New Arrivals */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <ProductRail eyebrow="Just landed" title="New Arrivals" products={getByTag('newArrival')} viewAllHref="/products" loading={loading} />
      </motion.div>

      {/* Top Brands */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <TopBrands />
      </motion.div>

      {/* Best Sellers */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <ProductRail eyebrow="Customer favorites" title="Best Sellers" products={getByTag('bestSeller')} viewAllHref="/products" loading={loading} />
      </motion.div>

      {/* Recommended Products */}
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <ProductRail eyebrow="Picked for you" title="Recommended Products" products={getByTag('recommended')} viewAllHref="/products" loading={loading} />
      </motion.div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <ProductRail eyebrow="Continue browsing" title="Recently Viewed" products={recentlyViewed} />
        </motion.div>
      )}
    </>
  );
};

export default Home;
