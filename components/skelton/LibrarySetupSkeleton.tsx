import { Skeleton } from '@/components/ui/skeleton';

export function LibrarySetupSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-4 mb-10">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Facilities */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Floors Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-9 w-24" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Shifts Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-9 w-24" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}
