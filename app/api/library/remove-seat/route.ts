import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/library/remove-seat
// Removes SeatAssignment only so admin can reassign seat to another student.
// Subscription status is NOT touched — midnight cron job handles expiry.
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { seatId, shiftName } = await req.json();

    if (!seatId || !shiftName) {
      return NextResponse.json(
        { error: "Missing or invalid parameters" },
        { status: 400 },
      );
    }

    const [seat, shift] = await Promise.all([
      prisma.seat.findFirst({
        where: {
          id: seatId,
        },
        select: { id: true },

      }),
      prisma.shift.findFirst({
        where: {
          name: shiftName,
        },
        select: { id: true },
      }),
    ]);

    // Validation checks
    if (!seat) {
      return NextResponse.json({ error: "Seat not found." }, { status: 404 });
    }
    if (!shift) {
      return NextResponse.json({ error: "Shift not found." }, { status: 404 });
    }

    const deleted = await prisma.seatAssignment.deleteMany({
      where: {
        seatId: seat.id,
        shiftId: shift.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deleted.count} seat assignment(s) removed.`,
    });
  } catch (error) {
    console.error("[REMOVE_SEAT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
