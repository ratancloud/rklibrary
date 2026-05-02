import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileIds } = body;

    if (!fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid fileIds format" },
        { status: 400 }
      );
    }

    // 3. ImageKit API call
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables");
    }

    const authString = Buffer.from(`${privateKey}:`).toString("base64");

    const ikResponse = await fetch("https://api.imagekit.io/v1/files/batch/deleteByFileIds", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileIds: fileIds }),
    });

    // 4. Handle ImageKit-specific responses
    if (!ikResponse.ok) {
        const errorData = await ikResponse.json();
        console.error("ImageKit API Error Details:", errorData);
        throw new Error(errorData.message || "Failed to delete image from ImageKit");
    }

    return NextResponse.json({ 
        success: true, 
        message: "Image deleted successfully" 
    });

  } catch (error: any) {
    console.error("Delete Handler Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}