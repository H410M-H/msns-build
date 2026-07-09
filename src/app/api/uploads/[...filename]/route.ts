import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await params;
    const file = filename.join("/");
    const filepath = path.join(process.cwd(), "public", "uploads", file);
    
    // Security check to prevent path traversal
    const resolvedPath = path.resolve(filepath);
    const resolvedUploadDir = path.resolve(path.join(process.cwd(), "public", "uploads"));
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!existsSync(resolvedPath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

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
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
