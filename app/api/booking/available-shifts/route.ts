import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seatId = searchParams.get("seatId");

    if (!seatId) {
      return NextResponse.json(
        { error: "Seat ID is required" },
        { status: 400 },
      );
    }

    // Get the user's library
    const library = await prisma.library.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!library) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    const availableShifts = await prisma.shift.findMany({
      where: {
        libraryId: library.id,
        isActive: true,
        assignments: {
          none: {
            seatId: seatId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        price: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Fetch the seat details
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      select: { id: true, seatNo: true, floor: { select: { name: true } } },
    });

    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    }

    // Format the seat for the UI
    const formattedSeat = {
      id: seat.id,
      seatNo: seat.seatNo,
      floorName: seat.floor.name,
    };

    return NextResponse.json({
      success: true,
      seat: formattedSeat,
      data: availableShifts,
    });
  } catch (error) {
    console.error("Failed to fetch available shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch available shifts" },
      { status: 500 },
    );
  }
}
