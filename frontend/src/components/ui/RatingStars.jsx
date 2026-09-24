import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, count, size = 12, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span
        className="inline-flex items-center gap-0.5 bg-leaf-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded"
        aria-label={`Rated ${rating} out of 5 stars`}
      >
        {rating.toFixed(1)}
        <Star size={size} className="fill-white" />
      </span>
      {count != null && (
        <span className="text-xs text-ink/50 dark:text-paper/50">({count.toLocaleString('en-IN')})</span>
      )}
    </div>
  );
};

export default RatingStars;
