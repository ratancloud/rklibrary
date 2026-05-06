"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegistrationLinkGenerator({
  libraryId,
}: {
  libraryId: string;
}) {
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  const registrationLink = `${baseUrl}/new-registration?libraryId=${libraryId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      toast.success("Registration link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className="border-0 bg-muted/40">
      <CardHeader>
        <CardTitle className="text-lg">Student Registration Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share this link with your students so they can self-register. The link
          will automatically associate them with your library.
        </p>

        <div className="space-y-2">
          <Label htmlFor="registration-link" className="text-sm font-medium">
            Registration Link
          </Label>
          <div className="flex gap-2">
            <Input
              id="registration-link"
              value={registrationLink}
              readOnly
              className="bg-background"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">
            How to use:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Copy the link above</li>
            <li>
              • Share it with your students via email, WhatsApp, or social media
            </li>
            <li>
              • Students click the link and fill out the registration form
            </li>
            <li>
              • You can view and manage registrations in the Students section
            </li>
            <li>
              • Approve students and assign them to seats after verification
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
