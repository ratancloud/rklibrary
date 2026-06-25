"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, addMonths } from "date-fns";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  Home,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Lock,
  ArrowRight,
  Receipt,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { RenewPageSkeleton } from "@/components/skelton/RenewPageSkeleton";
import { toast } from "sonner";

interface RenewData {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentGender: string;
  studentAddress: string | null;
  floorName: string;
  seatNo: number;
  shiftName: string[];
  previousStartDate: string | null;
  previousEndDate: string | null;
  previousStatus: "ACTIVE" | "EXPIRED";
  newStartDate: string;
  pricePerMonth: number;
  lockerAmount: number;
  lockerNumber: string | null;
}

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
}

function formatShift(name: string) {
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RenewClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<RenewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [months, setMonths] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [lockerAmount, setLockerAmount] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch prefill data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/subscriptions/${id}/renew`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json.subscription);
        setLockerAmount(json.subscription.lockerAmount || 0);
        setAmountPaid(json.subscription.pricePerMonth);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Computed values
  const totalAmount = data ? data.pricePerMonth * months : 0;
  const finalSeatAmount = totalAmount - discount;
  const newStartDate = data ? new Date(data.newStartDate) : new Date();
  const newEndDate = addMonths(newStartDate, months);

  const totalPayable = finalSeatAmount + lockerAmount;
  const totalCollected = amountPaid + lockerAmount;
  const seatDue = finalSeatAmount - amountPaid;

  const handleOpenPreview = () => {
    if (!data) return;
    if (discount > totalAmount) {
      setError("Discount cannot exceed total seat amount.");
      return;
    }
    if (amountPaid > finalSeatAmount) {
      setError("Seat amount paid cannot exceed the final seat amount.");
      return;
    }
    setError(null);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async () => {
    if (!data) return;
    setSubmitting(true);
    setError(null);

    try {
      console.log({ months, discount, amountPaid, lockerAmount });
      
      const res = await fetch(`/api/subscriptions/${id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months, discount, amountPaid, lockerAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to renew");

      setIsPreviewOpen(false);
      toast.success("Subscription renewed successfully!");
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setIsPreviewOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return <RenewPageSkeleton />;
  }

  // ── Error ──
  if (error && !data) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <p className="text-base font-semibold text-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mt-24">
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
              <BreadcrumbPage className="text-primary font-medium">
                Renew Subscription
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ── LEFT COLUMN: Context (Student, Seat, Previous) ── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />

              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Subscriber Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Student Name
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {data.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-base font-medium text-slate-900">
                      {data.studentPhone}
                    </p>
                  </div>
                </div>
                {data.studentAddress && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Address
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-700">
                        {data.studentAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Seat
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {data.floorName}, Seat {data.seatNo}
                  </p>
                </div>

                {/* ── Locker Number Added Here ── */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Locker
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {data.lockerNumber ? `#${data.lockerNumber}` : "—"}
                  </p>
                </div>

                <div className="col-span-2 mt-2 sm:mt-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Enrolled Shifts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.shiftName.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 font-medium"
                      >
                        {formatShift(s)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Period Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                Previous Subscription
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {fmt(data.previousStartDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    End Date
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {fmt(data.previousEndDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Status
                  </p>
                  <Badge
                    className={cn(
                      "text-xs font-bold border-0 shadow-none",
                      data.previousStatus === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {data.previousStatus}
                  </Badge>
                </div>
              </div>

              {data.previousStatus === "ACTIVE" && (
                <div className="mt-5 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    The current subscription is still active. This renewal will
                    automatically begin on{" "}
                    <span className="font-semibold">
                      {fmt(data.newStartDate)}
                    </span>{" "}
                    to ensure continuous access.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Configuration Form ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-primary/10 overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-primary/10">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Configure Renewal
                </h3>
              </div>

              <div className="p-6 space-y-7">
                {/* Duration */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>Duration</span>
                    <span className="text-primary capitalize text-[11px] bg-primary/10 px-2 py-0.5 rounded-md">
                      ₹{data.pricePerMonth}/mo
                    </span>
                  </label>

                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-12 shadow-sm">
                    <button
                      className="w-14 h-full text-xl font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-30"
                      onClick={() => {
                        const next = Math.max(1, months - 1);
                        setMonths(next);
                        setAmountPaid(data.pricePerMonth * next);
                      }}
                      disabled={months <= 1}
                    >
                      −
                    </button>
                    <div className="flex-1 text-center font-semibold text-lg text-slate-900 border-x border-slate-200 bg-white h-full flex items-center justify-center">
                      {months}{" "}
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        Months
                      </span>
                    </div>
                    <button
                      className="w-14 h-full text-xl font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-30"
                      onClick={() => {
                        const next = Math.min(12, months + 1);
                        setMonths(next);
                        setAmountPaid(data.pricePerMonth * next);
                      }}
                      disabled={months >= 12}
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Select */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[1, 2, 3, 6].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setMonths(m);
                          setAmountPaid(data.pricePerMonth * m);
                        }}
                        className={cn(
                          "py-2 text-xs font-medium rounded-lg border transition-all duration-200",
                          months === m
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                        )}
                      >
                        {m} mo
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Financial Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locker Fee
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        value={lockerAmount === 0 ? "" : lockerAmount}
                        onChange={(e) =>
                          setLockerAmount(
                            Math.max(
                              0,
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value),
                            ),
                          )
                        }
                        disabled = {data.lockerNumber ? false : true}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="0"
                      />
                    </div>
                    {data.lockerNumber === null && (
                      <p className="text-xs text-slate-400">
                        No locker assigned. You can leave this as 0.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Discount
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min={0}
                        max={totalAmount}
                        value={discount === 0 ? "" : discount}
                        onChange={(e) =>
                          setDiscount(
                            Math.min(
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value),
                              totalAmount,
                            ),
                          )
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Seat Amount Paid
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      Max: ₹{finalSeatAmount}
                    </span>
                  </div>
                  <div className="relative">
                    <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      max={finalSeatAmount}
                      value={amountPaid === 0 ? "" : amountPaid}
                      onChange={(e) =>
                        setAmountPaid(
                          Math.min(
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value),
                            finalSeatAmount,
                          ),
                        )
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-lg font-bold text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="0"
                    />
                  </div>
                  {seatDue > 0 && (
                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1.5 ml-1">
                      <AlertCircle className="w-3.5 h-3.5" /> ₹
                      {seatDue.toLocaleString("en-IN")} seat balance will remain
                      pending
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleOpenPreview}
                  className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
                >
                  Review Renewal
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW DIALOG (MODAL) ── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-106.25 p-0 overflow-hidden bg-white rounded-2xl">
          <div className="bg-primary/5 p-6 border-b border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-slate-900">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Confirm Renewal
              </DialogTitle>
              <DialogDescription className="text-slate-500 pt-1">
                Please verify the subscription details before processing the
                payment.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Context Summary */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {data.studentName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seat {data.seatNo} • {data.floorName} • {data.lockerNumber ? `Locker #${data.lockerNumber}` : "No Locker"}
                </p>
              </div>
            </div>

            {/* Date Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Subscription Period
              </h4>
              <div className="flex items-center justify-between text-sm font-medium text-slate-900">
                <span>{fmt(data.newStartDate)}</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <span>{format(newEndDate, "dd MMM yyyy")}</span>
              </div>
              <p className="text-xs text-slate-500 text-right">
                {months} Month(s)
              </p>
            </div>

            <Separator />

            {/* Invoice Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Payment Summary
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Seat Fee
                  </span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>

                {lockerAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Locker Add-on</span>
                    <span>₹{lockerAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount applied</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-between font-bold text-slate-900 text-base border-t border-dashed border-slate-200 mt-2">
                  <span>Total Payable</span>
                  <span>₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Collection Summary */}
            <div className="bg-slate-900 text-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-sm">
                  Amount Collected Now
                </span>
                <span className="text-xl font-bold">
                  ₹{totalCollected.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>
                  (Seat: ₹{amountPaid} + Locker: ₹{lockerAmount})
                </span>
                {seatDue > 0 ? (
                  <span className="text-amber-400">Dues Balance: ₹{seatDue}</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Fully Paid
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2">
            <Button
              variant="ghost"
              className="text-slate-500 hover:text-slate-900"
              onClick={() => setIsPreviewOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="min-w-35 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                "Confirm & Renew"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
