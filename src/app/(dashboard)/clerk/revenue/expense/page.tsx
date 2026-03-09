"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, TrendingDown, Calendar } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const EXPENSE_CATEGORIES = [
  "UTILITIES",
  "SUPPLIES",
  "MAINTENANCE",
  "SALARIES",
  "TRANSPORT",
  "FOOD",
  "EQUIPMENT",
  "OTHER",
  "BISE",
];

const SAMPLE_EXPENSES = [
  {
    id: "EXP-001",
    title: "Electric Bill",
    category: "UTILITIES",
    amount: 15000,
    date: "2025-01-15",
    description: "Monthly electricity bill",
  },
  {
    id: "EXP-002",
    title: "Stationery Supplies",
    category: "SUPPLIES",
    amount: 5000,
    date: "2025-01-14",
    description: "Office stationery purchase",
  },
  {
    id: "EXP-003",
    title: "Building Maintenance",
    category: "MAINTENANCE",
    amount: 25000,
    date: "2025-01-10",
    description: "Roof repair and painting",
  },
];

export default function ClerkExpensePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const breadcrumbs = [
    { href: "/clerk", label: "Dashboard", current: false },
    { href: "/clerk/revenue", label: "Revenue", current: false },
    { href: "/clerk/revenue/expense", label: "Expenses", current: true },
  ];

  const filteredExpenses = SAMPLE_EXPENSES.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              Rs. {totalExpenses.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {filteredExpenses.length} expenses recorded
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              Rs. 45,000
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              January 2025 expenses
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-slate-200 bg-white/50 pl-9 dark:border-border dark:bg-card"
          />
        </div>

        <Select value={selectedCategory || ""} onValueChange={(v) => setSelectedCategory(v || null)}>
          <SelectTrigger className="w-full border-slate-200 bg-white/50 dark:border-border dark:bg-card md:w-[200px]">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-200 dark:border-border">
            <DialogHeader>
              <DialogTitle>Record New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Expense Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Electric Bill"
                  className="border-slate-200 dark:border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue="OTHER">
                  <SelectTrigger className="border-slate-200 dark:border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Rs.)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="border-slate-200 dark:border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  className="border-slate-200 dark:border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any notes about this expense..."
                  className="border-slate-200 dark:border-border"
                />
              </div>

              <Button className="w-full bg-emerald-600 text-foreground hover:bg-emerald-700">
                Record Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader>
            <CardTitle>Expense Records</CardTitle>
            <CardDescription>
              All recorded expenses for the current period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-white/5">
                  <tr>
                    <th className="p-3 font-medium text-foreground">ID</th>
                    <th className="p-3 font-medium text-foreground">Title</th>
                    <th className="p-3 font-medium text-foreground">Category</th>
                    <th className="p-3 font-medium text-foreground">Amount</th>
                    <th className="p-3 font-medium text-foreground">Date</th>
                    <th className="p-3 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {expense.id}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {expense.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {expense.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-red-400">
                          -Rs. {expense.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {expense.date}
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        No expenses found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
