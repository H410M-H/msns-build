import { NextResponse } from "next/server";
import { moveS3Object } from "~/lib/s3";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { keys?: string[]; targetFolder?: string };
    const keys = body.keys;
    const targetFolder = body.targetFolder;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "Keys are required" }, { status: 400 });
    }

    // targetFolder can be empty for moving to root
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
        
        // Don't move to same location
        if (key === destinationKey) return;

        await moveS3Object(key, destinationKey);
      })
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      return NextResponse.json({ error: `Failed to move ${failed.length} items`, results }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error moving items:", error);
    return NextResponse.json({ error: "Failed to move items" }, { status: 500 });
  }
}
