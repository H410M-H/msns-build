import { type NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "~/lib/s3";
import { auth } from "~/server/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const ALLOWED_ROLES = ["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER"];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const userRole = session.user.accountType;
    if (!ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "You do not have permission to upload gallery images" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const folder = (formData.get("folder") as string | null) ?? "";
    const customName = (formData.get("customName") as string | null) ?? file.name;

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = customName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const sanitizedFolder = folder ? folder.replace(/[^a-zA-Z0-9_-]/g, "_") + "/" : "";
    
    // Preserve extension if customName doesn't have one but original file does
    const originalExt = file.name.split('.').pop()?.toLowerCase();
    const hasExt = sanitizedName.includes('.');
    const finalName = !hasExt && originalExt ? `${sanitizedName}.${originalExt}` : sanitizedName;

    const key = `gallery/${sanitizedFolder}${timestamp}_${finalName}`;

    await uploadToS3(key, buffer, file.type);

    return NextResponse.json({
      key,
      url: `/api/images/${key}`,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
