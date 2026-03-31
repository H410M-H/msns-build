// File: src/app/(dashboard)/admin/revenue/fee/page.tsx
"use client";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { motion } from "framer-motion";
import { FeeDashboard } from "~/components/forms/fee/feeDashboard";

export default function FeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revenue", label: "Revenue" },
    { href: "#", label: "Fee Management", current: true },
  ];

  return (
    <div className="relative w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Animated background elements - Theme Adapted */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -right-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-500/5"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: 360,
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[120px] dark:bg-blue-500/5"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
            rotate: -360,
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="w-full duration-700 animate-in fade-in slide-in-from-bottom-4">
        <FeeDashboard />
      </div>
    </div>
  );
}
