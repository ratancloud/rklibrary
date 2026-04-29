import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { startOfMonth, endOfMonth, startOfDay } from 'date-fns';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get library info
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const today = startOfDay(now);
    const monthFromNow = new Date(today);
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    // Parallel queries
    const [
      totalStudents,
      activeSubscriptions,
      allSubscriptions,
      activeSeats,
    ] = await Promise.all([
      // Total students
      prisma.student.count({
        where: { libraryId: library.id },
      }),

      // Active subscriptions
      prisma.subscription.count({
        where: {
          libraryId: library.id,
          status: 'ACTIVE',
        },
      }),

      // All subscriptions for revenue calculation
      prisma.subscription.findMany({
        where: { libraryId: library.id },
        select: { totalAmount: true, status: true, endDate: true, amountPaid: true },
      }),

      // Total seats
      prisma.seat.count({
        where: {
          floor: { libraryId: library.id },
        },
      }),

      // Active (non-disabled) seats
      prisma.seat.count({
        where: {
          floor: { libraryId: library.id },
          isActive: true,
        },
      }),
    ]);

    // Calculate revenue (total amounts from subscriptions)
    const totalRevenue = allSubscriptions.reduce(
      (sum, sub) => sum + (sub.totalAmount || 0),
      0
    );

    // Calculate occupancy rate
    const occupancyRate = activeSeats > 0 
      ? (activeSubscriptions / activeSeats) * 100 
      : 0;

    // Count pending payments
    const pendingPayments = allSubscriptions.filter(
      (sub) => sub.status === 'ACTIVE' && sub.amountPaid < sub.totalAmount
    ).length;

    // Count subscriptions expiring this month
    const expiringThisMonth = allSubscriptions.filter((sub) => {
      const endDate = new Date(sub.endDate);
      return (
        endDate >= monthStart &&
        endDate <= monthEnd &&
        sub.status === 'ACTIVE'
      );
    }).length;

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        activeSubscriptions,
        totalRevenue,
        occupancyRate,
        pendingPayments,
        expiringThisMonth,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
