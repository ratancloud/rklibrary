"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, addMonths } from "date-fns";
import {
  CheckCircle2,
  Loader2,
  IndianRupee,
  Home,
  User,
  Phone,
  Calendar,
  CreditCard,
  Lock,
  ArrowRight,
  Receipt,
  Armchair,
  Clock,
  Search,
  Box,
  ChevronRight,
  X,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMemberId } from "@/lib/helper";

// ─── Interfaces ────────────────────────────────────────────────────────────
interface OccupiedBy {
  studentId: string;
  studentName: string;
  memberId: number;
  phoneNumber: string;
  gender: string;
  activeSubscription: {
    id: string; endDate: string; totalAmount: number; amountPaid: number; isDue: boolean;
  } | null;
  subscriptionExpired: boolean;
}
interface ShiftAvailability {
  id: string; name: string; startTime: number; endTime: number;
  price: number; isActive: boolean; isOccupied: boolean; occupiedBy: OccupiedBy | null;
}
interface SeatInfo {
  id: string; seatNo: number; isActive: boolean; floorId: string; floorName: string;
}
interface StudentResult {
  id: string; name: string; memberId: number; phoneNumber: string;
  gender: string; address: string | null;
  currentSeats: { seatNo: number; floorName: string; shiftName: string }[];
}

// ─── Utilities ─────────────────────────────────────────────────────────────
const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

// ─── Skeleton ──────────────────────────────────────────────────────────────
function BookingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6">
      <Skeleton className="h-5 w-48 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-5"><Skeleton className="h-[480px] w-full rounded-2xl" /></div>
      </div>
    </div>
  );
}

