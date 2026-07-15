"use client";

import React, { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Landmark, Plus, Loader2, AlertTriangle, Wrench, CircleDot, Tag, Pencil } from "lucide-react";
import { toast } from "sonner";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Separator } from "~/components/ui/separator";

const CONDITION_COLORS: Record<string, string> = {
  New: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
  Good: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
  Fair: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  Poor: "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
  UnderMaintenance: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400",
  Disposed: "border-slate-300 bg-slate-50 text-muted-foreground",
};

export default function AssetsPage() {
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState<string | null>(null);
  const [showDisposeDialog, setShowDisposeDialog] = useState<string | null>(null);
  type AssetFormCondition = "New" | "Good" | "Fair" | "Poor" | "UnderMaintenance";
  type AssetFormDepreciation = "StraightLine" | "DecliningBalance";
  const [assetForm, setAssetForm] = useState<{
    assetName: string;
    assetCategoryId: string;
    purchaseCost: number;
    condition: AssetFormCondition;
    location: string;
    usefulLifeYears: number;
    depreciationMethod: AssetFormDepreciation;
  }>({
    assetName: "", assetCategoryId: "", purchaseCost: 0,
    condition: "New", location: "", usefulLifeYears: 5, depreciationMethod: "StraightLine",
  });
  const [mxForm, setMxForm] = useState({ maintenanceType: "Preventive" as const, scheduledDate: "", vendorName: "", cost: 0 });
  const [disposeForm, setDisposeForm] = useState({ disposalDate: "", disposalMethod: "Sale" as const, proceedsReceived: 0, notes: "" });

  const { data: assets, refetch, isLoading } = api.erp.assets.getAssetRegister.useQuery({ includeDisposed: false });
  const { data: categories, refetch: refetchCats } = api.erp.assets.getAllCategories.useQuery();
  const { data: overdue } = api.erp.assets.getOverdueMaintenance.useQuery();

  const createCategory = api.erp.assets.createCategory.useMutation({ onSuccess: () => void refetchCats() });
  const createAsset = api.erp.assets.createAsset.useMutation({
    onSuccess: () => { toast.success("Asset registered"); setShowAssetDialog(false); void refetch(); },
    onError: e => toast.error(e.message),
  });
  const updateAsset = api.erp.assets.updateAsset.useMutation({
    onSuccess: () => { toast.success("Asset updated"); setShowAssetDialog(false); void refetch(); },
    onError: e => toast.error(e.message),
  });
  const computeDepreciation = api.erp.assets.computeDepreciation.useMutation({
    onSuccess: () => toast.success("Depreciation computed"),
    onError: e => toast.error(e.message),
  });
  const recordMaintenance = api.erp.assets.recordMaintenance.useMutation({
    onSuccess: () => { toast.success("Maintenance scheduled"); setShowMaintenanceDialog(null); },
    onError: e => toast.error(e.message),
  });
  const disposeAsset = api.erp.assets.disposeAsset.useMutation({
    onSuccess: () => { toast.success("Asset disposed"); setShowDisposeDialog(null); void refetch(); },
    onError: e => toast.error(e.message),
  });

  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Stats computation
  const stats = useMemo(() => {
    if (!assets) return { totalVal: 0, count: 0 };
    const totalVal = assets.assets.reduce((sum, a) => sum + a.purchaseCost, 0);
    const count = assets.totalAssets;
    return { totalVal, count };
  }, [assets]);

  // Export dataset
  const exportData = useMemo(() => {
    if (!assets) return undefined;
    return {
      columns: [
        { key: "assetTag", label: "Asset Tag" },
        { key: "assetName", label: "Asset Name" },
        { key: "category", label: "Category" },
        { key: "location", label: "Location" },
        { key: "condition", label: "Condition" },
        { key: "purchaseCost", label: "Purchase Cost (PKR)" },
      ],
      rows: assets.assets.map(a => ({
        assetTag: a.assetTag,
        assetName: a.assetName,
        category: a.AssetCategory.name,
        location: a.location ?? "",
        condition: a.condition,
        purchaseCost: a.purchaseCost.toLocaleString(),
      })),
      sheetName: "Asset Register",
      title: "School Asset Register",
    };
  }, [assets]);

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/erp", label: "ERP" },
        { href: "/admin/erp/assets", label: "Asset Management" },
      ]} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-2.5 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Asset <span className="text-emerald-600 dark:text-emerald-400">Management</span>
            </h1>
            <p className="text-sm text-muted-foreground">Register, depreciate, maintain, and dispose of school assets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename="asset-register" />
          <Dialog open={showAssetDialog} onOpenChange={(open) => {
            setShowAssetDialog(open);
            if (!open) {
              setEditingAssetId(null);
              setAssetForm({ assetName: "", assetCategoryId: "", purchaseCost: 0, condition: "New", location: "", usefulLifeYears: 5, depreciationMethod: "StraightLine" });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-emerald-900/20">
                <Plus className="mr-2 h-4 w-4" /> Register Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>{editingAssetId ? "Edit Asset" : "Register New Asset"}</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Name</Label>
                  <Input value={assetForm.assetName} onChange={e => setAssetForm({ ...assetForm, assetName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <div className="flex gap-2">
                    <Select value={assetForm.assetCategoryId} onValueChange={v => setAssetForm({ ...assetForm, assetCategoryId: v })}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories?.map(c => <SelectItem key={c.assetCategoryId} value={c.assetCategoryId}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={() => { const n = prompt("Category name:"); if (n) createCategory.mutate({ name: n }); }}>+ New</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purchase Cost (PKR)</Label><Input type="number" value={assetForm.purchaseCost || ""} onChange={e => setAssetForm({ ...assetForm, purchaseCost: parseFloat(e.target.value) })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Useful Life (years)</Label><Input type="number" min={1} value={assetForm.usefulLifeYears} onChange={e => setAssetForm({ ...assetForm, usefulLifeYears: parseInt(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Condition</Label>
                    <Select value={assetForm.condition} onValueChange={v => setAssetForm({ ...assetForm, condition: v as typeof assetForm.condition })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["New", "Good", "Fair", "Poor"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Depreciation Method</Label>
                    <Select value={assetForm.depreciationMethod} onValueChange={v => setAssetForm({ ...assetForm, depreciationMethod: v as typeof assetForm.depreciationMethod })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="StraightLine">Straight Line</SelectItem><SelectItem value="DecliningBalance">Declining Balance</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label><Input value={assetForm.location} onChange={e => setAssetForm({ ...assetForm, location: e.target.value })} placeholder="e.g. Principal's Office" /></div>
                <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={createAsset.isPending || updateAsset.isPending || !assetForm.assetName || !assetForm.assetCategoryId} onClick={() => editingAssetId ? updateAsset.mutate({ assetId: editingAssetId, ...assetForm }) : createAsset.mutate(assetForm)}>
                  {createAsset.isPending || updateAsset.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingAssetId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />} {editingAssetId ? "Update Asset" : "Register Asset"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="bg-emerald-500/20" />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Assets Value"
          value={isLoading ? "..." : `PKR ${stats.totalVal.toLocaleString()}`}
          icon={<Landmark className="h-5 w-5" />}
          theme="blue"
        />
        <GradientStatCard
          title="Registered Assets"
          value={isLoading ? "..." : stats.count}
          icon={<Tag className="h-5 w-5" />}
          theme="emerald"
        />
        <GradientStatCard
          title="Overdue Maintenance"
          value={isLoading ? "..." : overdue?.length ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          theme="orange"
        />
        <GradientStatCard
          title="Asset Categories"
          value={isLoading ? "..." : categories?.length ?? 0}
          icon={<CircleDot className="h-5 w-5" />}
          theme="purple"
        />
      </div>

      {/* Overdue Maintenance Alert */}
      {overdue && overdue.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{overdue.length} asset{overdue.length > 1 ? "s" : ""} with overdue maintenance</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">{overdue.map(o => o.Asset.assetName).slice(0, 3).join(", ")}{overdue.length > 3 ? ` +${overdue.length - 3} more` : ""}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="register">
        <TabsList className="border border-slate-200 bg-slate-50 dark:border-border dark:bg-card">
          <TabsTrigger value="register"><Landmark className="mr-1.5 h-3.5 w-3.5" /> Asset Register</TabsTrigger>
          <TabsTrigger value="maintenance"><Wrench className="mr-1.5 h-3.5 w-3.5" /> Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Asset Register</CardTitle>
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs">{assets?.totalAssets ?? 0} assets</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                      {["Tag", "Name", "Category", "Location", "Condition", "Purchase Cost", "Actions"].map(h => (
                        <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets?.assets.map(asset => (
                      <TableRow key={asset.assetId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                        <TableCell className="font-mono text-xs font-semibold text-slate-900 dark:text-foreground">{asset.assetTag}</TableCell>
                        <TableCell className="text-sm font-semibold text-slate-800 dark:text-foreground">{asset.assetName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{asset.AssetCategory.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{asset.location ?? "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-xs ${CONDITION_COLORS[asset.condition] ?? ""}`}>{asset.condition}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">PKR {asset.purchaseCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => {
                              setEditingAssetId(asset.assetId);
                              setAssetForm({
                                assetName: asset.assetName,
                                assetCategoryId: asset.assetCategoryId,
                                purchaseCost: asset.purchaseCost,
                                condition: asset.condition as AssetFormCondition,
                                location: asset.location ?? "",
                                usefulLifeYears: asset.usefulLifeYears,
                                depreciationMethod: asset.depreciationMethod as AssetFormDepreciation,
                              });
                              setShowAssetDialog(true);
                            }} className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                              <Pencil className="mr-1 h-3 w-3" /> Edit
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => computeDepreciation.mutate({ assetId: asset.assetId, period: currentPeriod })} className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">Depreciate</Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowMaintenanceDialog(asset.assetId)} className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                              <Wrench className="mr-1 h-3 w-3" /> Maint.
                            </Button>
                            {!asset.isDisposed && (
                              <Button size="sm" variant="ghost" onClick={() => setShowDisposeDialog(asset.assetId)} className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Dispose</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!assets?.assets.length && (
                      <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No assets registered yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Overdue Maintenance Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                    {["Asset", "Location", "Scheduled Date"].map(h => (
                      <TableHead key={h} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdue?.map(m => (
                    <TableRow key={m.maintenanceId} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5">
                      <TableCell className="text-sm font-semibold text-slate-800 dark:text-foreground">{m.Asset.assetName} <span className="text-xs font-normal text-muted-foreground">({m.Asset.assetTag})</span></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.Asset.location ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-red-600 dark:text-red-400">{new Date(m.scheduledDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {!overdue?.length && (
                    <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">No overdue maintenance tasks.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Maintenance Dialog */}
      <Dialog open={!!showMaintenanceDialog} onOpenChange={open => !open && setShowMaintenanceDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle><Wrench className="inline mr-2 h-4 w-4 text-amber-500" />Schedule Maintenance</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={mxForm.maintenanceType} onValueChange={v => setMxForm({ ...mxForm, maintenanceType: v as typeof mxForm.maintenanceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Preventive">Preventive</SelectItem><SelectItem value="Corrective">Corrective</SelectItem><SelectItem value="Emergency">Emergency</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scheduled Date</Label><Input type="date" value={mxForm.scheduledDate} onChange={e => setMxForm({ ...mxForm, scheduledDate: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Cost (PKR)</Label><Input type="number" value={mxForm.cost || ""} onChange={e => setMxForm({ ...mxForm, cost: parseFloat(e.target.value) })} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vendor</Label><Input value={mxForm.vendorName} onChange={e => setMxForm({ ...mxForm, vendorName: e.target.value })} /></div>
            <Button className="w-full bg-amber-600 text-white hover:bg-amber-700" disabled={recordMaintenance.isPending || !mxForm.scheduledDate}
              onClick={() => recordMaintenance.mutate({ assetId: showMaintenanceDialog!, ...mxForm, scheduledDate: new Date(mxForm.scheduledDate) })}>
              {recordMaintenance.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Schedule Maintenance
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disposal Dialog */}
      <Dialog open={!!showDisposeDialog} onOpenChange={open => !open && setShowDisposeDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-red-600 dark:text-red-400">Dispose Asset</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              ⚠ This action is irreversible. The asset will be locked as Disposed.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Disposal Date</Label><Input type="date" value={disposeForm.disposalDate} onChange={e => setDisposeForm({ ...disposeForm, disposalDate: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Method</Label>
                <Select value={disposeForm.disposalMethod} onValueChange={v => setDisposeForm({ ...disposeForm, disposalMethod: v as typeof disposeForm.disposalMethod })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Sale", "Scrap", "Donation", "Loss"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proceeds Received (PKR)</Label><Input type="number" value={disposeForm.proceedsReceived || ""} onChange={e => setDisposeForm({ ...disposeForm, proceedsReceived: parseFloat(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</Label><Input value={disposeForm.notes} onChange={e => setDisposeForm({ ...disposeForm, notes: e.target.value })} /></div>
            <Button className="w-full bg-red-600 text-white hover:bg-red-700" disabled={disposeAsset.isPending || !disposeForm.disposalDate}
              onClick={() => disposeAsset.mutate({ assetId: showDisposeDialog!, ...disposeForm, disposalDate: new Date(disposeForm.disposalDate) })}>
              {disposeAsset.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Confirm Disposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
