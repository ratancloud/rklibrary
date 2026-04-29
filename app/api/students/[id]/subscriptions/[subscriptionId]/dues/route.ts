import { NextRequest, NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
    subscriptionId: string;
  }>;
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  const { id: studentId, subscriptionId } = await context.params;

  let body: { amountPaid?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const payment = Number(body.amountPaid);
  if (!payment || isNaN(payment) || payment <= 0) {
    return NextResponse.json(
      { success: false, message: 'amountPaid must be a positive number' },
      { status: 400 }
    );
  }

  // ── Fetch subscription ────────────────────────────────────────────────────
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, studentId },
  });

  if (!subscription) {
    return NextResponse.json(
      { success: false, message: 'Subscription not found' },
      { status: 404 }
    );
  }

  // ── Validate payment does not exceed outstanding ──────────────────────────
  const currentDues = subscription.totalAmount - subscription.amountPaid;
  if (payment > currentDues) {
    return NextResponse.json(
      {
        success: false,
        message: `Payment of ₹${payment} exceeds outstanding dues of ₹${currentDues}`,
      },
      { status: 400 }
    );
  }

  // ── Apply payment ─────────────────────────────────────────────────────────
  const newAmountPaid = subscription.amountPaid + payment;

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { amountPaid: newAmountPaid },
    select: {
      id: true,
      totalAmount: true,
      amountPaid: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Payment of ₹${payment} recorded successfully`,
    data: {
      ...updated,
      outstandingDues: updated.totalAmount - updated.amountPaid,
    },
  });
}