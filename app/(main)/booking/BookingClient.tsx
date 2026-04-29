"use client";

// app/booking/page.tsx
//
// Arrives with URL params: ?seatId=xxx&seatNo=14&floorName=Floor+A&shift=AFTERNOON&date=2026-04-12
//
// Key fixes vs old version:
//   1. Uses /api/booking/seat-availability (SeatAssignment-based) not /api/subscriptions
//   2. Shows who is occupying a booked shift (name + memberId)
//   3. Shows "subscription expired, not yet removed" warning
//   4. Student search is debounced — not a flat list
//   5. Pre-selects the shift from URL param
//   6. amountPaid correctly sent in payload

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Armchair,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Home,
  Search,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface OccupiedBy {
  studentId: string;
  studentName: string;
  memberId: number;
  phoneNumber: string;
  gender: string;
  activeSubscription: {
    id: string;
    endDate: string;
    totalAmount: number;
    amountPaid: number;
    isDue: boolean;
  } | null;
  subscriptionExpired: boolean;
}

interface ShiftAvailability {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  price: number;
  isActive: boolean;
  isOccupied: boolean;
  occupiedBy: OccupiedBy | null;
}

interface SeatInfo {
  id: string;
  seatNo: number;
  isActive: boolean;
  floorId: string;
  floorName: string;
}

interface StudentResult {
  id: string;
  name: string;
  memberId: number;
  phoneNumber: string;
  gender: string;
  address: string | null;
  currentSeats: { seatNo: number; floorName: string; shiftName: string }[];
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
};

