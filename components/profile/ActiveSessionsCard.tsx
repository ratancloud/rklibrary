"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, LogOut, Laptop, Smartphone, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formateIndDate } from "@/lib/helper";

type Session = typeof authClient.$Infer.Session.session;

interface ActiveSessionsCardProps {
  currentSessionId: string;
  enabled?: boolean;
}

export default function ActiveSessionsCard({
  currentSessionId,
}: ActiveSessionsCardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await authClient.listSessions();
        if (res.data) setSessions(res.data);
      } catch {
        toast.error("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const revokeSession = async (token: string, id: string) => {
    setRevokingId(id);
    const { error } = await authClient.revokeSession({ token });
    setRevokingId(null);

    if (error) return toast.error(error.message || "Failed to revoke");

    toast.success("Session revoked");
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Card className="rounded-3xl bg-white inset-ring-1 inset-ring-gray-200/60 shadow-sm border-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 bg-gray-50/50 border-b border-gray-100">
        <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
          <Shield className="size-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-950">Active Sessions</h3>
          <p className="text-sm text-gray-500">Manage devices logged into your account</p>
        </div>
      </div>

      {/* Content */}
      <CardContent className="px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No active sessions found.
          </p>
        ) : (
          sessions.map((s) => {
            const isCurrent = s.id === currentSessionId;
            const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(s.userAgent || "");

            const browser = s.userAgent?.includes("Chrome") ? "Chrome"
              : s.userAgent?.includes("Firefox") ? "Firefox"
              : s.userAgent?.includes("Edg") ? "Edge"
              : s.userAgent?.includes("Safari") ? "Safari"
              : "Unknown";

            const expiry = formateIndDate(s.expiresAt);

            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white inset-ring-1 inset-ring-gray-200 px-5 py-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Left */}
                <div className="flex items-center gap-5">
                  <div className="size-12 rounded-xl bg-gray-50 inset-ring-1 inset-ring-gray-100 flex items-center justify-center">
                    {isMobile ? (
                      <Smartphone className="size-6 text-gray-700" />
                    ) : (
                      <Laptop className="size-6 text-gray-700" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-bold text-gray-950">
                        {isMobile ? "Mobile Device" : "Desktop Device"}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {browser} &bull; IP {s.ipAddress || "127.0.0.1"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Expires: <span className="font-medium text-gray-600">{expiry}</span>
                    </p>
                  </div>
                </div>

                {/* Action */}
                {!isCurrent && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-10 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => revokeSession(s.token, s.id)}
                    disabled={revokingId === s.id}
                    aria-label="Logout session"
                  >
                    {revokingId === s.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}