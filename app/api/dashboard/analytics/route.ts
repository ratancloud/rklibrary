import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

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

    // Get subscription status breakdown
    const subscriptionStatus = await prisma.subscription.groupBy({
      by: ['status'],
      where: { libraryId: library.id },
      _count: true,
    });

    // Get revenue by month (last 6 months)
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const monthRevenue = await prisma.subscription.aggregate({
        where: {
          libraryId: library.id,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { totalAmount: true },
      });

      revenueByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: monthRevenue._sum.totalAmount || 0,
      });
    }

    // Get top performing floors
    const floorStats = await prisma.subscription.groupBy({
      by: ['floorName'],
      where: { libraryId: library.id },
      _count: true,
      _sum: { totalAmount: true },
    });

    const topFloors = floorStats
      .map((floor) => ({
        floor: floor.floorName,
        subscriptions: floor._count,
        revenue: floor._sum.totalAmount || 0,
      }))
      .sort((a, b) => b.subscriptions - a.subscriptions)
      .slice(0, 5);

    // Get new students this month
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const newStudentsThisMonth = await prisma.student.count({
      where: {
        libraryId: library.id,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Get best performing shifts
    const shiftStats = await prisma.seatAssignment.groupBy({
      by: ['shiftId'],
      where: {
        seat: {
          floor: { libraryId: library.id },
        },
      },
      _count: true,
    });

    const shifts = await prisma.shift.findMany({
      where: { libraryId: library.id },
      select: { id: true, name: true },
    });

    const topShifts = shiftStats
      .map((stat) => {
        const shiftInfo = shifts.find((s) => s.id === stat.shiftId);
        return {
          shift: shiftInfo?.name || 'Unknown',
          bookings: stat._count,
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 4);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionStatus: Object.fromEntries(
          subscriptionStatus.map((s) => [s.status, s._count])
        ),
        revenueByMonth,
        topFloors,
        topShifts,
        newStudentsThisMonth,
        totalBookingsThisMonth: await prisma.subscription.count({
          where: {
            libraryId: library.id,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
