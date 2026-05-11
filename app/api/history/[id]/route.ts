import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// DELETE Subscription by ID
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

    await prisma.subscription.delete({
      where: {
        id,
        library: { userId: session.user.id },
      },
    });

    return NextResponse.json({ success: true, message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Delete Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500 },
    );
  }
}