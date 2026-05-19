import { NextResponse } from "next/server";
import { createS3Folder, deleteS3Folder } from "~/lib/s3";
import { auth } from "~/server/auth";

const DELETE_ALLOWED_ROLES = ["ADMIN", "PRINCIPAL", "HEAD"];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { folderName?: string };
    const folderName = body.folderName;

    if (!folderName) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    await createS3Folder(folderName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.accountType;
    if (!DELETE_ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: "You do not have permission to delete gallery folders" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as { folders?: string[] };
    const folders = body.folders;

    if (!folders || !Array.isArray(folders) || folders.length === 0) {
      return NextResponse.json({ error: "Folders array is required" }, { status: 400 });
    }

    for (const folder of folders) {
      await deleteS3Folder(folder);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folders:", error);
    return NextResponse.json({ error: "Failed to delete folders" }, { status: 500 });
  }
}
