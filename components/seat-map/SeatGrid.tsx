import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { SeatInfo, getSubscriptionStatus } from "@/types/seatMapTypes";

interface Props {
  currentFloorSeats: [string, SeatInfo][];
  selectedSeat: { floorName: string; seatNo: string; data: SeatInfo } | null;
  setSelectedSeat: (seat: {
    floorName: string;
    seatNo: string;
    data: SeatInfo;
  }) => void;
  selectedFloor: string;
  selectedShift: string;
  activeShifts: string[];
  allShifts?: { name: string; isActive: boolean }[];
}

// ─── Shift identity map ───────────────────────────────────────────────────────
// Maps shift name keywords → time-of-day identity for coloring & icon
const SHIFT_IDENTITIES: {
  keywords: string[];
  short: string;
  fill: string;
  stroke: string;
  textColor: string;
}[] = [
  {
    keywords: ["morning", "morn", "day1", "shift1", "first"],
    short: "M",
    fill: "#FFFBEB",
    stroke: "#D97706",
    textColor: "#78350F",
  },
  {
    keywords: ["afternoon", "noon", "day2", "shift2", "second"],
    short: "A",
    fill: "#EFF6FF",
    stroke: "#2563EB",
    textColor: "#1E3A5F",
  },
  {
    keywords: ["evening", "eve", "day3", "shift3", "third"],
    short: "E",
    fill: "#FFF5EC",
    stroke: "#EA580C",
    textColor: "#6B2000",
  },
  {
    keywords: ["night", "late", "shift4", "fourth"],
    short: "N",
    fill: "#F0EEFF",
    stroke: "#6366F1",
    textColor: "#2E1065",
  },
];

function resolveShiftIdentity(shiftName: string, index: number) {
  const lower = shiftName.toLowerCase();
  const match = SHIFT_IDENTITIES.find((s) =>
    s.keywords.some((k) => lower.includes(k)),
  );
  return match ?? SHIFT_IDENTITIES[index % SHIFT_IDENTITIES.length];
}

// ─── Status colors ────────────────────────────────────────────────────────────
type ShiftStatus = "active" | "expired" | "vacant";

function resolveStatus(
  expiryDays: number | null,
  hasShift: boolean,
): ShiftStatus {
  if (!hasShift) return "vacant";
  if (expiryDays !== null && expiryDays <= 0) return "expired";
  return "active";
}

const STATUS_STYLES: Record<
  ShiftStatus,
  { fill: string; stroke: string; badge: string }
> = {
  active: { fill: "#F0FDF4", stroke: "#4ADE80", badge: "#16A34A" },
  expired: { fill: "#FFF1F2", stroke: "#FCA5A5", badge: "#DC2626" },
  vacant: { fill: "#F8FAFC", stroke: "#CBD5E1", badge: "" },
};

// ─── Quadrant layouts depending on shift count ───────────────────────────────
interface Quad {
  qx: number;
  qy: number;
  qw: number;
  qh: number;
  cx: number;
  cy: number;
  rx: string;
}

function getQuads(n: number): Quad[] {
  if (n >= 4)
    return [
      { qx: 4, qy: 4, qw: 22, qh: 22, cx: 15, cy: 15, rx: "4 0 0 0" },
      { qx: 30, qy: 4, qw: 22, qh: 22, cx: 41, cy: 15, rx: "0 4 0 0" },
      { qx: 4, qy: 30, qw: 22, qh: 22, cx: 15, cy: 41, rx: "0 0 0 4" },
      { qx: 30, qy: 30, qw: 22, qh: 22, cx: 41, cy: 41, rx: "0 0 4 0" },
    ];
  if (n === 3)
    return [
      { qx: 4, qy: 4, qw: 22, qh: 22, cx: 15, cy: 15, rx: "4 0 0 0" },
      { qx: 30, qy: 4, qw: 22, qh: 22, cx: 41, cy: 15, rx: "0 4 0 0" },
      { qx: 4, qy: 30, qw: 48, qh: 22, cx: 28, cy: 41, rx: "0 0 4 4" },
    ];
  if (n === 2)
    return [
      { qx: 4, qy: 4, qw: 48, qh: 22, cx: 28, cy: 15, rx: "4 4 0 0" },
      { qx: 4, qy: 30, qw: 48, qh: 22, cx: 28, cy: 41, rx: "0 0 4 4" },
    ];
  return [{ qx: 4, qy: 4, qw: 48, qh: 48, cx: 28, cy: 28, rx: "4 4 4 4" }];
}

