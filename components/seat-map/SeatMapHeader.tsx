import React from "react";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  floors: string[];
  selectedFloor: string;
  setSelectedFloor: (f: string) => void;
  selectedShift: string;
  setSelectedShift: (s: string) => void;
  onClearSeat: () => void;
  activeShifts: string[];
  allShifts?: { name: string; isActive: boolean }[];
}

const formatShiftLabel = (shift: string) =>
  shift
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function SeatMapHeader({
  floors,
  selectedFloor,
  setSelectedFloor,
  selectedShift,
  setSelectedShift,
  onClearSeat,
  activeShifts,
  allShifts = [],
}: Props) {
  const shiftsToDisplay =
    allShifts.length > 0
      ? allShifts
      : activeShifts.map((s) => ({ name: s, isActive: true }));

  const shiftOptions = [
    { id: "ALL", label: "All Shifts", isActive: true },
    ...shiftsToDisplay.map((shift) => ({
      id: typeof shift === "string" ? shift : shift.name,
      label: formatShiftLabel(
        typeof shift === "string" ? shift : shift.name
      ),
      isActive: typeof shift === "string" ? true : shift.isActive,
    })),
  ];

  return (
    <header className="flex flex-col justify-between gap-5 pb-6 border-b border-border/50">
      <div className="flex items-center gap-4">
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger className="w-48 bg-background border-border shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <SelectValue placeholder="Select floor" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {floors.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {shiftOptions.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedShift(s.id);
              onClearSeat();
            }}
            disabled={!s.isActive && s.id !== "ALL"}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              selectedShift === s.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : !s.isActive
                ? "bg-background text-muted-foreground border-border opacity-40 cursor-not-allowed"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {s.label}
            {!s.isActive && s.id !== "ALL" && (
              <span className="ml-1 text-[10px] opacity-60">(Off)</span>
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
