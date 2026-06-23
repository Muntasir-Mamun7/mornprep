export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-5 w-1/3 rounded-lg" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-2/3 rounded-lg" />
    </div>
  );
}

export function SkeletonCircle({ size = "w-12 h-12" }: { size?: string }) {
  return <div className={`skeleton rounded-full ${size}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-6"><div className="skeleton h-8 w-8 mx-auto rounded-lg" /></div>
        <div className="card text-center py-6"><div className="skeleton h-8 w-8 mx-auto rounded-lg" /></div>
        <div className="card text-center py-6"><div className="skeleton h-8 w-8 mx-auto rounded-lg" /></div>
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