export default function BookingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const seatId = searchParams.get("seatId") || "";
  const seatNo = searchParams.get("seatNo") || "";
  const floorName = searchParams.get("floorName")
    ? decodeURIComponent(searchParams.get("floorName")!)
    : "";
  const urlShift = searchParams.get("shift") || ""; // e.g. "AFTERNOON"
  const initialDate =
    searchParams.get("date") ?? new Date().toLocaleDateString("en-CA");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
  const [shifts, setShifts] = useState<ShiftAvailability[]>([]);

  // Student search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [bookingData, setBookingData] = useState({
    selectedShifts: [] as string[],
    startDate: initialDate,
    duration: 1,
    selectedStudent: null as StudentResult | null,
    isNewStudent: false,
    newStudent: { name: "", phoneNumber: "", gender: "MALE", address: "" },
    amountPaid: 0,
    discount: 0,
  });

  // ── Fetch seat availability on mount ────────────────────────────────────────
  useEffect(() => {
    if (!seatId) {
      setError("No seat selected");
      setLoading(false);
      return;
    }

    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/booking/seat-availability?seatId=${seatId}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load seat data");

        setSeatInfo(data.data.seat);
        setShifts(data.data.shifts);

        // Pre-select shift from URL param if it exists and is available
        if (urlShift) {
          const match = data.data.shifts.find(
            (s: ShiftAvailability) =>
              s.name === urlShift && !s.isOccupied && s.isActive,
          );
          if (match) {
            setBookingData((prev) => ({ ...prev, selectedShifts: [match.id] }));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetch_();
  }, [seatId, urlShift]);

  // ── Debounced student search ─────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/students/search?q=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  // ── Calculations ─────────────────────────────────────────────────────────────
  const selectedShiftData = shifts.filter((s) =>
    bookingData.selectedShifts.includes(s.id),
  );
  const monthlyTotal = selectedShiftData.reduce((sum, s) => sum + s.price, 0);
  const totalAmount = monthlyTotal * bookingData.duration;

  const getEndDate = () => {
    const d = new Date(bookingData.startDate);
    d.setMonth(d.getMonth() + bookingData.duration);
    d.setDate(d.getDate());
    return d;
  };

  const toggleShift = (shiftId: string) => {
    setBookingData((prev) => ({
      ...prev,
      selectedShifts: prev.selectedShifts.includes(shiftId)
        ? prev.selectedShifts.filter((id) => id !== shiftId)
        : [...prev.selectedShifts, shiftId],
    }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    if (bookingData.selectedShifts.length === 0) {
      setError("Select at least one shift");
      return;
    }
    if (!bookingData.isNewStudent && !bookingData.selectedStudent) {
      setError("Select or create a student");
      return;
    }
    if (
      bookingData.isNewStudent &&
      (!bookingData.newStudent.name || !bookingData.newStudent.phoneNumber)
    ) {
      setError("Fill in student name and phone");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatId,
          studentId: bookingData.isNewStudent
            ? undefined
            : bookingData.selectedStudent?.id,
          newStudent: bookingData.isNewStudent
            ? bookingData.newStudent
            : undefined,
          shiftIds: bookingData.selectedShifts,
          startDate: bookingData.startDate,
          endDate: getEndDate().toISOString().split("T")[0],
          totalAmount,
          discount: bookingData.discount,
          amountPaid: bookingData.amountPaid,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Booking failed");

      toast.success("Booking confirmed!");
      router.push("/seat-map");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Validation for step 1 → 2 ────────────────────────────────────────────────
  const canProceed = () => {
    if (bookingData.selectedShifts.length === 0) return false;
    if (bookingData.isNewStudent) {
      return !!(
        bookingData.newStudent.name && bookingData.newStudent.phoneNumber
      );
    }
    return !!bookingData.selectedStudent;
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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
            <BreadcrumbLink asChild>
              <Link href="/seat-map">Seat Map</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Booking — Seat #{seatInfo?.seatNo ?? seatNo}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Error */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-destructive mt-0.5 shrink-0"
                size={18}
              />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      <div className="flex items-center gap-3">
        {(["Select Details", "Review & Confirm"] as const).map((label, idx) => {
          const num = idx + 1;
          return (
            <div
              key={num}
              className="flex items-center gap-3 flex-1 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    step > num
                      ? "bg-primary text-white"
                      : step === num
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {step > num ? "✓" : num}
                </div>
                <span
                  className={cn(
                    "text-sm hidden sm:block",
                    step === num ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {idx === 0 && (
                <div
                  className={cn(
                    "flex-1 h-px",
                    step > 1 ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Seat + Date info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Armchair className="text-primary" size={20} />
                  </div>
                  <div>
                    <CardTitle>Seat #{seatInfo?.seatNo ?? seatNo}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {seatInfo?.floorName ?? floorName}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) =>
                        setBookingData((p) => ({
                          ...p,
                          startDate: e.target.value,
                        }))
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      End Date
                    </Label>
                    <p className="font-semibold text-sm mt-3">
                      {getEndDate().toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Duration
                    </Label>
                    <div className="flex gap-2 mt-1.5">
                      {[1, 2, 3].map((m) => (
                        <button
                          key={m}
                          onClick={() =>
                            setBookingData((p) => ({ ...p, duration: m }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                            bookingData.duration === m
                              ? "bg-primary text-white border-primary"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          {m}M
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shifts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} /> Select Shifts
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Occupied shifts show who is currently seated. They cannot be
                  booked until the librarian removes the student.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {shifts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No shifts configured for this library.
                  </p>
                )}
                {shifts.map((shift) => {
                  const isSelected = bookingData.selectedShifts.includes(
                    shift.id,
                  );
                  const disabled = shift.isOccupied || !shift.isActive;

                  return (
                    <button
                      key={shift.id}
                      onClick={() => !disabled && toggleShift(shift.id)}
                      disabled={disabled}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        disabled
                          ? "cursor-not-allowed opacity-70"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        shift.isOccupied && "border-border bg-muted",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: shift info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{shift.name}</p>
                            {!shift.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                            {shift.isOccupied &&
                              shift.occupiedBy?.subscriptionExpired && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-amber-500/50 text-amber-700 bg-amber-500/10"
                                >
                                  Subscription Expired
                                </Badge>
                              )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatTime(shift.startTime)} –{" "}
                            {formatTime(shift.endTime)}
                          </p>

                          {/* Who is seated here */}
                          {shift.isOccupied && shift.occupiedBy && (
                            <div
                              className={cn(
                                "mt-3 p-2.5 rounded-lg text-sm",
                                shift.occupiedBy.subscriptionExpired
                                  ? "bg-amber-500/10 border border-amber-500/20"
                                  : "bg-muted border border-border",
                              )}
                            >
                              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                {shift.occupiedBy.subscriptionExpired ? (
                                  <AlertTriangle
                                    size={13}
                                    className="text-amber-600"
                                  />
                                ) : (
                                  <Users size={13} />
                                )}
                                <span className="text-xs font-medium uppercase tracking-wide">
                                  {shift.occupiedBy.subscriptionExpired
                                    ? "Expired — seat not cleared"
                                    : "Currently seated"}
                                </span>
                              </div>
                              <p className="font-semibold text-foreground">
                                {shift.occupiedBy.studentName}
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                  #{shift.occupiedBy.memberId}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {shift.occupiedBy.phoneNumber}
                              </p>
                              {shift.occupiedBy.activeSubscription && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Valid till{" "}
                                  {new Date(
                                    shift.occupiedBy.activeSubscription.endDate,
                                  ).toLocaleDateString("en-IN")}
                                  {shift.occupiedBy.activeSubscription
                                    .isDue && (
                                    <span className="ml-1.5 text-destructive font-medium">
                                      · Due
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: price / status badge */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {shift.isOccupied ? (
                            <Badge variant="destructive" className="text-xs">
                              Occupied
                            </Badge>
                          ) : !shift.isActive ? (
                            <Badge variant="secondary" className="text-xs">
                              Unavailable
                            </Badge>
                          ) : (
                            <Badge
                              variant={isSelected ? "default" : "outline"}
                              className="text-xs"
                            >
                              ₹{shift.price}/mo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Student picker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={18} /> Student
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Toggle new vs existing */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setBookingData((p) => ({
                        ...p,
                        isNewStudent: false,
                        selectedStudent: null,
                      }))
                    }
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                      !bookingData.isNewStudent
                        ? "bg-primary text-white border-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    Existing Student
                  </button>
                  <button
                    onClick={() =>
                      setBookingData((p) => ({
                        ...p,
                        isNewStudent: true,
                        selectedStudent: null,
                      }))
                    }
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                      bookingData.isNewStudent
                        ? "bg-primary text-white border-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    New Student
                  </button>
                </div>

                {/* Existing student search */}
                {!bookingData.isNewStudent && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        className="pl-9"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searching && (
                        <Loader2
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                        />
                      )}
                    </div>

                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                      <p className="text-xs text-muted-foreground">
                        Type at least 2 characters to search
                      </p>
                    )}

                    {/* Selected student display */}
                    {bookingData.selectedStudent && (
                      <div className="p-3 rounded-lg border-2 border-primary bg-primary/5 flex items-start justify-between">
                        <div>
                          <p className="font-semibold">
                            {bookingData.selectedStudent.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            #{bookingData.selectedStudent.memberId} ·{" "}
                            {bookingData.selectedStudent.phoneNumber}
                          </p>
                          {bookingData.selectedStudent.currentSeats.length >
                            0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Also seated:{" "}
                              {bookingData.selectedStudent.currentSeats
                                .map((s) => `Seat ${s.seatNo} (${s.shiftName})`)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setBookingData((p) => ({
                              ...p,
                              selectedStudent: null,
                            }))
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    )}

                    {/* Search results */}
                    {searchResults.length > 0 &&
                      !bookingData.selectedStudent && (
                        <div className="border rounded-lg overflow-hidden divide-y">
                          {searchResults.map((student) => (
                            <button
                              key={student.id}
                              onClick={() => {
                                setBookingData((p) => ({
                                  ...p,
                                  selectedStudent: student,
                                }));
                                setSearchQuery("");
                                setSearchResults([]);
                              }}
                              className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    #{student.memberId} · {student.phoneNumber}
                                  </p>
                                  {student.currentSeats.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Seats:{" "}
                                      {student.currentSeats
                                        .map(
                                          (s) => `${s.seatNo}/${s.shiftName}`,
                                        )
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {student.gender}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                    {searchQuery.length >= 2 &&
                      !searching &&
                      searchResults.length === 0 &&
                      !bookingData.selectedStudent && (
                        <p className="text-sm text-muted-foreground text-center py-3">
                          No students found for &quot;{searchQuery}&quot;
                        </p>
                      )}
                  </div>
                )}

                {/* New student form */}
                {bookingData.isNewStudent && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold uppercase">
                          Name *
                        </Label>
                        <Input
                          className="mt-1.5"
                          placeholder="Full name"
                          value={bookingData.newStudent.name}
                          onChange={(e) =>
                            setBookingData((p) => ({
                              ...p,
                              newStudent: {
                                ...p.newStudent,
                                name: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold uppercase">
                          Phone *
                        </Label>
                        <Input
                          className="mt-1.5"
                          placeholder="10-digit number"
                          maxLength={10}
                          value={bookingData.newStudent.phoneNumber}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (/^\d*$/.test(inputValue)) {
                              setBookingData((p) => ({
                                ...p,
                                newStudent: {
                                  ...p.newStudent,
                                  phoneNumber: inputValue,
                                },
                              }));
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase">
                        Gender
                      </Label>
                      <Select
                        value={bookingData.newStudent.gender}
                        onValueChange={(v) =>
                          setBookingData((p) => ({
                            ...p,
                            newStudent: { ...p.newStudent, gender: v },
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase">
                        Address (optional)
                      </Label>
                      <Textarea
                        className="mt-1.5 resize-none"
                        rows={2}
                        placeholder="Area / locality"
                        value={bookingData.newStudent.address}
                        onChange={(e) =>
                          setBookingData((p) => ({
                            ...p,
                            newStudent: {
                              ...p.newStudent,
                              address: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sticky summary */}
          <div className="h-fit sticky top-24">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar size={18} className="text-primary" /> Booking
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                    Duration
                  </p>
                  <p>
                    {new Date(bookingData.startDate).toLocaleDateString(
                      "en-IN",
                    )}{" "}
                    → {getEndDate().toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookingData.duration} month
                    {bookingData.duration > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                    Selected Shifts
                  </p>
                  {selectedShiftData.length === 0 ? (
                    <p className="text-muted-foreground italic text-xs">
                      None selected
                    </p>
                  ) : (
                    selectedShiftData.map((s) => (
                      <div key={s.id} className="flex justify-between mb-1">
                        <span>{s.name}</span>
                        <span className="font-medium">₹{s.price}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Monthly</span>
                    <span>₹{monthlyTotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>× {bookingData.duration} months</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-primary/20">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setError("");
                    if (!canProceed()) {
                      setError(
                        "Select at least one shift and a student to continue",
                      );
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full gap-2"
                >
                  Review Booking <ArrowRight size={15} />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── STEP 2: REVIEW ── */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking details */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      Seat
                    </p>
                    <p className="font-semibold">
                      Seat #{seatInfo?.seatNo} · {seatInfo?.floorName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      Duration
                    </p>
                    <p className="font-semibold">
                      {bookingData.duration} month
                      {bookingData.duration > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      Start
                    </p>
                    <p className="font-semibold">
                      {new Date(bookingData.startDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      End
                    </p>
                    <p className="font-semibold">
                      {getEndDate().toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shifts review */}
            <Card>
              <CardHeader>
                <CardTitle>Shifts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedShiftData.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border"
                  >
                    <div>
                      <p className="font-semibold">{shift.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(shift.startTime)} –{" "}
                        {formatTime(shift.endTime)}
                      </p>
                    </div>
                    <Badge>₹{shift.price}/mo</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Student review */}
            <Card>
              <CardHeader>
                <CardTitle>Student</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                {[
                  [
                    "Name",
                    bookingData.isNewStudent
                      ? bookingData.newStudent.name
                      : bookingData.selectedStudent?.name,
                  ],
                  [
                    "Phone",
                    bookingData.isNewStudent
                      ? bookingData.newStudent.phoneNumber
                      : bookingData.selectedStudent?.phoneNumber,
                  ],
                  [
                    "Gender",
                    (bookingData.isNewStudent
                      ? bookingData.newStudent.gender
                      : bookingData.selectedStudent?.gender
                    )?.toLowerCase(),
                  ],
                  [
                    "Member ID",
                    bookingData.isNewStudent
                      ? "Auto-assigned"
                      : `#${bookingData.selectedStudent?.memberId}`,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground uppercase mb-0.5">
                      {label}
                    </p>
                    <p className="font-semibold capitalize">{value || "—"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase">
                      Discount (₹)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={totalAmount}
                      className="mt-1.5"
                      placeholder="0"
                      value={bookingData.discount || ""}
                      onChange={(e) =>
                        setBookingData((p) => ({
                          ...p,
                          discount: Math.max(
                            0,
                            Math.min(
                              parseFloat(e.target.value) || 0,
                              totalAmount,
                            ),
                          ),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase">
                      Amount Paid Now (₹)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={totalAmount - bookingData.discount}
                      className="mt-1.5"
                      placeholder="0"
                      value={bookingData.amountPaid || ""}
                      onChange={(e) =>
                        setBookingData((p) => ({
                          ...p,
                          amountPaid: Math.max(
                            0,
                            parseFloat(e.target.value) || 0,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Amount
                    </p>
                    <p className="font-bold text-lg">₹{totalAmount}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-muted-foreground mb-1">
                      Discount
                    </p>
                    <p className="font-bold text-lg text-red-700">
                      -₹{bookingData.discount}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-lg border",
                      bookingData.amountPaid >=
                        totalAmount - bookingData.discount
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-amber-500/10 border-amber-500/20",
                    )}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      Remaining
                    </p>
                    <p
                      className={cn(
                        "font-bold text-lg",
                        bookingData.amountPaid >=
                          totalAmount - bookingData.discount
                          ? "text-emerald-700"
                          : "text-amber-700",
                      )}
                    >
                      ₹
                      {Math.max(
                        0,
                        totalAmount -
                          bookingData.discount -
                          bookingData.amountPaid,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final summary */}
          <div className="h-fit sticky top-24">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 size={18} className="text-primary" /> Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {selectedShiftData.length} shift
                      {selectedShiftData.length > 1 ? "s" : ""} ×{" "}
                      {bookingData.duration}mo
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-primary/20 pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>-₹{bookingData.discount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-primary/20 pt-2">
                    <span>Final Total</span>
                    <span className="text-primary">
                      ₹{totalAmount - bookingData.discount}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Paid now</span>
                    <span>₹{bookingData.amountPaid}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Remaining</span>
                    <span>
                      ₹
                      {Math.max(
                        0,
                        totalAmount -
                          bookingData.discount -
                          bookingData.amountPaid,
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} /> Confirm Booking
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  disabled={submitting}
                  className="w-full"
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
