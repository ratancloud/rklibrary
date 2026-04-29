import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import BookingClient from "./BookingClient";

export const metadata = {
  title: "Booking",
  description: "Book a seat in the library",
}


export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-10 w-56 rounded" />
              <Skeleton className="h-40 rounded-lg" />
              <Skeleton className="h-80 rounded-lg" />
            </div>
          }
        >
          <BookingClient />
        </Suspense>
      </div>
    </div>
  );
}
