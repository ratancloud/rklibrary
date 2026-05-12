
import {
  User,
  AlertCircle,
  Timer,
  Loader2,
  Trash2,
  RotateCcw,
  Phone,
  Calendar,
  CreditCard,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { formatMemberId } from "@/lib/helper";
import { format } from "date-fns";
import { formatShiftName, getDaysRemaining, getSubscriptionStatus, SeatInfo } from "@/types/seatMapTypes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";


export function ShiftCard({
  shiftName,
  shiftData,
  isInactive,
  seatId,
  compact = false,
}: {
  shiftName: string;
  shiftData: NonNullable<SeatInfo["shifts"][string]>;
  isInactive: boolean;
  seatId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [showDissociate, setShowDissociate] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);

  const status = getSubscriptionStatus(shiftData.expiry);
  const daysInfo = getDaysRemaining(shiftData.expiry);

  const handleDissociate = async () => {
    if (!shiftData.subscriptionId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/library/remove-seat", {
        method: "DELETE",
        body: JSON.stringify({ seatId: seatId, shiftName: shiftName }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setActionMsg({ text: "Seat dissociated successfully", ok: true });
      setTimeout(() => router.refresh(), 1200);
    } catch (e) {
      setActionMsg({
        text: e instanceof Error ? e.message : "Error",
        ok: false,
      });
    } finally {
      setDeleteLoading(false);
      setShowDissociate(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border space-y-3 transition-colors",
        compact ? "p-3" : "p-4",
        isInactive
          ? "bg-slate-500/5 border-slate-400/20 opacity-70"
          : status === "active"
            ? "bg-emerald-500/8 border-emerald-500/25"
            : "bg-amber-500/8 border-amber-500/25",
      )}
    >
      {/* Shift name + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-foreground">
          {formatShiftName(shiftName)}
        </span>
        <Badge
          className={cn(
            "text-[10px] font-bold shrink-0",
            isInactive
              ? "bg-slate-500 text-white"
              : status === "active"
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white",
          )}
        >
          {isInactive ? "Inactive" : status === "active" ? "Active" : "Expired"}
        </Badge>
      </div>

      {/* Student details */}
      <div className="space-y-0.5 bg-background/70 rounded-lg border border-border/40 px-3 divide-y divide-border/40">
        {/* Member ID - clickable */}
        <div className="flex items-center gap-3 py-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CreditCard size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Member ID
            </p>
            <button
              onClick={() => router.push(`/student/${shiftData.studentId}`)}
              className="text-sm font-bold text-primary hover:underline font-mono flex items-center gap-0.5 group"
            >
              {formatMemberId(shiftData.memberId)}
              <ChevronRight
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="flex items-center gap-3 py-2.5">
          <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <User size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Student
            </p>
            <button
              onClick={() => router.push(`/student/${shiftData.studentId}`)}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block text-left w-full"
            >
              {shiftData.studentName}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 py-2.5">
          <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Phone size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Phone
            </p>
            <p className="text-sm font-semibold text-foreground">
              {shiftData.studentPhone}
            </p>
          </div>
        </div>

        {/* Gender */}
        <div className="flex items-center gap-3 py-2.5">
          <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <User size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Gender
            </p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {shiftData.studentGender}
            </p>
          </div>
        </div>

        {/* Start date */}
        {shiftData.startDate && (
          <div className="flex items-center gap-3 py-2.5">
            <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <Calendar size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Start date
              </p>
              <p className="text-sm font-semibold text-foreground">
                {format(new Date(shiftData.startDate), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        )}

        {/* End date */}
        {shiftData.expiry && (
          <div className="flex items-center gap-3 py-2.5">
            <div
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                status === "active"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600",
              )}
            >
              <Timer size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Expires
              </p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  status === "active" ? "text-emerald-700" : "text-amber-700",
                )}
              >
                {format(new Date(shiftData.expiry), "dd MMM yyyy")}
                {daysInfo && (
                  <span className="text-xs ml-1.5 font-medium opacity-80">
                    ({daysInfo.text})
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Due amount */}
        {shiftData.isDue && (
          <div className="flex items-center gap-3 py-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Payment
              </p>
              <p className="text-sm font-bold text-rose-600">Amount Due</p>
            </div>
          </div>
        )}
      </div>

      {/* Action message */}
      {actionMsg && (
        <div
          className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium border",
            actionMsg.ok
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
              : "bg-red-500/10 text-red-700 border-red-500/20",
          )}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Confirmation panels */}
      {showDissociate && (
        <DissociateConfirm
          loading={deleteLoading}
          onConfirm={handleDissociate}
          onCancel={() => setShowDissociate(false)}
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs gap-1.5 text-destructive border-destructive/25 hover:bg-destructive/8 hover:border-destructive/40"
          onClick={() => setShowDissociate(true)}
        >
          <Trash2 size={11} />
          Remove
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs gap-1.5 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/8 hover:border-emerald-500/40"
          onClick={() => router.push(`/renew/${shiftData.subscriptionId}`)}
        >
          <RotateCcw size={11} />
          Renew
        </Button>
      </div>
    </div>
  );
}


// ── Dissociate confirmation toggle ────────────────────────────────────────────
function DissociateConfirm({
  loading,
  onConfirm,
  onCancel,
}: {
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Dissociate this seat?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The student will be removed from this seat. Their subscription
            record will remain but the seat assignment will be cleared.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs bg-destructive hover:bg-destructive/90 text-white"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              <Trash2 size={12} className="mr-1" />
              Confirm Remove
            </>
          )}
        </Button>
      </div>
    </div>
  );
}