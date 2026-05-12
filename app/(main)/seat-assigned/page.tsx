import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SeatAssignmentComponent from "@/components/seat-map/SeatAssignmentComponent";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Assign Seat",
  description: "Assign a student to a seat for a specific shift",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export default function SeatAssignedPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-6xl mx-auto pb-10 px-4 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mt-24 mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">
                    <Home className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary">
                  Assign Seat
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <SeatAssignmentComponent />
        </Suspense>
      </div>
    </div>
  );
}
