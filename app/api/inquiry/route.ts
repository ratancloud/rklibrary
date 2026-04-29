import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Private:  GET /api/inquiry - Fetch all inquiries
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: inquiries },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}

// Public: POST /api/inquiry - Create a new inquiry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      gender,
      phoneNumber,
      address,
      shiftNames,
      joiningDate,
      message,
    } = body;

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        gender,
        phoneNumber,
        address,
        shiftNames,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        message,
      },
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    console.error("Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 },
    );
  }
}
