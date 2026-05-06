"use client";

import { useSearchParams } from "next/navigation";
import StudentRegisterForm from "@/components/publicStudent/StudentRegisterForm";
import { Card } from "@/components/ui/card";

export default function NewRegistrationContent() {
  const searchParams = useSearchParams();
  const libraryId = searchParams.get("libraryId");

  return (
    <>
      {libraryId ? (
        <StudentRegisterForm libraryId={libraryId} />
      ) : (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-amber-900 text-sm">
            <span className="font-semibold">Library Not Found:</span> Please use a valid registration link provided by your library.
          </p>
        </Card>
      )}
    </>
  );
}
