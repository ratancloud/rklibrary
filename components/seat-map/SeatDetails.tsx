import React from "react";
import { X, Search, Info, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SeatInfo, formatShiftName } from "@/types/seatMapTypes";
import { useRouter } from "next/navigation";
import { ShiftCard } from "./ShiftCard";
import { VacantShiftCard } from "./VacantShiftCard";

interface Props {
  selectedSeat: { floorName: string; seatNo: string; data: SeatInfo } | null;
  onClose: () => void;
  selectedShift: string;
  activeShifts: string[];
  allShifts?: { name: string; isActive: boolean }[];
}

export function SeatDetails({
  selectedSeat,
  onClose,
  selectedShift,
  activeShifts,
  allShifts = [],
}: Props) {
  const router = useRouter();

  if (!selectedSeat) {
    return (
      <div className="h-64 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-muted/10">
        <div className="w-12 h-12 bg-background border border-border rounded-xl shadow-sm flex items-center justify-center text-muted-foreground mb-4">
          <Search size={20} />
        </div>
        <p className="text-sm text-muted-foreground max-w-50">
          Select a seat from the floor plan to view details.
        </p>
      </div>
    );
  }

  const { data, floorName, seatNo } = selectedSeat;

  // Disabled seat
  if (!data.active) {
    return (
      <div className="bg-background rounded-2xl p-5 border border-border shadow-sm animate-in fade-in duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Seat {seatNo}
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {floorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <Separator className="mb-4" />
        <div className="py-6 text-center space-y-3 border border-red-500/20 bg-red-500/5 rounded-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-600">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Seat Unavailable
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              This seat is disabled and cannot be booked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const shiftsToDisplay =
    allShifts.length > 0 ? allShifts.map((s) => s.name) : activeShifts;

  return (
    <div className="bg-background rounded-2xl p-5 border border-border shadow-sm animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Info size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Seat {seatNo}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {floorName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <Separator className="mb-4" />

      {/* ALL shifts mode */}
      {selectedShift === "ALL" ? (
        <div className="space-y-2.5 overflow-y-auto max-h-[70vh] pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            All Shifts
          </p>
          {shiftsToDisplay.map((shiftName) => {
            const shiftData = data.shifts[shiftName];
            const shiftInfo = allShifts.find((s) => s.name === shiftName);
            const isInactive = !!(shiftInfo && !shiftInfo.isActive);

            if (shiftData) {
              return (
                <ShiftCard
                  key={shiftName}
                  shiftName={shiftName}
                  shiftData={shiftData}
                  isInactive={isInactive}
                  seatId={data.id}
                  compact
                />
              );
            }

            return (
              <VacantShiftCard
                key={shiftName}
                shiftName={shiftName}
                isInactive={isInactive}
                seatId={data.id}
                seatNo={seatNo}
                floorName={floorName}
              />
            );
          })}
        </div>
      ) : (
        /* Single shift mode */
        (() => {
          const shiftData = data.shifts[selectedShift];
          const shiftInfo = allShifts.find((s) => s.name === selectedShift);
          const isInactive = !!(shiftInfo && !shiftInfo.isActive);

          if (shiftData) {
            return (
              <ShiftCard
                shiftName={selectedShift}
                shiftData={shiftData}
                isInactive={isInactive}
                seatId={data.id}
              />
            );
          }

          return (
            <div
              className={cn(
                "py-8 text-center space-y-4 rounded-xl border",
                isInactive
                  ? "bg-muted/10 border-border/30"
                  : "bg-emerald-500/5 border-emerald-500/20",
              )}
            >
              <div
                className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-full",
                  isInactive
                    ? "bg-muted/30 text-muted-foreground"
                    : "bg-emerald-500/10 text-emerald-600",
                )}
              >
                {isInactive ? <AlertCircle size={22} /> : <Search size={22} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isInactive ? "Shift Inactive" : "Seat Available"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isInactive
                    ? "This shift is no longer active."
                    : `Ready to book for ${formatShiftName(selectedShift)} shift.`}
                </p>
              </div>
              {!isInactive && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={() =>
                      router.push(`/seat-assigned?seatId=${data.id}`)
                    }
                  >
                    Add to seat {seatNo}
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() =>
                      router.push(
                        `/booking?seatId=${data.id}&shift=${selectedShift}`,
                      )
                    }
                  >
                    Book Seat {seatNo}
                  </Button>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
