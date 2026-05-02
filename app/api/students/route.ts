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
            discount: true,
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
    const {
      name,
      gender,
      phoneNumber,
      fatherName,
      fatherPhone,
      aadhaarNumber,
      address,
      temporaryAddress,
      lockerNumber,
      profileImageUrl,
      profileImageId,
      aadhaarFrontUrl,
      aadhaarFrontId,
      aadhaarBackUrl,
      aadhaarBackId,
    } = body;
    
    if (!name || !gender || !phoneNumber || !fatherName || !fatherPhone) {
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
        fatherName,
        fatherPhone,
        aadhaarNumber,
        address,
        temporaryAddress,
        lockerNumber: lockerNumber ? parseInt(lockerNumber) : null,
        profileImageUrl,
        profileImageId,
        aadhaarFrontUrl,
        aadhaarFrontId,
        aadhaarBackUrl,
        aadhaarBackId,
        libraryId,
      },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create Student Error:", error);
    const err = error as { code?: string; meta?: { target?: string[] }; message?: string };
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0];
      console.log(field);
      
      let errorMsg = "A record with this information already exists";
      
      if (field === "phoneNumber") {
        errorMsg = "This phone number is already registered";
      } else if (field === "lockerNumber") {
        errorMsg = "This locker number is already assigned to another student";
      } else if (field === "fatherPhone") {
        errorMsg = "This father's phone number is already registered";
      }
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
