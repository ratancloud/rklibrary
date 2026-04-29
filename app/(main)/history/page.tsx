import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import HistoryClient from "./HistoryClient";

export const metadata = {
  title: "History",
  description: "View your past seat reservations and renewals to keep track of your library usage and plan for future visits.",
}


export default function History() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-6xl mx-auto pb-10 px-4 md:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          }
        >
          <HistoryClient />
        </Suspense>
      </div>
    </div>
  );
}
