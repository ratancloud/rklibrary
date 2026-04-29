import { differenceInDays, startOfDay } from "date-fns";

export interface ShiftData {
  studentName: string;
  studentPhone: string;
  studentGender: string;
  memberId: number;
  studentId: string;
  startDate: Date | string | null;
  expiry: Date | string | null;
  isDue: boolean;
  subscriptionId: string | null;
}

export interface SeatInfo {
  id: string;
  active: boolean;
  shifts: Record<string, ShiftData | null>;
}

export type SeatMapData = Record<string, Record<number, SeatInfo>>;

export function getSubscriptionStatus(
  expiry: Date | string | null
): "active" | "expired" {
  if (!expiry) return "expired";
  const diff = differenceInDays(
    startOfDay(new Date(expiry)),
    startOfDay(new Date())
  );
  return diff >= 0 ? "active" : "expired";
}

export function getDaysRemaining(expiry: Date | string | null): {
  days: number;
  text: string;
} | null {
  if (!expiry) return null;
  const diff = differenceInDays(
    startOfDay(new Date(expiry)),
    startOfDay(new Date())
  );
  if (diff < 0) return { days: 0, text: "Expired" };
  if (diff === 0) return { days: 0, text: "Expires today" };
  if (diff === 1) return { days: 1, text: "Expires tomorrow" };
  return { days: diff, text: `${diff} days left` };
}

export function formatShiftName(name: string): string {
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}