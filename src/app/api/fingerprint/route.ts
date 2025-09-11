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
    const body = (await request.json()) as { action: FingerprintRequest };

    // Initialize fingerprint device
    const initialized = await fingerprintService.initialize();
    if (!initialized) {
      return NextResponse.json(
        { error: "Fingerprint device not available" },
        { status: 500 },
      );
    }

    const { template, quality } = await fingerprintService.captureFingerprint();

    if (quality < 50) {
      await fingerprintService.close();
      return NextResponse.json(
        {
          error: "Poor fingerprint quality. Please try again.",
          quality,
        },
        { status: 400 },
      );
    }

    await api.finger.addFinger({ template });

    //     await fingerprintService.close();

    // switch (action) {
    //   case "enroll": {

    //     // Capture fingerprint from device
    //     const { template, quality } =
    //       await fingerprintService.captureFingerprint();

    //     if (quality < 50) {
    //       await fingerprintService.close();
    //       return NextResponse.json(
    //         {
    //           error: "Poor fingerprint quality. Please try again.",
    //           quality,
    //         },
    //         { status: 400 },
    //       );
    //     }

    //     // Store in database
    //     await DatabaseService.storeFingerprint(user.id, template);

    //     await fingerprintService.close();
    //     return NextResponse.json({
    //       success: true,
    //       message: "Fingerprint enrolled successfully",
    //       quality,
    //     });
    //   }

    //   case "verify": {
    //     // Check if user has registered fingerprint
    //     const hasFingerprint = await DatabaseService.hasFingerprint(user.id);
    //     if (!hasFingerprint) {
    //       await fingerprintService.close();
    //       return NextResponse.json(
    //         { error: "No fingerprint registered" },
    //         { status: 400 },
    //       );
    //     }

    //     // Capture fingerprint for verification
    //     const { template } = await fingerprintService.captureFingerprint();

    //     // Verify against database
    //     const isVerified = await DatabaseService.verifyFingerprint(
    //       user.id,
    //       template,
    //     );

    //     await fingerprintService.close();
    //     return NextResponse.json({
    //       verified: isVerified,
    //       message: isVerified
    //         ? "Fingerprint verified"
    //         : "Fingerprint not matched",
    //     });
    //   }

    //   case "check": {
    //     const hasFingerprint = await DatabaseService.hasFingerprint(user.id);
    //     await fingerprintService.close();
    //     return NextResponse.json({ hasFingerprint });
    //   }

    //   case "delete": {
    //     await DatabaseService.deleteFingerprint(user.id);
    //     await fingerprintService.close();
    //     return NextResponse.json({
    //       success: true,
    //       message: "Fingerprint deleted",
    //     });
    //   }

    //   default: {
    //     await fingerprintService.close();
    //     return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    //   }
    // }

    return NextResponse.json({ message: "okay" });
  } catch (error: unknown) {
    await fingerprintService.close();

    const errorMessage =
      error instanceof Error ? error.message : "Operation failed";
    console.error("Fingerprint API error:", error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
