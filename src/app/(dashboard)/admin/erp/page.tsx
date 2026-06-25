"use client";

import Link from "next/link";
import {
  Building2, ShoppingCart, Package, Landmark, Wallet,
  BarChart3, Receipt, ArrowRight, TrendingDown, TrendingUp,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

const ERP_MODULES = [
  {
    title: "Revenue Overview",
    description: "Track institution revenue streams, operational expenses, and net profit analysis.",
    href: "/admin/erp/revenue",
    icon: TrendingUp,
    color: "emerald",
    accentClass: "border-emerald-200 bg-emerald-100 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    badgeClass: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    cardClass: "hover:border-emerald-300 dark:hover:border-emerald-500/30",
  },
  {
    title: "Fee Management",
    description: "Handle student fees structure, payments collection, and student billings.",
    href: "/admin/erp/revenue/fee",
    icon: Receipt,
    color: "blue",
    accentClass: "border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
    badgeClass: "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400",
    cardClass: "hover:border-blue-300 dark:hover:border-blue-500/30",
  },
  {
    title: "Salary Management",
    description: "Manage employee salaries, pay structures, increments, and compensations.",
    href: "/admin/erp/revenue/salary",
    icon: Wallet,
    color: "violet",
    accentClass: "border-violet-200 bg-violet-100 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400",
    badgeClass: "border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400",
    cardClass: "hover:border-violet-300 dark:hover:border-violet-500/30",
  },
  {
    title: "Bulk Salary Processing",
    description: "Atomically process session-wise employee salaries and batch pay structures.",
    href: "/admin/erp/revenue/bulk-salary",
    icon: BarChart3,
    color: "amber",
    accentClass: "border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
    badgeClass: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    cardClass: "hover:border-amber-300 dark:hover:border-amber-500/30",
  },
  {
    title: "Expenses Management",
    description: "Record, categorise, and approve direct expenditures and billing invoices.",
    href: "/admin/erp/revenue/expense",
    icon: TrendingDown,
    color: "rose",
    accentClass: "border-rose-200 bg-rose-100 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400",
    badgeClass: "border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400",
    cardClass: "hover:border-rose-300 dark:hover:border-rose-500/30",
  },
  {
    title: "Budget & Cost Centres",
    description: "Manage fiscal budgets, cost centre allocations, and track utilisation against targets.",
    href: "/admin/erp/budget",
    icon: Building2,
    color: "blue",
    accentClass: "border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",
    badgeClass: "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400",
    cardClass: "hover:border-blue-300 dark:hover:border-blue-500/30",
  },
  {
    title: "Purchase Orders",
    description: "Full PO lifecycle — draft, multi-stage approval, GRN recording, and vendor management.",
    href: "/admin/erp/purchase-orders",
    icon: ShoppingCart,
    color: "violet",
    accentClass: "border-violet-200 bg-violet-100 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400",
    badgeClass: "border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400",
    cardClass: "hover:border-violet-300 dark:hover:border-violet-500/30",
  },
  {
    title: "Inventory & Stock",
    description: "Track inventory items, record stock movements, reconcile quantities, and view valuations.",
    href: "/admin/erp/stock",
    icon: Package,
    color: "amber",
    accentClass: "border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
    badgeClass: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    cardClass: "hover:border-amber-300 dark:hover:border-amber-500/30",
  },
  {
    title: "Asset Management",
    description: "Asset register, depreciation schedules, maintenance calendar, transfers, and disposals.",
    href: "/admin/erp/assets",
    icon: Landmark,
    color: "emerald",
    accentClass: "border-emerald-200 bg-emerald-100 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    badgeClass: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    cardClass: "hover:border-emerald-300 dark:hover:border-emerald-500/30",
  },
  {
    title: "Petty Cash",
    description: "Manage petty cash registers, disbursements, replenishments, and periodic reconciliations.",
    href: "/admin/erp/petty-cash",
    icon: Wallet,
    color: "orange",
    accentClass: "border-orange-200 bg-orange-100 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400",
    badgeClass: "border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400",
    cardClass: "hover:border-orange-300 dark:hover:border-orange-500/30",
  },
  {
    title: "Financial Ledger",
    description: "Double-entry general ledger, trial balance, and P&L statements for complete financial transparency.",
    href: "/admin/erp/ledger",
    icon: BarChart3,
    color: "teal",
    accentClass: "border-teal-200 bg-teal-100 text-teal-600 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400",
    badgeClass: "border-teal-500/20 bg-teal-500/5 text-teal-600 dark:text-teal-400",
    cardClass: "hover:border-teal-300 dark:hover:border-teal-500/30",
  },
];

export default function ErpHubPage() {
  const { data: sessions } = api.session.getSessions.useQuery();
  const latestSession = sessions?.[0];

  const { data: pendingPOs } = api.erp.purchaseOrders.getAll.useQuery(
    { status: "PendingApprovalL1", pageSize: 1 },
  );
  const { data: lowStockItems } = api.erp.stock.getAll.useQuery(
    { lowStockOnly: true },
  );
  const { data: overdueMaintenance } = api.erp.assets.getOverdueMaintenance.useQuery();

  const alerts = [
    pendingPOs?.total && pendingPOs.total > 0 ? {
      type: "warning" as const,
      message: `${pendingPOs.total} Purchase Order${pendingPOs.total > 1 ? "s" : ""} awaiting Level 1 approval`,
      href: "/admin/erp/purchase-orders",
    } : null,
    lowStockItems && lowStockItems.length > 0 ? {
      type: "warning" as const,
      message: `${lowStockItems.length} inventory item${lowStockItems.length > 1 ? "s" : ""} below reorder level`,
      href: "/admin/erp/stock",
    } : null,
    overdueMaintenance && overdueMaintenance.length > 0 ? {
      type: "warning" as const,
      message: `${overdueMaintenance.length} asset maintenance task${overdueMaintenance.length > 1 ? "s" : ""} overdue`,
      href: "/admin/erp/assets",
    } : null,
  ].filter(Boolean);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/erp", label: "ERP Control Centre" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5 text-emerald-600 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 dark:text-emerald-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
              ERP{" "}
              <span className="text-emerald-600 dark:text-emerald-400">Control Centre</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Integrated financial management — budgets, procurement, assets, and reporting
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Link key={i} href={alert!.href}>
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/15">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{alert!.message}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pending POs", value: pendingPOs?.total ?? 0, icon: TrendingUp, color: "violet" },
          { label: "Low Stock Items", value: lowStockItems?.length ?? 0, icon: TrendingDown, color: "amber" },
          { label: "Overdue Maintenance", value: overdueMaintenance?.length ?? 0, icon: AlertTriangle, color: "rose" },
          { label: "Active Session", value: latestSession?.sessionName ?? "—", icon: CheckCircle2, color: "emerald" },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm dark:border-border dark:bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ERP_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}>
              <Card className={`group h-full cursor-pointer border-slate-200 bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-border dark:bg-card ${mod.cardClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl border p-2.5 ${mod.accentClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 translate-x-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>
                  <CardTitle className="mt-3 text-base font-bold text-slate-900 dark:text-foreground">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    {mod.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className={`text-xs font-medium ${mod.badgeClass}`}>
                    ERP v2.0
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
