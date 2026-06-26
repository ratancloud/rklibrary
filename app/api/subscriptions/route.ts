/**
 * @route POST /api/subscriptions
 * @description Creates a new student subscription & assigns seats/lockers.
 * * --- CORE WORKFLOW & ARCHITECTURE ---
 * 1. Auth & Tenant Check: Validates the logged-in librarian owns the seat/shifts.
 * 2. Parallel Fetch: Loads Seat, Shifts, and Student concurrently for performance.
 * 3. Shift Overlap Math: Prevents mathematically overlapping time slots.
 * 4. Occupancy Check (CRITICAL): Uses `SeatAssignment` (not Subscriptions) as the
 * source of truth to prevent double-booking a physically occupied chair.
 * 5. Time Normalization: Aligns dates to exact IST start (00:00:00) and end (23:59:59) of day.
 * 6. Atomic Transaction: Ensures the financial Subscription, physical SeatAssignments,
 * and Student Locker updates all succeed or fail together.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

function shiftsOverlap(s1: number, e1: number, s2: number, e2: number) {
  return s1 < e2 && s2 < e1;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      seatId,
      shiftIds,
      studentId,
      startDate,
      endDate,
      totalAmount,
      discount = 0,
      amountPaid = 0,
      lockerAmount = 0,
      lockerNumber,
    } = body;

    if (
      !seatId ||
      !shiftIds?.length ||
      !studentId ||
      !startDate ||
      !endDate ||
      totalAmount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library) {
      return NextResponse.json({ error: "Library not found" }, { status: 403 });
    }

    // parrallel fetch seat, shifts, and student
    const [seat, shifts, student] = await Promise.all([
      prisma.seat.findUnique({
        where: { id: seatId },
        include: { floor: { select: { id: true, libraryId: true, name: true } } },
      }),
      prisma.shift.findMany({
        where: { id: { in: shiftIds }, libraryId: library.id },
        select: { id: true, name: true, startTime: true, endTime: true },
      }),
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          gender: true,
          phoneNumber: true,
          address: true,
        },
      }),
    ]);

    // validation checks
    if (!seat || seat.floor.libraryId !== library.id) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    }
    if (shifts.length !== shiftIds.length) {
      return NextResponse.json(
        { error: "One or more shifts not found" },
        { status: 404 },
      );
    }
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Validate selected shifts don't overlap with each other
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const s1 = shifts[i],
          s2 = shifts[j];
        if (shiftsOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
          return NextResponse.json(
            {
              error: `Shifts overlap: ${s1.name} (${formatTime(s1.startTime)}-${formatTime(s1.endTime)}) and ${s2.name} (${formatTime(s2.startTime)}-${formatTime(s2.endTime)})`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Use SeatAssignment, not Subscription
    const existingAssignments = await prisma.seatAssignment.findMany({
      where: {
        seatId: seat.id,
        shiftId: { in: shiftIds },
      },
      include: {
        shift: { select: { name: true } },
        student: { select: { name: true, memberId: true } },
      },
    });

    if (existingAssignments.length > 0) {
      const conflicts = existingAssignments.map(
        (a) =>
          `${a.shift.name} (occupied by ${a.student.name} #${a.student.memberId})`,
      );
      return NextResponse.json(
        {
          error: `Seat already occupied for: ${conflicts.join(", ")}. Librarian must remove the student before rebooking.`,
        },
        { status: 409 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setUTCHours(0, 0, 0, 0);
    start.setMinutes(start.getMinutes() - 330);

    end.setUTCHours(23, 59, 59, 999);
    end.setMinutes(end.getMinutes() - 330);

    // Create Subscription + SeatAssignments + Update Locker
    await prisma.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          libraryId: library.id,
          studentId: student.id,
          floorName: seat.floor.name,
          seatNo: seat.seatNo,
          shiftName: shifts.map((s) => s.name),
          studentName: student.name,
          studentGender: student.gender,
          studentPhone: student.phoneNumber,
          studentAddress: student.address || "",
          startDate: start,
          endDate: end,
          totalAmount: Math.round(totalAmount) || 0,
          discount: Math.round(discount) || 0,
          amountPaid: Math.round(amountPaid) || 0,
          lockerAmount: Math.round(lockerAmount) || 0,
          status: "ACTIVE",
        },
      });

      // Create one SeatAssignment per shift
      await tx.seatAssignment.createMany({
        data: shifts.map((shift) => ({
          seatId: seat.id,
          shiftId: shift.id,
          studentId: student.id,
        })),
      });

      if (
        lockerNumber !== undefined &&
        lockerNumber !== null &&
        lockerNumber !== ""
      ) {
        await tx.student.update({
          where: { id: student.id },
          data: { lockerNumber: Number(lockerNumber) },
        });
      }
      return;
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Subscription creation error:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Seat already assigned for one of the selected shifts" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create booking",
      },
      { status: 500 },
    );
  }
}
