import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const expired = await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: now },
      },
      data: { 
        status: 'EXPIRED' 
      },
    });

    const daysLimit = 10;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysLimit);

    const removedSeats = await prisma.seatAssignment.deleteMany({
      where: {
        student: {
          subscriptions: {
            none: {
              endDate: {
                gte: thresholdDate,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cron tasks completed successfully',
      expiredSubscriptions: expired.count,
      freedSeats: removedSeats.count,
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}