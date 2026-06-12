import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import z from "zod";
import { Prisma } from "@/generated/prisma/client";

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

// GET /api/students - Fetch all students for the library with Server-Side Pagination
export async function GET(request: Request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * pageSize;
    const now = new Date();

    // 1. Initialize strongly-typed where clause
    const where: Prisma.StudentWhereInput = { libraryId };
    const andConditions: Prisma.StudentWhereInput[] = [];

    // 2. Add Search Filters
    if (search) {
      const searchLower = search.toLowerCase();
      const orConditions: Prisma.StudentWhereInput[] = [
        { name: { contains: searchLower, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
        { aadhaarNumber: { contains: search } },
      ];
      
      if (/^\d+$/.test(search)) {
        const numericSearch = parseInt(search, 10);
        orConditions.push({ memberId: numericSearch });
        orConditions.push({ lockerNumber: numericSearch });
      }
      
      andConditions.push({ OR: orConditions });
    }

    // 3. Add Status Filters
    if (status === "active") {
      andConditions.push({
        assignments: { some: {} },
        subscriptions: { 
          some: { status: "ACTIVE", endDate: { gte: now } } 
        }
      });
    } else if (status === "expired") {
      andConditions.push({
        assignments: { some: {} },
        subscriptions: { 
          some: {},
          none: { status: "ACTIVE", endDate: { gte: now } }
        }
      });
    } else if (status === "none") {
      andConditions.push({
        OR: [
          { assignments: { none: {} } },
          { subscriptions: { none: {} } }
        ]
      });
    }

    // Attach dynamic AND conditions if any exist
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // 4. Execute DB Queries in parallel
    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          subscriptions: {
            where: {
              student: {
                assignments: {
                  some: {}, 
                },
              },
            },
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
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      data: students,
      total,
      page,
      pageSize
    });
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
