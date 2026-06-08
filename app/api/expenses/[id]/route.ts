import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateExpenseSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = updateExpenseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const updateData = validation.data;

    // Prevent updating with an empty object
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }

    // 2. Update database
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 },
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Expense deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
