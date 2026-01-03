// File: src/app/(dashboard)/admin/sessions/fee/[classId]/page.tsx

import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
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
    { href: `/admin/sessions/${searchProps.sessionId}`, label: "Session Details" },
    // Fixed: Added href="#" to satisfy the type definition
    { href: "#", label: "Fee Structure", current: true },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs}/>
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 shadow-xs">
                    <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </span>
                Fee Details
            </h1>
            <p className="text-slate-500 dark:text-slate-400 ml-1 max-w-2xl text-sm sm:text-base leading-relaxed">
                Manage fee structures, update amounts, and track payment records for this specific class within the active session.
            </p>
        </div>

        {/* Main Content Card */}
        <Card className="border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/40 backdrop-blur-md shadow-xs dark:shadow-xl overflow-hidden transition-colors rounded-xl">
          
          <CardHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-black/20">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:shadow-none">
                  <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
               </div>
               <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Class Fee Registry
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
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