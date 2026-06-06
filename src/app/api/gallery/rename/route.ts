import { type NextRequest, NextResponse } from "next/server";
import { moveS3Object } from "~/lib/s3";
import { auth } from "~/server/auth";

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
        { error: "You do not have permission to rename gallery media" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { key?: string; newName?: string };
    const key = body.key;
    const newName = body.newName;

    if (!key || !newName) {
      return NextResponse.json(
        { error: "Original key and new name are required" },
        { status: 400 }
      );
    }

    // Split folder structure and filename
    const parts = key.split("/");
    const filename = parts.pop();
    if (!filename) {
      return NextResponse.json({ error: "Invalid original key" }, { status: 400 });
    }
    const folder = parts.join("/");

    // Extract timestamp if filename starts with `timestamp_`
    const match = /^(\d+)_(.*)$/.exec(filename);
    const timestamp = match ? match[1]! : Date.now().toString();
    const oldFilename = match ? match[2]! : filename;

    // Get extension
    const originalExt = oldFilename.split('.').pop()?.toLowerCase();
    
    // Sanitize new name
    const sanitizedNewName = newName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const hasExt = sanitizedNewName.includes('.');
    const finalFilename = !hasExt && originalExt ? `${sanitizedNewName}.${originalExt}` : sanitizedNewName;

    // Construct destination key
    const destinationKey = folder ? `${folder}/${timestamp}_${finalFilename}` : `${timestamp}_${finalFilename}`;

    // Don't rename to the exact same path
    if (key === destinationKey) {
      return NextResponse.json({ success: true, key: destinationKey });
    }

    // Call S3 helper to copy and delete (which moves the file)
    await moveS3Object(key, destinationKey);

    return NextResponse.json({
      success: true,
      key: destinationKey,
      url: `/api/images/${destinationKey}`
    });
  } catch (error) {
    console.error("Error renaming media:", error);
    return NextResponse.json(
      { error: "Failed to rename media" },
      { status: 500 }
    );
  }
}
