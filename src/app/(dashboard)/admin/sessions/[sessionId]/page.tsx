"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange } from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassList } from "~/components/tables/ClassList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile for conditional rendering
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* 🎯 OPTIMIZED GRID BACKGROUND (Dark Theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>

      {/* 🎯 AMBIENT GLOW EFFECTS */}
      {!prefersReducedMotion && !isMobile && (
        <>
          <motion.div
            className="absolute left-[10%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[80px]"
            animate={{
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[10%] right-[10%] h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[80px]"
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </>
      )}

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-[100vw]">
        <PageHeader breadcrumbs={breadcrumbs} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {/* Glassmorphism Card */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-white/10 p-6 sm:p-8 bg-gradient-to-r from-emerald-900/20 to-transparent">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                  <CalendarRange className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Session Overview
                  </CardTitle>
                  <CardDescription className="text-emerald-100/60 font-medium text-sm sm:text-base">
                    Manage classes, student allocations, and fee structures for this academic session
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <div className="bg-black/20 rounded-2xl border border-white/5 p-4 sm:p-6 shadow-inner">
                {/* Passed sessionId to ClassList */}
                <ClassList sessionId={sessionId} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}