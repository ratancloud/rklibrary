import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { addMonths, startOfDay } from "date-fns";

// GET /api/subscriptions/[id]/renew
// Returns prefill data for the renew page
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        studentName: true,
        studentPhone: true,
        studentGender: true,
        studentAddress: true,
        floorName: true,
        seatNo: true,
        shiftName: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        discount: true,
        amountPaid: true,
        status: true,
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

    // Compute new start date:
    // ALWAYS start the day AFTER the old endDate to ensure continuous
    // billing, regardless of whether the old subscription is expired.
    const oldEnd = startOfDay(new Date(subscription.endDate));

    // Fetch current shift prices
    const shifts = await prisma.shift.findMany({
      where: {
        name: { in: subscription.shiftName },
        library: { userId: session.user.id },
      },
      select: { name: true, price: true },
    });

    const pricePerMonth = shifts.reduce((sum, s) => sum + s.price, 0);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        studentId: subscription.studentId,
        studentName: subscription.studentName,
        studentPhone: subscription.studentPhone,
        studentGender: subscription.studentGender,
        studentAddress: subscription.studentAddress,
        floorName: subscription.floorName,
        seatNo: subscription.seatNo,
        shiftName: subscription.shiftName,
        previousStartDate: subscription.startDate,
        previousEndDate: subscription.endDate,
        previousStatus: subscription.status,
        newStartDate: oldEnd,
        pricePerMonth,
      },
    });
  } catch (error) {
    console.error("[RENEW GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/subscriptions/[id]/renew
// Body: { months: number, amountPaid: number }
// Creates a new Subscription row. Old one stays as historical record.
// Re-creates SeatAssignment if missing (in case seat was dissociated).
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const months = parseInt(body?.months);
    const discount = parseInt(body?.discount ?? "0");
    const amountPaid = parseInt(body?.amountPaid ?? "0");

    if (!months || months < 1 || months > 12)
      return NextResponse.json(
        { error: "months must be between 1 and 12" },
        { status: 400 },
      );

    if (isNaN(discount) || discount < 0)
      return NextResponse.json(
        { error: "Invalid discount" },
        { status: 400 },
      );

    if (isNaN(amountPaid) || amountPaid < 0)
      return NextResponse.json(
        { error: "Invalid amountPaid" },
        { status: 400 },
      );

    // 1. Fetch old subscription
    const old = await prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        libraryId: true,
        studentId: true,
        floorName: true,
        seatNo: true,
        shiftName: true,
        studentName: true,
        studentGender: true,
        studentPhone: true,
        studentAddress: true,
        endDate: true,
        status: true,
        library: {
          select: { userId: true },
        },
      },
    });

    if (!old)
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );

    if (old.library.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!old.studentId)
      return NextResponse.json(
        { error: "No student linked to this subscription" },
        { status: 400 },
      );

    // 2. Compute new start date:
    // ALWAYS start the day AFTER the old endDate to ensure continuous 
    // billing, regardless of whether the old subscription is expired.
    const oldEnd = startOfDay(new Date(old.endDate));
    const newStartDate = oldEnd
    const newEndDate = addMonths(newStartDate, months);

    // 3. Get shift prices for totalAmount
    const shifts = await prisma.shift.findMany({
      where: {
        name: { in: old.shiftName },
        library: { userId: session.user.id },
      },
      select: { id: true, name: true, price: true },
    });

    const totalAmount =
      shifts.length > 0
        ? shifts.reduce((sum, s) => sum + s.price, 0) * months
        : 0;

    if (discount > totalAmount)
      return NextResponse.json(
        { error: "discount cannot exceed totalAmount" },
        { status: 400 },
      );

    const finalAmount = totalAmount - discount;

    if (amountPaid > finalAmount)
      return NextResponse.json(
        { error: "amountPaid cannot exceed final amount" },
        { status: 400 },
      );

    // 4. Create new subscription + ensure SeatAssignment exists — in a transaction
    const seat = await prisma.seat.findFirst({
      where: {
        seatNo: old.seatNo,
        floor: {
          name: old.floorName,
          library: { userId: session.user.id },
        },
      },
      select: { id: true },
    });

    const newSubscription = await prisma.$transaction(async (tx) => {
      // Create new subscription row
      const created = await tx.subscription.create({
        data: {
          libraryId: old.libraryId,
          studentId: old.studentId,
          floorName: old.floorName,
          seatNo: old.seatNo,
          shiftName: old.shiftName,
          studentName: old.studentName,
          studentGender: old.studentGender,
          studentPhone: old.studentPhone,
          studentAddress: old.studentAddress,
          startDate: newStartDate,
          endDate: newEndDate,
          totalAmount,
          discount,
          amountPaid,
          status: "ACTIVE",
        },
      });

      // Re-create SeatAssignments if missing (upsert = safe if already exists)
      if (seat && shifts.length > 0) {
        for (const shift of shifts) {
          await tx.seatAssignment.upsert({
            where: {
              seatId_shiftId: {
                seatId: seat.id,
                shiftId: shift.id,
              },
            },
            // If assignment exists but points to a different student (edge case), update it
            update: { studentId: old.studentId! },
            create: {
              seatId: seat.id,
              shiftId: shift.id,
              studentId: old.studentId!,
            },
          });
        }
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      message: `Subscription renewed for ${months} month(s).`,
      subscriptionId: newSubscription.id,
      startDate: newStartDate,
      endDate: newEndDate,
      totalAmount,
      discount,
      finalAmount,
      amountPaid,
    });
  } catch (error) {
    console.error("[RENEW POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
