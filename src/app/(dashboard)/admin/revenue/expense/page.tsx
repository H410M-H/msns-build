"use client";

import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { SalaryTable } from "~/components/tables/SalaryTable";
import { ExpenseCreationDialog } from "~/components/blocks/expense/ExpenseCreation";
import { Button } from "~/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { PageHeader } from "~/components/blocks/nav/PageHeader";

export default function ExpensePage() {
  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Add actual refresh logic here
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const breadcrumbs = [
    { href: "/admin/revenue", label: "Revenue" },
    {
      href: "/admin/revenue/expense",
      label: "Expense Management",
      current: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/50 to-teal-50/50 sm:px-6 sm:py-0">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Animated background elements */}
      <motion.div
        className="fixed -right-32 -top-40 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed -bottom-40 -left-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto pt-[5rem]">
        <div className="mx-auto w-full space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <h1 className="bg-gradient-to-r from-green-800 to-teal-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-sm md:text-5xl">
              Expenses & Financial Management
            </h1>
            <p className="text-md mx-auto max-w-2xl font-medium text-green-700/90">
              Streamline salary allocations with precision and clarity through
              our comprehensive compensation management system
            </p>
          </motion.div>

          <Separator className="h-[2px] bg-gradient-to-r from-green-200/80 to-teal-200/80 shadow-sm" />

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 rounded-xl border border-green-50/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm"
          >
            {/* Controls Section */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="group relative max-w-md flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-green-600/80 transition-colors group-focus-within:text-green-700" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-green-200/50 bg-green-50/50 pl-10 text-green-900 placeholder-green-600/60 transition-colors hover:bg-green-50/70 focus-visible:ring-2 focus-visible:ring-green-300/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <ExpenseCreationDialog />

                <Button
                  variant="outline"
                  className="group border-green-200 text-green-700 hover:bg-green-50/50 hover:text-green-800"
                  onClick={handleRefresh}
                >
                  <RefreshCw
                    className={cn(
                      "mr-2 h-4 w-4 transition-transform",
                      isRefreshing && "animate-spin",
                    )}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <SalaryTable
              page={page}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
              searchTerm={searchTerm}
            />
          </motion.div>

          {/* Footer Badges */}
          <motion.div
            className="pb-6 text-center text-sm font-medium text-green-700/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex flex-wrap justify-center gap-3">
              {[
                { icon: "🔒", text: "Secured Transactions" },
                { icon: "📊", text: "Real-time Analytics" },
                { icon: "📑", text: "Audit Compliance" },
              ].map((badge, index) => (
                <motion.span
                  key={index}
                  className="cursor-default rounded-full border border-green-200/30 bg-green-100/50 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-green-100/70"
                  whileHover={{ scale: 1.05 }}
                >
                  {badge.icon} {badge.text}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
