import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createExpenseSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const libraryId = library?.id;

    if (!libraryId) {
      return NextResponse.json(
        { error: "libraryId is required" },
        { status: 400 },
      );
    }
    const body = await req.json();
    const validation = createExpenseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 },
      );
    }

    const data = validation.data;

    const newExpense = await prisma.expense.create({
      data: {
        libraryId: libraryId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(
      searchParams.get("year") ?? String(now.getFullYear()),
    );
    const month = parseInt(
      searchParams.get("month") ?? String(now.getMonth() + 1),
    );

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const libraryId = library?.id;

    if (!libraryId) {
      return NextResponse.json(
        { error: "libraryId is required" },
        { status: 400 },
      );
    }

    let dateFilter = {};

    if (month && year) {
      const monthIndex = month - 1;
      const parsedYear = year;
      const startOfMonth = new Date(parsedYear, monthIndex, 1);
      const endOfMonth = new Date(
        parsedYear,
        monthIndex + 1,
        0,
        23,
        59,
        59,
        999,
      );

      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    const expenses = await prisma.expense.findMany({
      where: { libraryId, ...dateFilter },
      orderBy: { date: "desc" },
    });

    const totalExpenditure = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return NextResponse.json(
      { total: totalExpenditure, count: expenses.length, expenses },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
