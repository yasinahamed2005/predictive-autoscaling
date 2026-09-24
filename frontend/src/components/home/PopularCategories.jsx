import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import { categories } from '../../data/categories';

const PopularCategories = () => (
  <section className="container-page py-6 sm:py-8">
    <SectionHeader eyebrow="Shop by" title="Popular Categories" />
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
      {categories.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
          >
            <Link to={`/products?category=${c.id}`} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                <Icon size={24} className="text-brand-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-ink dark:text-paper text-center line-clamp-1">{c.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  </section>
);

export default PopularCategories;
