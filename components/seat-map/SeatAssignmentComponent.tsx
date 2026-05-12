"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatMemberId, minutesToAmPm } from "@/lib/helper";

interface Shift {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  price: number;
}

interface Student {
  id: string;
  name: string;
  memberId: number;
  phoneNumber: string;
  gender: string;
  address: string | null;
  currentSeats: Array<{
    seatNo: number;
    floorName: string;
    shiftName: string;
  }>;
}

export default function SeatAssignmentComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const seatId = searchParams.get("seatId");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data: availabilityData, isLoading: loadingShifts } = useQuery({
    queryKey: ["seat-availability", seatId],
    queryFn: async () => {
      const response = await fetch(
        `/api/booking/available-shifts?seatId=${seatId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch seat availability");
      return response.json();
    },
    enabled: !!seatId,
  });

  const seat = availabilityData?.seat;
  const shifts: Shift[] = availabilityData?.data || [];

  const { data: searchData, isFetching: searchingStudents } = useQuery({
    queryKey: ["students-search", debouncedSearchQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/students/search?q=${encodeURIComponent(debouncedSearchQuery)}`,
      );
      if (!response.ok) throw new Error("Failed to search students");
      return response.json();
    },
    enabled: debouncedSearchQuery.length >= 2,
  });

  const students: Student[] = searchData?.data || [];

  const assignMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/booking/assign-seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatId,
          shiftId: selectedShifts.map((s) => s.id),
          studentId: selectedStudent?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to assign seat");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["seat-availability", seatId],
      });

      setSubmitMessage({
        type: "success",
        text: `Successfully assigned ${selectedShifts.length} shift(s) to ${selectedStudent?.name}`,
      });

      toast.success(submitMessage?.text || "Seat assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["seatMap"] });
      setSelectedStudent(null);
      setSelectedShifts([]);
      setSubmitMessage(null);
      router.replace("/seat-map");
    },
    onError: (error: Error) => {
      setSubmitMessage({ type: "error", text: error.message });
      toast.error(error.message || "Failed to assign seat");
    },
    onSettled: () => {
      setShowConfirmation(false);
    },
  });

  // Helpers
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const toggleShift = (shift: Shift) => {
    setSelectedShifts((prev) =>
      prev.some((s) => s.id === shift.id)
        ? prev.filter((s) => s.id !== shift.id)
        : [...prev, shift],
    );
  };

  if (!seatId) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <h3 className="font-semibold">No Seat Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select a seat from the seat map first.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => router.push("/seat-map")}
          >
            Go to Seat Map
          </Button>
        </div>
      </div>
    );
  }

  if (loadingShifts) {
    return (
      <div className="space-y-6">
        {/* Seat Header Skeleton */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-10 w-32 shrink-0" />
          </div>
        </div>

        {/* Step 1 Skeleton */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Step 2 Skeleton */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 border rounded-lg"
              >
                <Skeleton className="h-5 w-5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seat Header Info */}
      {seat && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Seat Selected</p>
              <h2 className="text-2xl font-bold">
                Seat {seat.seatNo} • {seat.floorName}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/seat-map")}
            >
              Change Seat
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Select Student */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Step 1: Find Student</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Search by name or phone number
          </p>
        </div>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student name or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              className="pl-10"
              disabled={!!selectedStudent}
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
              {searchingStudents ? (
                <div className="p-4 flex items-center justify-center text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                </div>
              ) : students.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No students found
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full px-4 py-3 text-left hover:bg-accent border-b last:border-b-0 transition-colors"
                    >
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMemberId(student.memberId)} •{" "}
                        {student.phoneNumber}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Student Card */}
        {selectedStudent && (
          <div className="rounded-lg bg-accent/50 p-4 flex items-start justify-between">
            <div>
              <p className="font-semibold">{selectedStudent.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatMemberId(selectedStudent.memberId)} •{" "}
                {selectedStudent.phoneNumber}
              </p>
              {selectedStudent.currentSeats.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    Currently active in:
                  </Badge>
                  {selectedStudent.currentSeats.map((s, idx) => (
                    <Badge
                      key={idx}
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {s.floorName} Seat {s.seatNo} ({s.shiftName})
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudent(null)}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: Select Shifts (Multi-Select) */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Step 2: Select Shifts</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You can select multiple empty shifts for this seat
          </p>
        </div>

        {shifts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {shifts.map((shift) => {
              const isSelected = selectedShifts.some((s) => s.id === shift.id);
              return (
                <button
                  key={shift.id}
                  onClick={() => toggleShift(shift)}
                  disabled={!selectedStudent}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg border p-4 text-left transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card",
                  )}
                >
                  <div className="text-primary shrink-0">
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{shift.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {minutesToAmPm(shift.startTime)} -{" "}
                      {minutesToAmPm(shift.endTime)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            No empty shifts available for this seat right now.
          </div>
        )}
      </div>

      {/* Step 3: Confirm and Submit */}
      {selectedStudent && selectedShifts.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">
              Step 3: Confirm Assignment
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review the details before assigning
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Student:</span>
              <span className="font-semibold text-base">
                {selectedStudent.name}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-muted-foreground">Seat Location:</span>
              <span className="font-medium">
                Seat {seat?.seatNo} ({seat?.floorName})
              </span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <span className="text-muted-foreground block mb-2">
                Selected Shifts ({selectedShifts.length}):
              </span>
              {selectedShifts.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center bg-background px-3 py-2 rounded border"
                >
                  <span className="font-medium">
                    {s.name}{" "}
                    <span className="text-muted-foreground font-normal ml-2">
                      {minutesToAmPm(s.startTime)} - {minutesToAmPm(s.endTime)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setShowConfirmation(true)}
            className="w-full"
            size="lg"
            disabled={assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              `Assign ${selectedShifts.length} Shift(s)`
            )}
          </Button>
        </div>
      )}

      {/* Alert Messages */}
      {submitMessage && (
        <div
          className={cn(
            "rounded-lg border p-4 flex items-start gap-3",
            submitMessage.type === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50",
          )}
        >
          {submitMessage.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <p
            className={cn(
              "text-sm",
              submitMessage.type === "success"
                ? "text-green-800"
                : "text-red-800",
            )}
          >
            {submitMessage.text}
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Seat Assignment</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            Are you sure you want to assign{" "}
            <strong>{selectedStudent?.name}</strong> to{" "}
            <strong>Seat {seat?.seatNo}</strong> for the following shifts?
            <ul className="mt-2 list-disc pl-5 text-foreground font-medium">
              {selectedShifts.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <AlertDialogCancel disabled={assignMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                assignMutation.mutate();
              }}
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Confirm Assignment"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
