import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Private:  GET /api/inquiry - Fetch all inquiries
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Inquiry ID is required" },
        { status: 400 },
      );
    }

    const inquiry = await prisma.inquiry.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Inquiry deleted successfully", data: inquiry },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 },
    );
  }
}

// Private: PATCH /api/inquiry/:id - Update inquiry status
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Inquiry ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const validStatuses = ["PENDING", "CONTACTED", "CONVERTED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry status updated successfully",
        data: inquiry,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 },
    );
  }
}
