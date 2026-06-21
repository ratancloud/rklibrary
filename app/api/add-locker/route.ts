import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

const createLockerSchema = z.object({
  lockerNumber: z.number().int().positive(),
  studentId: z.string(),
  lockerAmount: z.number().min(0),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedBody = createLockerSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsedBody.error.format() },
        { status: 400 },
      );
    }

    const { lockerNumber, studentId, lockerAmount } = parsedBody.data;

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!library?.id) {
      return NextResponse.json(
        { error: "libraryId is required" },
        { status: 400 },
      );
    }
    const libraryId = library.id;

    const [existingLockerOwner, activeSubscription] = await Promise.all([
      prisma.student.findFirst({
        where: { libraryId, lockerNumber },
        select: { id: true, name: true },
      }),
      prisma.subscription.findFirst({
        where: { studentId, libraryId, status: "ACTIVE" },
        select: { id: true },
      }),
    ]);

    if (existingLockerOwner && existingLockerOwner.id !== studentId) {
      return NextResponse.json(
        { error: `Locker #${lockerNumber} is already assigned to ${existingLockerOwner.name}.` },
        { status: 409 },
      );
    }

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "Student does not have an active subscription." },
        { status: 403 },
      );
    }

    const [updatedStudent, updatedSubscription] = await prisma.$transaction([
      prisma.student.update({
        where: { id: studentId },
        data: { lockerNumber },
        select: { id: true },
      }),
      
      prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { lockerAmount },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      message: "Locker assigned successfully",
      studentId: updatedStudent.id,
      subscriptionId: updatedSubscription.id,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Assign Locker Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}