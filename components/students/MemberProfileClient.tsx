"use client";

import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import {
  ArrowLeft,
  Phone,
  MapPin,
  KeyRound,
  Calendar,
  AlertTriangle,
  Receipt,
  Building2,
  MessageCircle,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define Types based on the Prisma inclusion
type Shift = { id: string; name: string };
type SubShift = { shift: Shift };
type Seat = {
  id: string;
  seatNumber: string; /* Adjust based on your Seat model */
};

type Subscription = {
  id: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  status: string;
  seat: Seat;
  subscriptionShifts: SubShift[];
};

type StudentProfile = {
  id: string;
  memberId: string | null;
  name: string;
  gender: string;
  phoneNumber: string;
  address: string | null;
  lockerNumber: number | null;
  createdAt: Date;
  subscriptions: Subscription[];
};

interface MemberProfileProps {
  student: StudentProfile;
}

export default function MemberProfileClient({ student }: MemberProfileProps) {
  const getSubStatus = (sub: Subscription) => {
    const daysLeft = differenceInDays(new Date(sub.endDate), new Date());

    if (sub.status !== "ACTIVE" || daysLeft < 0) {
      return {
        label: "Expired",
        color: "bg-destructive/10 text-destructive border-destructive/20",
      };
    }
    if (daysLeft <= 3) {
      return {
        label: `Expires in ${daysLeft} days`,
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    }
    return {
      label: "Active",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const activeSub = student.subscriptions.find(
    (s) =>
      s.status === "ACTIVE" &&
      differenceInDays(new Date(s.endDate), new Date()) >= 0,
  );

  const sendWhatsapp = () => {
    const msg = encodeURIComponent(
      `Hello ${student.name}, this is a message regarding your library membership.`,
    );
    window.open(`https://wa.me/${student.phoneNumber}?text=${msg}`, "_blank");
  };

  return (
    <main className="min-h-screen w-full bg-background pb-12 relative">
      {/* Decorative Header Background */}
      <div className="absolute top-0 w-full h-72 bg-linear-to-b from-primary/10 to-transparent -z-10" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pt-24 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="rounded-xl border-border bg-background/50 backdrop-blur-sm"
            >
              <Link href="/admin/students">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Member Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                ID: {student.memberId || "Pending"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={sendWhatsapp}
              variant="outline"
              className="rounded-xl bg-background hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-colors"
            >
              <MessageCircle className="size-4 mr-2" /> Message
            </Button>
            <Button className="rounded-xl shadow-sm">Renew Membership</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Personal Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />

              <div className="flex flex-col items-center text-center mb-6">
                <div className="size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl shadow-inner mb-4 border-4 border-background">
                  {getInitials(student.name)}
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {student.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wider"
                  >
                    {student.gender}
                  </Badge>
                  {activeSub ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-md font-bold">
                      Active Member
                    </Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 px-2.5 py-0.5 rounded-md font-bold">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={student.phoneNumber}
                />
                <InfoRow
                  icon={KeyRound}
                  label="Locker"
                  value={
                    student.lockerNumber
                      ? `#${student.lockerNumber}`
                      : "Not Assigned"
                  }
                  highlight={!!student.lockerNumber}
                />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={student.address || "No address provided"}
                />
                <InfoRow
                  icon={Calendar}
                  label="Joined"
                  value={format(new Date(student.createdAt), "MMMM yyyy")}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Subscription History */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Receipt className="size-5 text-muted-foreground" />
              Subscription History
            </h3>

            {student.subscriptions.length === 0 ? (
              <div className="bg-muted/30 border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <div className="size-12 rounded-full bg-background border border-border flex items-center justify-center mb-3">
                  <AlertTriangle className="size-5 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">
                  No Booking History
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  This student hasn&apos;t booked any seats yet. Click &quot;Renew
                  Membership&quot; to start.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {student.subscriptions.map((sub, idx) => {
                  const status = getSubStatus(sub);
                  const isLatest = idx === 0;

                  return (
                    <div
                      key={sub.id}
                      className={cn(
                        "bg-card border rounded-2xl p-5 transition-all",
                        isLatest
                          ? "border-primary/30 shadow-sm ring-1 ring-primary/5"
                          : "border-border shadow-sm opacity-80 hover:opacity-100",
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "size-10 rounded-xl flex items-center justify-center",
                              isLatest
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <Building2 className="size-5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              Seat {sub.seat?.seatNumber || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              {format(new Date(sub.startDate), "MMM dd, yyyy")}{" "}
                              — {format(new Date(sub.endDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "w-max px-3 py-1 rounded-full font-bold border",
                            status.color,
                          )}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                        {/* Shifts */}
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Booked Shifts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {sub.subscriptionShifts.map((ss) => (
                              <span
                                key={ss.shift.id}
                                className="text-xs font-bold bg-muted text-foreground px-2.5 py-1 rounded-md border border-border"
                              >
                                {ss.shift.name.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className="sm:text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Payment Status
                          </p>
                          <div className="flex items-end sm:justify-end gap-2">
                            <span className="text-lg font-black text-foreground">
                              ₹{sub.amountPaid}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground mb-1">
                              / ₹{sub.totalAmount - (sub.discount || 0)}
                            </span>
                          </div>
                          {sub.amountPaid < (sub.totalAmount - (sub.discount || 0)) && (
                            <p className="text-xs font-bold text-destructive mt-1">
                              Due: ₹{(sub.totalAmount - (sub.discount || 0)) - sub.amountPaid}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Reusable micro-component for the profile card
function InfoRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            highlight ? "text-primary font-bold" : "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
