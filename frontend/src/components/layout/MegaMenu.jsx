import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { megaMenu } from '../../data/categories';

const MegaMenu = ({ open, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubCategoryClick = (categoryId, subName) => {
    onClose();
    navigate(`/products?category=${categoryId}&sub=${encodeURIComponent(subName)}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        onMouseLeave={onClose}
        className="absolute left-0 right-0 top-full z-40 bg-white dark:bg-ink-soft border-t border-b border-ink/10 dark:border-paper/10 shadow-2xl"
        role="menu"
        aria-label="All Categories Mega Menu"
      >
        <div className="container-page py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {megaMenu.map((section) => (
              <div key={section.id} className="space-y-4">
                <Link
                  to={`/products?category=${section.id}`}
                  onClick={onClose}
                  className="font-display font-extrabold text-base text-brand-500 hover:text-brand-600 flex items-center justify-between group border-b border-ink/10 dark:border-paper/10 pb-2"
                >
                  <span>{section.category}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="space-y-4">
                  {section.groups.map((g) => (
                    <div key={g.heading}>
                      <h4 className="text-xs font-bold text-ink/40 dark:text-paper/40 uppercase tracking-wider mb-2">
                        {g.heading}
                      </h4>
                      <ul className="space-y-1.5">
                        {g.links.map((l) => (
                          <li key={l}>
                            <button
                              type="button"
                              onClick={() => handleSubCategoryClick(section.id, l)}
                              className="text-xs sm:text-sm text-ink/70 dark:text-paper/70 hover:text-brand-500 transition-colors text-left w-full"
                            >
                              {l}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MegaMenu;
