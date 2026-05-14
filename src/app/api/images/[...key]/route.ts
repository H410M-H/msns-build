import { type NextRequest, NextResponse } from "next/server";
import { getFromS3 } from "~/lib/s3";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const p = await params;
    const key = p.key.join("/");

    if (!key) {
      return new NextResponse("Image key is required", { status: 400 });
    }

    const response = await getFromS3(key);

    if (!response.Body) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const stream = response.Body.transformToWebStream();

    const headers = new Headers();
    if (response.ContentType) headers.set("Content-Type", response.ContentType);
    if (response.ContentLength)
      headers.set("Content-Length", response.ContentLength.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(stream, { headers });
  } catch (error: unknown) {
    console.error("Error fetching image from S3:", error);

    if (error instanceof Error && error.name === "NoSuchKey") {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new NextResponse("Internal server error", { status: 500 });
  }
}
