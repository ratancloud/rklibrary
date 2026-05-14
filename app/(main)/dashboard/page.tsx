import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import DashboardClientView from "./DashboardClient";

export const metadata = {
  title: "Dashboard",
  description: "Welcome to your dashboard! Here you can view your current seat status, manage your account, and access important information about your library experience.",
}


export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <Skeleton className="h-5 w-96 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80 rounded-2xl" />
                <Skeleton className="h-80 rounded-2xl" />
              </div>
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          }
        >
          <DashboardClientView />
        </Suspense>
      </div>
    </div>
  );
}