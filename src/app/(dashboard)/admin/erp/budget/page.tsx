"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Building2, Plus, Loader2, AlertTriangle, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function BudgetPage() {
  const [showCCDialog, setShowCCDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [ccForm, setCCForm] = useState({ code: "", name: "" });
  const [planForm, setPlanForm] = useState({ name: "", sessionId: "" });
  const [allocations, setAllocations] = useState<{ costCentreId: string; expenseCategory: string; allocatedAmount: number }[]>([]);

  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: costCentres, refetch: refetchCCs } = api.erp.budget.getAllCostCentres.useQuery();
  const { data: budgetPlans, refetch: refetchPlans } = api.erp.budget.getBudgetPlansForSession.useQuery(
    { sessionId: planForm.sessionId },
    { enabled: !!planForm.sessionId },
  );
  const { data: utilisation } = api.erp.budget.getBudgetUtilisation.useQuery(
    { budgetPlanId: selectedPlanId },
    { enabled: !!selectedPlanId },
  );

  const createCC = api.erp.budget.createCostCentre.useMutation({
    onSuccess: () => { toast.success("Cost centre created"); setShowCCDialog(false); void refetchCCs(); },
    onError: (e) => toast.error(e.message),
  });
  const createPlan = api.erp.budget.createBudgetPlan.useMutation({
    onSuccess: () => { toast.success("Budget plan created"); setShowPlanDialog(false); void refetchPlans(); },
    onError: (e) => toast.error(e.message),
  });

  const addAllocationRow = () =>
    setAllocations([...allocations, { costCentreId: "", expenseCategory: "", allocatedAmount: 0 }]);

  const utilPct = (u: { allocatedAmount: number; approvedSpend: number; committed: number }) => {
    const used = u.approvedSpend + u.committed;
    return u.allocatedAmount > 0 ? Math.round((used / u.allocatedAmount) * 100) : 0;
  };

  return (
    <div className="w-full space-y-5">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/budget", label: "Budget & Cost Centres" },
      ]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-100 p-2.5 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Budget & <span className="text-blue-600 dark:text-blue-400">Cost Centres</span>
            </h1>
            <p className="text-sm text-muted-foreground">Manage cost centres, budget plans, and track utilisation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCCDialog} onOpenChange={setShowCCDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-500/20 dark:text-blue-400">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Cost Centre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>New Cost Centre</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Code</Label>
                  <Input placeholder="e.g. CC-ADM-001" value={ccForm.code} onChange={e => setCCForm({ ...ccForm, code: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</Label>
                  <Input placeholder="e.g. Administration" value={ccForm.name} onChange={e => setCCForm({ ...ccForm, name: e.target.value })} />
                </div>
                <Button
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  disabled={createCC.isPending || !ccForm.code || !ccForm.name}
                  onClick={() => createCC.mutate(ccForm)}
                >
                  {createCC.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Cost Centre
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Budget Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader><DialogTitle>New Budget Plan</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session</Label>
                    <Select value={planForm.sessionId} onValueChange={v => setPlanForm({ ...planForm, sessionId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
                      <SelectContent>{sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Name</Label>
                    <Input placeholder="e.g. Annual Budget 2026" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 dark:border-border">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-foreground">Allocations</h3>
                    <Button size="sm" variant="outline" onClick={addAllocationRow}><Plus className="mr-1 h-3 w-3" /> Add Row</Button>
                  </div>
                  {allocations.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">Click &quot;Add Row&quot; to add budget allocations per cost centre.</p>
                  )}
                  {allocations.map((alloc, i) => (
                    <div key={i} className="mb-2 grid grid-cols-3 gap-2">
                      <Select value={alloc.costCentreId} onValueChange={v => { const a = [...allocations]; a[i]!.costCentreId = v; setAllocations(a); }}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Cost centre" /></SelectTrigger>
                        <SelectContent>{costCentres?.map(cc => <SelectItem key={cc.costCentreId} value={cc.costCentreId}>{cc.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input className="text-xs" placeholder="Category" value={alloc.expenseCategory} onChange={e => { const a = [...allocations]; a[i]!.expenseCategory = e.target.value; setAllocations(a); }} />
                      <Input type="number" className="text-xs" placeholder="Amount (PKR)" value={alloc.allocatedAmount || ""} onChange={e => { const a = [...allocations]; a[i]!.allocatedAmount = parseFloat(e.target.value); setAllocations(a); }} />
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  disabled={createPlan.isPending || !planForm.sessionId || !planForm.name || allocations.length === 0}
                  onClick={() => createPlan.mutate({ ...planForm, allocations })}
                >
                  {createPlan.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Budget Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="utilisation">
        <TabsList className="border border-slate-200 bg-slate-50 dark:border-border dark:bg-card">
          <TabsTrigger value="utilisation"><BarChart3 className="mr-1.5 h-3.5 w-3.5" />Utilisation</TabsTrigger>
          <TabsTrigger value="centres"><Building2 className="mr-1.5 h-3.5 w-3.5" />Cost Centres</TabsTrigger>
        </TabsList>

        <TabsContent value="utilisation" className="mt-4 space-y-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-bold">Budget Plan Selector</CardTitle>
                <div className="flex items-center gap-2 ml-auto">
                  <Select value={planForm.sessionId} onValueChange={v => { setPlanForm({ ...planForm, sessionId: v }); setSelectedPlanId(""); }}>
                    <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Session" /></SelectTrigger>
                    <SelectContent>{sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={!budgetPlans?.length}>
                    <SelectTrigger className="h-8 w-56 text-xs"><SelectValue placeholder="Select plan" /></SelectTrigger>
                    <SelectContent>{budgetPlans?.map(p => <SelectItem key={p.budgetPlanId} value={p.budgetPlanId}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedPlanId ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Select a session and budget plan to view utilisation.</div>
              ) : !utilisation ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-border">
                  {utilisation.utilisation.map((u) => {
                    const pct = utilPct(u);
                    return (
                      <div key={u.allocationId} className="px-5 py-4">
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{u.costCentreName}</p>
                            <p className="text-xs text-muted-foreground">{u.expenseCategory} · Code: {u.costCentreCode}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold text-slate-800 dark:text-foreground">
                              PKR {(u.approvedSpend + u.committed).toLocaleString()} <span className="font-normal text-muted-foreground">/ {u.allocatedAmount.toLocaleString()}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PKR {u.remaining.toLocaleString()} remaining</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={pct} className="h-2 flex-1" />
                          <Badge variant="outline" className={`text-xs tabular-nums ${pct >= 90 ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400" : pct >= 75 ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400" : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>
                            {pct}%
                          </Badge>
                          {u.alert90 && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                        </div>
                        {u.alert75 && !u.alert90 && (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">⚠ Over 75% utilised</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centres" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Cost Centres</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => void refetchCCs()} className="h-7 text-xs"><RefreshCw className="mr-1 h-3 w-3" /> Refresh</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Code</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manager</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costCentres?.map(cc => (
                    <TableRow key={cc.costCentreId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                      <TableCell className="font-mono text-sm font-semibold text-slate-900 dark:text-foreground">{cc.code}</TableCell>
                      <TableCell className="text-sm text-slate-700 dark:text-foreground">{cc.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cc.Manager?.employeeName ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cc.status === "Active" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-slate-200 bg-slate-50 text-muted-foreground"}>
                          {cc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!costCentres?.length && (
                    <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">No cost centres yet. Create one above.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
