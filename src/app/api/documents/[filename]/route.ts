import { type NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getBucket } from "~/lib/s3";
import { Readable } from "stream";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return new NextResponse("Document filename is required", { status: 400 });
    }

    const decodedFilename = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedFilename);
    const key = `documents/${safeFilename}`;

    const s3 = getS3Client();
    const bucket = getBucket();
    const rangeHeader = request.headers.get("range");

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
          s3Response.ContentType ?? "application/pdf"
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
          "public, max-age=86400, stale-while-revalidate=604800"
        );

        const status = s3Response.ContentRange ? 206 : 200;
        return new NextResponse(stream, { status, headers });
      }
    } catch (s3Error: unknown) {
      if (typeof s3Error === "object" && s3Error !== null) {
        const err = s3Error as { name?: string; Code?: string };
        if (err.name === "NoSuchKey" || err.Code === "NoSuchKey") {
          return new NextResponse("Document not found in Cloudflare bucket", { status: 404 });
        }
      }
      console.error(`[S3 Document Stream] Could not fetch ${key} from R2:`, s3Error);
    }

    return new NextResponse("Document not found", { status: 404 });
  } catch (error: unknown) {
    console.error("Error serving document:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
