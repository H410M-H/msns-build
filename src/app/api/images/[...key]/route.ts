import { type NextRequest, NextResponse } from "next/server";
import { getFromS3 } from "~/lib/s3";
import { Readable } from "stream";

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

    // Use Node.js Readable.toWeb to avoid AWS SDK transformToWebStream uncaught exceptions
    const stream = Readable.toWeb(response.Body as Readable) as ReadableStream;

    const headers = new Headers();
    if (response.ContentType) headers.set("Content-Type", response.ContentType);
    if (response.ContentLength)
      headers.set("Content-Length", response.ContentLength.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(stream, { headers });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null) {
      const err = error as { name?: string; Code?: string };
      if (err.name === "NoSuchKey" || err.Code === "NoSuchKey") {
        return new NextResponse("Image not found", { status: 404 });
      }
    }

    console.error("Error fetching image from S3:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
