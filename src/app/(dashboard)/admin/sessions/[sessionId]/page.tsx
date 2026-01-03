// File: src/app/(dashboard)/admin/sessions/[sessionId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarRange, Layers, Info } from "lucide-react";
import { Suspense } from "react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassList } from "~/components/tables/ClassList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sessions", label: "Sessions" },
    {
      href: `/admin/sessions/${sessionId}`,
      label: "Session Details",
      current: true,
    },
  ];

  return (
    // Wrapper: Full width, standard spacing
    <div className="w-full space-y-6">
      
      <PageHeader breadcrumbs={breadcrumbs} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header Section: Clean & Professional */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200 dark:border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                 <CalendarRange className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Session Overview</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl pl-1">
              Manage classes, student allocations, and fee structures for this academic session.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300 px-3 py-1">
               <Info className="mr-1 h-3 w-3" /> Active Session
             </Badge>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border border-slate-200 bg-white/50 dark:border-white/5 dark:bg-slate-900/40 backdrop-blur-md shadow-xs dark:shadow-xl overflow-hidden transition-all">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-4 bg-slate-50/50 dark:bg-black/20">
            <div className="flex items-center gap-2">
               <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
               <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Class Management</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Configure classes assigned to this session</CardDescription>
               </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Suspense Wrapper for Data Table */}
            <Suspense 
              fallback={
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <Skeleton className="h-10 w-48 bg-slate-100 dark:bg-white/5" />
                     <Skeleton className="h-10 w-32 bg-slate-100 dark:bg-white/5" />
                  </div>
                  <Skeleton className="h-[400px] w-full rounded-xl bg-slate-100 dark:bg-white/5" />
                </div>
              }
            >
               {/* Table Container */}
               <div className="overflow-hidden">
                 <ClassList sessionId={sessionId} />
               </div>
            </Suspense>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}