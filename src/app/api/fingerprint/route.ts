import { type NextRequest, NextResponse } from "next/server";
import { FingerprintService } from "~/lib/finger-print";
import { db } from "~/server/db";
import { api } from "~/trpc/server";

interface FingerprintRequest {
  action: "enroll" | "verify" | "check" | "delete";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const fingerprintService = FingerprintService.getInstance();

   try {
    const { template, userData } = await request.json();

    console.log(template)
    // if (!template || !userData.name || !userData.id) {
    //   return Response.json({ message: 'Missing required fields' }, { status: 400 });
    // }

    // // Check if user ID already exists
    // const existing = await query(
    //   'SELECT * FROM fingerprints WHERE user_id = ?',
    //   [userData.id]
    // );

    // if (existing.length > 0) {
    //   return Response.json({ 
    //     success: false, 
    //     error: 'User ID already exists' 
    //   }, { status: 400 });
    // }

    // // Save to database
    // const result = await query(
    //   'INSERT INTO fingerprints (user_id, name, template) VALUES (?, ?, ?)',
    //   [userData.id, userData.name, template]
    // );

    
    return NextResponse.json({ message: "okay" });
  } catch (error: unknown) {
    await fingerprintService.close();

    const errorMessage =
      error instanceof Error ? error.message : "Operation failed";
    console.error("Fingerprint API error:", error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