// ─── Shift Card (memoised) ─────────────────────────────────────────────────
const ShiftCard = memo(function ShiftCard({
  shift, isSelected, onToggle,
}: { shift: ShiftAvailability; isSelected: boolean; onToggle: () => void }) {
  const disabled = shift.isOccupied || !shift.isActive;
  const isExpired = shift.occupiedBy?.subscriptionExpired;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        disabled
          ? "bg-muted/20 border-border opacity-50 cursor-not-allowed"
          : isSelected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/30 hover:bg-muted/20 cursor-pointer"
      )}
      aria-pressed={isSelected}
    >
      {/* Selected indicator */}
      {isSelected && (
        <CheckCircle2 className="absolute top-3 right-3 text-primary" size={15} strokeWidth={2.5} />
      )}

      {/* Name + badges */}
      <div className="flex items-center gap-2 pr-6 mb-1.5">
        <span className="font-bold text-foreground text-sm">{shift.name}</span>
        {!shift.isActive && (
          <span className="text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wide">
            Inactive
          </span>
        )}
      </div>

      {/* Time */}
      <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium mb-3">
        <Clock size={10} className="text-primary/50" />
        {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
      </p>

      {/* Price / status bar */}
      <div className="pt-2.5 border-t border-border/50 flex items-center justify-between">
        {shift.isOccupied ? (
          <div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              isExpired
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
            )}>
              {isExpired ? "Expired" : "Occupied"}
            </span>
            {shift.occupiedBy && (
              <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[140px]">
                {shift.occupiedBy.studentName}
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm font-extrabold text-foreground">
            ₹{shift.price.toLocaleString("en-IN")}
            <span className="text-[11px] text-muted-foreground font-normal ml-0.5">/mo</span>
          </span>
        )}
        {!disabled && !isSelected && (
          <span className="text-[10px] text-primary font-semibold opacity-0 group-hover:opacity-100">Select</span>
        )}
      </div>
    </button>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────
export default function BookingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const seatId = searchParams.get("seatId") || "";
  const seatNo = searchParams.get("seatNo") || "";
  const floorName = searchParams.get("floorName") ? decodeURIComponent(searchParams.get("floorName")!) : "";
  const urlShift = searchParams.get("shift") || "";
  const initialDate = searchParams.get("date") ?? new Date().toLocaleDateString("en-CA");

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
  const [shifts, setShifts] = useState<ShiftAvailability[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Form
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(initialDate);
  const [months, setMonths] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // Locker
  const [wantsLocker, setWantsLocker] = useState(false);
  const [lockerNumber, setLockerNumber] = useState<number | "">("");
  const [lockerAmount, setLockerAmount] = useState(0);

  // ── Computed ──
  const selectedShiftData = useMemo(() => shifts.filter(s => selectedShifts.includes(s.id)), [shifts, selectedShifts]);
  const monthlyShiftsTotal = useMemo(() => selectedShiftData.reduce((sum, s) => sum + s.price, 0), [selectedShiftData]);
  const seatTotalAmount = monthlyShiftsTotal * months;
  const finalSeatAmount = Math.max(0, seatTotalAmount - discount);
  const actualLockerAmount = wantsLocker ? lockerAmount : 0;
  const totalPayable = finalSeatAmount + actualLockerAmount;
  const totalCollected = amountPaid + actualLockerAmount;
  const seatDue = finalSeatAmount - amountPaid;
  const parsedStartDate = new Date(startDate);
  const newEndDate = addMonths(parsedStartDate, months);

  // ── Dropdown close on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node))
        setIsSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Initial data fetch ──
  useEffect(() => {
    if (!seatId) {
      toast.error("No seat selected. Please go back and choose a seat.");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/booking/seat-availability?seatId=${seatId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSeatInfo(data.data.seat);
        setShifts(data.data.shifts);
        if (urlShift) {
          const match = data.data.shifts.find((s: ShiftAvailability) => s.name === urlShift && !s.isOccupied && s.isActive);
          if (match) setSelectedShifts([match.id]);
        }
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [seatId, urlShift]);

  // ── Debounced student search ──
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  // ── Toggle shift ──
  const toggleShift = useCallback((id: string) => {
    setSelectedShifts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  // Auto-set amount paid when discount or total changes
  useEffect(() => {
    setAmountPaid(prev => Math.min(prev, finalSeatAmount));
  }, [finalSeatAmount]);

  // ── Open Preview with toast errors ──
  const handleOpenPreview = () => {
    if (selectedShifts.length === 0) { toast.error("Please select at least one shift."); return; }
    if (!selectedStudent) { toast.error("Please search and assign a student."); return; }
    if (wantsLocker && !lockerNumber) { toast.error("Please enter a locker number."); return; }
    if (discount > seatTotalAmount) { toast.error("Discount cannot exceed total seat amount."); return; }
    if (amountPaid > finalSeatAmount) { toast.error("Amount paid cannot exceed the final seat amount."); return; }
    setIsPreviewOpen(true);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatId,
          studentId: selectedStudent!.id,
          shiftIds: selectedShifts,
          startDate,
          endDate: newEndDate.toISOString().split("T")[0],
          totalAmount: seatTotalAmount,
          discount,
          amountPaid,
          lockerNumber: wantsLocker ? lockerNumber : undefined,
          lockerAmount: actualLockerAmount,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to book seat");
      setIsPreviewOpen(false);
      toast.success("Seat booked successfully!");
      router.push("/seat-map");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setIsPreviewOpen(false);
    } finally { setSubmitting(false); }
  };

  if (loading) return <BookingSkeleton />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Page Header ── */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/"><Home className="w-4 h-4" /></Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/seat-map">Seat Map</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary font-semibold">New Booking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-7 space-y-4">

          {/* ── STEP 1: Assign Student ── */}
          <section aria-label="Step 1: Assign Student" className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-3">
              <span className={cn(
                "w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0",
                selectedStudent ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
              )}>
                {selectedStudent ? <CheckCircle2 size={13} /> : "1"}
              </span>
              <h3 className="font-bold text-foreground text-sm flex-1">Assign Student</h3>
              {selectedStudent && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Selected</span>
              )}
            </div>

            <div className="p-5" ref={searchContainerRef}>
              {selectedStudent ? (
                /* ── Selected student card ── */
                <div className="relative flex items-center gap-3.5 p-3.5 rounded-xl border-2 border-primary/25 bg-gradient-to-r from-primary/5 to-transparent">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0 font-black text-primary text-sm">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm leading-none truncate">{selectedStudent.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                        {formatMemberId(selectedStudent.memberId)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Phone size={10} />{selectedStudent.phoneNumber}
                      </span>
                      {selectedStudent.currentSeats.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                          <AlertTriangle size={9} /> Already Seated
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Change */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Change student"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* ── Search ── */
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    autoComplete="off"
                    className="w-full pl-10 pr-9 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    placeholder="Search by name or phone…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                  {searching && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}

                  {/* Dropdown */}
                  {isSearchFocused && searchQuery.length >= 2 && (
                    <div className="absolute top-full mt-1.5 w-full bg-popover border border-border shadow-xl rounded-xl max-h-[240px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                      {searchResults.length === 0 && !searching ? (
                        <div className="py-8 text-center">
                          <User className="w-7 h-7 text-muted-foreground mx-auto mb-2 opacity-30" />
                          <p className="text-xs text-muted-foreground">No students found</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-border">
                          {searchResults.map(student => (
                            <li key={student.id}>
                              <button
                                type="button"
                                onClick={() => { setSelectedStudent(student); setSearchQuery(""); setIsSearchFocused(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-muted/60 flex justify-between items-center transition-colors group"
                              >
                                <div>
                                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {student.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {formatMemberId(student.memberId)} · {student.phoneNumber}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {student.currentSeats.length > 0 && (
                                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                                      Seated
                                    </span>
                                  )}
                                  <ChevronRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── STEP 2: Select Shifts ── */}
          <section aria-label="Step 2: Select Shifts" className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-3">
              <span className={cn(
                "w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0",
                selectedShifts.length > 0 ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
              )}>
                {selectedShifts.length > 0 ? <CheckCircle2 size={13} /> : "2"}
              </span>
              <h3 className="font-bold text-foreground text-sm flex-1">Select Shifts</h3>
              {selectedShifts.length > 0 && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {selectedShifts.length} · ₹{monthlyShiftsTotal.toLocaleString("en-IN")}/mo
                </span>
              )}
            </div>
            <div className="p-5">
              {shifts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No shifts available for this seat.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {shifts.map(shift => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      isSelected={selectedShifts.includes(shift.id)}
                      onToggle={() => toggleShift(shift.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── STEP 3: Locker (optional) ── */}
          <section
            aria-label="Step 3: Locker (optional)"
            className={cn("bg-card rounded-2xl border shadow-sm transition-colors duration-200", wantsLocker ? "border-primary/30" : "border-border")}
          >
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-muted border border-border text-muted-foreground text-[11px] font-black flex items-center justify-center shrink-0">3</span>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-sm leading-none">
                  Locker <span className="text-[10px] font-normal text-muted-foreground">optional</span>
                </h3>
              </div>
              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0" aria-label="Enable locker">
                <input type="checkbox" className="sr-only peer" checked={wantsLocker} onChange={e => { setWantsLocker(e.target.checked); if (!e.target.checked) { setLockerNumber(""); setLockerAmount(0); } }} />
                <div className="w-9 h-5 rounded-full bg-muted border border-border peer-checked:bg-primary transition-colors duration-200">
                  <div className={cn("mt-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ml-0.5", wantsLocker ? "translate-x-4" : "translate-x-0")} />
                </div>
              </label>
            </div>

            {wantsLocker && (
              <div className="p-5 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="grid grid-cols-2 gap-4">
                  {/* Locker Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Box size={10} /> Locker No.
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                      placeholder="e.g. 12"
                      value={lockerNumber}
                      onChange={e => setLockerNumber(e.target.value === "" ? "" : parseInt(e.target.value))}
                      onWheel={e => e.currentTarget.blur()}
                    />
                  </div>
                  {/* Locker Fee */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Lock size={10} /> Locker Fee
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number" min={0}
                        value={lockerAmount === 0 ? "" : lockerAmount}
                        onChange={e => setLockerAmount(Math.max(0, e.target.value === "" ? 0 : parseInt(e.target.value)))}
                        onWheel={e => e.currentTarget.blur()}
                        className="w-full pl-8 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* ═══ RIGHT COLUMN: Configure Booking (sticky) ═══ */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 bg-card rounded-2xl border border-border shadow-lg overflow-hidden">

            {/* Panel header */}
            <div className="px-5 py-4 border-b border-border bg-gradient-to-br from-primary/10 to-primary/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm leading-none">Configure Booking</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Set duration & payment</p>
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input type="date"
                    className="w-full pl-8 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
                  {monthlyShiftsTotal > 0 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      ₹{monthlyShiftsTotal.toLocaleString("en-IN")}/mo
                    </span>
                  )}
                </div>
                {/* Stepper */}
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-muted/20 h-10">
                  <button type="button" className="w-11 h-full text-base font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                    onClick={() => setMonths(n => Math.max(1, n - 1))} disabled={months <= 1}>−</button>
                  <div className="flex-1 text-center font-bold text-foreground border-x border-border bg-background h-full flex items-center justify-center gap-1">
                    <span>{months}</span><span className="text-xs font-normal text-muted-foreground">Mo</span>
                  </div>
                  <button type="button" className="w-11 h-full text-base font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                    onClick={() => setMonths(n => Math.min(12, n + 1))} disabled={months >= 12}>+</button>
                </div>
                {/* Quick pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 6].map(m => (
                    <button key={m} type="button"
                      onClick={() => setMonths(m)}
                      className={cn("py-1.5 text-xs font-semibold rounded-lg border transition-all",
                        months === m ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border hover:bg-muted")}>
                      {m} mo
                    </button>
                  ))}
                </div>
                {/* Date range preview */}
                {startDate && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5 border border-border">
                    <span className="font-medium">{format(parsedStartDate, "dd MMM yyyy")}</span>
                    <ArrowRight size={11} className="opacity-40" />
                    <span className="font-medium">{format(newEndDate, "dd MMM yyyy")}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* ── Payment section ── */}
              {/* Ordered: seat subscription → locker → discount → paid */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Payment Details</p>

                {/* Seat subscription total (read-only display) */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Armchair size={12} /> Seat ({months} mo)
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {seatTotalAmount > 0 ? `₹${seatTotalAmount.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>

                {/* Locker amount display (read-only if enabled) */}
                {wantsLocker && (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Box size={12} /> Locker Add on
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {actualLockerAmount > 0 ? `₹${actualLockerAmount.toLocaleString("en-IN")}` : "—"}
                    </span>
                  </div>
                )}

                {/* Discount input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Discount
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="number" min={0} max={seatTotalAmount}
                      value={discount === 0 ? "" : discount}
                      onChange={e => {
                        const v = e.target.value === "" ? 0 : parseInt(e.target.value);
                        const clamped = Math.min(v, seatTotalAmount);
                        setDiscount(clamped);
                        // auto-apply: fill paid = finalSeatAmount after discount
                        setAmountPaid(Math.max(0, seatTotalAmount - clamped));
                      }}
                      onWheel={e => e.currentTarget.blur()}
                      className="w-full pl-8 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                      placeholder="0" />
                  </div>
                  {discount > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={11} /> After discount: ₹{finalSeatAmount.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                {/* Amount Paid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Seat Paid Now
                    </label>
                    {finalSeatAmount > 0 && (
                      <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                        Max ₹{finalSeatAmount.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                    <input type="number" min={0} max={finalSeatAmount}
                      value={amountPaid === 0 ? "" : amountPaid}
                      onChange={e => setAmountPaid(Math.min(e.target.value === "" ? 0 : parseInt(e.target.value), finalSeatAmount))}
                      onWheel={e => e.currentTarget.blur()}
                      className="w-full pl-8 pr-3 py-2.5 bg-background border-2 border-primary/20 rounded-xl text-sm font-bold text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="0" />
                  </div>
                  {seatDue > 0 && amountPaid > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <AlertTriangle size={11} className="shrink-0" /> ₹{seatDue.toLocaleString("en-IN")} balance pending
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Button
                type="button"
                onClick={handleOpenPreview}
                className="w-full h-11 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all gap-2 group"
              >
                Review & Confirm
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONFIRM DIALOG ═══ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-card rounded-2xl border border-border">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground leading-none">Confirm Booking</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">Review details before confirming</DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3">

            {/* Student + Seat */}
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 font-black text-primary text-sm">
                {selectedStudent?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-none">{selectedStudent?.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  Seat {seatInfo?.seatNo} · {seatInfo?.floorName}{wantsLocker ? ` · Locker #${lockerNumber}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                {selectedStudent?.memberId && formatMemberId(selectedStudent.memberId)}
              </span>
            </div>

            {/* Shifts */}
            <div className="bg-muted/30 rounded-xl border border-border px-3 py-2.5">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Shifts</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedShiftData.map(s => (
                  <span key={s.id} className="flex items-center gap-1 text-[10px] font-semibold text-foreground bg-background border border-border px-2 py-1 rounded-lg">
                    <Clock size={9} className="text-primary" />{s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Period */}
            <div className="bg-muted/30 rounded-xl border border-border px-3 py-2.5">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Subscription Period</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{format(parsedStartDate, "dd MMM yyyy")}</span>
                <ArrowRight size={11} className="text-muted-foreground shrink-0" />
                <span className="text-xs font-bold text-foreground">{format(newEndDate, "dd MMM yyyy")}</span>
                <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-md shrink-0">
                  {months} Mo
                </span>
              </div>
            </div>

            {/* Payment table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3 py-2 bg-muted/30 border-b border-border">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Payment Summary</p>
              </div>
              <div className="px-3 py-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Seat Fee ({months} mo)</span>
                  <span className="font-semibold">₹{seatTotalAmount.toLocaleString("en-IN")}</span>
                </div>
                {actualLockerAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Locker Add-on</span>
                    <span className="font-semibold">₹{actualLockerAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span><span>−₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-foreground text-sm pt-1.5 border-t border-dashed border-border">
                  <span>Total Payable</span><span>₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Collection strip */}
            <div className="flex items-center justify-between bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl px-4 py-3">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Collecting Now</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Seat ₹{amountPaid.toLocaleString("en-IN")} + Locker ₹{actualLockerAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">₹{totalCollected.toLocaleString("en-IN")}</p>
                {seatDue > 0 ? (
                  <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Due ₹{seatDue.toLocaleString("en-IN")}</p>
                ) : (
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Fully Paid
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-border">
            <Button variant="outline" className="flex-1 h-10" onClick={() => setIsPreviewOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing…</> : "Confirm & Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}