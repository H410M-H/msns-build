"use client";

import React, { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Wallet, Plus, Loader2, ArrowDown, ArrowUp, RefreshCw, Landmark, Percent } from "lucide-react";
import { toast } from "sonner";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Separator } from "~/components/ui/separator";

export default function PettyCashPage() {
  const [disbForm, setDisbForm] = useState({ amount: 0, payee: "", purpose: "", expenseCategory: "" });
  const [replenishAmount, setReplenishAmount] = useState(0);
  const [reconForm, setReconForm] = useState({ physicalCount: 0, explanation: "" });
  const [showDisbDialog, setShowDisbDialog] = useState(false);
  const [showReplenishDialog, setShowReplenishDialog] = useState(false);
  const [showReconDialog, setShowReconDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: register, refetch, isLoading } = api.erp.pettyCash.getRegister.useQuery(
    { sessionId: selectedSessionId },
    { enabled: !!selectedSessionId },
  );

  const initRegister = api.erp.pettyCash.initRegister.useMutation({
    onSuccess: () => { toast.success("Register initialized"); void refetch(); },
    onError: e => toast.error(e.message),
  });

  const disburse = api.erp.pettyCash.recordDisbursement.useMutation({
    onSuccess: (d) => { toast.success(`Disbursed PKR ${disbForm.amount}. New balance: PKR ${d.newBalance}`); setShowDisbDialog(false); setDisbForm({ amount: 0, payee: "", purpose: "", expenseCategory: "" }); void refetch(); },
    onError: e => toast.error(e.message),
  });
  const replenish = api.erp.pettyCash.recordReplenishment.useMutation({
    onSuccess: (d) => { toast.success(`Replenished. New balance: PKR ${d.newBalance}`); setShowReplenishDialog(false); void refetch(); },
    onError: e => toast.error(e.message),
  });
  const reconcile = api.erp.pettyCash.recordReconciliation.useMutation({
    onSuccess: (d) => { toast.success(`Reconciled. Variance: ${d.variance >= 0 ? "+" : ""}${d.variance}`); setShowReconDialog(false); void refetch(); },
    onError: e => toast.error(e.message),
  });

  const balancePct = register
    ? Math.round((register.currentBalance / register.openingBalance) * 100)
    : 0;

  // Stats computation
  const stats = useMemo(() => {
    if (!register) return { current: 0, opening: 0, disbursements: 0, reconciliations: 0 };
    const current = register.currentBalance;
    const opening = register.openingBalance;
    const disbursements = register.Disbursements.reduce((sum, d) => sum + d.amount, 0);
    const reconciliations = register.Reconciliations.length;
    return { current, opening, disbursements, reconciliations };
  }, [register]);

  // Export Data definition
  const exportData = useMemo(() => {
    if (!register) return undefined;
    return {
      columns: [
        { key: "date", label: "Date" },
        { key: "payee", label: "Payee" },
        { key: "purpose", label: "Purpose" },
        { key: "category", label: "Category" },
        { key: "amount", label: "Amount (PKR)" },
        { key: "by", label: "Recorded By" },
      ],
      rows: register.Disbursements.map(d => ({
        date: new Date(d.date).toLocaleDateString(),
        payee: d.payee,
        purpose: d.purpose,
        category: d.expenseCategory,
        amount: d.amount.toLocaleString(),
        by: d.RecordedBy.employeeName,
      })),
      sheetName: "Petty Cash Disbursements",
      title: "Petty Cash Disbursements Log",
    };
  }, [register]);

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/petty-cash", label: "Petty Cash" },
      ]} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-orange-200 bg-orange-100 p-2.5 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Petty <span className="text-orange-600 dark:text-orange-400">Cash</span>
            </h1>
            <p className="text-sm text-muted-foreground">Manage petty cash registers, disbursements, and reconciliations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename="petty-cash-disbursements" />
        </div>
      </div>

      <Separator className="bg-orange-500/20" />

      {/* Session Selector */}
      <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic Session</Label>
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select session" /></SelectTrigger>
                <SelectContent>{sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSessionId && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center dark:border-border dark:bg-card/50">
          <p className="text-sm text-muted-foreground">Select a session to view the petty cash register.</p>
        </div>
      )}

      {selectedSessionId && !register && !isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 py-10 text-center dark:border-orange-500/20 dark:bg-orange-500/5">
          <div>
            <p className="mb-3 text-sm font-medium text-orange-700 dark:text-orange-400">No petty cash register for this session.</p>
            <Button className="bg-orange-600 text-white hover:bg-orange-700" onClick={() => {
              const opening = parseFloat(prompt("Opening balance (PKR):") ?? "0");
              if (opening > 0) {
                initRegister.mutate({ sessionId: selectedSessionId, openingBalance: opening });
              }
            }}>
              <Plus className="mr-2 h-4 w-4" /> Initialize Register
            </Button>
          </div>
        </div>
      )}

      {register && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GradientStatCard
              title="Current Balance"
              value={isLoading ? "..." : `PKR ${stats.current.toLocaleString()}`}
              icon={<Wallet className="h-5 w-5" />}
              theme={register.needsReplenishment ? "rose" : "emerald"}
              subtitle={register.needsReplenishment ? "Below minimum threshold" : "Balance Healthy"}
            />
            <GradientStatCard
              title="Opening Balance"
              value={isLoading ? "..." : `PKR ${stats.opening.toLocaleString()}`}
              icon={<Landmark className="h-5 w-5" />}
              theme="blue"
            />
            <GradientStatCard
              title="Total Disbursed"
              value={isLoading ? "..." : `PKR ${stats.disbursements.toLocaleString()}`}
              icon={<ArrowDown className="h-5 w-5" />}
              theme="orange"
            />
            <GradientStatCard
              title="Remaining Health"
              value={isLoading ? "..." : `${balancePct}%`}
              icon={<Percent className="h-5 w-5" />}
              theme="purple"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={() => setShowDisbDialog(true)} className="bg-orange-600 text-white hover:bg-orange-700">
              <ArrowDown className="mr-2 h-4 w-4" /> Record Disbursement
            </Button>
            <Button onClick={() => setShowReplenishDialog(true)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400">
              <ArrowUp className="mr-2 h-4 w-4" /> Replenish
            </Button>
            <Button onClick={() => { setShowReconDialog(true); setReconForm({ physicalCount: register.currentBalance, explanation: "" }); }} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Reconcile
            </Button>
          </div>

          <Tabs defaultValue="disbursements">
            <TabsList className="border border-slate-200 bg-slate-50 dark:border-border dark:bg-card">
              <TabsTrigger value="disbursements">Disbursements ({register.Disbursements.length})</TabsTrigger>
              <TabsTrigger value="reconciliations">Reconciliations ({register.Reconciliations.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="disbursements" className="mt-4">
              <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                        {["Date", "Payee", "Purpose", "Category", "Amount", "Recorded By"].map(h => (
                          <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {register.Disbursements.map(d => (
                        <TableRow key={d.disbursementId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                          <TableCell className="font-mono text-xs">{new Date(d.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-sm font-semibold text-slate-800 dark:text-foreground">{d.payee}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.purpose}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/5 dark:text-orange-400">{d.expenseCategory}</Badge></TableCell>
                          <TableCell className="font-mono text-sm font-bold text-slate-800 dark:text-foreground">PKR {d.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.RecordedBy.employeeName}</TableCell>
                        </TableRow>
                      ))}
                      {!register.Disbursements.length && (
                        <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No disbursements recorded yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reconciliations" className="mt-4">
              <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                        {["Date", "System Balance", "Physical Count", "Variance", "Performed By"].map(h => (
                          <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {register.Reconciliations.map(r => (
                        <TableRow key={r.reconciliationId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                          <TableCell className="font-mono text-xs">{new Date(r.performedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-sm font-semibold">PKR {r.systemBalance.toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-sm font-semibold">PKR {r.physicalCount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs font-mono font-bold ${r.variance === 0 ? "border-slate-300 bg-slate-50 text-slate-700" : r.variance > 0 ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400" : "border-red-300 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400"}`}>
                              {r.variance > 0 ? "+" : ""}{r.variance.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.PerformedBy.employeeName}</TableCell>
                        </TableRow>
                      ))}
                      {!register.Reconciliations.length && (
                        <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">No reconciliations performed yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Record Disbursement Dialog */}
      <Dialog open={showDisbDialog} onOpenChange={setShowDisbDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle><ArrowDown className="inline mr-2 h-4 w-4 text-orange-500" />Record Disbursement</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payee Name</Label><Input value={disbForm.payee} onChange={e => setDisbForm({ ...disbForm, payee: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount (PKR)</Label><Input type="number" value={disbForm.amount || ""} onChange={e => setDisbForm({ ...disbForm, amount: parseFloat(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose</Label><Input value={disbForm.purpose} onChange={e => setDisbForm({ ...disbForm, purpose: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense Category</Label>
                <Select value={disbForm.expenseCategory} onValueChange={v => setDisbForm({ ...disbForm, expenseCategory: v })}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{["Stationery", "Utilities", "Repairs", "Entertainment", "Logistics", "Others"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-orange-600 text-white hover:bg-orange-700" disabled={disburse.isPending || !disbForm.amount || !disbForm.payee}
              onClick={() => disburse.mutate({ sessionId: selectedSessionId, ...disbForm })}>
              {disburse.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Record Disbursement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replenish Dialog */}
      <Dialog open={showReplenishDialog} onOpenChange={setShowReplenishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle><ArrowUp className="inline mr-2 h-4 w-4 text-emerald-500" />Replenish Register</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Replenish Amount (PKR)</Label>
              <Input type="number" value={replenishAmount || ""} onChange={e => setReplenishAmount(parseFloat(e.target.value))} />
            </div>
             <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={replenish.isPending || !replenishAmount}
              onClick={() => replenish.mutate({ sessionId: selectedSessionId, amount: replenishAmount })}>
              {replenish.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Replenish Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reconcile Dialog */}
      <Dialog open={showReconDialog} onOpenChange={setShowReconDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle><RefreshCw className="inline mr-2 h-4 w-4 text-slate-500" />Perform Reconciliation</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Cash Count (PKR)</Label>
              <Input type="number" value={reconForm.physicalCount || ""} onChange={e => setReconForm({ ...reconForm, physicalCount: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes / Explanation</Label>
              <Input value={reconForm.explanation} onChange={e => setReconForm({ ...reconForm, explanation: e.target.value })} placeholder="e.g. Reconciliation verified" />
            </div>
            <Button className="w-full bg-slate-700 text-white hover:bg-slate-800" disabled={reconcile.isPending}
              onClick={() => reconcile.mutate({ sessionId: selectedSessionId, ...reconForm })}>
              {reconcile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Complete Reconciliation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
