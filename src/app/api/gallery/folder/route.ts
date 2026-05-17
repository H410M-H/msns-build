import { NextResponse } from "next/server";
import { createS3Folder } from "~/lib/s3";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { folderName?: string };
    const folderName = body.folderName;

    if (!folderName) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    await createS3Folder(folderName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
