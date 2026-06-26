"use client";

import React, { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ShoppingCart, Plus, Loader2, Eye, FileCheck, DollarSign, Hourglass, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Separator } from "~/components/ui/separator";

const STATUS_STYLES: Record<string, string> = {
  Draft: "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400",
  PendingApprovalL1: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  PendingApprovalL2: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400",
  Approved: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
  Ordered: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400",
  Received: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400",
  Invoiced: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400",
  Paid: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
  Cancelled: "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
};

type POStatus = "Draft" | "PendingApprovalL1" | "PendingApprovalL2" | "Approved" | "Ordered" | "Received" | "Invoiced" | "Paid" | "Cancelled";

export default function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<POStatus | undefined>(undefined);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    supplierName: "",
    supplierContact: "",
    costCentreId: "",
    expenseCategory: "",
    justification: "",
  });
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, unit: "pcs", estimatedUnitPrice: 0 }]);

  const { data: pos, refetch, isLoading } = api.erp.purchaseOrders.getAll.useQuery({ status: statusFilter, page, pageSize: 15 });
  const { data: poDetail } = api.erp.purchaseOrders.getById.useQuery({ poId: showDetailId! }, { enabled: !!showDetailId });
  const { data: costCentres } = api.erp.budget.getAllCostCentres.useQuery();

  const createPO = api.erp.purchaseOrders.create.useMutation({
    onSuccess: () => { toast.success("Purchase order created"); setShowCreateDialog(false); void refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const submitPO = api.erp.purchaseOrders.submitForApproval.useMutation({
    onSuccess: () => { toast.success("Submitted for approval"); void refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const approveL1 = api.erp.purchaseOrders.approveL1.useMutation({
    onSuccess: () => { toast.success("Approved (L1)"); void refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const approveL2 = api.erp.purchaseOrders.approveL2.useMutation({
    onSuccess: () => { toast.success("Approved (L2)"); void refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const rejectPO = api.erp.purchaseOrders.reject.useMutation({
    onSuccess: () => { toast.success("Purchase order rejected"); void refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const addLineItem = () => setLineItems([...lineItems, { description: "", quantity: 1, unit: "pcs", estimatedUnitPrice: 0 }]);
  const estTotal = lineItems.reduce((s, l) => s + l.quantity * l.estimatedUnitPrice, 0);

  // Stats computation
  const stats = useMemo(() => {
    if (!pos) return { totalVal: 0, pendingL1: 0, pendingL2: 0, completed: 0 };
    const totalVal = pos.pos.reduce((sum, po) => sum + po.estimatedTotal, 0);
    const pendingL1 = pos.pos.filter(po => po.status === "PendingApprovalL1").length;
    const pendingL2 = pos.pos.filter(po => po.status === "PendingApprovalL2").length;
    const completed = pos.pos.filter(po => po.status === "Paid" || po.status === "Received").length;
    return { totalVal, pendingL1, pendingL2, completed };
  }, [pos]);

  // Export Data definition
  const exportData = useMemo(() => {
    if (!pos) return undefined;
    return {
      columns: [
        { key: "poNumber", label: "PO Number" },
        { key: "supplierName", label: "Supplier Name" },
        { key: "supplierContact", label: "Contact" },
        { key: "category", label: "Expense Category" },
        { key: "total", label: "Estimated Total (PKR)" },
        { key: "status", label: "Status" },
        { key: "created", label: "Date Created" },
      ],
      rows: pos.pos.map(po => ({
        poNumber: po.poNumber,
        supplierName: po.supplierName,
        supplierContact: po.supplierContact,
        category: po.expenseCategory,
        total: po.estimatedTotal.toLocaleString(),
        status: po.status,
        created: new Date(po.createdAt).toLocaleDateString(),
      })),
      sheetName: "Purchase Orders",
      title: "School Purchase Orders Logs",
    };
  }, [pos]);

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/purchase-orders", label: "Purchase Orders" },
      ]} />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-violet-200 bg-violet-100 p-2.5 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Purchase <span className="text-violet-600 dark:text-violet-400">Orders</span>
            </h1>
            <p className="text-sm text-muted-foreground">Manage procurement requests and approvals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename="purchase-orders" />
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-200 dark:shadow-violet-900/20">
                <Plus className="mr-2 h-4 w-4" /> New Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-violet-500" /> New Purchase Order</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Supplier Name</Label>
                    <Input value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} placeholder="Supplier / Vendor name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</Label>
                    <Input value={form.supplierContact} onChange={e => setForm({ ...form, supplierContact: e.target.value })} placeholder="Phone / Email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cost Centre</Label>
                    <Select value={form.costCentreId} onValueChange={v => setForm({ ...form, costCentreId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select cost centre" /></SelectTrigger>
                      <SelectContent>{costCentres?.map(cc => <SelectItem key={cc.costCentreId} value={cc.costCentreId}>{cc.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expense Category</Label>
                    <Input value={form.expenseCategory} onChange={e => setForm({ ...form, expenseCategory: e.target.value })} placeholder="e.g. Office Supplies" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Justification</Label>
                  <Textarea value={form.justification} onChange={e => setForm({ ...form, justification: e.target.value })} placeholder="Why is this purchase needed?" rows={2} />
                </div>

                {/* Line Items */}
                <div className="rounded-xl border border-slate-100 p-4 dark:border-border">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-foreground">Line Items</h3>
                    <Button size="sm" variant="outline" onClick={addLineItem}><Plus className="mr-1 h-3 w-3" /> Add Item</Button>
                  </div>
                  {lineItems.map((li, i) => (
                    <div key={i} className="mb-2 grid grid-cols-4 gap-2">
                      <Input className="col-span-2 text-xs" placeholder="Description" value={li.description} onChange={e => { const l = [...lineItems]; l[i]!.description = e.target.value; setLineItems(l); }} />
                      <Input type="number" className="text-xs" placeholder="Qty" value={li.quantity} onChange={e => { const l = [...lineItems]; l[i]!.quantity = parseFloat(e.target.value); setLineItems(l); }} />
                      <Input type="number" className="text-xs" placeholder="Unit Price" value={li.estimatedUnitPrice || ""} onChange={e => { const l = [...lineItems]; l[i]!.estimatedUnitPrice = parseFloat(e.target.value); setLineItems(l); }} />
                    </div>
                  ))}
                  <div className="mt-3 flex justify-end">
                    <p className="text-sm font-semibold text-slate-800 dark:text-foreground">
                      Estimated Total: <span className="font-mono text-violet-600 dark:text-violet-400">PKR {estTotal.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-violet-600 text-white hover:bg-violet-700"
                  disabled={createPO.isPending || !form.supplierName || !form.costCentreId || !form.justification}
                  onClick={() => createPO.mutate({ ...form, lineItems, attachmentUrls: [] })}
                >
                  {createPO.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Purchase Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="bg-violet-500/20" />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Estimated Value"
          value={isLoading ? "..." : `PKR ${stats.totalVal.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          theme="violet"
        />
        <GradientStatCard
          title="Pending L1 Approval"
          value={isLoading ? "..." : stats.pendingL1}
          icon={<Hourglass className="h-5 w-5" />}
          theme="amber"
        />
        <GradientStatCard
          title="Pending L2 Approval"
          value={isLoading ? "..." : stats.pendingL2}
          icon={<ShieldAlert className="h-5 w-5" />}
          theme="orange"
        />
        <GradientStatCard
          title="Fulfilled POs"
          value={isLoading ? "..." : stats.completed}
          icon={<FileCheck className="h-5 w-5" />}
          theme="emerald"
        />
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter ?? "all"} onValueChange={v => { setStatusFilter(v === "all" ? undefined : v as POStatus); setPage(1); }}>
        <TabsList className="flex h-auto flex-wrap gap-1 border border-slate-200 bg-slate-50 p-1 dark:border-border dark:bg-card">
          {(["all", "PendingApprovalL1", "PendingApprovalL2", "Approved", "Ordered", "Received", "Paid", "Draft", "Cancelled"] as const).map(s => (
            <TabsTrigger key={s} value={s} className="text-xs">{s === "all" ? "All" : s.replace(/([A-Z])/g, " $1").trim()}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter ?? "all"} className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Purchase Orders</CardTitle>
                <Badge variant="outline" className="border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400 text-xs">{pos?.total ?? 0} total</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                      {["PO Number", "Supplier", "Estimated Total", "Status", "Created By", "Actions"].map(h => (
                        <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pos?.pos.map(po => (
                      <TableRow key={po.poId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                        <TableCell className="font-mono text-sm font-semibold text-slate-900 dark:text-foreground">{po.poNumber}</TableCell>
                        <TableCell className="text-sm text-slate-700 dark:text-foreground">{po.supplierName}</TableCell>
                        <TableCell className="font-mono text-sm text-slate-800 dark:text-foreground">PKR {po.estimatedTotal.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-semibold ${STATUS_STYLES[po.status] ?? ""}`}>{po.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{po.CreatedBy.employeeName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setShowDetailId(po.poId)} className="h-7 px-2 text-xs">
                              <Eye className="mr-1 h-3.5 w-3.5 text-muted-foreground" /> View
                            </Button>
                            {po.status === "Draft" && (
                              <Button size="sm" variant="ghost" onClick={() => submitPO.mutate({ poId: po.poId })} className="h-7 px-2 text-xs text-emerald-600">Submit</Button>
                            )}
                            {po.status === "PendingApprovalL1" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => approveL1.mutate({ poId: po.poId })} className="h-7 px-2 text-xs text-emerald-600">Approve L1</Button>
                                <Button size="sm" variant="ghost" onClick={() => rejectPO.mutate({ poId: po.poId, reason: "Rejected" })} className="h-7 px-2 text-xs text-red-500">Reject</Button>
                              </div>
                            )}
                            {po.status === "PendingApprovalL2" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => approveL2.mutate({ poId: po.poId })} className="h-7 px-2 text-xs text-emerald-600">Approve L2</Button>
                                <Button size="sm" variant="ghost" onClick={() => rejectPO.mutate({ poId: po.poId, reason: "Rejected" })} className="h-7 px-2 text-xs text-red-500">Reject</Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!pos?.pos.length && (
                      <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No purchase orders found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {pos && pos.total > 15 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-border">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="text-xs text-muted-foreground">Page {page} · {pos.total} entries</span>
                  <Button size="sm" variant="outline" disabled={page * 15 >= pos.total} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PO Detail Dialog */}
      <Dialog open={!!showDetailId} onOpenChange={open => !open && setShowDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Purchase Order Details</DialogTitle></DialogHeader>
          {poDetail ? (
            <div className="space-y-4 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div><span className="text-xs text-muted-foreground">PO Number:</span> <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">{poDetail.poNumber}</p></div>
                <div><span className="text-xs text-muted-foreground">Status:</span> <p className="mt-0.5"><Badge variant="outline" className={`text-xs ${STATUS_STYLES[poDetail.status] ?? ""}`}>{poDetail.status}</Badge></p></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div><span className="text-xs text-muted-foreground">Supplier:</span> <p className="font-medium">{poDetail.supplierName}</p></div>
                <div><span className="text-xs text-muted-foreground">Contact:</span> <p className="text-muted-foreground">{poDetail.supplierContact}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div><span className="text-xs text-muted-foreground">Cost Centre:</span> <p>{poDetail.CostCentre.name}</p></div>
                <div><span className="text-xs text-muted-foreground">Category:</span> <p>{poDetail.expenseCategory}</p></div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Justification:</span>
                <p className="rounded bg-slate-50 p-2 text-xs italic text-muted-foreground dark:bg-black/20">{poDetail.justification}</p>
              </div>

              {/* Line items table */}
              <div className="rounded border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-black/10">
                      <TableHead className="py-2 text-xs">Item Description</TableHead>
                      <TableHead className="py-2 text-xs text-right">Qty</TableHead>
                      <TableHead className="py-2 text-xs text-right">Unit Price</TableHead>
                      <TableHead className="py-2 text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poDetail.LineItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2 text-xs font-medium">{item.description}</TableCell>
                        <TableCell className="py-2 text-xs text-right font-mono">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="py-2 text-xs text-right font-mono">PKR {item.estimatedUnitPrice.toLocaleString()}</TableCell>
                        <TableCell className="py-2 text-xs text-right font-mono font-semibold">PKR {(item.quantity * item.estimatedUnitPrice).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50 dark:bg-black/20 font-bold">
                      <TableCell colSpan={3} className="py-2 text-xs font-bold">ESTIMATED TOTAL</TableCell>
                      <TableCell className="py-2 text-xs text-right font-mono">PKR {poDetail.estimatedTotal.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