// ─── Chair SVG component ──────────────────────────────────────────────────────
interface ChairProps {
  seatNo: number;
  isSelected: boolean;
  isDisabled: boolean;
  isAllMode: boolean;
  activeShifts: string[];
  shifts: SeatInfo["shifts"];
  shiftExpiries: ({ key: string; days: number } | null)[];
  subscriptionStatus?: "active" | "expired" | "vacant";
  isBooked: boolean;
  allShifts?: { name: string; isActive: boolean }[];
}

function ChairSVG({
  seatNo,
  isSelected,
  isDisabled,
  isAllMode,
  activeShifts,
  shifts,
  shiftExpiries,
  subscriptionStatus,
  isBooked,
  allShifts = [],
}: ChairProps) {
  const shiftsToUse = allShifts.length > 0 ? allShifts.map(s => s.name) : activeShifts;
  const n = Math.min(shiftsToUse.length, 4);
  const quads = getQuads(n);

  const outerBorder = isDisabled
    ? "#FCA5A5"
    : isSelected
      ? "#378ADD"
      : "#CBD5E1";

  const outerFill = isDisabled
    ? "#FFF1F2"
    : isSelected
      ? "#EFF6FF"
      : "var(--background, #fff)";

  // Build quadrant SVG markup
  const quadMarkup =
    isAllMode && !isDisabled
      ? shiftsToUse.slice(0, 4).map((shiftName, idx) => {
          const q = quads[idx];
          if (!q) return null;

          const expiry = shiftExpiries[idx];
          const hasShift = !!shifts[shiftName];
          const status = resolveStatus(
            hasShift ? (expiry?.days ?? 999) : null,
            hasShift,
          );
          const sc = STATUS_STYLES[status];
          const identity = resolveShiftIdentity(shiftName, idx);
          const shiftInfo = allShifts.find(s => s.name === shiftName);
          const isShiftInactive = shiftInfo && !shiftInfo.isActive;

          return (
            <g key={shiftName} opacity={isShiftInactive ? 0.4 : 1}>
              <rect
                x={q.qx}
                y={q.qy}
                width={q.qw}
                height={q.qh}
                rx={3}
                fill={isShiftInactive ? "#E2E8F0" : sc.fill}
                stroke={isShiftInactive ? "#94A3B8" : sc.stroke}
                strokeWidth={0.7}
              />
              {/* Large centered short label — easy to read at small sizes */}
              <text
                x={q.qx + q.qw / 2}
                y={q.qy + q.qh / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fontWeight={800}
                fill={
                  isShiftInactive
                    ? "#64748B"
                    : status === "vacant"
                      ? "#94A3B8"
                      : status === "expired"
                        ? "#DC2626"
                        : identity.stroke
                }
              >
                {identity.short}
              </text>
            </g>
          );
        })
      : null;

  // Single-mode fill
  const singleFill =
    !isAllMode && !isDisabled && isBooked
      ? subscriptionStatus === "active"
        ? "#F0FDF4"
        : "#FFFBEB"
      : !isAllMode && !isDisabled
        ? "#F8FAFC"
        : outerFill;

  const singleStroke =
    !isAllMode && !isDisabled && isBooked
      ? subscriptionStatus === "active"
        ? "#4ADE80"
        : "#FCD34D"
      : outerBorder;

  return (
    <svg
      viewBox="0 0 56 76"
      width="56"
      height="76"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      {/* ── Chair body: backrest ── */}
      <rect
        x={2}
        y={2}
        width={52}
        height={54}
        rx={8}
        fill={isAllMode && !isDisabled ? outerFill : singleFill}
        stroke={isAllMode && !isDisabled ? outerBorder : singleStroke}
        strokeWidth={1.5}
      />

      {/* ── Quadrant fills (ALL mode) ── */}
      {isAllMode && !isDisabled && (
        <>
          {/* Subtle grid dividers */}
          <line
            x1={28}
            y1={5}
            x2={28}
            y2={54}
            stroke="white"
            strokeWidth={1}
            opacity={0.8}
          />
          <line
            x1={5}
            y1={28}
            x2={51}
            y2={28}
            stroke="white"
            strokeWidth={1}
            opacity={0.8}
          />
          {quadMarkup}
        </>
      )}

      {/* ── Single mode seat number ── */}
      {!isAllMode && (
        <text
          x={28}
          y={29}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={700}
          fill={
            isDisabled
              ? "#DC2626"
              : isBooked
                ? subscriptionStatus === "active"
                  ? "#16A34A"
                  : "#D97706"
                : "#94A3B8"
          }
        >
          {seatNo}
        </text>
      )}

      {/* ── Seat cushion ── */}
      <rect
        x={0}
        y={57}
        width={56}
        height={13}
        rx={5}
        fill={isAllMode && !isDisabled ? outerFill : singleFill}
        stroke={isAllMode && !isDisabled ? outerBorder : singleStroke}
        strokeWidth={1.2}
      />

      {/* ── Armrests ── */}
      <rect
        x={-1}
        y={40}
        width={5}
        height={19}
        rx={2.5}
        fill={isAllMode ? outerFill : singleFill}
        stroke={isAllMode ? outerBorder : singleStroke}
        strokeWidth={1}
      />
      <rect
        x={52}
        y={40}
        width={5}
        height={19}
        rx={2.5}
        fill={isAllMode ? outerFill : singleFill}
        stroke={isAllMode ? outerBorder : singleStroke}
        strokeWidth={1}
      />

      {/* ── Legs ── */}
      <rect
        x={8}
        y={70}
        width={10}
        height={6}
        rx={2}
        fill={isAllMode ? outerFill : singleFill}
        stroke={isAllMode ? outerBorder : singleStroke}
        strokeWidth={1}
      />
      <rect
        x={38}
        y={70}
        width={10}
        height={6}
        rx={2}
        fill={isAllMode ? outerFill : singleFill}
        stroke={isAllMode ? outerBorder : singleStroke}
        strokeWidth={1}
      />

      {/* ── Seat number label (ALL mode, below cushion) ── */}
      {isAllMode && !isDisabled && (
        <text
          x={28}
          y={63.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={6.5}
          fontWeight={700}
          fill="#64748B"
        >
          {seatNo}
        </text>
      )}

      {/* ── Disabled X ── */}
      {isDisabled && (
        <>
          <line
            x1={18}
            y1={18}
            x2={38}
            y2={40}
            stroke="#FCA5A5"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={38}
            y1={18}
            x2={18}
            y2={40}
            stroke="#FCA5A5"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// ─── Legend strip ─────────────────────────────────────────────────────────────
function ShiftLegend({ shiftsToDisplay, allShifts = [] }: { shiftsToDisplay: string[]; allShifts?: { name: string; isActive: boolean }[] }) {
  const positionLabels = ["Morning", "Afternoon", "Evening", "Night"];
  return (
    <div className="flex flex-wrap gap-3 mb-4 text-[11px] font-medium text-muted-foreground">
      {shiftsToDisplay.slice(0, 4).map((shift, idx) => {
        const identity = resolveShiftIdentity(shift, idx);
        const shiftInfo = allShifts.find(s => s.name === shift);
        const isInactive = shiftInfo && !shiftInfo.isActive;
        return (
          <div key={shift} className={cn("flex items-center gap-1.5", isInactive && "opacity-50")}>
            <span style={{ color: identity.stroke }}>{identity.short}</span>
            <span>{positionLabels[idx]} {isInactive && "(Inactive)"}</span>
          </div>
        );
      })}
      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border/50">
        <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300" />
        Vacant
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-400" />
        Active
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-400" />
        Expired
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SeatGrid({
  currentFloorSeats,
  selectedSeat,
  setSelectedSeat,
  selectedFloor,
  selectedShift,
  activeShifts,
  allShifts = [],
}: Props) {
  const isAllMode = selectedShift === "ALL";
  const shiftsToDisplay = allShifts.length > 0 ? allShifts.map(s => s.name) : activeShifts;

  const stats = useMemo(() => {
    let totalSlots = 0,
      occupiedSlots = 0,
      activeSeats = 0;
    currentFloorSeats.forEach(([, seatInfo]) => {
      if (!seatInfo.active) return;
      activeSeats++;
      if (isAllMode) {
        totalSlots += shiftsToDisplay.length;
        shiftsToDisplay.forEach((k) => {
          if (seatInfo.shifts[k]) occupiedSlots++;
        });
      } else {
        totalSlots++;
        if (seatInfo.shifts[selectedShift]) occupiedSlots++;
      }
    });
    return { totalSlots, occupiedSlots, activeSeats };
  }, [currentFloorSeats, isAllMode, selectedShift, shiftsToDisplay]);

  return (
    <div className="flex-1 w-full bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm">
      {/* Legend */}
      {isAllMode ? (
        <ShiftLegend shiftsToDisplay={shiftsToDisplay} allShifts={allShifts} />
      ) : (
        <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300" /> Vacant
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400" /> Active
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" /> Expired
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-200" /> Disabled
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="mb-6 p-3 bg-muted/30 rounded-xl flex gap-6 text-xs font-medium text-muted-foreground border border-border/40">
        <div>
          Total seats:{" "}
          <span className="text-foreground font-bold">{stats.activeSeats}</span>
        </div>
        <div>
          Available:{" "}
          <span className="text-emerald-600 font-bold">
            {stats.totalSlots - stats.occupiedSlots}
          </span>
        </div>
        <div>
          Booked:{" "}
          <span className="text-blue-600 font-bold">{stats.occupiedSlots}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-6 mb-10">
        {currentFloorSeats.map(([seatNoStr, seatInfo]) => {
          const isSelected = selectedSeat?.data.id === seatInfo.id;
          const { shifts } = seatInfo;
          const seatNo = parseInt(seatNoStr);
          const isDisabled = !seatInfo.active;

          const shiftExpiries = shiftsToDisplay.map((key) => {
            const shift = shifts[key];
            if (!shift?.expiry) return null;
            const diff = differenceInDays(
              startOfDay(new Date(shift.expiry)),
              startOfDay(new Date()),
            );
            return { key, days: diff < 0 ? 0 : diff };
          });

          let subscriptionStatus: "active" | "expired" | "vacant" = "vacant";
          let singleExpireDays: number | null = null;
          if (!isAllMode) {
            const cur = shifts[selectedShift];
            if (cur?.expiry) {
              subscriptionStatus = getSubscriptionStatus(cur.expiry);
              const d = differenceInDays(
                startOfDay(new Date(cur.expiry)),
                startOfDay(new Date()),
              );
              singleExpireDays = d < 0 ? 0 : d;
            }
          }

          const isBooked = isAllMode
            ? Object.values(shifts).some((s) => s !== null)
            : !!shifts[selectedShift];

          return (
            <div key={seatNoStr} className="flex flex-col items-center gap-1">
              <button
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled &&
                  setSelectedSeat({
                    floorName: selectedFloor,
                    seatNo: seatNoStr,
                    data: seatInfo,
                  })
                }
                className={cn(
                  "relative transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg",
                  isDisabled && "cursor-not-allowed opacity-60",
                  isSelected && !isDisabled
                    ? "scale-110 z-10 drop-shadow-lg"
                    : !isDisabled &&
                        "hover:-translate-y-0.5 hover:drop-shadow-md",
                )}
              >
                {/* Single mode expiry badge */}
                {!isAllMode && singleExpireDays !== null && !isDisabled && (
                  <div
                    className={cn(
                      "absolute -top-2 -right-2 z-20 min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-background shadow-sm",
                      singleExpireDays === 0
                        ? "bg-red-500 text-white"
                        : singleExpireDays <= 3
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white",
                    )}
                  >
                    {singleExpireDays === 0 ? "!" : singleExpireDays}
                  </div>
                )}

                <ChairSVG
                  seatNo={seatNo}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  isAllMode={isAllMode}
                  activeShifts={activeShifts}
                  shifts={shifts}
                  shiftExpiries={shiftExpiries}
                  subscriptionStatus={subscriptionStatus}
                  isBooked={isBooked}
                  allShifts={allShifts}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium uppercase tracking-wider border border-border/50">
          <MapPin size={14} /> Main Entrance
        </div>
      </div>
    </div>
  );
}
