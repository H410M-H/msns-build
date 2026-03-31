"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import StudentCreationDialog from "~/components/forms/student/StudentCreation";
import { motion } from "framer-motion";

export default function StudentRegistration() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "User Management" },
    {
      href: "/admin/users/student/create",
      label: "Student Registration",
      current: true,
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* 🎯 OPTIMIZED GRID BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="via-emerald-300/200 absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-900/40 to-black/60" />
      </div>

      <ScrollArea className="h-screen">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader breadcrumbs={breadcrumbs} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pb-12 pt-8"
          >
            <div className="flex w-full flex-1 flex-col items-center justify-center">
              <StudentCreationDialog />
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
