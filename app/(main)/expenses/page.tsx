import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ExpenseClientView from "./ExpenseClient";

export const metadata = {
  title: "Expenses",
  description: "Track and manage your library expenditures, view monthly breakdowns, and monitor financial health.",
};

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        <Suspense
          fallback={
            <div className="space-y-6">
              {/* Breadcrumb & Controls Skeleton */}
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-64 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-40 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </div>
              
              {/* Stat Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
              
              {/* Main Content Bento Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
                <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
              </div>
            </div>
          }
        >
          <ExpenseClientView />
        </Suspense>
      </div>
    </div>
  );
}