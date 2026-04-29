import { Skeleton } from '@/components/ui/skeleton';

export const SettingsSkeleton = () => {
  return (
    <div className="w-full max-w-6xl mt-20 mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="w-20 h-4 rounded" />
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="w-16 h-4 rounded" />
      </div>

      {/* Card 1 Skeleton */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Skeleton className="h-14 w-full" />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
            ))}
            <div className="md:col-span-2 lg:col-span-3">
              <Skeleton className="h-3 w-20 rounded mb-2" />
              <Skeleton className="h-6 w-full rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 Skeleton */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Skeleton className="h-14 w-full" />
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 3 Skeleton */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Skeleton className="h-14 w-full" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-8 w-full rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-full rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
