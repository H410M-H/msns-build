"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DollarSign, Play, Eye, Loader2, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type IncrementType = "PERCENT" | "FIXED";

export default function BulkSalaryPage() {
  const [selectedToSession, setSelectedToSession] = useState("");
  const [selectedFromSession, setSelectedFromSession] = useState("");
  const [incrementType, setIncrementType] = useState<IncrementType>("PERCENT");
  const [incrementValue, setIncrementValue] = useState(0);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: sessions } = api.session.getSessions.useQuery();

  const { data: preview } = api.bulkSalary.previewBulkCreation.useQuery(
    { toSessionId: selectedToSession, fromSessionId: selectedFromSession || undefined },
    { enabled: !!selectedToSession },
  );

  // Compute increment preview from the rows data
  const items = preview?.rows?.map(r => ({
    employeeId: r.employeeId,
    currentSalary: r.suggestedNewSalary,
  })) ?? [];

  const { data: incrementPreviewRaw } = api.bulkSalary.applyGlobalIncrement.useQuery(
    { items, incrementType, incrementValue },
    { enabled: items.length > 0 && incrementValue > 0 },
  );

  const { data: batchReport } = api.bulkSalary.getBatchReport.useQuery(
    { batchId: selectedBatchId },
    { enabled: !!selectedBatchId },
  );

  const executeBulk = api.bulkSalary.executeBulkCreation.useMutation({
    onSuccess: (d) => {
      toast.success(`Batch created: ${d.createdCount} salary records.`);
      setSelectedBatchId(d.batchId);
      setShowPreview(false);
    },
    onError: e => toast.error(e.message),
  });

  const batchIncrement = api.bulkSalary.batchIncrement.useMutation({
    onSuccess: (d) => toast.success(d.message),
    onError: e => toast.error(e.message),
  });

  const totalPayroll = preview?.rows?.reduce((s, r) => s + r.suggestedNewSalary, 0) ?? 0;
  const projectedTotal = incrementPreviewRaw?.reduce((s, r) => s + r.newSalary, 0) ?? 0;

  return (
    <div className="w-full space-y-5">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/revenue", label: "Revenue Overview" },
        { href: "/admin/erp/revenue/bulk-salary", label: "Bulk Salary", current: true },
      ]} />

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5 text-emerald-600 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 dark:text-emerald-400">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Bulk Salary <span className="text-emerald-600 dark:text-emerald-400">Processing</span>
          </h1>
          <p className="text-sm text-muted-foreground">Batch salary creation, global increments, and audit reports</p>
        </div>
      </div>

      {/* Session Config */}
      <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
          <CardTitle className="text-sm font-bold">Session Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 min-w-[200px]">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Session (New)</Label>
              <Select value={selectedToSession} onValueChange={setSelectedToSession}>
                <SelectTrigger><SelectValue placeholder="New session" /></SelectTrigger>
                <SelectContent>{sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-[200px]">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Copy From Session (Optional)</Label>
              <Select value={selectedFromSession || "none"} onValueChange={v => setSelectedFromSession(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Previous session" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {preview && (
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400">
                <Eye className="mr-2 h-4 w-4" /> {showPreview ? "Hide" : "Preview"} Salaries
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedToSession && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 dark:border-border dark:bg-card/50">
          <p className="text-sm text-muted-foreground">Select a target session to begin.</p>
        </div>
      )}

      {selectedToSession && preview && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-slate-200 bg-white/60 shadow-sm dark:border-border dark:bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employees</p></div>
                <p className="text-2xl font-bold text-slate-900 dark:text-foreground">{preview?.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">{preview?.needingManualEntry} need manual entry</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white/60 shadow-sm dark:border-border dark:bg-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Payroll</p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-foreground">PKR {totalPayroll.toLocaleString()}</p>
              </CardContent>
            </Card>
            {incrementPreviewRaw && (
              <Card className="border-emerald-200 bg-emerald-50/60 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Projected Payroll</p></div>
                  <p className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">PKR {projectedTotal.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">+PKR {(projectedTotal - totalPayroll).toLocaleString()}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="bulk-create">
            <TabsList className="border border-slate-200 bg-slate-50 dark:border-border dark:bg-card">
              <TabsTrigger value="bulk-create">Bulk Create</TabsTrigger>
              <TabsTrigger value="increment">Global Increment</TabsTrigger>
              {selectedBatchId && <TabsTrigger value="report">Batch Report</TabsTrigger>}
            </TabsList>

            {/* Bulk Create */}
            <TabsContent value="bulk-create" className="mt-4 space-y-4">
              {showPreview && (
                <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
                    <CardTitle className="text-sm font-bold">Salary Preview — {sessions?.find(s => s.sessionId === selectedToSession)?.sessionName}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                          {["Employee", "Role", "Previous", "Suggested", "Status"].map(h => (
                            <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview?.rows?.map(row => (
                          <TableRow key={row.employeeId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                            <TableCell className="text-sm font-semibold text-slate-900 dark:text-foreground">{row.employeeName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{row.designation}</TableCell>
                            <TableCell className="font-mono text-sm">{row.previousSalary > 0 ? `PKR ${row.previousSalary.toLocaleString()}` : "—"}</TableCell>
                            <TableCell className="font-mono text-sm font-bold text-slate-800 dark:text-foreground">PKR {row.suggestedNewSalary.toLocaleString()}</TableCell>
                            <TableCell>
                              {row.hasExistingAssignment
                                ? <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle2 className="mr-1 inline h-3 w-3" />Done</Badge>
                                : row.needsManualEntry
                                  ? <Badge variant="outline" className="border-amber-300 bg-amber-50 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">Manual</Badge>
                                  : <Badge variant="outline" className="border-slate-300 bg-slate-50 text-xs text-muted-foreground">Pending</Badge>
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-border dark:bg-card">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-foreground">Execute Bulk Salary Creation</p>
                  <p className="text-xs text-muted-foreground">{(preview?.rows ?? []).filter(r => !r.hasExistingAssignment).length} salary records will be created atomically.</p>
                </div>
                <Button
                  onClick={() => executeBulk.mutate({
                    toSessionId: selectedToSession,
                    fromSessionId: selectedFromSession || undefined,
                    items: (preview?.rows ?? []).filter(r => !r.hasExistingAssignment && !r.needsManualEntry).map(r => ({
                      employeeId: r.employeeId,
                      newSalary: r.suggestedNewSalary,
                      isOverridden: false,
                    })),
                  })}
                  disabled={executeBulk.isPending || (preview?.rows ?? []).filter(r => !r.hasExistingAssignment && !r.needsManualEntry).length === 0}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                >
                  {executeBulk.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Execute
                </Button>
              </div>
            </TabsContent>

            {/* Global Increment */}
            <TabsContent value="increment" className="mt-4 space-y-4">
              <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
                  <CardTitle className="text-sm font-bold">Configure Global Increment</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Increment Type</Label>
                      <Select value={incrementType} onValueChange={v => setIncrementType(v as IncrementType)}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount (PKR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Value</Label>
                      <Input type="number" min={0} value={incrementValue || ""} onChange={e => setIncrementValue(parseFloat(e.target.value) || 0)} className="w-36" placeholder="e.g. 10" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {incrementPreviewRaw && preview && incrementValue > 0 && (
                <>
                  <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
                      <CardTitle className="text-sm font-bold">Increment Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                            {["Employee", "Current", "Increment", "New Salary"].map(h => (
                              <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incrementPreviewRaw.map((r, i) => {
                            const name = preview?.rows?.find(row => row.employeeId === r.employeeId)?.employeeName ?? r.employeeId;
                            return (
                              <TableRow key={i} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                                <TableCell className="text-sm font-semibold text-slate-900 dark:text-foreground">{name}</TableCell>
                                <TableCell className="font-mono text-sm">PKR {r.previousSalary.toLocaleString()}</TableCell>
                                <TableCell className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">+PKR {r.increment.toLocaleString()}</TableCell>
                                <TableCell className="font-mono text-sm font-bold text-slate-900 dark:text-foreground">PKR {r.newSalary.toLocaleString()}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => batchIncrement.mutate({
                        sessionId: selectedToSession,
                        employeeIds: (preview?.rows ?? []).filter(r => r.hasExistingAssignment).map(r => r.employeeId),
                        incrementType,
                        incrementValue,
                        effectiveDate: new Date(),
                        rationale: `Global ${incrementType === "PERCENT" ? `${incrementValue}%` : `PKR ${incrementValue}`} increment`,
                      })}
                      disabled={batchIncrement.isPending || (preview?.rows ?? []).filter(r => r.hasExistingAssignment).length === 0 || incrementValue <= 0}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {batchIncrement.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                      Apply Increment
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Batch Report */}
            {selectedBatchId && (
              <TabsContent value="report" className="mt-4">
                <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
                    <CardTitle className="text-sm font-bold">Batch Report — {batchReport?.createdAt ? new Date(batchReport.createdAt).toLocaleDateString() : ""}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                          {["Employee", "Previous", "New Salary"].map(h => (
                            <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(batchReport?.Items ?? []).map(item => (
                          <TableRow key={item.batchItemId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                            <TableCell className="text-sm font-semibold text-slate-900 dark:text-foreground">{item.Employee?.employeeName ?? "Unknown"}</TableCell>
                            <TableCell className="font-mono text-sm">PKR {item.previousSalary.toLocaleString()}</TableCell>
                            <TableCell className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">PKR {item.newSalary.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        {(batchReport?.Items ?? []).length === 0 && (
                          <TableRow><TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">No items.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
}
