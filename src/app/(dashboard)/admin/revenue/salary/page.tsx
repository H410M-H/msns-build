"use client"

import { useState } from 'react'
import { api } from "~/trpc/react"
import { 
  BarChart3, 
  Wallet, 
  Users, 
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useToast } from "~/hooks/use-toast"

// Components
import { SalaryAssignmentForm } from "~/components/forms/employee/SalaryAllotment"
import { SalaryTable } from "~/components/tables/SalaryTable" // This displays SalaryAssignment
import { PayrollTable } from "~/components/tables/PayrollTable" // New component below
import { IncrementDialog } from "~/components/forms/employee/IncrementDialog" // New component below
import { SalaryAnalytics } from "~/components/blocks/salary/SalaryAnalytics" // New component below

const MONTHS = [
  { value: "1", label: "January" }, { value: "2", label: "February" },
  { value: "3", label: "March" }, { value: "4", label: "April" },
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" }
]

export default function SalaryPage() {
  const { toast } = useToast()
  const utils = api.useUtils()
  
  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()))
  const [isGenerating, setIsGenerating] = useState(false)

  // Queries for Stats
  const { data: payrollCost } = api.salary.getTotalPayrollCost.useQuery({
    month: Number(selectedMonth),
    year: Number(selectedYear)
  })
  
  const { data: pendingSalaries } = api.salary.getPendingSalaries.useQuery({
    month: Number(selectedMonth),
    year: Number(selectedYear),
    sessionId: "default-session-id" // Replace with actual session logic
  })

  const { data: unpaidEmployees } = api.salary.getUnpaidEmployees.useQuery({
    month: Number(selectedMonth),
    year: Number(selectedYear),
    sessionId: "default-session-id"
  })

  // Mutations
  const generateMutation = api.salary.generateMonthlySalaries.useMutation({
    onSuccess: async (data) => {
      toast({
        title: "Payroll Generated",
        description: `Successfully generated ${data.generatedCount} salary records for ${MONTHS[Number(selectedMonth)-1]?.label}.`,
      })
      await utils.salary.getAll.invalidate()
      await utils.salary.getPendingSalaries.invalidate()
      await utils.salary.getTotalPayrollCost.invalidate()
      setIsGenerating(false)
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message })
      setIsGenerating(false)
    }
  })

  const handleGeneratePayroll = () => {
    setIsGenerating(true)
    generateMutation.mutate({
      month: Number(selectedMonth),
      year: Number(selectedYear),
      sessionId: "default-session-id" // Replace with session context
    })
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Compensation Management</h1>
          <p className="text-slate-500">Manage salaries, run payroll, and track expenses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] bg-white">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Payroll</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {(payrollCost?.totalPayroll ?? 0).toLocaleString()}</div>
            <p className="text-xs text-emerald-100/80">For {MONTHS[Number(selectedMonth)-1]?.label}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSalaries?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Employees waiting for payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Staff</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidEmployees?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Not generated yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">System Operational</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="payroll" className="gap-2"><Wallet className="h-4 w-4"/> Monthly Payroll</TabsTrigger>
          <TabsTrigger value="structures" className="gap-2"><Users className="h-4 w-4"/> Salary Structures</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4"/> Analytics</TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Payroll Processing */}
        <TabsContent value="payroll" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 rounded-t-xl border-b">
              <div>
                <CardTitle>Payroll Processing</CardTitle>
                <CardDescription>Generate and manage monthly salary disbursements</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGeneratePayroll} 
                  disabled={isGenerating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Generate {MONTHS[Number(selectedMonth)-1]?.label} Payroll
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <PayrollTable 
                month={Number(selectedMonth)} 
                year={Number(selectedYear)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Salary Structures (Assignments) */}
        <TabsContent value="structures" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 rounded-t-xl border-b">
              <div>
                <CardTitle>Employee Salary Structures</CardTitle>
                <CardDescription>Manage base salaries and increments</CardDescription>
              </div>
              <div className="flex gap-2">
                <IncrementDialog />
                <SalaryAssignmentForm />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <SalaryTable 
                page={1} 
                pageSize={10} 
                setPage={() => ""} 
                setPageSize={() => ""} 
                searchTerm="" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Analytics */}
        <TabsContent value="analytics">
          <SalaryAnalytics year={Number(selectedYear)} />
        </TabsContent>
      </Tabs>
    </main>
  )
}