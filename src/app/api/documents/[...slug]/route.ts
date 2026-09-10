import { type NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getBucket } from "~/lib/s3";
import { Readable } from "stream";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
      return new NextResponse("Document filename is required", { status: 400 });
    }

    const filename = slug[slug.length - 1] ?? "";
    const decodedFilename = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedFilename);
    const subpath = slug.map((s) => path.basename(decodeURIComponent(s))).join("/");

    const s3 = getS3Client();
    const bucket = getBucket();
    const rangeHeader = request.headers.get("range");

    const candidateKeys = [
      `documents/${subpath}`,
      `documents/${safeFilename}`,
      `documents/notes/${safeFilename}`,
      `documents/books/${safeFilename}`,
    ];

    const uniqueKeys = Array.from(new Set(candidateKeys));

    for (const key of uniqueKeys) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          Range: rangeHeader ?? undefined,
        });

        const s3Response = await s3.send(command);

        if (s3Response.Body) {
          // Use Node stream to web stream for reliability
          const stream = Readable.toWeb(s3Response.Body as Readable) as ReadableStream;
          const headers = new Headers();
          headers.set("Accept-Ranges", "bytes");
          headers.set(
            "Content-Type",
            s3Response.ContentType ?? (safeFilename.endsWith(".pdf") ? "application/pdf" : "application/octet-stream")
          );
          if (s3Response.ContentLength !== undefined) {
            headers.set("Content-Length", s3Response.ContentLength.toString());
          }
          if (s3Response.ContentRange) {
            headers.set("Content-Range", s3Response.ContentRange);
          }
          headers.set(
            "Content-Disposition",
            `inline; filename="${safeFilename}"`
          );
          headers.set(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );

          const status = s3Response.ContentRange ? 206 : 200;
          return new NextResponse(stream, { status, headers });
        }
      } catch {
        // Try next candidate key
      }
    }

    return new NextResponse("Document not found", { status: 404 });
  } catch (error: unknown) {
    console.error("Error serving document in msns-build:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
