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
    { href: "/clerk", label: "Dashboard" },
    { href: "/clerk/sessions", label: "Sessions" },
    {
      href: `/clerk/sessions/${sessionId}`,
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
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <CalendarRange className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Session Overview
              </h1>
            </div>
            <p className="max-w-2xl pl-1 text-muted-foreground">
              Manage classes, student allocations, and fee structures for this
              academic session.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-emerald-300"
            >
              <Info className="mr-1 h-3 w-3" /> Active Session
            </Badge>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="overflow-hidden border border-border bg-card shadow-xl backdrop-blur-md">
          <CardHeader className="border-b border-border bg-black/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-500" />
              <div>
                <CardTitle className="text-lg font-medium text-foreground">
                  Class Management
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Configure classes assigned to this session
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Suspense Wrapper for Data Table */}
            <Suspense
              fallback={
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48 bg-white/5" />
                    <Skeleton className="h-10 w-32 bg-white/5" />
                  </div>
                  <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
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
