import { Home } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import NewRegistrationContent from "./new-registration-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Registration",
  description: "Register as a new student to access our library resources and services",
};

function LoadingContent() {
  return (
    <Card className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border overflow-hidden p-6 md:p-8">
      <div className="animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    </Card>
  );
}

export default function StudentRegisterPage() {
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
                <BreadcrumbPage className="text-primary flex items-center gap-2">
                  Student Registration
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Student Registration
          </h1>
        </div>

        {/* Info Card */}
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-900 text-sm">
            <span className="font-semibold">Welcome!</span> Fill in your details to register with our library. 
            All information will be kept secure and confidential.
          </p>
        </Card>

        {/* Main Content */}
        <Card className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border overflow-hidden p-6 md:p-8">
          <Suspense fallback={<LoadingContent />}>
            <NewRegistrationContent />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
