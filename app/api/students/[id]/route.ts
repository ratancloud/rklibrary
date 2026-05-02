import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET SINGLE STUDENT
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

// UPDATE STUDENT
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

    // Manual check for lockerNumber unique constraint within the same library
    if (lockerNumber) {
      const existingLocker = await prisma.student.findFirst({
        where: {
          lockerNumber: Number(lockerNumber),
          library: { userId: session.user.id },
          NOT: { id: id },
        },
      });

      if (existingLocker) {
        return NextResponse.json(
          {
            success: false,
            message: `Locker ${lockerNumber} is already in use.`,
          },
          { status: 400 },
        );
      }
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id,
        library: { userId: session.user.id },
      },
      data: {
        ...(name && { name }),
        ...(gender && { gender }),
        ...(phoneNumber && { phoneNumber }),
        ...(fatherName && { fatherName }),
        ...(fatherPhone && { fatherPhone }),
        ...(aadhaarNumber !== undefined && { aadhaarNumber }),
        ...(address !== undefined && { address }),
        ...(temporaryAddress !== undefined && { temporaryAddress }),
        ...(lockerNumber !== undefined && {
          lockerNumber: lockerNumber ? Number(lockerNumber) : null,
        }),
        ...(profileImageUrl && { profileImageUrl }),
        ...(profileImageId && { profileImageId }),
        ...(aadhaarFrontUrl && { aadhaarFrontUrl }),
        ...(aadhaarFrontId && { aadhaarFrontId }),
        ...(aadhaarBackUrl && { aadhaarBackUrl }),
        ...(aadhaarBackId && { aadhaarBackId }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student updated",
      data: updatedStudent,
    });
  } catch (error: unknown) {
    console.error("Update Student Error:", error);
    const err = error as { code?: string; meta?: { target?: string[] }; message?: string };
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0];
      let errorMsg = "A record with this information already exists";
      
      if (field === "phoneNumber") {
        errorMsg = "This phone number is already registered";
      } else if (field === "lockerNumber") {
        errorMsg = "This locker number is already assigned to another student";
      } else if (field === "fatherPhone") {
        errorMsg = "This father's phone number is already registered";
      }
      
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update student" },
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
