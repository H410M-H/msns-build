// File: src/app/(dashboard)/admin/sessions/fee/[classId]/page.tsx

import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { ClassFeeTable } from "~/components/tables/ClassFee";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Coins, Receipt } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string }>;
};

export default async function FeeDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sessions", label: "Sessions" },
    {
      href: `/admin/sessions/${searchProps.sessionId}`,
      label: "Session Details",
    },
    // Fixed: Added href="#" to satisfy the type definition
    { href: "#", label: "Fee Structure", current: true },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="pt-2 duration-500 animate-in fade-in slide-in-from-bottom-4">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            <span className="rounded-xl border border-emerald-200 bg-emerald-100 p-2 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <Coins className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </span>
            Fee Details
          </h1>
          <p className="ml-1 max-w-2xl text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground sm:text-base">
            Manage fee structures, update amounts, and track payment records for
            this specific class within the active session.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm backdrop-blur-md transition-colors dark:border-border dark:bg-card dark:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-black/20">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:shadow-none">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-foreground">
                  Class Fee Registry
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground dark:text-muted-foreground sm:text-sm">
                  Detailed breakdown of fees assigned to this class
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Scroll area adjusted to fit viewport nicely */}
            <ScrollArea className="h-[calc(100vh-320px)] w-full">
              <div className="p-4 sm:p-6">
                <ClassFeeTable
                  sessionId={searchProps.sessionId}
                  classId={searchProps.classId}
                />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
