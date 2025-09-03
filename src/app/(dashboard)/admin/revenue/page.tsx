"use client";

import { RevenueCards } from "~/components/cards/RevenueCard";
import { ExpensesTable, type Expense } from "~/components/tables/ExpensesTable";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { motion } from "framer-motion";

export default function RevenuePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revenue", label: "Revenue", current: true },
  ];

  const handleEdit = (expense: Expense) => {
    console.log("Edit expense:", expense);
    // Implement edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete expense with id:", id);
    // Implement delete logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-gray-100/50 hover:shadow-xl transition-shadow duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#e0f7fa_0%,transparent_70%)] opacity-20" />
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50/50 p-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-800">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center gap-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-7 h-7 text-teal-600"
                    >
                      <path
                        d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.653V16.347L12 20.689L19.5 16.347V7.653L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                      />
                    </svg>
                    Revenue Management
                  </motion.div>
                </CardTitle>
                <motion.div
                  className="text-sm bg-teal-50/80 text-teal-700 px-3 py-1.5 rounded-full border border-teal-100/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    Real-time Insights
                  </span>
                </motion.div>
              </div>
              <motion.p
                className="mt-2 text-gray-600 text-sm max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Monitor revenue streams, track payments, and optimize financial
                performance with ease.
              </motion.p>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                <RevenueCards />
                <ExpensesTable
                  expenses={[]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}