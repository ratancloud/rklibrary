"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <Skeleton className="h-8 w-28 rounded-md" />

      {/* Profile Hero Skeleton */}
      <Card className="rounded-2xl border shadow-sm overflow-hidden">
        <div className="h-36 sm:h-44 bg-muted" />

        <div className="flex justify-center -mt-16">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
        </div>

        <CardContent className="pt-6 px-6 text-center space-y-4">
          <Skeleton className="h-5 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />

          <div className="flex justify-center gap-3 pt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Password Card Skeleton */}
      <Card className="rounded-xl border shadow-sm">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-4 w-40" />
        </div>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </CardContent>

        <CardFooter className="border-t px-6 py-4 flex justify-end">
          <Skeleton className="h-10 w-40 rounded-md" />
        </CardFooter>
      </Card>

      {/* Active Sessions Skeleton */}
      <Card className="rounded-xl border shadow-sm">
        <div className="px-6 py-4 border-b">
          <Skeleton className="h-4 w-36" />
        </div>

        <CardContent className="space-y-3 py-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
