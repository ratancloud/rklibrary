"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import ProfileHeroCard from "@/components/profile/ProfileHeroCard";
import ActiveSessionsCard from "@/components/profile/ActiveSessionsCard";
import { toast } from "sonner";
import ProfilePageSkeleton from "@/components/skelton/ProfilePageSkeleton";

export default function ProfileClient() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
  });

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (isPending) return;

    if (!data?.user) {
      toast.error("Please sign in.");
      router.replace("/login");
    }
  }, [data, isPending, router]);

  /* ---------- Password Change ---------- */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.current.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passwordData.new.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await authClient.changePassword({
      currentPassword: passwordData.current,
      newPassword: passwordData.new,
      revokeOtherSessions: true,
    });

    setIsUpdatingPassword(false);

    if (error) {
      toast.error(error.message || "Update failed");
      return;
    }

    toast.success("Password updated. Other sessions revoked.");
    setPasswordData({ current: "", new: "" });
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ProfilePageSkeleton />
      </div>
    );
  }

  if (!data?.user || !data.session) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-8 pt-24 lg:pt-30">
      {/* Profile Hero Section */}
      <ProfileHeroCard
        name={data.user.name || "Administrator"}
        email={data.user.email}
        emailVerified={data.user.emailVerified}
        role="Library Administrator"
        createdAt={new Date(data.user.createdAt)}
        image={data.user.image}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Active Sessions */}
        <div className="lg:col-span-1">
          <ActiveSessionsCard currentSessionId={data.session.id} />
        </div>

        {/* Right Column - Security Settings */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl bg-linear-to-br from-card to-muted/20 border border-border/60 shadow-lg overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-5 bg-linear-to-r from-orange-500/10 to-transparent border-b border-border/40">
              <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600">
                <Key className="size-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Password & Security
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure your account and manage active sessions
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange}>
              <CardContent className="px-6 py-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-foreground font-semibold text-base">
                        Current Password
                      </Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 rounded-xl bg-muted/30 border-border/60 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:bg-background transition-colors"
                        value={passwordData.current}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground font-semibold text-base">
                        New Password
                      </Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        minLength={8}
                        className="h-12 rounded-xl bg-muted/30 border-border/60 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:bg-background transition-colors"
                        value={passwordData.new}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs font-medium text-muted-foreground">
                        Minimum 8 characters required for security.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900">
                      💡 Changing your password will revoke all other active
                      sessions for security purposes.
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/40 bg-muted/30 px-6 py-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  size="lg"
                  className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="size-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
