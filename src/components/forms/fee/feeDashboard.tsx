// File: src/components/forms/fee/feeDashboard.tsx
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Fee Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage fee structures, track collections, and view analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-[200px] bg-white border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-slate-200">
              {sessionsQuery.isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <SelectValue placeholder="Select Session" />
              )}
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-white/10">
              {sessionsQuery.data?.map((session) => (
                <SelectItem key={session.sessionId} value={session.sessionId}>
                  <div className="flex items-center gap-2">
                    {session.sessionName}
                    {session.isActive && (
                      <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400">
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[120px] bg-white border-slate-200 dark:bg-slate-950 dark:border-white/10 dark:text-slate-200">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-white/10">
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="bg-white border-slate-200 text-slate-600 hover:text-emerald-600 dark:bg-slate-950 dark:border-white/10 dark:text-slate-400 dark:hover:text-emerald-400"
          >
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
        <TabsList className="w-full justify-start bg-slate-100 p-1 border border-slate-200 dark:bg-slate-900/50 dark:border-white/10 flex-wrap h-auto gap-1">
          <TabsTrigger 
            value="classes" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
          >
            <GraduationCap className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            Monthly View
          </TabsTrigger>
          <TabsTrigger 
            value="ledger" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Student Ledger
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="defaulters" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
          >
            <AlertCircle className="h-4 w-4" />
            Defaulters
          </TabsTrigger>
          <TabsTrigger 
            value="structure" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
          >
            <DollarSign className="h-4 w-4" />
            Fee Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="animate-in fade-in-50 duration-300">
          <ClassFeeCards
            sessionId={selectedSessionId}
            year={selectedYear}
            classData={summaryQuery.data?.classes}
            isLoading={summaryQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="monthly" className="animate-in fade-in-50 duration-300">
          <MonthlyFeeSummary sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent value="ledger" className="animate-in fade-in-50 duration-300">
          <StudentFeeLedger sessionId={selectedSessionId} />
        </TabsContent>

        <TabsContent value="analytics" className="animate-in fade-in-50 duration-300">
          <FeeAnalyticsDashboard sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent value="defaulters" className="animate-in fade-in-50 duration-300">
          <DefaultersList sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent value="structure" className="animate-in fade-in-50 duration-300">
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
  // Theme-aware color classes
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 hover:shadow-blue-500/10",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 hover:shadow-emerald-500/10",
    orange: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300 hover:shadow-orange-500/10",
    purple: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300 hover:shadow-purple-500/10",
  }

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  }

  return (
    <Card className={cn("border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", colorClasses[color])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", iconColorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-black/5 dark:bg-white/10" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {isCurrency ? `Rs. ${value.toLocaleString()}` : value.toLocaleString()}
            </span>
            {trend !== null && (
              <Badge 
                variant={trend >= 70 ? "default" : "destructive"} 
                className={cn(
                    "text-xs ml-auto", 
                    trend >= 70 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400" 
                        : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400"
                )}
              >
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