"use client";

import React, { useState, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BarChart3, CheckCircle2, XCircle, TrendingDown, TrendingUp, DollarSign, Wallet, Landmark } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Separator } from "~/components/ui/separator";

export default function LedgerPage() {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);

  const { data: sessions } = api.session.getSessions.useQuery();
  const latestSession = sessions?.[0];

  useEffect(() => {
    if (latestSession && !selectedSessionId) {
      setSelectedSessionId(latestSession.sessionId);
    }
  }, [latestSession, selectedSessionId]);

  const { data: ledger, isLoading: isLedgerLoading } = api.erp.ledger.getGeneralLedger.useQuery({
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
    page: ledgerPage,
    pageSize: 30,
  });
  const { data: trialBalance, isLoading: isTBLoading } = api.erp.ledger.getTrialBalance.useQuery({
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
  });
  const { data: pnl, isLoading: isPnLLoading } = api.erp.ledger.getProfitLoss.useQuery(
    { sessionId: selectedSessionId },
    { enabled: !!selectedSessionId },
  );

  const ACCOUNT_TYPE_COLORS: Record<string, string> = {
    Income: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    Expenditure: "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
    Asset: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
    Liability: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  };

  // Stats computation
  const stats = useMemo(() => {
    const income = pnl?.totalIncome ?? trialBalance?.accounts.filter(a => a.accountType === "Income").reduce((sum, a) => sum + a.totalCredit, 0) ?? 0;
    const expense = pnl?.totalExpenditure ?? trialBalance?.accounts.filter(a => a.accountType === "Expenditure").reduce((sum, a) => sum + a.totalDebit, 0) ?? 0;
    const balance = pnl ? pnl.netSurplusDeficit : (income - expense);
    const tbBalanced = trialBalance?.isBalanced ?? false;
    return { income, expense, balance, tbBalanced };
  }, [trialBalance, pnl]);

  // Export Data definition
  const exportData = useMemo(() => {
    if (!ledger) return undefined;
    return {
      columns: [
        { key: "date", label: "Date" },
        { key: "code", label: "Account Code" },
        { key: "type", label: "Type" },
        { key: "dc", label: "D/C" },
        { key: "amount", label: "Amount (PKR)" },
        { key: "description", label: "Description" },
        { key: "source", label: "Source" },
        { key: "by", label: "By" },
      ],
      rows: ledger.entries.map(e => ({
        date: new Date(e.transactionDate).toLocaleDateString(),
        code: e.accountCode,
        type: e.accountType,
        dc: e.entryType === "DEBIT" ? "DR" : "CR",
        amount: e.amount.toLocaleString(),
        description: e.description,
        source: e.sourceType,
        by: e.CreatedBy.employeeName,
      })),
      sheetName: "General Ledger",
      title: "School General Ledger Logs",
    };
  }, [ledger]);

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/ledger", label: "Financial Ledger" },
      ]} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-teal-200 bg-teal-100 p-2.5 text-teal-600 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Financial <span className="text-teal-600 dark:text-teal-400">Ledger</span>
            </h1>
            <p className="text-sm text-muted-foreground">General ledger, trial balance, and profit &amp; loss reports</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename="financial-ledger" />
        </div>
      </div>

      <Separator className="bg-teal-500/20" />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Revenue (Income)"
          value={isLedgerLoading ? "..." : `PKR ${stats.income.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          theme="emerald"
        />
        <GradientStatCard
          title="Expenditures"
          value={isLedgerLoading ? "..." : `PKR ${stats.expense.toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          theme="rose"
        />
        <GradientStatCard
          title="Net Surplus/Deficit"
          value={isLedgerLoading ? "..." : `PKR ${stats.balance.toLocaleString()}`}
          icon={stats.balance >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          theme={stats.balance >= 0 ? "indigo" : "orange"}
        />
        <GradientStatCard
          title="Trial Balance Status"
          value={isTBLoading ? "..." : stats.tbBalanced ? "Balanced" : "Unbalanced"}
          icon={<Landmark className="h-5 w-5" />}
          theme={stats.tbBalanced ? "emerald" : "orange"}
        />
      </div>

      {/* Date Range Filter */}
      <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From Date</Label>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm dark:border-border dark:bg-card dark:text-foreground w-full" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To Date</Label>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm dark:border-border dark:bg-card dark:text-foreground w-full" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session (P&L)</Label>
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="h-9 w-full text-sm bg-white dark:bg-card"><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>{sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFromDate(""); setToDate(""); }} className="mb-0">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general-ledger">
        <TabsList className="border border-slate-200 bg-slate-50 dark:border-border dark:bg-card">
          <TabsTrigger value="general-ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
        </TabsList>

        {/* General Ledger */}
        <TabsContent value="general-ledger" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">General Ledger</CardTitle>
                <Badge variant="outline" className="border-teal-500/20 bg-teal-500/5 text-teal-600 dark:text-teal-400 text-xs">{ledger?.total ?? 0} entries</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                      {["Date", "Account Code", "Type", "D/C", "Amount", "Description", "Source", "By"].map(h => (
                        <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger?.entries.map((e, idx) => (
                      <TableRow key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                        <TableCell className="font-mono text-xs">{new Date(e.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-slate-800 dark:text-foreground">{e.accountCode}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-xs ${ACCOUNT_TYPE_COLORS[e.accountType] ?? ""}`}>{e.accountType}</Badge></TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-bold ${e.entryType === "DEBIT" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400" : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>
                            {e.entryType === "DEBIT" ? "DR" : "CR"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-bold text-slate-800 dark:text-foreground">PKR {e.amount.toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{e.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.sourceType}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.CreatedBy.employeeName}</TableCell>
                      </TableRow>
                    ))}
                    {!ledger?.entries.length && (
                      <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No ledger entries found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {ledger && ledger.total > 30 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-border">
                  <Button size="sm" variant="outline" disabled={ledgerPage <= 1} onClick={() => setLedgerPage(p => p - 1)}>Previous</Button>
                  <span className="text-xs text-muted-foreground">Page {ledger.page} · {ledger.total} entries</span>
                  <Button size="sm" variant="outline" disabled={ledgerPage * 30 >= ledger.total} onClick={() => setLedgerPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="trial-balance" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Trial Balance</CardTitle>
                {trialBalance && (
                  <Badge variant="outline" className={`text-xs ${trialBalance.isBalanced ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"}`}>
                    {trialBalance.isBalanced ? <><CheckCircle2 className="mr-1 inline h-3 w-3" /> Balanced</> : <><XCircle className="mr-1 inline h-3 w-3" /> Unbalanced</>}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                    {["Account Code", "Account Type", "Total Debit (PKR)", "Total Credit (PKR)"].map(h => (
                      <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance?.accounts.map(a => (
                    <TableRow key={a.accountCode} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                      <TableCell className="font-mono text-sm font-semibold text-slate-900 dark:text-foreground">{a.accountCode}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-xs ${ACCOUNT_TYPE_COLORS[a.accountType] ?? ""}`}>{a.accountType}</Badge></TableCell>
                      <TableCell className="font-mono text-sm text-blue-700 dark:text-blue-400">{a.totalDebit.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm text-emerald-700 dark:text-emerald-400">{a.totalCredit.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {trialBalance && (
                    <TableRow className="border-t-2 border-slate-300 bg-slate-50 dark:border-border dark:bg-black/20 font-bold">
                      <TableCell colSpan={2} className="text-sm font-bold text-slate-900 dark:text-foreground">TOTALS</TableCell>
                      <TableCell className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">{trialBalance.totalDebits.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{trialBalance.totalCredits.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {!trialBalance?.accounts.length && (
                    <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No ledger entries for the selected period.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L */}
        <TabsContent value="pnl" className="mt-4">
          {!selectedSessionId ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 dark:border-border dark:bg-card/50">
              <p className="text-sm text-muted-foreground">Select a session above to view the Profit &amp; Loss statement.</p>
            </div>
          ) : isPnLLoading ? (
            <div className="py-14 text-center text-sm text-muted-foreground">Loading Profit &amp; Loss...</div>
          ) : !pnl ? (
            <div className="py-14 text-center text-sm text-muted-foreground">Profit &amp; Loss statement not found.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
                  <CardTitle className="text-sm font-bold">Profit &amp; Loss Statement</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Income (Fee Collections)</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">PKR {pnl.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">Total Expenditure</span>
                    <span className="font-mono font-bold text-red-500">PKR {pnl.totalExpenditure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold pt-2">
                    <span>Net Surplus / Deficit</span>
                    <span className={pnl.isDeficit ? "text-red-500 font-mono" : "text-emerald-600 dark:text-emerald-400 font-mono"}>
                      PKR {pnl.netSurplusDeficit.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
                  <CardTitle className="text-sm font-bold">Expenditure Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Salaries paid</span>
                    <span className="font-mono">PKR {pnl.breakdown.salaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Direct Expenses approved</span>
                    <span className="font-mono">PKR {pnl.breakdown.directExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Petty cash disbursements</span>
                    <span className="font-mono">PKR {pnl.breakdown.pettyCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Purchase orders settled</span>
                    <span className="font-mono">PKR {pnl.breakdown.purchaseOrders.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Other miscellaneous expenses</span>
                    <span className="font-mono">PKR {pnl.breakdown.otherExpenses.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
