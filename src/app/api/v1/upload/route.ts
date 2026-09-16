import { NextResponse } from "next/server";
import { uploadToS3 } from "~/lib/s3";
import { auth } from "~/server/auth";
import { optimizeImageForUpload } from "~/lib/image-optimizer";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
];
const ALLOWED_ROLES = [
  "ADMIN",
  "PRINCIPAL",
  "HEAD",
  "CLERK",
  "TEACHER",
  "WORKER",
  "STUDENT",
  "FACULTY",
];

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based authorization
    const userRole = session.user.accountType;
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "You do not have permission to upload files" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF, PDF",
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImageForUpload(rawBuffer, file.type);

    // Sanitize filename — remove path traversal and special characters
    const baseName = file.name ? file.name.split("/").pop()?.split("\\").pop() ?? "file" : "file";
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${Date.now()}_${sanitizedName}`;

    // Upload to Cloudflare R2 bucket
    await uploadToS3(key, optimized.buffer, optimized.contentType);

    return NextResponse.json({
      url: `/api/images/${key}`,
      key,
      filename: file.name,
      size: optimized.size,
      contentType: optimized.contentType,
      isOptimized: optimized.isOptimized,
    });
  } catch (error) {
    console.error("Error uploading file to Cloudflare R2:", error);
    return NextResponse.json(
      { error: "Failed to upload file to Cloudflare R2." },
      { status: 500 },
    );
  }
}
