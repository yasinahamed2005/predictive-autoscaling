import React, { useState } from 'react';
import { ImageOff, Package } from 'lucide-react';

const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  fallbackText = '',
  aspectRatio = 'square',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-ink-soft text-ink/40 dark:text-paper/40 p-3 select-none rounded-lg ${className}`}
        role="img"
        aria-label={alt || 'Image placeholder'}
      >
        <Package size={24} className="mb-1 opacity-60" />
        <span className="text-[11px] font-medium text-center line-clamp-1">
          {fallbackText || alt || 'No image'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      onLoad={() => setLoading(false)}
      className={`${className} ${loading ? 'opacity-75 animate-pulse' : 'opacity-100'} transition-opacity duration-300`}
      {...props}
    />
  );
};

export default ImageWithFallback;
