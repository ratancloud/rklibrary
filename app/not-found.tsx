import { Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-8xl font-black text-primary tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-bold text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground text-lg">
            Oops! The page you are looking for doesn&apos;t exist or has been moved to a new address.
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="pt-4">
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 shadow-sm"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}