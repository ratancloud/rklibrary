import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-96 rounded-lg" />
            </div>
          }
        >
          <DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}