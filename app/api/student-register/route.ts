import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import z from "zod";

const studentRegisterSchema = z.object({
  libraryId: z.string().min(1, "Library ID is required"),
  name: z.string().min(1, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z.string().min(10, "Phone number must be valid"),
  fatherName: z.string().min(1, "Father's name is required"),
  fatherPhone: z.string().min(10, "Father's phone must be valid"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be valid"),
  address: z.string().optional().nullable(),
  temporaryAddress: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  profileImageId: z.string().optional().nullable(),
  aadhaarFrontUrl: z.string().optional().nullable(),
  aadhaarFrontId: z.string().optional().nullable(),
  aadhaarBackUrl: z.string().optional().nullable(),
  aadhaarBackId: z.string().optional().nullable(),
});

// POST /api/student-register - Public endpoint for student self-registration
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate input
    const validation = studentRegisterSchema.safeParse(body);
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

    // 2. Verify library exists
    const library = await prisma.library.findUnique({
      where: { id: data.libraryId },
      select: { id: true },
    });

    if (!library) {
      return NextResponse.json(
        { error: "Library not found. Invalid registration link." },
        { status: 404 },
      );
    }

    const existing = await prisma.student.findFirst({
      where: {
        libraryId: data.libraryId,
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
        libraryId: data.libraryId,
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
