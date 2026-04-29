import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { librarySchema } from "@/lib/validations";
import { ZodError } from "zod";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const library = await prisma.library.findFirst({
      where: { userId: session.user.id },
      omit: { createdAt: true, updatedAt: true },
      include: {
        floors: {
          select: { id: true, name: true, totalSeats: true },
          orderBy: { name: "asc" },
        },
        shifts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            isActive: true,
            price: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!library) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    return NextResponse.json(library);
  } catch (error) {
    console.error("Failed to fetch library:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 },
    );
  }
}

// update library details
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validatedData = librarySchema.parse(body);

    // Find library first to get its ID
    const existingLibrary = await prisma.library.findFirst({
      where: { userId: session.user.id },
    });

    if (!existingLibrary) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    const library = await prisma.library.update({
      where: { id: existingLibrary.id },
      data: validatedData,
      omit: { createdAt: true, updatedAt: true },
      include: {
        floors: {
          select: { id: true, name: true, totalSeats: true },
          orderBy: { name: "asc" },
        },
        shifts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            isActive: true,
            price: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    return NextResponse.json(library);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Failed to update library:", error);
    return NextResponse.json(
      { error: "Failed to update library" },
      { status: 500 },
    );
  }
}
