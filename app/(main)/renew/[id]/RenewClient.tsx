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
}

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
}

function formatShift(name: string) {
  return name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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
  const [submitting, setSubmitting] = useState(false);

  // Fetch prefill data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/subscriptions/${id}/renew`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json.subscription);
        setAmountPaid(json.subscription.pricePerMonth);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Computed values
  const totalAmount = data ? data.pricePerMonth * months : 0;
  const finalAmount = totalAmount - discount;
  const newStartDate = data ? new Date(data.newStartDate) : new Date();
  const newEndDate = addMonths(newStartDate, months);
  const isDue = amountPaid < finalAmount;

  const handleSubmit = async () => {
    if (!data) return;
    if (discount > totalAmount) {
      setError("Discount cannot exceed total amount.");
      return;
    }
    if (amountPaid > finalAmount) {
      setError("Amount paid cannot exceed final amount.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months, discount, amountPaid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to renew");
      toast.success("Subscription renewed successfully!");
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <RenewPageSkeleton />
    );
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
              <BreadcrumbPage className="text-primary">Renew Subscription</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: Student & Seat Details ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Card */}
            <div className="bg-white border border-primary/20 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-sm font-bold">👤</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">Student Information</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Name</p>
                  <p className="text-base font-semibold text-foreground">{data.studentName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                  <p className="text-base font-semibold text-foreground">{data.studentPhone}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Gender</p>
                  <p className="text-base font-semibold text-foreground capitalize">{data.studentGender}</p>
                </div>
                {data.studentAddress && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Address</p>
                    <p className="text-sm text-foreground line-clamp-2">{data.studentAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seat Details Card */}
            <div className="bg-white border border-primary/20 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-sm font-bold">🪑</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">Seat Information</h2>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Floor</p>
                  <p className="text-base font-semibold text-foreground">{data.floorName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Seat Number</p>
                  <p className="text-base font-semibold text-foreground">Seat {data.seatNo}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Shifts</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.shiftName.map((s) => (
                      <Badge
                        key={s}
                        className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-lg px-2.5 py-1 text-xs font-medium"
                      >
                        {formatShift(s)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Period Card */}
            <div className="bg-white border border-primary/20 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-sm font-bold">📅</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">Previous Period</h2>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Start Date</p>
                  <p className="text-base font-semibold text-foreground">{fmt(data.previousStartDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">End Date</p>
                  <p className="text-base font-semibold text-foreground">{fmt(data.previousEndDate)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                  <Badge
                    className={cn(
                      "text-xs font-bold border-0 w-fit",
                      data.previousStatus === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-700"
                        : "bg-slate-500/20 text-slate-700"
                    )}
                  >
                    {data.previousStatus}
                  </Badge>
                </div>
              </div>
              
              {data.previousStatus === "ACTIVE" && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Subscription is still active — new period will start on{" "}
                    <span className="font-bold">{fmt(data.newStartDate)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Renewal Form ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-primary/20 rounded-2xl p-8 shadow-sm space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-bold text-foreground">Renewal Details</h3>
                <Separator className="mt-4" />
              </div>

              {/* Period Summary */}
              <div className="space-y-3 bg-primary/5 rounded-xl border border-primary/10 p-5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New start</span>
                  <span className="text-sm font-semibold text-foreground text-right">{fmt(data.newStartDate)}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">New end</span>
                  <span className="text-sm font-semibold text-foreground text-right">{format(newEndDate, "dd MMM yyyy")}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Per month</span>
                  <span className="text-sm font-semibold text-foreground">₹{data.pricePerMonth.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center gap-2 bg-background rounded-lg px-4 py-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                  <span className="text-lg font-bold text-foreground">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center gap-2 bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-widest">Discount</span>
                    <span className="text-lg font-bold text-red-700">-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2 bg-primary/10 rounded-lg px-4 py-3 border border-primary/20 mt-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Final Total</span>
                  <span className="text-xl font-bold text-primary">₹{finalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Duration (months)
                </label>
                
                {/* Buttons */}
                <div className="flex items-center border border-primary/20 rounded-lg overflow-hidden bg-background">
                  <button
                    className="flex-1 px-3 py-3 text-base font-bold hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => {
                      const next = Math.max(1, months - 1);
                      setMonths(next);
                      setAmountPaid(data.pricePerMonth * next);
                    }}
                    disabled={months <= 1}
                  >
                    −
                  </button>
                  <div className="flex-1 text-center text-lg font-bold text-foreground py-3 border-x border-primary/20">
                    {months} <span className="text-xs font-normal text-muted-foreground">mo</span>
                  </div>
                  <button
                    className="flex-1 px-3 py-3 text-base font-bold hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMonths(m);
                        setAmountPaid(data.pricePerMonth * m);
                      }}
                      className={cn(
                        "px-3 py-2 text-xs font-semibold rounded-lg border transition-all",
                        months === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-primary/20 hover:bg-primary/5"
                      )}
                    >
                      {m}mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Collected */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Discount (₹)
                </label>
                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="number"
                    min={0}
                    max={totalAmount}
                    value={discount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setDiscount(Math.min(val, totalAmount));
                    }}
                    className="w-full pl-8 pr-3 py-2.5 border border-primary/20 bg-primary/5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Amount Collected */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Amount Collected (₹)
                </label>
                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="number"
                    min={0}
                    max={finalAmount}
                    value={amountPaid}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setAmountPaid(Math.min(val, finalAmount));
                    }}
                    className="w-full pl-8 pr-3 py-2.5 border border-primary/20 bg-primary/5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                {/* Status */}
                {isDue ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-800">
                      <span className="font-bold">₹{(finalAmount - amountPaid).toLocaleString("en-IN")}</span> pending
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-emerald-800">Fully paid</span>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="w-full h-11 font-bold rounded-lg shadow-sm shadow-primary/20"
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Renewing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    Confirm & Renew
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}