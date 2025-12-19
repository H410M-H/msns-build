"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import dayjs from "dayjs"
import { api } from "~/trpc/react"
import { toast } from "sonner"

type Designation = "PRINCIPAL" | "ADMIN" | "HEAD" | "CLERK" | "TEACHER" | "WORKER" | "ALL"

const designations = [
  { value: "ALL", label: "All Employees" },
  { value: "TEACHER", label: "Teachers" },
  { value: "ADMIN", label: "Admin Staff" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "HEAD", label: "Department Heads" },
  { value: "CLERK", label: "Clerks" },
  { value: "WORKER", label: "Workers" },
]

export default function EmployeeMonthlyAttendancePage() {
  const [selectedDesignation, setSelectedDesignation] = useState<Designation>("ALL")
  const [currentMonth, setCurrentMonth] = useState(dayjs().month())
  const [currentYear, setCurrentYear] = useState(dayjs().year())

  const daysInMonth = dayjs().year(currentYear).month(currentMonth).daysInMonth()
  const monthName = dayjs().month(currentMonth).format("MMMM")

  // Fetch employees by designation
  const { data: employees, error: employeeError } = api.employee.getEmployeesByDesignation.useQuery(
    { designation: selectedDesignation as Exclude<Designation, "ALL"> },
    { enabled: selectedDesignation !== "ALL" }
  )

  // Fetch all employees if "ALL" is selected
  const { data: allEmployees, error: allEmployeesError } = api.employee.getEmployees.useQuery(
    undefined,
    { enabled: selectedDesignation === "ALL" }
  )

  // Fetch attendance data for the selected month
  const startOfMonth = dayjs().year(currentYear).month(currentMonth).startOf("month").format("YYYY-MM-DD")
  const endOfMonth = dayjs().year(currentYear).month(currentMonth).endOf("month").format("YYYY-MM-DD")
  const { data: attendanceData } = api.attendance.getAllEmployeeAttendance.useQuery()

  // Filter attendance data for the current month
  const filteredAttendanceData = useMemo(() => {
    return attendanceData?.filter((att) => {
      const attDate = dayjs(att.date)
      return attDate.isAfter(dayjs(startOfMonth).subtract(1, "day")) && attDate.isBefore(dayjs(endOfMonth).add(1, "day"))
    }) ?? []
  }, [attendanceData, startOfMonth, endOfMonth])

  // Combine employee data based on selection
  const filteredEmployees = useMemo(() => {
    const employeeList = selectedDesignation === "ALL" ? allEmployees : employees
    return employeeList?.map(emp => ({
      id: emp.employeeId,
      username: emp.employeeName,
      accountId: emp.registrationNumber,
      accountType: emp.designation
    })) ?? []
  }, [employees, allEmployees, selectedDesignation])

  // Generate array of days for the month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getAttendanceStatus = (employeeId: string, day: number): string => {
    const date = dayjs().year(currentYear).month(currentMonth).date(day).format("YYYY-MM-DD")
    const record = filteredAttendanceData.find(
      (att) => att.employeeId === employeeId && att.date === date
    )
    if (!record) return "ABSENT"
    if (record.morning === "P" && record.afternoon === "P") return "PRESENT"
    if (record.morning === "A" && record.afternoon === "A") return "ABSENT"
    return "PARTIAL" // For cases where only one time slot is marked as present
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PRESENT: "default",
      ABSENT: "destructive",
      PARTIAL: "secondary",
    } as const

    const colors = {
      PRESENT: "P",
      ABSENT: "A",
      PARTIAL: "P/A",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] ?? "outline"} className="w-6 h-6 p-0 text-xs">
        {colors[status as keyof typeof colors] ?? "A"}
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
      <Badge variant={colors[accountType as keyof typeof colors] ?? "outline"} className="text-xs">
        {accountType}
      </Badge>
    )
  }

  const handleExportReport = () => {
    toast.info("Export functionality not implemented yet")
  }

  // Handle errors
  if (employeeError || allEmployeesError) {
    toast.error("Failed to fetch employee data")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Monthly Attendance</h1>
          <p className="text-muted-foreground">View monthly attendance records for all staff members</p>
        </div>
        <Button onClick={handleExportReport}>
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
            <Select value={selectedDesignation} onValueChange={(value) => setSelectedDesignation(value as Designation)}>
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
                {designations.find((d) => d.value === selectedDesignation)?.label ?? "All Employees"} - {monthName} {currentYear}
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
                  <span>Partial</span>
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