import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getLibraryId(userId: string) {
  const library = await prisma.library.findUnique({
    where: { userId },
    select: { id: true },
  });
  return library?.id;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const libraryId = await getLibraryId(session.user.id);
    if (!libraryId) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: { libraryId },
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          orderBy: { endDate: "desc" },
          take: 1,
          select: {
            id: true,
            floorName: true,
            seatNo: true,
            shiftName: true,
            totalAmount: true,
            amountPaid: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Fetch Students Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const libraryId = await getLibraryId(session.user.id);
    if (!libraryId) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, gender, phoneNumber, address, lockerNumber } = body;
    
    if (!name || !gender || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
        gender,
        phoneNumber,
        address,
        lockerNumber: lockerNumber ? parseInt(lockerNumber) : null,
        libraryId,
      },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    console.error("Create Student Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Phone number or Locker number already exists" },
        { status: 400 },
      );
    }
    console.error("Create Student Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
