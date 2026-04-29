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
    const { name, gender, phoneNumber, address, lockerNumber } = body;

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
        name,
        gender,
        phoneNumber,
        address,
        lockerNumber: lockerNumber ? Number(lockerNumber) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student updated",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update student" },
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
