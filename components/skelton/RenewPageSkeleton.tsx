import React from "react";
import { Separator } from "@/components/ui/separator";

export function RenewPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mt-24">
        <div className="flex gap-2 animate-pulse">
          <div className="w-6 h-6 bg-muted rounded" />
          <div className="w-32 h-6 bg-muted rounded" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Student & Seat Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Card */}
            <div className="bg-white border border-primary/20 rounded-2xl p-8 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="w-48 h-6 bg-muted rounded" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-20 h-3 bg-muted rounded" />
                    <div className="w-32 h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Details Card */}
            <div className="bg-white border border-primary/20 rounded-2xl p-8 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="w-48 h-6 bg-muted rounded" />
              </div>

              <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-20 h-3 bg-muted rounded" />
                    <div className="w-24 h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Period Card */}
            <div className="bg-white border border-primary/20 rounded-2xl p-8 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="w-48 h-6 bg-muted rounded" />
              </div>

              <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-20 h-3 bg-muted rounded" />
                    <div className="w-24 h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Renewal Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-primary/20 rounded-2xl p-8 shadow-sm space-y-6 animate-pulse">
              {/* Header */}
              <div className="space-y-4">
                <div className="w-40 h-6 bg-muted rounded" />
                <Separator />
              </div>

              {/* Period Summary */}
              <div className="space-y-3 bg-primary/5 rounded-xl border border-primary/10 p-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <div className="w-16 h-3 bg-muted rounded" />
                    <div className="w-24 h-3 bg-muted rounded" />
                  </div>
                ))}
              </div>

              {/* Duration Selection */}
              <div className="space-y-4">
                <div className="w-32 h-3 bg-muted rounded" />

                {/* Buttons Skeleton */}
                <div className="flex items-center border border-primary/20 rounded-lg overflow-hidden bg-background">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-10 bg-muted border-x border-primary/20"
                    />
                  ))}
                </div>

                {/* Quick Select */}
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((m) => (
                    <div key={m} className="h-9 bg-muted rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Amount Collected */}
              <div className="space-y-3">
                <div className="w-32 h-3 bg-muted rounded" />
                <div className="w-full h-10 bg-muted rounded-lg" />
                <div className="w-full h-12 bg-muted rounded-lg" />
              </div>

              {/* Submit Button */}
              <div className="w-full h-11 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
