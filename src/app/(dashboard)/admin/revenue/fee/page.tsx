"use client";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { motion } from "framer-motion";
import { FeeDashboard } from "~/components/forms/fee/feeDashboard";

export default function FeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revenue", label: "Revenue" },
    { href: "/admin/revenue/fee", label: "Fee Management", current: true },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-blue-50/50">
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Animated background elements matching Revenue theme */}
      <motion.div 
        className="fixed -top-40 -right-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl -z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="fixed -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl -z-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <FeeDashboard />
      </div>
    </main>
  );
}