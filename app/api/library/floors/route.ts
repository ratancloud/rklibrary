import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

interface FloorPayload {
  id: string;
  name: string;
  totalSeats: number;
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { libraryId, floors } = (await req.json()) as {
      libraryId: string;
      floors: FloorPayload[];
    };

    if (!libraryId)
      return NextResponse.json(
        { error: "Library ID required" },
        { status: 400 },
      );

    const incomingIds = floors
      .filter((f) => !f.id.startsWith("temp-"))
      .map((f) => f.id);
    const floorsToCreate = floors.filter((f) => f.id.startsWith("temp-"));
    const floorsToUpdate = floors.filter((f) => !f.id.startsWith("temp-"));

    // 1. Check for active bookings on floors slated for deletion
    const floorsSlatedForDeletion = await prisma.floor.findMany({
      where: {
        libraryId,
        id: { notIn: incomingIds },
      },
      include: {
        seats: {
          select: {
            _count: { select: { assignments: true } },
          },
        },
      },
    });

    for (const floor of floorsSlatedForDeletion) {
      const hasActiveAssignments = floor.seats.some(
        (seat) => seat._count.assignments > 0,
      );
      if (hasActiveAssignments) {
        return NextResponse.json(
          {
            error: `Cannot delete "${floor.name}". It has active seat assignments.`,
          },
          { status: 400 },
        );
      }
    }

    // 2. Execute Sync Transaction
    await prisma.$transaction(
      async (tx) => {
        // DELETE missing floors
        await tx.floor.deleteMany({
          where: { libraryId, id: { notIn: incomingIds } },
        });

        // CREATE new floors
        for (const f of floorsToCreate) {
          const createdFloor = await tx.floor.create({
            data: { name: f.name, totalSeats: f.totalSeats, libraryId },
          });

          // Bulk create seats for new floor
          await tx.seat.createMany({
            data: Array.from({ length: f.totalSeats }, (_, i) => ({
              seatNo: i + 1,
              floorId: createdFloor.id,
            })),
          });
        }

        // UPDATE existing floors
        for (const f of floorsToUpdate) {
          await tx.floor.update({
            where: { id: f.id },
            data: { name: f.name, totalSeats: f.totalSeats },
          });

          const existingSeats = await tx.seat.findMany({
            where: { floorId: f.id },
            orderBy: { seatNo: "asc" },
            include: { _count: { select: { assignments: true } } },
          });

          const currentCount = existingSeats.length;

          if (f.totalSeats > currentCount) {
            // Add more seats
            await tx.seat.createMany({
              data: Array.from(
                { length: f.totalSeats - currentCount },
                (_, i) => ({
                  seatNo: currentCount + i + 1,
                  floorId: f.id,
                }),
              ),
            });
          } else if (f.totalSeats < currentCount) {
            // Remove excess seats
            const excessSeats = existingSeats.slice(f.totalSeats);

            const deletableIds = excessSeats
              .filter((s) => s._count.assignments === 0)
              .map((s) => s.id);

            const blockableIds = excessSeats
              .filter((s) => s._count.assignments > 0)
              .map((s) => s.id);

            if (deletableIds.length > 0) {
              await tx.seat.deleteMany({ where: { id: { in: deletableIds } } });
            }

            // If seat has assignment, we can't delete it, so we deactivate it
            if (blockableIds.length > 0) {
              await tx.seat.updateMany({
                where: { id: { in: blockableIds } },
                data: { isActive: false },
              });
            }
          }
        }
      },
      { timeout: 30000 },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
