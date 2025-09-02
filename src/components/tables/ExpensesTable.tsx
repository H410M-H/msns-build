"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Trash2, Edit, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

interface Expense {
  expenseId: string
  title: string
  description?: string
  amount: number
  category: string
  month: number
  year: number
  createdAt: string
}

interface ExpensesTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const categoryColors: Record<string, string> = {
  UTILITIES: "bg-blue-100 text-blue-800",
  SUPPLIES: "bg-green-100 text-green-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  SALARIES: "bg-purple-100 text-purple-800",
  TRANSPORT: "bg-orange-100 text-orange-800",
  FOOD: "bg-red-100 text-red-800",
  EQUIPMENT: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-gray-100 text-gray-800",
}

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
]

export function ExpensesTable({ expenses, onEdit, onDelete, isLoading }: ExpensesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("ALL_CATEGORIES")
  const [filterMonth, setFilterMonth] = useState("ALL_MONTHS")

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "ALL_CATEGORIES" || expense.category === filterCategory
    const matchesMonth = filterMonth === "ALL_MONTHS" || expense.month.toString() === filterMonth

    return matchesSearch && matchesCategory && matchesMonth
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Expenses</span>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Total: ${totalAmount.toLocaleString()}
          </Badge>
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
          <div className="text-center py-8">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {expenses.length === 0 ? "No expenses found" : "No expenses match your filters"}
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
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>
                      <Badge className={categoryColors[expense.category] ?? categoryColors.OTHER}>
                        {expense.category.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {months[expense.month - 1]} {expense.year}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{expense.description ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDelete(expense.expenseId)}>
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
  )
}
