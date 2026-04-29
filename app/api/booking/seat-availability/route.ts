// app/api/booking/seat-availability/route.ts
//
// GET /api/booking/seat-availability?seatId=xxx
//
// Returns:
//   - All library shifts (active + inactive)
//   - For each shift: is it occupied? if yes, who is sitting there?
//   - Source of truth: SeatAssignment (NOT Subscription)
//
// This is the correct way to check availability because:
//   SeatAssignment = physical occupancy (persists even after subscription expires)
//   Subscription   = financial record only (snapshot)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seatId = searchParams.get('seatId');

    if (!seatId) {
      return NextResponse.json({ error: 'Missing seatId' }, { status: 400 });
    }

    // Get library for this user
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!library) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 });
    }

    // Verify this seat belongs to this library
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        floor: {
          select: { id: true, name: true, libraryId: true },
        },
      },
    });

    if (!seat || seat.floor.libraryId !== library.id) {
      return NextResponse.json({ error: 'Seat not found' }, { status: 404 });
    }

    // Get all shifts for this library
    const allShifts = await prisma.shift.findMany({
      where: { libraryId: library.id },
      orderBy: { startTime: 'asc' },
    });

    // Get all current SeatAssignments for this seat
    // This tells us who is physically sitting here, per shift
    const assignments = await prisma.seatAssignment.findMany({
      where: { seatId },
      include: {
        shift: true,
        student: {
          select: {
            id: true,
            name: true,
            memberId: true,
            phoneNumber: true,
            gender: true,
            // Also get their latest subscription for context
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { endDate: 'desc' },
              take: 1,
              select: {
                id: true,
                endDate: true,
                totalAmount: true,
                amountPaid: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Build a map: shiftId -> assignment info
    const assignmentMap = new Map(
      assignments.map((a) => [a.shiftId, a])
    );

    // Build the response: for each shift, is it free or occupied?
    const shiftsWithAvailability = allShifts.map((shift) => {
      const assignment = assignmentMap.get(shift.id);

      if (!assignment) {
        // No SeatAssignment exists — shift is FREE for this seat
        return {
          id: shift.id,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          price: shift.price,
          isActive: shift.isActive,
          isOccupied: false,
          occupiedBy: null,
        };
      }

      // Shift is occupied — show who is sitting here
      const activeSub = assignment.student.subscriptions[0] ?? null;
      return {
        id: shift.id,
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        price: shift.price,
        isActive: shift.isActive,
        isOccupied: true,
        occupiedBy: {
          studentId: assignment.student.id,
          studentName: assignment.student.name,
          memberId: assignment.student.memberId,
          phoneNumber: assignment.student.phoneNumber,
          gender: assignment.student.gender,
          // Subscription info for context (may be null if subscription expired but student still assigned)
          activeSubscription: activeSub
            ? {
                id: activeSub.id,
                endDate: activeSub.endDate,
                totalAmount: activeSub.totalAmount,
                amountPaid: activeSub.amountPaid,
                isDue: activeSub.totalAmount > activeSub.amountPaid,
              }
            : null,
          // If no active subscription but still assigned = subscription expired, librarian hasn't removed yet
          subscriptionExpired: activeSub === null,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        seat: {
          id: seat.id,
          seatNo: seat.seatNo,
          isActive: seat.isActive,
          floorId: seat.floor.id,
          floorName: seat.floor.name,
        },
        shifts: shiftsWithAvailability,
      },
    });
  } catch (error) {
    console.error('Seat availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seat availability' },
      { status: 500 }
    );
  }
}
