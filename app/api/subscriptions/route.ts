// app/api/subscriptions/route.ts  (POST only — replace your existing POST)
//
// KEY FIXES vs old version:
//   1. Conflict check now uses SeatAssignment (not Subscription)
//      Reason: SeatAssignment is the source of truth for physical occupancy.
//              A student with an expired subscription is still physically seated
//              until the librarian removes them. Checking Subscription would
//              allow double-booking expired seats.
//
//   2. amountPaid is now actually saved (was ignored before)
//
//   3. No more date-range conflict check — if SeatAssignment exists for
//      seat+shift, it's occupied. Period. No date logic needed.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

function shiftsOverlap(s1: number, e1: number, s2: number, e2: number) {
  return s1 < e2 && s2 < e1;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { seatId, studentId, newStudent, shiftIds, startDate, endDate, totalAmount, discount = 0, amountPaid = 0 } = body;

    if (!seatId || !shiftIds?.length || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });
    if (!library) {
      return NextResponse.json({ error: 'Library not found' }, { status: 403 });
    }

    // Verify seat belongs to this library
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: { floor: true },
    });
    if (!seat || seat.floor.libraryId !== library.id) {
      return NextResponse.json({ error: 'Seat not found' }, { status: 404 });
    }

    // Verify shifts belong to this library
    const shifts = await prisma.shift.findMany({
      where: { id: { in: shiftIds }, libraryId: library.id },
    });
    if (shifts.length !== shiftIds.length) {
      return NextResponse.json({ error: 'One or more shifts not found' }, { status: 404 });
    }

    // Validate selected shifts don't overlap with each other
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const s1 = shifts[i], s2 = shifts[j];
        if (shiftsOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
          return NextResponse.json({
            error: `Shifts overlap: ${s1.name} (${formatTime(s1.startTime)}-${formatTime(s1.endTime)}) and ${s2.name} (${formatTime(s2.startTime)}-${formatTime(s2.endTime)})`,
          }, { status: 400 });
        }
      }
    }

    // ✅ CORRECT CONFLICT CHECK: Use SeatAssignment, not Subscription
    // If a SeatAssignment row exists for this seat+shift, it's physically occupied.
    // Doesn't matter if the subscription is active or expired.
    const existingAssignments = await prisma.seatAssignment.findMany({
      where: {
        seatId,
        shiftId: { in: shiftIds },
      },
      include: {
        shift: { select: { name: true } },
        student: { select: { name: true, memberId: true } },
      },
    });

    if (existingAssignments.length > 0) {
      const conflicts = existingAssignments.map(
        (a) => `${a.shift.name} (occupied by ${a.student.name} #${a.student.memberId})`
      );
      return NextResponse.json({
        error: `Seat already occupied for: ${conflicts.join(', ')}. Librarian must remove the student before rebooking.`,
      }, { status: 409 });
    }

    // Handle student: create new or use existing
    let finalStudentId = studentId;

    if (newStudent) {
      const created = await prisma.student.create({
        data: {
          name: newStudent.name,
          phoneNumber: newStudent.phoneNumber,
          gender: newStudent.gender || 'MALE',
          address: newStudent.address,
          libraryId: library.id,
        },
      });
      finalStudentId = created.id;
    } else if (!studentId) {
      return NextResponse.json({ error: 'Student information required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: finalStudentId },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setUTCHours(0, 0, 0, 0); 
    start.setMinutes(start.getMinutes() - 330); // Subtract 330 mins (5h 30m) to align UTC with IST start-of-day

    end.setUTCHours(23, 59, 59, 999);
    end.setMinutes(end.getMinutes() - 330); // Subtract 330 mins to align UTC with IST end-of-day

    // Create Subscription (financial snapshot) + SeatAssignments (physical occupancy)
    // Done in a transaction so either both succeed or neither does
    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          libraryId: library.id,
          studentId: finalStudentId,
          floorName: seat.floor.name,
          seatNo: seat.seatNo,
          shiftName: shifts.map((s) => s.name),
          studentName: student.name,
          studentGender: student.gender,
          studentPhone: student.phoneNumber,
          studentAddress: student.address || '',
          startDate: start,
          endDate: end,
          totalAmount: Math.round(totalAmount) || 0,
          discount: Math.round(discount) || 0,
          amountPaid: Math.round(amountPaid) || 0,
          status: 'ACTIVE',
        },
      });

      // Create one SeatAssignment per shift
      await tx.seatAssignment.createMany({
        data: shifts.map((shift) => ({
          seatId: seat.id,
          shiftId: shift.id,
          studentId: finalStudentId,
        })),
      });

      return subscription;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        studentId: finalStudentId,
        studentName: student.name,
        memberId: student.memberId,
        seatNo: seat.seatNo,
        floorName: seat.floor.name,
        startDate: result.startDate,
        endDate: result.endDate,
        totalAmount: result.totalAmount,
        discount: result.discount,
        amountPaid: result.amountPaid,
        shifts: shifts.map((s) => ({ id: s.id, name: s.name, price: s.price })),
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Subscription creation error:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Seat already assigned for one of the selected shifts' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    );
  }
}
