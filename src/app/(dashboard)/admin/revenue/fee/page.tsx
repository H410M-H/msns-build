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
    <div className="w-full space-y-6 relative">
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Animated background elements - Theme Adapted */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          className="absolute -top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-emerald-100/50 dark:bg-emerald-500/5 blur-[120px]"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: 360 
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-100/50 dark:bg-blue-500/5 blur-[120px]"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
            rotate: -360 
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <FeeDashboard />
      </div>
    </div>
  );
}