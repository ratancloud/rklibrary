import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || 'ALL';
    const monthYear = searchParams.get('month') || new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const isExport = searchParams.get('export') === 'true';
    
    // Pagination (disabled if exporting)
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Calculate start and end dates for the selected month
    const [year, month] = monthYear.split('-');
    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 1);

    const whereClause: any = {
      libraryId: library.id,
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    };

    if (search) {
      whereClause.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { floorName: { contains: search, mode: 'insensitive' } },
        { studentPhone: { contains: search } },
      ];
    }

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      select: {
        id: true,
        libraryId: true,
        studentId: true,
        floorName: true,
        seatNo: true,
        shiftName: true,
        studentName: true,
        studentGender: true,
        studentPhone: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        discount: true,
        amountPaid: true,
        status: true,
        createdAt: true,
        student: {
          select: { memberId: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: isExport ? 0 : skip,
      take: isExport ? undefined : pageSize,
    });

    const total = await prisma.subscription.count({ where: whereClause });

    // Format data for response
    const records = subscriptions.map((sub) => ({
      id: sub.id,
      libraryId: sub.libraryId,
      studentId: sub.studentId,
      floorName: sub.floorName,
      seatNo: sub.seatNo,
      shiftName: sub.shiftName,
      studentName: sub.studentName,
      studentGender: sub.studentGender,
      studentPhone: sub.studentPhone,
      startDate: sub.startDate.toISOString(),
      endDate: sub.endDate.toISOString(),
      totalAmount: sub.totalAmount,
      discount: sub.discount,
      amountPaid: sub.amountPaid,
      status: sub.status,
      createdAt: sub.createdAt.toISOString(),
      memberIdFormatted: sub.student?.memberId 
        ? `MID${String(sub.student.memberId).padStart(4, '0')}` 
        : 'N/A',
    }));

    if (isExport) {
      const csv = convertToCSV(records);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="history-${monthYear}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: records,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

function convertToCSV(records: any[]): string {
  const headers = [
    'Member ID', 'Student Name', 'Gender', 'Phone', 'Floor', 'Seat', 
    'Shifts', 'Total Amount', 'Discount', 'Final Amount', 'Amount Paid', 'Due', 'Status', 'Start Date', 'End Date', 'Created At'
  ];

  const rows = records.map((record) => {
    const finalAmount = record.totalAmount - (record.discount || 0);
    const due = Math.max(0, finalAmount - record.amountPaid);
    return [
      record.memberIdFormatted,
      record.studentName,
      record.studentGender,
      record.studentPhone,
      record.floorName,
      record.seatNo,
      record.shiftName.join(' | '),
      record.totalAmount,
      record.discount || 0,
      finalAmount,
      record.amountPaid,
      due,
      record.status,
      new Date(record.startDate).toLocaleDateString(),
      new Date(record.endDate).toLocaleDateString(),
      new Date(record.createdAt).toLocaleDateString(),
    ];
  });

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell || ''}"`).join(',')),
  ].join('\n');
}