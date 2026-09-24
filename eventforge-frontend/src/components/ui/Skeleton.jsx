export function Skeleton({ className = '' }) {
  return <div className={`shimmer-bg rounded-lg ${className}`} />;
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
