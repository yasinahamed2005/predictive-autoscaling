import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

export const ProductCardSkeleton = () => (
  <div className="card-surface p-3 flex flex-col gap-3" aria-hidden="true">
    <Skeleton className="w-full aspect-square rounded-xl" />
    <Skeleton className="h-3.5 w-4/5" />
    <Skeleton className="h-3.5 w-3/5" />
    <Skeleton className="h-5 w-2/5" />
  </div>
);

export const RailSkeleton = ({ count = 6 }) => (
  <div className="flex gap-4 overflow-hidden" role="status" aria-label="Loading products">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="min-w-[168px] sm:min-w-[200px]">
        <ProductCardSkeleton />
      </div>
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="container-page py-10 space-y-6" role="status" aria-label="Loading page">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-40 w-full rounded-2xl" />
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  </div>
);
