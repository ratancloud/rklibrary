// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(
      searchParams.get("year") ?? String(now.getFullYear()),
    );
    const month = parseInt(
      searchParams.get("month") ?? String(now.getMonth() + 1),
    );

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const libraryId = library?.id;

    if (!libraryId) {
      return NextResponse.json(
        { error: "libraryId is required" },
        { status: 400 },
      );
    }

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [
      totalStudents,
      newStudentsThisMonth,
      activeSubscriptions,
      expiringThisMonthCount,
      allCurrentMonthSubscriptions,
      shifts,
      floors,
      seatAssignments,
      recentSubscriptionsData,
      expiringSubscriptionsData,
    ] = await Promise.all([
      // total students in the library
      prisma.student.count({ where: { libraryId } }),

      // new students added in the current month
      prisma.student.count({
        where: {
          libraryId,
          createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
      }),

      // active subscriptions in the current month
      prisma.subscription.count({
        where: {
          libraryId,
          status: "ACTIVE",
          startDate: { lte: lastDayOfMonth },
          endDate: { gte: firstDayOfMonth },
        },
      }),

      // subscriptions expiring in the current month
      prisma.subscription.count({
        where: {
          libraryId,
          status: "ACTIVE",
          startDate: { lte: lastDayOfMonth },
          endDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
      }),

      // all active subscriptions overlapping with the current month (for revenue calculations)
      prisma.subscription.findMany({
        where: {
          libraryId,
          createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        select: { totalAmount: true, amountPaid: true, discount: true },
      }),

      prisma.shift.findMany({
        where: { libraryId, isActive: true },
        select: { id: true, name: true, price: true },
      }),

      prisma.floor.findMany({
        where: { libraryId },
        select: {
          id: true,
          name: true,
          totalSeats: true,
          seats: { select: { id: true } },
        },
      }),

      prisma.seatAssignment.findMany({
        where: {
          shift: { libraryId },
        },
        include: { shift: true, seat: { include: { floor: true } } },
      }),

      // Recent subscriptions in the current month
      prisma.subscription.findMany({
        where: {
          libraryId,
          createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          studentName: true,
          floorName: true,
          seatNo: true,
          shiftName: true,
          startDate: true,
          endDate: true,
          totalAmount: true,
          amountPaid: true,
          status: true,
        },
      }),

      // Subscriptions expiring in the next 30 days
      prisma.subscription.findMany({
        where: {
          libraryId,
          status: "ACTIVE",
          startDate: { lte: lastDayOfMonth },
          endDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        orderBy: { endDate: "asc" },
        take: 5,
        select: {
          id: true,
          studentId: true,
          studentName: true,
          studentPhone: true,
          endDate: true,
        },
      }),
    ]);

    // --- Process Revenue ---
    let expectedMonthlyRevenue = 0;
    let collectedRevenue = 0;
    let totalDiscountsGiven = 0;

    allCurrentMonthSubscriptions.forEach((sub) => {
      expectedMonthlyRevenue += sub.totalAmount;
      collectedRevenue += sub.amountPaid;
      totalDiscountsGiven += sub.discount;
    });

    // --- Process Occupancy & Shift Analytics ---
    const totalPhysicalSeats = floors.reduce(
      (sum, floor) => sum + floor.totalSeats,
      0,
    );
    const totalCapacitySlots = totalPhysicalSeats * shifts.length;
    const occupiedSlots = seatAssignments.length;

    const shiftAnalytics = shifts.map((shift) => {
      const occupiedSeats = seatAssignments.filter(
        (sa) => sa.shiftId === shift.id,
      ).length;
      const occupancyRate =
        totalPhysicalSeats > 0
          ? Number(((occupiedSeats / totalPhysicalSeats) * 100).toFixed(2))
          : 0;

      return {
        shiftId: shift.id,
        shiftName: shift.name,
        shiftPrice: shift.price,
        occupiedSeats,
        totalSeats: totalPhysicalSeats,
        revenueGenerated: occupiedSeats * shift.price,
        occupancyRate,
      };
    });

    // --- Process Floor Occupancy ---
    const floorOccupancy = floors.map((floor) => {
      const assignmentsOnFloor = seatAssignments.filter(
        (sa) => sa.seat.floor.id === floor.id,
      );
      const uniqueOccupiedSeatIds = new Set(
        assignmentsOnFloor.map((sa) => sa.seatId),
      );

      return {
        floorId: floor.id,
        floorName: floor.name,
        totalSeats: floor.totalSeats,
        uniqueOccupiedSeats: uniqueOccupiedSeatIds.size,
      };
    });

    // --- Process Actionable Lists ---
    const formattedRecentSubscriptions = recentSubscriptionsData.map((sub) => ({
      ...sub,
      paymentStatus:
        sub.amountPaid >= sub.totalAmount && sub.totalAmount > 0
          ? "PAID"
          : sub.amountPaid > 0
            ? "PARTIAL"
            : "UNPAID",
    }));

    const formattedExpiringSoon = expiringSubscriptionsData.map((sub) => ({
      ...sub,
      daysRemaining: Math.ceil(
        (sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));

    return NextResponse.json({
      kpis: {
        totalStudents,
        newStudentsThisMonth,
        activeSubscriptions,
        expiringThisMonth: expiringThisMonthCount,
      },
      revenue: {
        expectedMonthlyRevenue,
        collectedRevenue,
        pendingRevenue: expectedMonthlyRevenue - collectedRevenue,
        totalDiscountsGiven,
      },
      occupancyOverview: {
        totalPhysicalSeats,
        totalCapacitySlots,
        occupiedSlots,
        overallOccupancyRate:
          totalCapacitySlots > 0
            ? Number(((occupiedSlots / totalCapacitySlots) * 100).toFixed(2))
            : 0,
      },
      shiftAnalytics,
      floorOccupancy,
      actionableLists: {
        recentSubscriptions: formattedRecentSubscriptions,
        expiringSoon: formattedExpiringSoon,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
