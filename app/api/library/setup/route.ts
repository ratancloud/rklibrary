import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { librarySetupSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = librarySetupSchema.parse(body);

    const completeLibrary = await prisma.$transaction(
      async (tx) => {
        // 1. Create the Library
        const library = await tx.library.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            contactNumber: validatedData.contactNumber,
            address: validatedData.address,
            district: validatedData.district,
            state: validatedData.state,
            pincode: validatedData.pincode,
            facilities: validatedData.facilities,
            userId: session.user.id,
          },
        });

        // 2. Create Floors & Seats
        // We loop floors because we need the generated 'floor.id' for the seats
        for (const floorData of validatedData.floors) {
          const floor = await tx.floor.create({
            data: {
              name: floorData.name,
              totalSeats: floorData.totalSeats,
              libraryId: library.id,
            },
          });

          // Generate all seat objects for this specific floor
          const seatsToCreate = Array.from(
            { length: floorData.totalSeats },
            (_, i) => ({
              seatNo: i + 1,
              floorId: floor.id,
              isActive: true,
            }),
          );

          // BULK INSERT: This is the performance booster.
          // Even with 10 floors, this reduces 1000 queries to 10 queries.
          await tx.seat.createMany({
            data: seatsToCreate,
          });
        }

        // 3. Create Shifts in one single bulk command
        if (validatedData.shifts && validatedData.shifts.length > 0) {
          await tx.shift.createMany({
            data: validatedData.shifts.map((shift: any) => ({
              name: shift.name,
              startTime: shift.startTime,
              endTime: shift.endTime,
              price: shift.price,
              isActive: shift.isActive ?? true,
              libraryId: library.id,
            })),
          });
        }

        // 4. Final Fetch
        return await tx.library.findUniqueOrThrow({
          where: { id: library.id },
          include: {
            floors: {
              orderBy: { name: "asc" },
              include: {
                seats: { orderBy: { seatNo: "asc" } },
              },
            },
            shifts: { orderBy: { startTime: "asc" } },
          },
        });
      },
      {
        timeout: 30000,
      },
    );

    return NextResponse.json(completeLibrary, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Setup failed:", error);
    return NextResponse.json(
      { error: "Failed to complete setup." },
      { status: 500 },
    );
  }
}
