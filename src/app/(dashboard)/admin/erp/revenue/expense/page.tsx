"use client";

import { motion } from "framer-motion";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ExpensesTable, type Expense } from "~/components/tables/ExpensesTable";

export default function ExpensePage() {
  const handleEdit = (expense: Expense) => {
    console.log("Edit expense:", expense);
  };

  const handleDelete = (id: string) => {
    console.log("Delete expense:", id);
  };

  const breadcrumbs = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/erp", label: "ERP" },
    { href: "/admin/erp/revenue", label: "Revenue Overview" },
    {
      href: "/admin/erp/revenue/expense",
      label: "Expense Management",
      current: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/50 to-teal-50/50 sm:px-6 sm:py-0 dark:from-slate-950 dark:to-slate-900">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Animated background elements */}
      <motion.div
        className="fixed -right-32 -top-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed -bottom-40 -left-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl dark:bg-green-500/5"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto pt-[5rem] relative z-10">
        <div className="mx-auto w-full space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <h1 className="bg-gradient-to-r from-green-800 to-teal-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-sm dark:from-emerald-400 dark:to-teal-400 md:text-5xl">
              Expenses & Financial Management
            </h1>
            <p className="text-md mx-auto max-w-2xl font-medium text-green-700/90 dark:text-emerald-300/80">
              Track, categorise, and manage institutional operational expenditures and records.
            </p>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-green-50/20 bg-white/90 p-4 shadow-lg backdrop-blur-sm dark:border-border dark:bg-card/90"
          >
            <ExpensesTable onEdit={handleEdit} onDelete={handleDelete} />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
