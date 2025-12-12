"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Badge } from "~/components/ui/badge"
import { Loader2, Printer, Plus, FileX } from "lucide-react"
import { toast } from "~/hooks/use-toast"
import { pdf } from "@react-pdf/renderer"
import SalarySlipPDF from "../../tables/SalarySlipPdf" // Corrected import path based on context

// Define proper type for salary record
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
}

interface SalaryHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  employeeName: string
  designation: string
  registrationNumber: string
  currentSessionId: string
  baseSalary: number
}

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" }
]

export function SalaryHistoryDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  designation,
  registrationNumber,
  currentSessionId,
  baseSalary
}: SalaryHistoryDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()))
  const [isGenerating, setIsGenerating] = useState(false)

  const utils = api.useUtils()
  
  const { data: history, isLoading } = api.salary.getEmployeeSalarySummary.useQuery(
    { employeeId },
    { enabled: open }
  )

  const createSalaryMutation = api.salary.create.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Salary record generated successfully." })
      void utils.salary.getEmployeeSalarySummary.invalidate()
      setIsGenerating(false)
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message})
      setIsGenerating(false)
    }
  })

  const handleGenerate = () => {
    setIsGenerating(true)
    createSalaryMutation.mutate({
      employeeId,
      amount: baseSalary,
      month: Number(selectedMonth),
      year: Number(selectedYear),
      sessionId: currentSessionId,
      status: "PENDING",
      deductions: 0,
      allowances: 0,
      bonus: 0,
    })
  }

  const handleDownloadSlip = async (record: SalaryRecord) => {
    try {
      const netPay = 
        record.amount + 
        (record.allowances ?? 0) + 
        (record.bonus ?? 0) - 
        (record.deductions ?? 0)
      
      const blob = await pdf(
        <SalarySlipPDF 
          salary={{
            ...record,
            employee: { employeeName, designation, registrationNumber },
            netPay
          }} 
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Payslip-${employeeName}-${record.month}-${record.year}.pdf`
      link.click()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Could not generate PDF"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salary Details: {employeeName}</DialogTitle>
          <DialogDescription>
            View payment history and generate individual salary slips.
          </DialogDescription>
        </DialogHeader>

        {/* Generator Section */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Generate for:</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[90px] bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} size="sm" className="ml-auto">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Generate Slip
          </Button>
        </div>

        {/* History Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Base Amount</TableHead>
                <TableHead>Additions</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Loading history...</TableCell>
                </TableRow>
              ) : !history?.records || history.records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileX className="w-8 h-8 text-slate-300" />
                      No salary records found.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                history.records.map((record) => {
                  const typedRecord = record as unknown as SalaryRecord
                  const additions = (typedRecord.allowances ?? 0) + (typedRecord.bonus ?? 0)
                  const net = typedRecord.amount + additions - (typedRecord.deductions ?? 0)
                  
                  return (
                    <TableRow key={typedRecord.id}>
                      <TableCell>{MONTHS[typedRecord.month - 1]?.label} {typedRecord.year}</TableCell>
                      <TableCell>{typedRecord.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">+{additions.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-{typedRecord.deductions?.toLocaleString() ?? 0}</TableCell>
                      <TableCell className="font-bold">{net.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={typedRecord.status === "PAID" ? "default" : "outline"}>
                          {typedRecord.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadSlip(typedRecord)}
                          title="Download Slip"
                        >
                          <Printer className="w-4 h-4 text-slate-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}