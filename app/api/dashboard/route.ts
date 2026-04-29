// app/api/dashboard/route.ts
// GET /api/dashboard?libraryId=xxx&year=2024&month=6

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const libraryId = searchParams.get("libraryId");
  const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  if (!libraryId) {
    return NextResponse.json({ error: "libraryId is required" }, { status: 400 });
  }

  // ── Date range for the requested month ──────────────────────────────────────
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth   = new Date(year, month, 0, 23, 59, 59, 999);

  // ── Parallel queries ────────────────────────────────────────────────────────
  const [
    totalStudents,
    newStudentsThisMonth,
    activeSubscriptions,
    expiredSubscriptions,
    subscriptionsInMonth,
    floors,
    seatAssignments,
    inquiries,
    recentSubscriptions,
    recentInquiries,
  ] = await Promise.all([

    // 1. Total students in library
    prisma.student.count({ where: { libraryId } }),

    // 2. New students this month
    prisma.student.count({
      where: { libraryId, createdAt: { gte: startOfMonth, lte: endOfMonth } },
    }),

    // 3. Active subscriptions (active during this month)
    prisma.subscription.count({
      where: {
        libraryId,
        status: "ACTIVE",
        startDate: { lte: endOfMonth },
        endDate:   { gte: startOfMonth },
      },
    }),

    // 4. Expired subscriptions this month
    prisma.subscription.count({
      where: {
        libraryId,
        status: "EXPIRED",
        endDate: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    // 5. All subscriptions active in month (for revenue)
    prisma.subscription.findMany({
      where: {
        libraryId,
        startDate: { lte: endOfMonth },
        endDate:   { gte: startOfMonth },
      },
      select: {
        totalAmount: true,
        amountPaid:  true,
        shiftName:   true,
        status:      true,
      },
    }),

    // 6. All floors with seats
    prisma.floor.findMany({
      where: { libraryId },
      include: { seats: { select: { id: true, isActive: true } } },
    }),

    // 7. Seat assignments (occupied = active sub in this month)
    prisma.seatAssignment.findMany({
      where: {
        seat: { floor: { libraryId } },
        student: {
          subscriptions: {
            some: {
              libraryId,
              status:    "ACTIVE",
              startDate: { lte: endOfMonth },
              endDate:   { gte: startOfMonth },
            },
          },
        },
      },
      select: {
        seatId:  true,
        seat: { select: { floor: { select: { name: true } } } },
      },
    }),

    // 8. Inquiries created this month
    prisma.inquiry.findMany({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      select: { id: true, status: true },
    }),

    // 9. Recent subscriptions (for table)
    prisma.subscription.findMany({
      where: {
        libraryId,
        startDate: { lte: endOfMonth },
        endDate:   { gte: startOfMonth },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id:             true,
        studentName:    true,
        studentGender:  true,
        floorName:      true,
        seatNo:         true,
        shiftName:      true,
        startDate:      true,
        endDate:        true,
        totalAmount:    true,
        amountPaid:     true,
        status:         true,
      },
    }),

    // 10. Recent inquiries (for table)
    prisma.inquiry.findMany({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id:          true,
        name:        true,
        gender:      true,
        phoneNumber: true,
        shiftNames:  true,
        status:      true,
        createdAt:   true,
      },
    }),
  ]);

  // ── Revenue aggregation ──────────────────────────────────────────────────────
  const totalRevenue    = subscriptionsInMonth.reduce((s, x) => s + x.totalAmount, 0);
  const collectedRevenue = subscriptionsInMonth.reduce((s, x) => s + x.amountPaid,  0);
  const pendingRevenue  = totalRevenue - collectedRevenue;

  // ── Shift breakdown ──────────────────────────────────────────────────────────
  const shiftMap = new Map<string, { revenue: number; count: number }>();
  for (const sub of subscriptionsInMonth) {
    for (const shift of sub.shiftName) {
      const existing = shiftMap.get(shift) ?? { revenue: 0, count: 0 };
      // Divide amount proportionally across shifts on the subscription
      existing.revenue += sub.totalAmount / sub.shiftName.length;
      existing.count   += 1;
      shiftMap.set(shift, existing);
    }
  }
  const shiftRevenue = Array.from(shiftMap.entries()).map(([shift, data]) => ({
    shift,
    revenue: Math.round(data.revenue),
    count:   data.count,
  }));

  // ── Seat occupancy ───────────────────────────────────────────────────────────
  const totalSeats    = floors.reduce((s, f) => s + f.seats.filter(se => se.isActive).length, 0);
  const occupiedSeats = new Set(seatAssignments.map(a => a.seatId)).size;

  // ── Floor occupancy ──────────────────────────────────────────────────────────
  const floorOccupancyMap = new Map<string, number>();
  for (const a of seatAssignments) {
    const name = a.seat.floor.name;
    floorOccupancyMap.set(name, (floorOccupancyMap.get(name) ?? 0) + 1);
  }
  const floorOccupancy = floors.map(f => ({
    floorName:     f.name,
    totalSeats:    f.seats.filter(s => s.isActive).length,
    occupiedSeats: floorOccupancyMap.get(f.name) ?? 0,
  }));

  // ── Inquiry summary ──────────────────────────────────────────────────────────
  const totalInquiries     = inquiries.length;
  const pendingInquiries   = inquiries.filter(i => i.status === "PENDING").length;
  const convertedInquiries = inquiries.filter(i => i.status === "CONVERTED").length;

  // ── Response ─────────────────────────────────────────────────────────────────
  return NextResponse.json({
    stats: {
      totalStudents,
      newStudentsThisMonth,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      totalSeats,
      occupiedSeats,
      totalInquiries,
      pendingInquiries,
      convertedInquiries,
    },
    shiftRevenue,
    floorOccupancy,
    recentSubscriptions,
    recentInquiries,
  });
}