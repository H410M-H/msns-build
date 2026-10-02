import { type Metadata } from "next";
import { ReportsHub } from "~/components/blocks/reports/ReportsHub";

export const metadata: Metadata = {
  title: "Reports & Regulatory Registers | MSNS ERP",
  description:
    "Official institutional reports and regulatory registers for M.S. Naz High School. Generate and export enrolled student rosters, admission statistics, examination rankings, and revenue summaries in PDF, Excel (XLSX), CSV, and Word (DOCX).",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return <ReportsHub role="admin" />;
}
