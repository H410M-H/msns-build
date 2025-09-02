"use client";

import { RevenueCards } from "~/components/cards/RevenueCard";
// import { ExpensesTable } from "~/components/tables/ExpensesTable";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { motion } from "framer-motion";
import { ExpensesTable } from "~/components/tables/ExpensesTable";
import type { Expense } from "~/components/tables/ExpensesTable";
// Animated number component

export default function RevenuePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revenue", label: "Revenue", current: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <PageHeader breadcrumbs={breadcrumbs} />



      {/* Revenue Cards Section */}
      <div className="pb-6">
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border-0 relative">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array<number>(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-teal-100/40"
            initial={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 5 + 5}px`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-500" />

      <CardHeader className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 relative py-5">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-teal-300/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
            <motion.div
              whileHover={{ x: 5 }}
              className="inline-flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-teal-600">
                <path d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.653V16.347L12 20.689L19.5 16.347V7.653L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"></path>
              </svg>
              Revenue Management
            </motion.div>
          </CardTitle>
          
          <motion.div 
            className="hidden md:block text-sm bg-teal-50 text-teal-800 px-3 py-1.5 rounded-full border border-teal-100 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              Real-time financial dashboard
            </span>
          </motion.div>
        </div>
        
        <motion.p 
          className="mt-2 text-gray-500 text-sm max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Manage all revenue streams, track payments, and analyze financial performance
        </motion.p>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <div className="absolute inset-0 bg-grid-teal-100/50 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]" />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="relative z-10"
        >
          <div className="p-4 md:p-6">
            <RevenueCards />
          <ExpensesTable expenses={[]} onEdit={function (_expense: Expense): void {
                    throw new Error("Function not implemented.");
                  } } onDelete={function (_id: string): void {
                    throw new Error("Function not implemented.");
                  } } />
          </div>
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
</div>
    </div>
  );
}