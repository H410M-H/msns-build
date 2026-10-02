import { type Metadata } from "next";
import { ReportsHub } from "~/components/blocks/reports/ReportsHub";

export const metadata: Metadata = {
  title: "Clerk Reports Center | MSNS LMS",
  description:
    "Official clerical reports and regulatory documents for student enrollment, form collection checklists, and fee collection receipts.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function ClerkReportsPage() {
  return <ReportsHub role="clerk" />;
}
