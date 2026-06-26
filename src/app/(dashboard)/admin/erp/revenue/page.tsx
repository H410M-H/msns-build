"use client";

import { useMemo, useState, useEffect } from "react";
import { ExpensesTable, type Expense } from "~/components/tables/ExpensesTable";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { motion, type Variants } from "framer-motion";
import { Calendar, TrendingUp, Wallet, Filter, DollarSign, Receipt } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";

export default function RevenuePage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const { data: sessions } = api.session.getSessions.useQuery();
  const latestSession = sessions?.[0];

  useEffect(() => {
    if (latestSession && !selectedSessionId) {
      setSelectedSessionId(latestSession.sessionId);
    }
  }, [latestSession, selectedSessionId]);

  const selectedYear = useMemo(() => {
    if (!selectedSessionId || !sessions) return undefined;
    const session = sessions.find((s) => s.sessionId === selectedSessionId);
    if (!session) return undefined;
    return new Date(session.sessionFrom).getFullYear();
  }, [selectedSessionId, sessions]);

  // Financial overview stats from ledger Profit & Loss
  const { data: profitLoss, isLoading: isPLLoading } = api.erp.ledger.getProfitLoss.useQuery(
    { sessionId: selectedSessionId },
    { enabled: !!selectedSessionId }
  );

  // Fee Analytics
  const { data: feeAnalytics, isLoading: isFeeLoading } = api.fee.getFeeAnalytics.useQuery(
    { sessionId: selectedSessionId, year: selectedYear ?? 2025 },
    { enabled: !!selectedSessionId && !!selectedYear }
  );

  // All expenses for CSV export
  const { data: allExpensesData } = api.expense.getAllExpenses.useQuery({
    pageSize: 1000,
  });

  const totalCollected = useMemo(() => {
    if (!feeAnalytics?.monthlyTrend) return 0;
    return feeAnalytics.monthlyTrend.reduce((sum, item) => sum + item.collected, 0);
  }, [feeAnalytics]);

  const totalOutstanding = feeAnalytics?.summary?.totalOutstanding ?? 0;

  const totalExpected = useMemo(() => {
    if (!feeAnalytics?.monthlyTrend) return 0;
    return feeAnalytics.monthlyTrend.reduce((sum, item) => sum + (item.collected + item.outstanding), 0);
  }, [feeAnalytics]);

  const otherRevenue = useMemo(() => {
    if (!profitLoss) return 0;
    return Math.max(0, profitLoss.totalIncome - totalCollected);
  }, [profitLoss, totalCollected]);

  const exportData = useMemo(() => {
    if (!allExpensesData?.data) return undefined;
    return {
      columns: [
        { key: "title", label: "Expense Title" },
        { key: "amount", label: "Amount (PKR)" },
        { key: "category", label: "Category" },
        { key: "date", label: "Date" },
        { key: "description", label: "Description" },
      ],
      rows: allExpensesData.data.map((exp) => ({
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        date: `${exp.month}/${exp.year}`,
        description: exp.description ?? "",
      })),
      sheetName: "Expenses",
      title: "Expenses Report",
    };
  }, [allExpensesData]);

  const breadcrumbs = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/erp", label: "ERP" },
    { href: "/admin/erp/revenue", label: "Revenue Overview", current: true },
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
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const handleEdit = (expense: Expense) => {
    console.log("Edit expense:", expense);
  };

  const handleDelete = (id: string) => {
    console.log("Delete expense with id:", id);
  };

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
        {/* Ambient Glow */}
        <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-emerald-500/10 opacity-40 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <motion.div
          className="container mx-auto space-y-8 px-4 py-8 pt-20 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* === Page Header & Controls === */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
          >
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                Financial Overview
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                Comprehensive tracking of institution revenue streams,
                operational expenses, and net income analysis.
              </p>
            </div>

            {/* Controls Toolbar */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/20 bg-card p-1.5 shadow-lg backdrop-blur-md">
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="h-10 w-[180px] border-emerald-500/20 bg-muted text-foreground focus:ring-emerald-500/50">
                  <Calendar className="mr-2 h-4 w-4 text-emerald-400" />
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent className="border-emerald-500/20 bg-card text-foreground">
                  {sessions?.map((s) => (
                    <SelectItem key={s.sessionId} value={s.sessionId}>
                      {s.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator
                orientation="vertical"
                className="hidden h-6 bg-emerald-500/20 sm:block"
              />

              <PageExportButton
                exportData={exportData}
                csvFilename="revenue-expenses-report"
                pdfReportType="fees"
                buttonLabel="Export Report"
              />
            </div>
          </motion.div>

          {/* === 1. Metrics Cards === */}
          <motion.div variants={itemVariants} className="relative">
            {/* Decorative blob behind cards */}
            <div className="absolute inset-0 -z-10 bg-emerald-500/5 blur-3xl" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <GradientStatCard
                title="Total Income"
                value={isPLLoading ? "..." : `PKR ${(profitLoss?.totalIncome ?? 0).toLocaleString()}`}
                icon={<TrendingUp className="h-5 w-5" />}
                subtitle="Total collected revenue"
                theme="emerald"
              />
              <GradientStatCard
                title="Invoiced Fees"
                value={isFeeLoading ? "..." : `PKR ${totalExpected.toLocaleString()}`}
                icon={<Receipt className="h-5 w-5" />}
                subtitle="Total generated billings"
                theme="blue"
              />
              <GradientStatCard
                title="Other Revenue"
                value={isPLLoading || isFeeLoading ? "..." : `PKR ${otherRevenue.toLocaleString()}`}
                icon={<DollarSign className="h-5 w-5" />}
                subtitle="Late fees & other funds"
                theme="amber"
              />
              <GradientStatCard
                title="Pending Collections"
                value={isFeeLoading ? "..." : `PKR ${totalOutstanding.toLocaleString()}`}
                icon={<Wallet className="h-5 w-5" />}
                subtitle="Unpaid vouchers total"
                theme="rose"
              />
            </div>
          </motion.div>

          {/* === 2. Transactions Table Section === */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-card shadow-2xl backdrop-blur-xl">
              <CardHeader className="border-b border-emerald-500/10 bg-card p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-3 shadow-inner">
                      <Wallet className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                        Expense Transactions
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Detailed breakdown of operational expenses and salary disbursements.
                      </CardDescription>
                    </div>
                  </div>

                  {/* Status Badge / Filter Placeholder */}
                  <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 sm:flex">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Live Updates</span>
                    </div>
                    <div className="cursor-pointer rounded-lg border border-emerald-500/20 bg-muted p-2 text-muted-foreground transition-colors hover:text-foreground">
                      <Filter className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto p-4 sm:p-6">
                  <ExpensesTable onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
