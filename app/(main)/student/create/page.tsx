"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import StudentForm from "@/components/students/StudentForm";

export default function AddStudentPage() {
  const router = useRouter();

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
                <BreadcrumbLink asChild>
                  <Link href="/student">Students</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary flex items-center gap-2">
                  Add Student
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border overflow-hidden p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Add New Student
            </h1>
            <p className="text-muted-foreground mt-2">
              Fill in the student details to create a new member profile
            </p>
          </div>
          <StudentForm onSuccess={() => router.back()} />
        </div>
      </div>
    </div>
  );
}
