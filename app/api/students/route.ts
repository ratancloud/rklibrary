import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import z from "zod";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z.string().min(10, "Phone number must be valid"),
  fatherName: z.string().min(1, "Father's name is required"),
  fatherPhone: z.string().min(10, "Father's phone must be valid"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be valid"),
  address: z.string().optional().nullable(),
  temporaryAddress: z.string().optional().nullable(),
  lockerNumber: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val ? Number(val) : null)),
  profileImageUrl: z.string().optional().nullable(),
  profileImageId: z.string().optional().nullable(),
  aadhaarFrontUrl: z.string().optional().nullable(),
  aadhaarFrontId: z.string().optional().nullable(),
  aadhaarBackUrl: z.string().optional().nullable(),
  aadhaarBackId: z.string().optional().nullable(),
});

async function getLibraryId(userId: string) {
  const library = await prisma.library.findUnique({
    where: { userId },
    select: { id: true },
  });
  return library?.id;
}

// GET /api/students - Fetch all students for the library
// it is used in student table page
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
      select: {
        id: true,
        memberId: true,
        name: true,
        gender: true,
        phoneNumber: true,
        aadhaarNumber: true,
        fatherName: true,
        fatherPhone: true,
        address: true,
        temporaryAddress: true,
        lockerNumber: true,
        profileImageUrl: true,
        subscriptions: true,
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

    // 1. Validate input
    const validation = studentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Missing or invalid fields",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = validation.data;
    const existing = await prisma.student.findFirst({
      where: {
        libraryId,
        OR: [
          { phoneNumber: data.phoneNumber },
          { aadhaarNumber: data.aadhaarNumber },
        ],
      },
    });

    if (existing) {
      if (existing.phoneNumber === data.phoneNumber) {
        return NextResponse.json(
          { error: "This phone number is already registered." },
          { status: 400 },
        );
      }

      if (existing.aadhaarNumber === data.aadhaarNumber) {
        return NextResponse.json(
          { error: "This Aadhaar number is already registered." },
          { status: 400 },
        );
      }
    }

    const student = await prisma.student.create({
      data: {
        ...data,
        libraryId,
      },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create Student Error:", error);

    const err = error as any;

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate entry detected. Please check your inputs." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
