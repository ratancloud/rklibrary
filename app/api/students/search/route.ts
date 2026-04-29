// app/api/students/search/route.ts
//
// GET /api/students/search?q=rahul
// GET /api/students/search?q=9876543210
//
// Searches students by name OR phone number.
// Returns lightweight list for booking page student picker.
// Does NOT return all students (could be 1000+).

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';

    // Require at least 2 chars to search — avoids huge result sets
    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!library) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: {
        libraryId: library.id,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phoneNumber: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        memberId: true,
        phoneNumber: true,
        gender: true,
        address: true,
        // Show their current seat assignments so librarian knows if they're already seated
        assignments: {
          include: {
            seat: {
              include: { floor: { select: { name: true } } },
            },
            shift: { select: { name: true } },
          },
        },
      },
      take: 10, // Cap results
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: students.map((s) => ({
        id: s.id,
        name: s.name,
        memberId: s.memberId,
        phoneNumber: s.phoneNumber,
        gender: s.gender,
        address: s.address,
        currentSeats: s.assignments.map((a) => ({
          seatNo: a.seat.seatNo,
          floorName: a.seat.floor.name,
          shiftName: a.shift.name,
        })),
      })),
    });
  } catch (error) {
    console.error('Student search error:', error);
    return NextResponse.json(
      { error: 'Failed to search students' },
      { status: 500 }
    );
  }
}
