import { type NextRequest, NextResponse } from "next/server";
import { 
  ListObjectsV2Command, 
  PutObjectCommand, 
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import { getS3Client, getBucket } from "~/lib/s3";
import { auth } from "~/server/auth";

export const dynamic = "force-dynamic";

const UPLOAD_ROLES = ["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER"];
const DELETE_ROLES = ["ADMIN", "PRINCIPAL", "HEAD"];

const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp"
];

// Well-known catalog of institutional documents and textbooks
const DOCUMENT_CATALOG: Record<string, { title: string; category: string }> = {
  "msns-prospectus-2026-2027.pdf": {
    title: "M. S. Naz High School Institutional Prospectus (2026-2027)",
    category: "Official",
  },
  "msns-offline-admission-form-2026-2027.pdf": {
    title: "Official Offline Admission Form & Application Package (2026-2027)",
    category: "Admissions",
  },
  "msns-academic-calendar-2026-2027.pdf": {
    title: "Comprehensive Academic Year Calendar & Planner (2026-2027)",
    category: "Academic",
  },
  "msns-matriculation-scheme-of-studies.pdf": {
    title: "BISE Gujranwala Matriculation Scheme of Studies (Grades 9 & 10)",
    category: "Examination",
  },
  "msns-tuition-fee-policy-and-challan-guide.pdf": {
    title: "Tuition Fee Structure, Concessions & Digital Challan Payment Guide",
    category: "Policy",
  },
  "msns-code-of-conduct-and-uniform-rules.pdf": {
    title: "Student Code of Conduct & Visual Uniform Leadership Guidelines",
    category: "Policy",
  },
  "msns-bise-matric-resource-guide.pdf": {
    title: "BISE Matric Exam Preparation & Model Papers Resource Directory",
    category: "Academic",
  },
  // Textbooks
  "pctb-class-9-physics.pdf": { title: "Class 9 Physics (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-chemistry.pdf": { title: "Class 9 Chemistry (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-biology.pdf": { title: "Class 9 Biology (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-computer-science.pdf": { title: "Class 9 Computer Science (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-mathematics.pdf": { title: "Class 9 Mathematics Science (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-english.pdf": { title: "Class 9 English Compulsory (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-urdu.pdf": { title: "Class 9 Urdu Compulsory (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-tarjuma-tul-quran.pdf": { title: "Class 9 Tarjuma-tul-Quran (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-islamiat.pdf": { title: "Class 9 Islamiat Compulsory (PCTB E-Book)", category: "Academic" },
  "pctb-class-9-pakistan-studies.pdf": { title: "Class 9 Pakistan Studies (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-physics.pdf": { title: "Class 10 Physics (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-chemistry.pdf": { title: "Class 10 Chemistry (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-biology.pdf": { title: "Class 10 Biology (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-computer-science.pdf": { title: "Class 10 Computer Science (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-mathematics.pdf": { title: "Class 10 Mathematics Science (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-english.pdf": { title: "Class 10 English Compulsory (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-urdu.pdf": { title: "Class 10 Urdu Compulsory (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-tarjuma-tul-quran.pdf": { title: "Class 10 Tarjuma-tul-Quran (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-islamiat.pdf": { title: "Class 10 Islamiat Compulsory (PCTB E-Book)", category: "Academic" },
  "pctb-class-10-pakistan-studies.pdf": { title: "Class 10 Pakistan Studies (PCTB E-Book)", category: "Academic" },
};

export interface DocumentResponseItem {
  key: string;
  filename: string;
  title: string;
  category: string;
  size: number;
  lastModified: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

// 1. GET: List all documents from Cloudflare R2 (Prefix: "documents/")
export async function GET() {
  try {
    const s3 = getS3Client();
    const bucket = getBucket();

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "documents/",
    });

    const response = await s3.send(command);
    const contents = response.Contents ?? [];

    const documents: DocumentResponseItem[] = contents
      .filter((obj) => obj.Key && !obj.Key.endsWith("/") && obj.Size && obj.Size > 0)
      .map((obj) => {
        const key = obj.Key!;
        const rawFilename = key.replace(/^documents\//, "");

        let title = "";
        let category = "General";
        let uploadedBy = "SYSTEM";

        // Check if filename has our structured naming format:
        // documents/${timestamp}__${category}__${title}__${cleanFilename}
        if (rawFilename.includes("__")) {
          const parts = rawFilename.split("__");
          if (parts.length >= 4) {
            category = parts[1]?.replace(/_/g, " ") ?? "General";
            title = parts[2]?.replace(/_/g, " ") ?? "";
            uploadedBy = "STAFF";
          } else if (parts.length === 3) {
            category = parts[1]?.replace(/_/g, " ") ?? "General";
            title = parts[2]?.replace(/\.[^/.]+$/, "").replace(/_/g, " ") ?? "";
          }
        }

        // Fallback to catalog or clean basename
        if (!title) {
          const catalogItem = DOCUMENT_CATALOG[rawFilename];
          if (catalogItem) {
            title = catalogItem.title;
            category = catalogItem.category;
          } else {
            // Clean up standard filename
            title = rawFilename
              .replace(/\.[^/.]+$/, "")
              .replace(/^[0-9]+[-_]/, "")
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
          }
        }

        const lastModified = obj.LastModified?.toISOString() ?? new Date().toISOString();

        return {
          key,
          filename: rawFilename,
          title,
          category,
          size: obj.Size ?? 0,
          lastModified,
          uploadedBy,
          uploadedAt: lastModified,
          url: `/api/documents/${encodeURIComponent(rawFilename)}`,
        };
      })
      .sort((a, b) => {
        // Priority to Official, Academic, Admissions, then newest
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      });

    return NextResponse.json({ documents });
  } catch (error: unknown) {
    console.error("Error listing documents from R2:", error);
    return NextResponse.json(
      { error: "Failed to list documents from Cloudflare bucket" },
      { status: 500 }
    );
  }
}

// 2. POST: Upload new document (Enforce RBAC: ADMIN, PRINCIPAL, HEAD, CLERK, TEACHER only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const role = (session.user.accountType ?? "").toUpperCase();
    if (!UPLOAD_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Forbidden. Only teachers, clerks, heads, principal and admin can upload documents." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const titleInput = (formData.get("title") as string | null)?.trim() ?? "";
    const categoryInput = (formData.get("category") as string | null)?.trim() ?? "General";

    if (!file) {
      return NextResponse.json({ error: "No document file provided" }, { status: 400 });
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 50MB size limit" },
        { status: 400 }
      );
    }

    // Sanitize filename & title
    const timestamp = Date.now();
    const originalExt = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const sanitizedTitle = (titleInput || baseName).replace(/[^a-zA-Z0-9_\s-]/g, "").trim().replace(/\s+/g, "_");
    const sanitizedCategory = categoryInput.replace(/[^a-zA-Z0-9_-]/g, "_");
    
    // Construct structured key: documents/${timestamp}__${category}__${title}__${filename}
    const finalFilename = `${timestamp}__${sanitizedCategory}__${sanitizedTitle}__${baseName}.${originalExt}`;
    const key = `documents/${finalFilename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const s3 = getS3Client();
    const bucket = getBucket();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/pdf",
      ContentDisposition: `inline; filename="${file.name}"`,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        title: titleInput || file.name,
        category: categoryInput,
        uploadedby: `${session.user.username || session.user.email} (${role})`,
        uploadedat: new Date().toISOString(),
      },
    });

    await s3.send(command);

    const docItem: DocumentResponseItem = {
      key,
      filename: finalFilename,
      title: titleInput || baseName.replace(/_/g, " "),
      category: categoryInput,
      size: file.size,
      lastModified: new Date().toISOString(),
      uploadedBy: `${session.user.username || "User"} (${role})`,
      uploadedAt: new Date().toISOString(),
      url: `/api/documents/${encodeURIComponent(finalFilename)}`,
    };

    return NextResponse.json({
      success: true,
      message: "Document successfully uploaded to Cloudflare R2",
      document: docItem,
    });
  } catch (error: unknown) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// 3. DELETE: Remove document (Enforce RBAC: ADMIN, PRINCIPAL, HEAD only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const role = (session.user.accountType ?? "").toUpperCase();
    if (!DELETE_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Forbidden. Only administrators, principals, and heads can delete documents." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const key = (body?.key as string | undefined) ?? searchParams.get("key");

    if (!key || !key.startsWith("documents/")) {
      return NextResponse.json(
        { error: "Valid document key starting with 'documents/' is required" },
        { status: 400 }
      );
    }

    const s3 = getS3Client();
    const bucket = getBucket();

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
      key,
    });
  } catch (error: unknown) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
