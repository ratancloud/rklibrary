"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LibrarySetupForm } from "@/components/setup/LibrarySetupForm";
import { LibrarySetupSkeleton } from "@/components/skelton/LibrarySetupSkeleton";
import { useLibraryStore } from "@/store/useLibraryStore";

const SetupPage = () => {
  const router = useRouter();
  const { data, isLoading, fetchAll } = useLibraryStore();
  const [isReady, setIsReady] = useState(false);

  // Handle Mounting and Initial Fetch
  useEffect(() => {
    const init = async () => {
      if (!data) {
        try {
          await fetchAll();
        } catch (err) {
          console.log("No existing library found, proceeding to setup.", err);
        }
      }
      setIsReady(true);
    };

    init();
  }, [data, fetchAll]);

  // Optimized Redirect Logic
  useEffect(() => {
    if (isReady && !isLoading && data) {
      router.replace("/settings");
    }
  }, [isReady, isLoading, data, router]);

  // 3. Loading State
  if (!isReady || (isLoading && !data)) {
    return (
      <main className="w-full min-h-screen bg-linear-to-b from-background via-background to-primary/5">
        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Loading Header */}
          <div className="text-center mb-10 pt-4">
            <p className="text-sm text-muted-foreground mt-6 animate-pulse">
              Setup page is loading...
            </p>
          </div>

          {/* Skeleton Form */}
          <LibrarySetupSkeleton />
        </div>
      </main>
    );
  }

  // 4. Prevent rendering the form if we are about to redirect
  if (data) return null;

  return (
    <main className="w-full min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      <div className="max-w-3xl mt-10 mx-auto p-4 md:p-6 lg:p-8">
        {/* Header with Animation */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-xs font-semibold text-primary tracking-wide">
                SETUP YOUR LIBRARY
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome to Library Manager
          </h1>
          <p className="text-muted-foreground text-lg">
            Let&apos;s set up your library information to get started
          </p>
        </div>

        {/* Setup Form */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LibrarySetupForm />
        </div>
      </div>
    </main>
  );
};

export default SetupPage;
