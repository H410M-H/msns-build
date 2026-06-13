import { NextResponse } from "next/server";
import { copyS3Object } from "~/lib/s3";
import { auth } from "~/server/auth";

const ALLOWED_ROLES = ["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER"];

export async function POST(req: Request) {
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
        { error: "You do not have permission to copy gallery media" },
        { status: 403 },
      );
    }

    const body = (await req.json()) as { keys?: string[]; targetFolder?: string };
    const keys = body.keys;
    const targetFolder = body.targetFolder;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "Keys are required" }, { status: 400 });
    }

    // targetFolder can be empty for copying to root
    const normalizedFolder = targetFolder ? (targetFolder.endsWith('/') ? targetFolder : targetFolder + '/') : '';

    const results = await Promise.allSettled(
      keys.map(async (key: string) => {
        const filename = key.split('/').pop();
        if (!filename) throw new Error("Invalid key");
        
        let destinationKey = "";
        if (normalizedFolder === 'videos/' || normalizedFolder.startsWith('videos/')) {
          destinationKey = `${normalizedFolder}${filename}`;
        } else {
          destinationKey = `gallery/${normalizedFolder}${filename}`;
        }
        
        // Handle copy to same location by appending timestamp
        if (key === destinationKey) {
          const parts = filename.split('.');
          const ext = parts.length > 1 ? `.${parts.pop()}` : '';
          const name = parts.join('.');
          if (normalizedFolder === 'videos/' || normalizedFolder.startsWith('videos/')) {
            destinationKey = `${normalizedFolder}${name}_copy_${Date.now()}${ext}`;
          } else {
            destinationKey = `gallery/${normalizedFolder}${name}_copy_${Date.now()}${ext}`;
          }
        }

        await copyS3Object(key, destinationKey);
      })
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      return NextResponse.json({ error: `Failed to copy ${failed.length} items`, results }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error copying items:", error);
    return NextResponse.json({ error: "Failed to copy items" }, { status: 500 });
  }
}
