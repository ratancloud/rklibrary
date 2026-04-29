"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LibraryBasicDetails } from "@/components/settings/LibraryBasicDetails";
import { ShiftDetails } from "@/components/settings/ShiftDetails";
import { FloorsSection } from "@/components/settings/FloorsSection";
import { SettingsSkeleton } from "@/components/skelton/SettingsSkeleton";
import { useLibraryStore } from "@/store/useLibraryStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

export default function LibrarySettingsClient(){
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const {
    data,
    isLoading,
    fetchAll,
    updateLibraryInfo,
    syncFloors,
    syncShifts,
  } = useLibraryStore();

  // Unified initialization logic
  useEffect(() => {
    const initializeData = async () => {
      if (!data) {
        try {
          await fetchAll();
        } catch (err) {
          console.error("No library found or failed to fetch:", err);
        }
      }
      setIsReady(true);
    };

    initializeData();
  }, [data, fetchAll]);

  // Safely redirect if no data exists after loading
  useEffect(() => {
    if (isReady && !isLoading && !data) {
      router.replace("/setup");
    }
  }, [isReady, isLoading, data, router]);

  // Prevent rendering anything until client-side is ready to avoid hydration mismatch
  if (!isReady || (isLoading && !data)) {
    return <SettingsSkeleton />;
  }

  if (!data) return null;

  return (
    <main className="w-full min-h-screen bg-background">
      <div className="max-w-6xl mt-20 mx-auto p-4 md:p-6 lg:p-8">
        {/* Breadcrumb Navigation */}
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
              <BreadcrumbPage className="text-primary">Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Settings Cards */}
        <div className="space-y-8">
          {/* Library Basic Information */}
          <LibraryBasicDetails
            data={data}
            isLoading={isLoading}
            onSave={updateLibraryInfo}
          />

          {/* Infrastructure: Floors */}
          <FloorsSection
            floors={data.floors || []}
            onSyncFloors={(floors) => syncFloors(data.id, floors)}
            isLoading={isLoading}
          />

          {/* Shift Configuration */}
          <ShiftDetails
            shifts={data.shifts || []}
            onSyncShifts={(shifts) => syncShifts(data.id, shifts)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
};
