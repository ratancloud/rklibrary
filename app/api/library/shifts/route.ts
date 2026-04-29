import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Shift } from "@/lib/validations";

interface SyncShiftsRequest {
  libraryId: string;
  shifts: Shift[];
}

export async function GET() {
  try {
    const library = await prisma.library.findFirst({
      select: {
        id: true,
        name: true,
        shifts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (!library) {
      return NextResponse.json(
        { error: "No library found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        libraryId: library.id,
        libraryName: library.name,
        shifts: library.shifts,
      },
    });
  } catch (error) {
    console.error("Failed to fetch public shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { libraryId, shifts } = (await req.json()) as SyncShiftsRequest;

    if (!libraryId) {
      return NextResponse.json(
        { error: "Library ID required" },
        { status: 400 },
      );
    }

    // 1. Security Check: Ensure the library belongs to the user
    const libraryOwner = await prisma.library.findFirst({
      where: {
        id: libraryId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!libraryOwner) {
      return NextResponse.json(
        { error: "Forbidden: Library access denied" },
        { status: 403 },
      );
    }

    // 2. Perform updates in a transaction
    await prisma.$transaction(async (tx) => {
      for (const shift of shifts) {
        await tx.shift.update({
          // Scoped where clause for extra safety
          where: {
            id: shift.id,
            libraryId: libraryId,
          },
          data: {
            startTime: shift.startTime,
            endTime: shift.endTime,
            price: shift.price,
            isActive: shift.isActive,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync shifts:", error);
    return NextResponse.json(
      { error: "Failed to synchronize shifts" },
      { status: 500 },
    );
  }
}
