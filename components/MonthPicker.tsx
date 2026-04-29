import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [selectedYear, selectedMonthIdx] = useMemo(() => {
    const [y, m] = value.split("-").map(Number);
    return [y, m - 1];
  }, [value]);

  const [viewYear, setViewYear] = useState(selectedYear);

  const today = new Date();

  const triggerLabel = useMemo(
    () =>
      new Date(selectedYear, selectedMonthIdx, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [selectedYear, selectedMonthIdx],
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (monthIdx: number) => {
    const val = `${viewYear}-${String(monthIdx + 1).padStart(2, "0")}`;
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="outline"
        onClick={() => {
          if (!open) setViewYear(selectedYear);
          setOpen((o) => !o);
        }}
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span>{triggerLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-50 bg-card border rounded-xl p-4 w-68 shadow-lg">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setViewYear((y) => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold">{viewYear}</span>
            <button
              onClick={() => setViewYear((y) => y + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS_SHORT.map((m, i) => {
              const isSelected =
                viewYear === selectedYear && i === selectedMonthIdx;
              const isCurrent =
                viewYear === today.getFullYear() && i === today.getMonth();

              return (
                <button
                  key={m}
                  onClick={() => handleSelect(i)}
                  className={`
                    py-2 rounded-lg text-xs font-medium transition-all
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border border-primary/40 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
