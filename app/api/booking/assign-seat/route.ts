import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { seatId, shiftId, studentId } = body;

    if (
      !seatId ||
      !shiftId ||
      !Array.isArray(shiftId) ||
      shiftId.length === 0 ||
      !studentId
    ) {
      return NextResponse.json(
        { error: "Missing required fields or shiftId is not an array" },
        { status: 400 },
      );
    }

    // Fetch dependencies
    const [library, seat, shifts, student] = await Promise.all([
      prisma.library.findUnique({
        where: { userId },
        select: { id: true },
      }),
      prisma.seat.findUnique({
        where: { id: seatId },
        select: { id: true, floor: { select: { libraryId: true } } },
      }),
      prisma.shift.findMany({
        where: { id: { in: shiftId } },
        select: { id: true, libraryId: true },
      }),
      prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, libraryId: true },
      }),
    ]);

    // Validation Checks
    if (!library) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }
    if (!seat || seat.floor.libraryId !== library.id) {
      return NextResponse.json(
        { error: "Seat not found or doesn't belong to this library" },
        { status: 404 },
      );
    }
    if (!student || student.libraryId !== library.id) {
      return NextResponse.json(
        { error: "Student not found or doesn't belong to this library" },
        { status: 404 },
      );
    }

    if (
      shifts.length !== shiftId.length ||
      shifts.some((s) => s.libraryId !== library.id)
    ) {
      return NextResponse.json(
        {
          error:
            "One or more shifts not found or do not belong to this library",
        },
        { status: 404 },
      );
    }

    // Prevent student from booking the same shift on different seats
    const overlappingAssignment = await prisma.seatAssignment.findFirst({
      where: {
        studentId: studentId,
        shiftId: {
          in: shiftId,
        },
      },
      include: {
        shift: { select: { name: true } },
        seat: { select: { seatNo: true, floor: { select: { name: true } } } },
      },
    });

    if (overlappingAssignment) {
      return NextResponse.json(
        {
          error: `Student is already assigned to Seat ${overlappingAssignment.seat.seatNo} (${overlappingAssignment.seat.floor.name}) during the ${overlappingAssignment.shift.name} shift.`,
        },
        { status: 409 },
      );
    }

    const assignment = await prisma.seatAssignment.createMany({
      data: shiftId.map((id: string) => ({
        seatId,
        shiftId: id,
        studentId,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully created ${assignment.count} seat assignments`,
      assignment,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "This seat is already assigned for one or more of these shifts",
        },
        { status: 409 },
      );
    }

    console.error("Seat assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign seat" },
      { status: 500 },
    );
  }
}
