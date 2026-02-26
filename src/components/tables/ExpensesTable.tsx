"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Trash2, Edit, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "~/hooks/use-toast";

export interface Expense {
  expenseId: string;
  title: string;
  description?: string | null;
  amount: number;
  category: string; // Can be refined to specific enum if shared type is available
  month: number;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExpensesTableProps {
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  UTILITIES: "bg-blue-100 text-blue-800",
  BISE: "bg-teal-100 text-teal-800",
  SUPPLIES: "bg-green-100 text-green-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  SALARIES: "bg-purple-100 text-purple-800",
  TRANSPORT: "bg-orange-100 text-orange-800",
  FOOD: "bg-red-100 text-red-800",
  EQUIPMENT: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ExpensesTable({ onEdit, onDelete }: ExpensesTableProps) {
  const { status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL_CATEGORIES");
  const [filterMonth, setFilterMonth] = useState("ALL_MONTHS");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "UTILITIES",
    month: "1",
    year: new Date().getFullYear().toString(),
  });

  // The query returns { data: Expense[], meta: ... } based on the router definition
  const {
    data: expensesResult,
    isLoading,
    refetch,
  } = api.expense.getAllExpenses.useQuery(
    {
      month: filterMonth !== "ALL_MONTHS" ? parseInt(filterMonth) : undefined,
      category:
        filterCategory !== "ALL_CATEGORIES" ? filterCategory : undefined,
      searchTerm: searchTerm || undefined, // Pass search to backend for efficiency
    },
    { enabled: status === "authenticated" },
  );

  const expensesData = expensesResult?.data ?? [];

  const createExpense = api.expense.createExpense.useMutation({
    onSuccess: async () => {
      toast({ title: "Expense created successfully" });
      await refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const updateExpense = api.expense.updateExpense.useMutation({
    onSuccess: async () => {
      toast({ title: "Expense updated successfully" });
      await refetch();
      resetForm();
      setIsDialogOpen(false);
      setEditingExpense(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const deleteExpense = api.expense.deleteExpense.useMutation({
    onSuccess: async () => {
      toast({ title: "Expense deleted successfully" });
      await refetch();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string },
  ) => {
    const { name, value } =
      "target" in e ? e.target : { name: e.name, value: e.value };
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      category: "UTILITIES",
      month: "1",
      year: new Date().getFullYear().toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      description: formData.description || undefined,
      amount: parseFloat(formData.amount),
      category: formData.category as
        | "UTILITIES"
        | "BISE"
        | "SUPPLIES"
        | "MAINTENANCE"
        | "SALARIES"
        | "TRANSPORT"
        | "FOOD"
        | "EQUIPMENT"
        | "OTHER",
      month: parseInt(formData.month),
      year: parseInt(formData.year),
    };

    if (editingExpense) {
      updateExpense.mutate({ id: editingExpense.expenseId, data });
      onEdit({ ...editingExpense, ...data });
    } else {
      createExpense.mutate(data);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      description: expense.description ?? "",
      amount: expense.amount.toString(),
      category: expense.category,
      month: expense.month.toString(),
      year: expense.year.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense.mutate({ id });
      onDelete(id);
    }
  };

  // Client-side fallback filter if needed, though backend handles search now
  // We type explicitely to avoid implicit any
  const filteredExpenses: Expense[] = expensesData.filter(
    (expense: Expense) => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = expense.title.toLowerCase().includes(searchLower);
      const descMatch =
        expense.description?.toLowerCase().includes(searchLower) ?? false;
      return titleMatch || descMatch;
    },
  );

  const totalAmount = filteredExpenses.reduce(
    (sum: number, expense: Expense) => sum + expense.amount,
    0,
  );

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") {
    // Ideally use router.push, but window.location works for force redirect
    if (typeof window !== "undefined")
      window.location.href = "/api/auth/signin";
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Expenses</span>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1 text-lg">
              Total: {totalAmount.toLocaleString()} PKR/-
            </Badge>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingExpense(null);
                    resetForm();
                  }}
                >
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? "Edit Expense" : "Add New Expense"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Title</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Description
                    </label>
                    <Input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <Input
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Category
                    </label>
                    <Select
                      name="category"
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange({ name: "category", value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTILITIES">Utilities</SelectItem>
                        <SelectItem value="BISE">BISE</SelectItem>
                        <SelectItem value="SUPPLIES">Supplies</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="SALARIES">Salaries</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                        <SelectItem value="FOOD">Food</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Month</label>
                    <Select
                      name="month"
                      value={formData.month}
                      onValueChange={(value) =>
                        handleInputChange({ name: "month", value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem
                            key={index + 1}
                            value={(index + 1).toString()}
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Year</label>
                    <Input
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      createExpense.isPending || updateExpense.isPending
                    }
                  >
                    {editingExpense ? "Update" : "Create"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
              <SelectItem value="UTILITIES">Utilities</SelectItem>
              <SelectItem value="BISE">BISE</SelectItem>
              <SelectItem value="SUPPLIES">Supplies</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="SALARIES">Salaries</SelectItem>
              <SelectItem value="TRANSPORT">Transport</SelectItem>
              <SelectItem value="FOOD">Food</SelectItem>
              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_MONTHS">All Months</SelectItem>
              {months.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {expensesData.length === 0
              ? "No expenses found"
              : "No expenses match your filters"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.expenseId}>
                    <TableCell className="font-medium">
                      {expense.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          categoryColors[expense.category] ??
                          categoryColors.OTHER
                        }
                      >
                        {expense.category.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {months[expense.month - 1]} {expense.year}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.description ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(expense.expenseId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
