"use client";

import { RevenueCards } from "~/components/cards/RevenueCard";
import { ExpensesTable, type Expense } from "~/components/tables/ExpensesTable";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { motion, type Variants } from "framer-motion";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import { DownloadPdfButton } from "~/components/ui/DownloadPdfButton";

export default function RevenuePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revenue", label: "Revenue", current: true },
  ];

  // Animation Variants typed correctly
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  const handleEdit = (expense: Expense) => {
    console.log("Edit expense:", expense);
    // Connect to your edit modal/sheet here
  };

  const handleDelete = (id: string) => {
    console.log("Delete expense with id:", id);
    // Connect to your delete mutation here
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Background Decorator */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
      
      <PageHeader breadcrumbs={breadcrumbs} />

      <motion.div 
        className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Title & Actions */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Financial Overview
            </h1>
            <p className="text-slate-500 mt-1">
              Track your institution&apos;s revenue, expenses, and net income.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select defaultValue="this_year">
              <SelectTrigger className="w-[140px] bg-white">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <DownloadPdfButton 
              reportType="fees" 
              label="Export Report" 
              variant="outline" 
              className="bg-white"
            />
          </div>
        </motion.div>

        {/* 1. Metrics Section */}
        <motion.div variants={itemVariants}>
          <RevenueCards />
        </motion.div>

        {/* 2. Main Content Section (Transactions) */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-teal-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Expense Transactions
                    </CardTitle>
                  </div>
                  <CardDescription>
                    A detailed list of all operational expenses and salaries.
                  </CardDescription>
                </div>
                
                {/* Visual Flair / Badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-xs font-medium text-teal-700">
                  <TrendingUp className="w-3 h-3" />
                  Live Data
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="p-6">
                <ExpensesTable
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}