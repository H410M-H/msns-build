"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useToast } from "~/hooks/use-toast"

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void
  initialData?: ExpenseFormData
  isLoading?: boolean
}

export interface ExpenseFormData {
  title: string
  description?: string
  amount: number
  category: string
  month: number
  year: number
}

const categories = [
  { value: "UTILITIES", label: "Utilities" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "SALARIES", label: "Salaries" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "FOOD", label: "Food" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "OTHER", label: "Other" },
]

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export function ExpenseForm({ onSubmit, initialData, isLoading }: ExpenseFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData ?? {
      title: "",
      description: "",
      amount: 0,
      category: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category || formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
      })
      return
    }

    onSubmit(formData)
  }

  const handleInputChange = (field: keyof ExpenseFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Expense" : "Add New Expense"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter expense title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Select
                value={formData.month.toString()}
                onValueChange={(value) => handleInputChange("month", Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value) || new Date().getFullYear())}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter expense description (optional)"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : initialData ? "Update Expense" : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
