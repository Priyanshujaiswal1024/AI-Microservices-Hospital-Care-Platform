import React from 'react';

export default function SkeletonLoader({ className = "h-4 w-full" }) {
  return (
    <div
      className={`bg-slate-200 animate-pulse rounded-md ${className}`}
    />
  );
}
