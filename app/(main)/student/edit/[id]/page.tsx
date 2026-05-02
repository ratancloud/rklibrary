"use client";

import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import StudentForm from "@/components/students/StudentForm";
import { Loader2 } from "lucide-react";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/${params.id}/edit`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Student not found");
          } else {
            setError("Failed to load student");
          }
          return;
        }
        const data = await res.json();
        setStudent(data.data);
      } catch (err) {
        console.error("Failed to fetch student:", err);
        setError("Failed to load student");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading student...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-4">
            {error || "Student not found"}
          </p>
          <button
            onClick={() => router.push("/student")}
            className="text-primary hover:underline"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-4xl mx-auto pb-10 px-4 md:px-6 lg:px-8">
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
                  Edit Student
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-2xl shadow-lg shadow-foreground/5 border border-border overflow-hidden p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Edit Student
            </h1>
            <p className="text-muted-foreground mt-2">
              Update the student details as needed
            </p>
          </div>
          <StudentForm
            initialData={student}
            isEditing={true}
            onSuccess={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}
