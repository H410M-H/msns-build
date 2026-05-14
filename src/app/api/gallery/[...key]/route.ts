import { type NextRequest, NextResponse } from "next/server";
import { deleteFromS3 } from "~/lib/s3";
import { auth } from "~/server/auth";

const DELETE_ALLOWED_ROLES = ["ADMIN", "PRINCIPAL", "HEAD"];

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin, Principal, and Head can delete
    const userRole = session.user.accountType;
    if (!DELETE_ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "You do not have permission to delete gallery images" },
        { status: 403 }
      );
    }

    const p = await params;
    const key = p.key.join("/");

    if (!key) {
      return NextResponse.json(
        { error: "Image key is required" },
        { status: 400 }
      );
    }

    await deleteFromS3(key);

    return NextResponse.json({ success: true, deletedKey: key });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
