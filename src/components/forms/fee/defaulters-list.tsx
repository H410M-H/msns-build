"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { AlertCircle, Phone, MessageSquare, FileSearch, Download } from "lucide-react"
import { toast } from "sonner"
import { exportToCSV, generateDefaultersReportData } from "~/lib/export-utils"
import { SendReminderDialog } from "./send-reminder-dialog"

interface DefaultersListProps {
  sessionId: string
  year: number
}

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

export function DefaultersList({ sessionId, year }: DefaultersListProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const defaultersQuery = api.fee.getDefaultersList.useQuery(
    { sessionId, month: selectedMonth, year },
    { enabled: !!sessionId },
  )

  const defaulters = defaultersQuery.data ?? []
  const totalDue = defaulters.reduce((sum, d) => sum + d.dueAmount, 0)

  const handleExport = () => {
    if (defaulters.length === 0) {
      toast.error("No data to export")
      return
    }
    const exportData = generateDefaultersReportData(defaulters, selectedMonth, year)
    exportToCSV(exportData, `defaulters-${months[selectedMonth - 1]?.label}-${year}`)
    toast.success("Defaulters list exported successfully")
  }

  const handleBulkReminders = () => {
    const withContact = defaulters.filter((d) => d.student.fatherMobile)
    toast.success(`Sending reminders to ${withContact.length} parents`, {
      description: "This may take a few moments...",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-slate-900">Fee Defaulters</h2>
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={String(month.value)}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {defaulters.length > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {defaulters.length} Defaulters | Total Due: Rs. {totalDue.toLocaleString()}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleBulkReminders}>
              <MessageSquare className="h-4 w-4" />
              Send Bulk Reminders
            </Button>
          </div>
        )}
      </div>

      {/* Defaulters Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">
            {months.find((m) => m.value === selectedMonth)?.label} {year} - Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {defaultersQuery.isLoading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
          ) : defaulters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSearch className="h-12 w-12 text-emerald-300 mb-4" />
              <p className="text-slate-600 font-medium">No defaulters for this month!</p>
              <p className="text-sm text-slate-500 mt-1">All students have cleared their dues</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50">
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Father Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Unpaid Items</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defaulters.map((d) => (
                    <TableRow key={d.sfcId} className="hover:bg-red-50/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{d.student.studentName}</p>
                          <p className="text-xs text-slate-500">{d.student.registrationNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {d.class.grade} - {d.class.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{d.student.fatherName}</TableCell>
                      <TableCell>
                        <a
                          href={`tel:${d.student.fatherMobile}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          <Phone className="h-3 w-3" />
                          {d.student.fatherMobile}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {d.unpaidItems.tuition && (
                            <Badge variant="destructive" className="text-xs">
                              Tuition
                            </Badge>
                          )}
                          {d.unpaidItems.examFund && (
                            <Badge variant="destructive" className="text-xs">
                              Exam
                            </Badge>
                          )}
                          {d.unpaidItems.computerLab && (
                            <Badge variant="destructive" className="text-xs">
                              Lab
                            </Badge>
                          )}
                          {d.unpaidItems.studentIdCard && (
                            <Badge variant="destructive" className="text-xs">
                              ID
                            </Badge>
                          )}
                          {d.unpaidItems.infoAndCalls && (
                            <Badge variant="destructive" className="text-xs">
                              Info
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        Rs. {d.dueAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <SendReminderDialog
                          studentName={d.student.studentName}
                          fatherMobile={d.student.fatherMobile}
                          dueAmount={d.dueAmount}
                          month={selectedMonth}
                          year={year}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
