import React from "react";

export function SeatMapSkeleton() {
  return (
    <div className="min-h-screen bg-muted/10 text-foreground">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
        
        {/* --- HEADER SKELETON --- */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            {/* Floor Dropdown Placeholder */}
            <div className="w-45 h-10 bg-muted rounded-md" />
          </div>

          <div className="flex gap-2 overflow-x-hidden">
            {/* Shift Buttons Placeholders */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-24 h-9 bg-muted rounded-full" />
            ))}
          </div>
        </header>

        <div className="flex flex-col xl:flex-row gap-8 items-start mt-8">
          
          {/* --- GRID SKELETON --- */}
          <div className="flex-1 w-full bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm">
            {/* Stats / Legend Placeholders */}
            <div className="flex justify-end gap-4 mb-6">
              <div className="w-16 h-3 bg-muted rounded-full" />
              <div className="w-16 h-3 bg-muted rounded-full" />
              <div className="w-16 h-3 bg-muted rounded-full" />
            </div>

            {/* Chair Grid Placeholders */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8 mb-12">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="flex justify-center">
                  <div className="relative flex flex-col items-center justify-end w-14 h-16">
                    {/* Chair Backrest */}
                    <div className="w-8 h-2.5 rounded-t-full mb-1 bg-muted" />
                    {/* Chair Cushion */}
                    <div className="relative w-full h-12 rounded-xl border-2 border-muted bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>

            {/* Entrance Placeholder */}
            <div className="flex justify-center">
              <div className="w-32 h-7 bg-muted rounded-full" />
            </div>
          </div>

          {/* --- SIDEBAR SKELETON --- */}
          <div className="w-full xl:w-105 shrink-0 overflow-hidden">
            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm h-auto">
              
              {/* Sidebar Header */}
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
                <div className="space-y-2 mt-1 w-full">
                  <div className="w-24 h-6 bg-muted rounded-md" />
                  <div className="w-16 h-3 bg-muted rounded-md" />
                </div>
                <div className="w-8 h-8 rounded-md bg-muted shrink-0" />
              </div>

              <div className="w-full h-px bg-border/50 my-4" />

              {/* Sidebar Shift Cards */}
              <div className="space-y-4 mt-6">
                <div className="w-24 h-4 bg-muted rounded-md mb-4" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full h-27 bg-muted/40 rounded-xl border border-muted" />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}