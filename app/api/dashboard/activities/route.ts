import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { subDays } from 'date-fns';

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

    // Get recent subscriptions (last 30 days for bookings and renewals)
    const thirtyDaysAgo = subDays(new Date(), 30);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        libraryId: library.id,
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        floorName: true,
        seatNo: true,
        studentName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        studentId: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    // Transform subscriptions into activities
    const activities = subscriptions.map((sub) => {
      // Determine activity type based on status and dates
      let type: 'NEW_BOOKING' | 'RENEWAL' | 'EXPIRY' | 'PAYMENT' = 'NEW_BOOKING';

      // Simple heuristic: if updatedAt is significantly after createdAt, it's likely a renewal
      const timeDiff = sub.updatedAt.getTime() - sub.createdAt.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 1) {
        type = 'RENEWAL';
      } else if (sub.status === 'EXPIRED') {
        type = 'EXPIRY';
      }

      return {
        id: sub.id,
        type,
        studentName: sub.studentName,
        seatNo: sub.seatNo,
        floorName: sub.floorName,
        amount: sub.totalAmount,
        timestamp: (type === 'RENEWAL' ? sub.updatedAt : sub.createdAt).toISOString(),
      };
    });

    // Sort by timestamp descending and return top 5
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: recentActivities,
    });
  } catch (error) {
    console.error('Dashboard activities error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
