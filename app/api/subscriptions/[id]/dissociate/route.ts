import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/subscriptions/[id]/dissociate
// Removes SeatAssignment only so admin can reassign seat to another student.
// Subscription status is NOT touched — midnight cron job handles expiry.
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: subscriptionId } = await context.params;

    // 1. Fetch subscription + ownership check
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        studentId: true,
        floorName: true,
        seatNo: true,
        shiftName: true,
        library: {
          select: { userId: true },
        },
      },
    });

    if (!subscription)
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );

    if (subscription.library.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!subscription.studentId)
      return NextResponse.json(
        { error: "No student linked to this subscription" },
        { status: 400 },
      );

    // 2. Resolve seat by floorName + seatNo scoped to this library
    const seat = await prisma.seat.findFirst({
      where: {
        seatNo: subscription.seatNo,
        floor: {
          name: subscription.floorName,
          library: { userId: session.user.id },
        },
      },
      select: { id: true },
    });

    if (!seat)
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });

    // 3. Resolve shift IDs from the shiftName[] stored on the subscription
    const shifts = await prisma.shift.findMany({
      where: {
        name: { in: subscription.shiftName },
        library: { userId: session.user.id },
      },
      select: { id: true },
    });

    if (shifts.length === 0)
      return NextResponse.json(
        { error: "No matching shifts found" },
        { status: 404 },
      );

    // 4. Delete only the SeatAssignment rows — subscription stays untouched
    const deleted = await prisma.seatAssignment.deleteMany({
      where: {
        seatId: seat.id,
        shiftId: { in: shifts.map((s) => s.id) },
        studentId: subscription.studentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deleted.count} seat assignment(s) removed.`,
    });
  } catch (error) {
    console.error("[DISSOCIATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
