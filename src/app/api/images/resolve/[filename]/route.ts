import { NextResponse } from "next/server";
import { findImageByFilename } from "~/lib/s3";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return new NextResponse("Filename is required", { status: 400 });
  }

  try {
    const key = await findImageByFilename(filename);
    if (!key) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Rewrite to the actual image proxy path
    const url = new URL(`/api/images/${key}`, request.url);
    return NextResponse.rewrite(url);
  } catch (error) {
    console.error(`Error resolving image ${filename}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
