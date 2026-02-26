import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Ensure the directory exists
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  // Create a unique filename
  const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
  const filepath = path.join(uploadDir, filename);

  try {
    await writeFile(filepath, buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json(
      { error: "Failed to save file." },
      { status: 500 },
    );
  }
}
