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
import { Calendar, TrendingUp, Wallet, Filter } from "lucide-react";
import { DownloadPdfButton } from "~/components/ui/DownloadPdfButton";
import { Separator } from "~/components/ui/separator";

export default function RevenuePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/revenue", label: "Financial Overview", current: true },
  ];

  // Animation Variants
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
  };

  const handleDelete = (id: string) => {
    console.log("Delete expense with id:", id);
  };

  return (
    <section className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
        {/* Ambient Glow */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] opacity-40" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader breadcrumbs={breadcrumbs} />

        <motion.div 
          className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* === Page Header & Controls === */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          >
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-400">
                Financial Overview
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Comprehensive tracking of institution revenue streams, operational expenses, and net income analysis.
              </p>
            </div>
            
            {/* Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-3 p-1.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md shadow-lg">
              <Select defaultValue="this_year">
                <SelectTrigger className="w-[160px] h-10 bg-slate-800/50 border-emerald-500/20 text-white focus:ring-emerald-500/50">
                  <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-emerald-500/20 text-white">
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Separator orientation="vertical" className="h-6 bg-emerald-500/20 hidden sm:block" />

              <DownloadPdfButton 
                reportType="fees" 
                label="Export Report" 
                variant="default" 
                className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border-0"
              />
            </div>
          </motion.div>

          {/* === 1. Metrics Cards === */}
          <motion.div variants={itemVariants} className="relative">
             {/* Decorative blob behind cards */}
             <div className="absolute inset-0 bg-emerald-500/5 blur-3xl -z-10" />
             <RevenueCards />
          </motion.div>

          {/* === 2. Transactions Table Section === */}
          <motion.div variants={itemVariants}>
            <Card className="border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              
              <CardHeader className="border-b border-emerald-500/10 bg-slate-900/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-inner">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        Expense Transactions
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Detailed breakdown of operational expenses and salary disbursements.
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Status Badge / Filter Placeholder */}
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Live Updates</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/50 border border-emerald-500/20 text-slate-400 hover:text-white cursor-pointer transition-colors">
                        <Filter className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="p-4 sm:p-6 overflow-x-auto">
                  {/* Ensure ExpensesTable handles dark mode styling internally or via global CSS */}
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
    </section>
  );
}