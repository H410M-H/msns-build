import { type Metadata } from "next";
import { DocumentsManager } from "~/components/blocks/documents/DocumentsManager";

export const metadata: Metadata = {
  title: "Documents & Academic Vault | MSNS LMS",
  description: "Official documents, admission forms, academic calendars, schemes of study, and matric textbooks hosted on Cloudflare R2.",
};

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  return <DocumentsManager />;
}
