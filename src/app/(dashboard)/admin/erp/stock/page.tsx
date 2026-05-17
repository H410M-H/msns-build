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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Package, Plus, Loader2, AlertTriangle, ArrowDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StockPage() {
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showStockOutDialog, setShowStockOutDialog] = useState<string | null>(null);
  const [showReconDialog, setShowReconDialog] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ itemName: "", category: "", unit: "pcs", reorderLevel: 10, costPerUnit: 0 });
  const [stockOutForm, setStockOutForm] = useState({ quantity: 1, purpose: "" });
  const [reconForm, setReconForm] = useState({ physicalCount: 0, explanation: "" });
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data: items, refetch } = api.erp.stock.getAll.useQuery({ lowStockOnly });
  const { data: valuation } = api.erp.stock.getValuationReport.useQuery();

  const createItem = api.erp.stock.createItem.useMutation({
    onSuccess: () => { toast.success("Item created"); setShowItemDialog(false); void refetch(); },
    onError: e => toast.error(e.message),
  });
  const stockOut = api.erp.stock.recordStockOut.useMutation({
    onSuccess: () => { toast.success("Stock-out recorded"); setShowStockOutDialog(null); void refetch(); },
    onError: e => toast.error(e.message),
  });
  const reconcile = api.erp.stock.recordReconciliation.useMutation({
    onSuccess: (data) => { toast.success(`Reconciled. Variance: ${data.variance > 0 ? "+" : ""}${data.variance}`); setShowReconDialog(null); void refetch(); },
    onError: e => toast.error(e.message),
  });

  const totalValue = valuation?.totalValue ?? 0;
  const lowStockCount = items?.filter(i => i.isLowStock).length ?? 0;

  return (
    <div className="w-full space-y-5">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/stock", label: "Inventory & Stock" },
      ]} />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-100 p-2.5 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Inventory <span className="text-amber-600 dark:text-amber-400">&amp; Stock</span>
            </h1>
            <p className="text-sm text-muted-foreground">Track items, movements, and valuations</p>
          </div>
        </div>
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-200 dark:shadow-amber-900/20">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Item Name</Label><Input value={itemForm.itemName} onChange={e => setItemForm({ ...itemForm, itemName: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label><Input value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</Label><Input value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reorder Level</Label><Input type="number" value={itemForm.reorderLevel} onChange={e => setItemForm({ ...itemForm, reorderLevel: parseInt(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cost/Unit (PKR)</Label><Input type="number" value={itemForm.costPerUnit || ""} onChange={e => setItemForm({ ...itemForm, costPerUnit: parseFloat(e.target.value) })} /></div>
              </div>
              <Button className="w-full bg-amber-600 text-white hover:bg-amber-700" disabled={createItem.isPending || !itemForm.itemName} onClick={() => createItem.mutate(itemForm)}>
                {createItem.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Create Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Items", value: items?.length ?? 0, cls: "" },
          { label: "Low Stock Alerts", value: lowStockCount, cls: "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5" },
          { label: "Total Value (PKR)", value: totalValue.toLocaleString(), cls: "" },
        ].map(s => (
          <Card key={s.label} className={`shadow-sm ${s.cls || "border-slate-200 bg-white/60 dark:border-border dark:bg-card"}`}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="items">
        <TabsList className="border border-slate-200 bg-slate-50 dark:border-border dark:bg-card">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Inventory Register</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setLowStockOnly(!lowStockOnly)} className="h-7 text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" /> {lowStockOnly ? "Show All" : "Low Stock Only"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                    {["Item", "Category", "On Hand", "Reorder", "Value", "Status", "Actions"].map(h => (
                      <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map(item => (
                    <TableRow key={item.inventoryItemId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                      <TableCell className="text-sm font-semibold text-slate-900 dark:text-foreground">{item.itemName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="font-mono text-sm font-bold">{item.quantityOnHand} {item.unit}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.reorderLevel}</TableCell>
                      <TableCell className="font-mono text-sm">PKR {item.stockValue.toLocaleString()}</TableCell>
                      <TableCell>
                        {item.isLowStock
                          ? <Badge variant="outline" className="border-red-300 bg-red-50 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">Low Stock</Badge>
                          : <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">OK</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setShowStockOutDialog(item.inventoryItemId)} className="h-7 px-2 text-xs text-red-500">
                            <ArrowDown className="mr-1 h-3 w-3" /> Out
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setShowReconDialog(item.inventoryItemId); setReconForm({ physicalCount: item.quantityOnHand, explanation: "" }); }} className="h-7 px-2 text-xs text-amber-600">
                            <RefreshCw className="mr-1 h-3 w-3" /> Recon
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items?.length && (
                    <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No inventory items yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="valuation" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <CardTitle className="text-sm font-bold">Stock Valuation by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {valuation && Object.entries(valuation.byCategory).map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-border dark:bg-white/5">
                  <span className="text-sm font-semibold text-slate-800 dark:text-foreground">{cat}</span>
                  <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">PKR {val.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10 mt-4">
                <span className="font-semibold text-amber-800 dark:text-amber-300">Grand Total</span>
                <span className="font-mono text-lg font-bold text-amber-700 dark:text-amber-400">PKR {totalValue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!showStockOutDialog} onOpenChange={open => !open && setShowStockOutDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Record Stock-Out</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label><Input type="number" min={1} value={stockOutForm.quantity} onChange={e => setStockOutForm({ ...stockOutForm, quantity: parseInt(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose</Label><Input value={stockOutForm.purpose} onChange={e => setStockOutForm({ ...stockOutForm, purpose: e.target.value })} placeholder="e.g. Classroom use" /></div>
            <Button className="w-full bg-red-600 text-white hover:bg-red-700" disabled={stockOut.isPending || !stockOutForm.purpose} onClick={() => stockOut.mutate({ inventoryItemId: showStockOutDialog!, ...stockOutForm })}>
              {stockOut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Record Stock-Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showReconDialog} onOpenChange={open => !open && setShowReconDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Reconcile Stock</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Count</Label><Input type="number" min={0} value={reconForm.physicalCount} onChange={e => setReconForm({ ...reconForm, physicalCount: parseInt(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explanation</Label><Input value={reconForm.explanation} onChange={e => setReconForm({ ...reconForm, explanation: e.target.value })} placeholder="Reason for variance" /></div>
            <Button className="w-full bg-amber-600 text-white hover:bg-amber-700" disabled={reconcile.isPending || !reconForm.explanation} onClick={() => reconcile.mutate({ inventoryItemId: showReconDialog!, ...reconForm })}>
              {reconcile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Reconciliation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
