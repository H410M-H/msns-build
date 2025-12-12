"use client"

import { api } from "~/trpc/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { CheckCircle, Clock, MoreHorizontal, Printer } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { toast } from "~/hooks/use-toast"
import SalarySlipPDF from "./SalarySlipPdf"
import { pdf } from "@react-pdf/renderer"

// Defined interface based on the query output
interface SalaryRecord {
  id: string
  amount: number
  allowances: number | null
  bonus: number | null
  deductions: number | null
  status: "PAID" | "PENDING" | "PARTIAL"
  month: number
  year: number
  paymentDate: Date | null
  Employees: {
    employeeName: string
    designation: string
    registrationNumber: string
  }
}

interface PayrollTableProps {
  month: number
  year: number
}

export function PayrollTable({ month, year }: PayrollTableProps) {
  const utils = api.useUtils()
  const { data, isLoading } = api.salary.getAll.useQuery({
    month,
    year,
    limit: 100
  })

  const paySalaryMutation = api.salary.update.useMutation({
    onSuccess: () => {
      toast({ title: "Status Updated", description: "Salary marked as PAID" })
      void utils.salary.getAll.invalidate()
    }
  })

  const handlePay = (id: string) => {
    paySalaryMutation.mutate({ id, status: "PAID", paymentDate: new Date() })
  }

  const handleDownloadSlip = async (salaryRecord: SalaryRecord) => {
    try {
      const netPay = 
        salaryRecord.amount + 
        (salaryRecord.allowances ?? 0) + 
        (salaryRecord.bonus ?? 0) - 
        (salaryRecord.deductions ?? 0)

      const blob = await pdf(
        <SalarySlipPDF 
          salary={{
            ...salaryRecord,
            employee: salaryRecord.Employees, 
            netPay: netPay
          }} 
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Payslip-${salaryRecord.Employees.employeeName}-${month}-${year}.pdf`
      link.click()
    } catch (error) {
      // Fix: Now utilizing the error variable to display the specific message
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to generate PDF", 
      })
    }
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading payroll data...</div>
  if (!data?.salaries.length) return <div className="p-12 text-center text-slate-500 border-2 border-dashed m-4 rounded-xl">No payroll records generated for this month yet.</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Base Salary</TableHead>
          <TableHead>Allowances</TableHead>
          <TableHead>Deductions</TableHead>
          <TableHead className="text-right">Net Payable</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.salaries.map((salary) => {
          // Safe cast to interface
          const typedSalary = salary as unknown as SalaryRecord;
          const netPay = salary.amount + (salary.allowances ?? 0) + (salary.bonus ?? 0) - (salary.deductions ?? 0)
          
          return (
            <TableRow key={salary.id}>
              <TableCell className="font-medium">{salary.Employees.employeeName}</TableCell>
              <TableCell>{salary.amount.toLocaleString()}</TableCell>
              <TableCell className="text-green-600">+{salary.allowances?.toLocaleString() ?? 0}</TableCell>
              <TableCell className="text-red-600">-{salary.deductions?.toLocaleString() ?? 0}</TableCell>
              <TableCell className="text-right font-bold">Rs. {netPay.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={salary.status === "PAID" ? "default" : "outline"} className={salary.status === "PAID" ? "bg-emerald-500" : "text-amber-500 border-amber-500"}>
                  {salary.status === "PAID" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {salary.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {salary.status !== "PAID" && (
                      <DropdownMenuItem onClick={() => handlePay(salary.id)}>
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDownloadSlip(typedSalary)}>
                      <Printer className="mr-2 h-4 w-4" /> Download Slip
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}