import { type Metadata } from "next";
import { DocumentsManager } from "~/components/blocks/documents/DocumentsManager";

export const metadata: Metadata = {
  title: "Documents & Academic Vault | MSNS LMS",
  description:
    "Official MSNS document vault: Download syllabi, scheme of studies, admission guidelines, matric textbooks, and academic calendars hosted on Cloudflare R2 storage.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  return <DocumentsManager />;
}
