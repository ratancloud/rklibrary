import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET SINGLE STUDENT with subscriptions and assignments
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isNumeric = /^\d+$/.test(id);

    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: id }, isNumeric ? { memberId: parseInt(id) } : {}],
        library: { userId: session.user.id },
      },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          include: {
            seat: {
              include: { floor: true },
            },
            shift: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error("Fetch Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// UPDATE STUDENT (Partial Update with Dynamic Fields) - Also handles locker assignment validation
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Verify student exists and belongs to the current user's library
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      select: { library: { select: { userId: true } } }, // Highly optimized fetch
    });

    if (
      !existingStudent ||
      existingStudent.library.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Student not found or unauthorized" },
        { status: 404 },
      );
    }

    // 2. Dynamically build update data
    const updateData: any = {};
    const stringFields = [
      "name",
      "gender",
      "phoneNumber",
      "fatherName",
      "fatherPhone",
      "aadhaarNumber",
      "address",
      "temporaryAddress",
      "profileImageUrl",
      "profileImageId",
      "aadhaarFrontUrl",
      "aadhaarFrontId",
      "aadhaarBackUrl",
      "aadhaarBackId",
    ];

    stringFields.forEach((field) => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    if (body.lockerNumber !== undefined) {
      updateData.lockerNumber = body.lockerNumber
        ? Number(body.lockerNumber)
        : null;
    }

    // 3. Perform the update (Database will automatically check the locker!)
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Student updated",
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error("Update Student Error:", error);

    // 4. Handle Database Validation Errors (Including the Locker)
    if (error.code === "P2002") {
      const target = error.meta?.target || [];
      let errorMsg = "A record with this information already exists";

      // Determine which unique constraint failed
      if (target.includes("phoneNumber")) {
        errorMsg = "This phone number is already registered.";
      } else if (target.includes("aadhaarNumber")) {
        errorMsg = "This Aadhaar number is already registered.";
      } else if (target.includes("libraryId_lockerNumber")) {
        // Catches the compound constraint
        errorMsg = "This locker is already assigned to another student.";
      }

      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 },
    );
  }
}

// DELETE STUDENT
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.student.delete({
      where: {
        id,
        library: { userId: session.user.id },
      },
    });

    return NextResponse.json({ success: true, message: "Student deleted" });
  } catch (error) {
    console.error("Delete Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500 },
    );
  }
}
