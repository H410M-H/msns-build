"use client";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import EmployeeCreationDialog from "~/components/forms/employee/employeeCreation";
import { ScrollArea } from "~/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function EmployeeRegistration() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    {
      href: "/admin/users/faculty/create",
      label: "Employee Registration",
      current: true,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* 🎯 OPTIMIZED GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>

      <ScrollArea className="h-screen w-full">
        <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <PageHeader breadcrumbs={breadcrumbs} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-8 pb-12"
          >
            <EmployeeCreationDialog />
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}