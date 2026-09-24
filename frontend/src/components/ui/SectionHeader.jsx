import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ eyebrow, title, viewAllHref, accent = 'text-brand-500' }) => (
  <div className="flex items-end justify-between mb-4 sm:mb-5">
    <div>
      {eyebrow && <p className={`text-xs font-semibold uppercase tracking-wider ${accent} mb-1`}>{eyebrow}</p>}
      <h2 className="text-xl sm:text-2xl font-display font-bold text-ink dark:text-paper">{title}</h2>
    </div>
    {viewAllHref && (
      <Link
        to={viewAllHref}
        className="flex items-center gap-0.5 text-sm font-semibold text-brand-500 hover:text-brand-600 shrink-0"
      >
        View all <ChevronRight size={16} />
      </Link>
    )}
  </div>
);

export default SectionHeader;
