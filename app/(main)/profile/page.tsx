import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile | RKLibrary",
  description: "Manage your administrator profile, password, and active sessions",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/30 to-background">
      <ProfileClient />
    </div>
  );
}