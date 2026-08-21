import { NextResponse } from "next/server";
import { getFromS3 } from "~/lib/s3";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { Readable } from "stream";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await params;
    const file = filename.join("/");

    if (!file) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    // 1. Try fetching from Cloudflare R2 bucket
    const r2Keys = [`uploads/${file}`, file];
    for (const key of r2Keys) {
      try {
        const response = await getFromS3(key);
        if (response.Body) {
          const stream = Readable.toWeb(response.Body as Readable) as ReadableStream;
          const headers = new Headers();
          if (response.ContentType) headers.set("Content-Type", response.ContentType);
          if (response.ContentLength)
            headers.set("Content-Length", response.ContentLength.toString());
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
          return new NextResponse(stream, { headers });
        }
      } catch {
        // NoSuchKey, continue to next fallback
      }
    }

    // 2. Fallback to local filesystem if exists (e.g. during migration)
    const filepath = path.join(process.cwd(), "public", "uploads", file);
    const resolvedPath = path.resolve(filepath);
    const resolvedUploadDir = path.resolve(path.join(process.cwd(), "public", "uploads"));
    if (resolvedPath.startsWith(resolvedUploadDir) && existsSync(resolvedPath)) {
      const fileBuffer = readFileSync(resolvedPath);
      const ext = path.extname(resolvedPath).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".avif") contentType = "image/avif";
      else if (ext === ".pdf") contentType = "application/pdf";

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new NextResponse(fileBuffer, { headers });
    }

    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
