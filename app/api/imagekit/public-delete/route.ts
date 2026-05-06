import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileIds } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid fileIds format" },
        { status: 400 },
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new Error("Missing Private Key");

    const authString = Buffer.from(`${privateKey}:`).toString("base64");

    const ikResponse = await fetch(
      "https://api.imagekit.io/v1/files/batch/deleteByFileIds",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileIds: fileIds }),
      },
    );

    if (!ikResponse.ok) {
      const errorData = await ikResponse.json();
      throw new Error(errorData.message || "Failed to delete from ImageKit");
    }

    return NextResponse.json({ success: true, message: "Images deleted" });
  } catch (error: any) {
    console.error("Public Delete Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
