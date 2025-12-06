"use client"

import type React from "react"
import { useState } from "react"
import { api } from "~/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Skeleton } from "~/components/ui/skeleton"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertCircle,
  BarChart3,
  FileText,
  GraduationCap,
  RefreshCw,
  BookOpen,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { ExportDialog } from "./export-dialog"
import { FeeAssignmentDialog } from "./feeAssignment"
import { ClassFeeCards } from "./class-fee-cards"
import { MonthlyFeeSummary } from "./monthly-fee-summary"
import { FeeTable } from "~/components/tables/FeeTable"
import { DefaultersList } from "./defaulters-list"
import { FeeAnalyticsDashboard } from "./fee-analytics-dashboard"
import { StudentFeeLedger } from "./student-fee-ledger"




const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export function FeeDashboard() {
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const sessionsQuery = api.session.getSessions.useQuery()
  const utils = api.useUtils()

  const summaryQuery = api.fee.getClassFeeSummary.useQuery(
    { sessionId: selectedSessionId, year: selectedYear },
    { enabled: !!selectedSessionId },
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await utils.fee.invalidate()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Auto-select first session
  if (sessionsQuery.data?.length && !selectedSessionId) {
    const activeSession = sessionsQuery.data.find((s) => s.isActive) ?? sessionsQuery.data[0]
    if (activeSession) {
      setSelectedSessionId(activeSession.sessionId)
    }
  }

  const { grandTotals } = summaryQuery.data ?? {
    grandTotals: { totalExpected: 0, totalCollected: 0, outstanding: 0, collectionRate: 0, totalStudents: 0 },
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fee Management</h1>
          <p className="text-slate-600 mt-1">Manage fee structures, track collections, and view analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-[200px] bg-white">
              {sessionsQuery.isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <SelectValue placeholder="Select Session" />
              )}
            </SelectTrigger>
            <SelectContent>
              {sessionsQuery.data?.map((session) => (
                <SelectItem key={session.sessionId} value={session.sessionId}>
                  <div className="flex items-center gap-2">
                    {session.sessionName}
                    {session.isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>

          <ExportDialog sessionId={selectedSessionId} year={selectedYear} />

          <FeeAssignmentDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Expected"
          value={grandTotals.totalExpected}
          icon={DollarSign}
          trend={null}
          color="blue"
          isLoading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Total Collected"
          value={grandTotals.totalCollected}
          icon={TrendingUp}
          trend={grandTotals.collectionRate}
          color="green"
          isLoading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Outstanding"
          value={grandTotals.outstanding}
          icon={AlertCircle}
          trend={null}
          color="orange"
          isLoading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Total Students"
          value={grandTotals.totalStudents}
          icon={Users}
          trend={null}
          color="purple"
          isLoading={summaryQuery.isLoading}
          isCurrency={false}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="classes" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <FileText className="h-4 w-4" />
            Monthly View
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Student Ledger
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="defaulters" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Defaulters
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Fee Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <ClassFeeCards
            sessionId={selectedSessionId}
            year={selectedYear}
            classData={summaryQuery.data?.classes}
            isLoading={summaryQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="monthly">
          <MonthlyFeeSummary sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent value="ledger">
          <StudentFeeLedger sessionId={selectedSessionId} />
        </TabsContent>

        <TabsContent value="analytics">
          <FeeAnalyticsDashboard sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent value="defaulters">
          <DefaultersList sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent value="structure">
          <FeeTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ElementType
  trend: number | null
  color: "blue" | "green" | "orange" | "purple"
  isLoading: boolean
  isCurrency?: boolean
}

function SummaryCard({ title, value, icon: Icon, trend, color, isLoading, isCurrency = true }: SummaryCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  }

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  }

  return (
    <Card className={cn("border-2 transition-all hover:shadow-md", colorClasses[color])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", iconColorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {isCurrency ? `Rs. ${value.toLocaleString()}` : value.toLocaleString()}
            </span>
            {trend !== null && (
              <Badge variant={trend >= 70 ? "default" : "destructive"} className="text-xs">
                {trend >= 70 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {trend.toFixed(1)}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
