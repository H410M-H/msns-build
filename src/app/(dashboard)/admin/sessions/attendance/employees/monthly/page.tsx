"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import dayjs from "dayjs"

// Mock data - replace with actual tRPC calls
const designations = [
  { value: "ALL", label: "All Employees" },
  { value: "TEACHER", label: "Teachers" },
  { value: "ADMIN", label: "Admin Staff" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "HEAD", label: "Department Heads" },
  { value: "CLERK", label: "Clerks" },
  { value: "WORKER", label: "Workers" },
]

const mockEmployees = [
  { id: "1", username: "Dr. Sarah Wilson", accountId: "msn-t-24-001", accountType: "TEACHER" },
  { id: "2", username: "John Admin", accountId: "msn-a-24-001", accountType: "ADMIN" },
  { id: "3", username: "Mary Principal", accountId: "msn-p-24-001", accountType: "PRINCIPAL" },
  { id: "4", username: "Bob Clerk", accountId: "msn-c-24-001", accountType: "CLERK" },
]

export default function EmployeeMonthlyAttendancePage() {
  const [selectedDesignation, setSelectedDesignation] = useState<string>("ALL")
  const [currentMonth, setCurrentMonth] = useState(dayjs().month())
  const [currentYear, setCurrentYear] = useState(dayjs().year())

  const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth()
  const monthName = dayjs().month(currentMonth).format("MMMM")

  // Generate array of days for the month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Filter employees based on selected designation
  const filteredEmployees =
    selectedDesignation === "ALL"
      ? mockEmployees
      : mockEmployees.filter((emp) => emp.accountType === selectedDesignation)

  // Mock attendance data - replace with actual tRPC call
  const getAttendanceStatus = (_employeeId: string, _day: number) => {
    const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"]
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PRESENT: "default",
      ABSENT: "destructive",
      LATE: "secondary",
      EXCUSED: "outline",
    } as const

    const colors = {
      PRESENT: "P",
      ABSENT: "A",
      LATE: "L",
      EXCUSED: "E",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="w-6 h-6 p-0 text-xs">
        {colors[status as keyof typeof colors]}
      </Badge>
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const getDesignationBadge = (accountType: string) => {
    const colors = {
      TEACHER: "default",
      ADMIN: "secondary",
      PRINCIPAL: "destructive",
      HEAD: "outline",
      CLERK: "secondary",
      WORKER: "outline",
    } as const

    return (
      <Badge variant={colors[accountType as keyof typeof colors] || "outline"} className="text-xs">
        {accountType}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Monthly Attendance</h1>
          <p className="text-muted-foreground">View monthly attendance records for all staff members</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Attendance Report</CardTitle>
              <CardDescription>Filter by designation to view specific employee groups</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {monthName} {currentYear}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map((designation) => (
                  <SelectItem key={designation.value} value={designation.value}>
                    {designation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {designations.find((d) => d.value === selectedDesignation)?.label} - {monthName} {currentYear}
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Badge variant="default" className="w-4 h-4 p-0"></Badge>
                  <span>Present</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="destructive" className="w-4 h-4 p-0"></Badge>
                  <span>Absent</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="w-4 h-4 p-0"></Badge>
                  <span>Late</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="w-4 h-4 p-0"></Badge>
                  <span>Excused</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Employee</TableHead>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead className="w-[100px]">Designation</TableHead>
                    {days.map((day) => (
                      <TableHead key={day} className="w-8 text-center">
                        {day}
                      </TableHead>
                    ))}
                    <TableHead className="w-[80px] text-center">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const presentDays = days.filter((day) => getAttendanceStatus(employee.id, day) === "PRESENT").length
                    const attendancePercentage = Math.round((presentDays / daysInMonth) * 100)

                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.username}</TableCell>
                        <TableCell className="text-muted-foreground">{employee.accountId}</TableCell>
                        <TableCell>{getDesignationBadge(employee.accountType)}</TableCell>
                        {days.map((day) => (
                          <TableCell key={day} className="text-center">
                            {getStatusBadge(getAttendanceStatus(employee.id, day))}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">
                          <Badge variant={attendancePercentage >= 75 ? "default" : "destructive"}>
                            {attendancePercentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
