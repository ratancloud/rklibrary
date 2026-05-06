import {
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Library,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl w-full space-y-8 pt-21">
        {/* Main Success Hero */}
        <Card className="border-none shadow-md bg-primary/5 overflow-hidden p-8 md:p-12 text-center relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>

          <div className="flex justify-center mb-6">
            <div className="bg-primary/20 p-5 rounded-full ring-8 ring-primary/5">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Registration Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome aboard! Your initial registration is complete. Please
              follow the steps below to finalize your admission and secure your
              spot.
            </p>
          </div>
        </Card>

        {/* Security Guarantee Banner */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
          <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full shrink-0">
            <ShieldCheck className="w-8 h-8 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
              100% Secure & Confidential
            </h3>
            <p className="text-green-800 dark:text-green-300 text-sm mt-1">
              Rest assured, all your uploaded documents and personal information
              are encrypted, strictly safe with us, and will never be shared.
            </p>
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            Your Next Steps
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2"></div>

            {/* Step 1 */}
            <Card className="p-6 text-center border-primary/20 bg-background shadow-sm relative">
              <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 ring-4 ring-background">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">1. Registered</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is created.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 text-center border-border hover:border-primary/50 transition-colors bg-background shadow-sm relative">
              <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 ring-4 ring-background">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                2. Meet the Owner
              </h3>
              <p className="text-sm text-muted-foreground">
                Visit or contact the library owner.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 text-center border-border hover:border-primary/50 transition-colors bg-background shadow-sm relative">
              <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 ring-4 ring-background">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                3. Book Your Seat
              </h3>
              <p className="text-sm text-muted-foreground">
                Select and reserve your desk.
              </p>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto px-10 h-12 text-base shadow-sm"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
