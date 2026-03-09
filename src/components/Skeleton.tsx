import React from 'react';
import { cn } from '../utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-white/5 rounded-md", className)} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
