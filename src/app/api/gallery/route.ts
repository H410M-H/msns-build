import { NextResponse } from "next/server";
import { listGalleryImages } from "~/lib/s3";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { images, folders } = await listGalleryImages();
    return NextResponse.json({ images, folders });
  } catch (error) {
    console.error("Error listing gallery images:", error);
    return NextResponse.json(
      { error: "Failed to list gallery images" },
      { status: 500 }
    );
  }
}
