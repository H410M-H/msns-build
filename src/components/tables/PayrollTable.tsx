"use client"

import { useState, useRef, useMemo } from "react"
import { api } from "~/trpc/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { 
  CheckCircle, 
  Clock, 
  MoreHorizontal, 
  Printer, 
  Download, 
  Eye, 
  Loader2, 
  PlusCircle, 
  AlertCircle,
  Banknote,
  Trash2,
  Zap
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"
import { toast } from "~/hooks/use-toast"
import * as jsPDF from "jspdf"
import * as html2canvas from "html2canvas-pro"

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
    employeeId: string
    employeeName: string
    designation: string
    registrationNumber: string
  }
}

// Interface for employees who don't have a salary record yet
interface UnpaidEmployee {
  employeeId: string
  employeeName: string
  designation: string
  registrationNumber: string
}

interface PayrollTableProps {
  month: number
  year: number
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function PayrollTable({ month, year }: PayrollTableProps) {
  const [previewRecord, setPreviewRecord] = useState<SalaryRecord | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const slipRef = useRef<HTMLDivElement>(null)
  const utils = api.useUtils()

  // 1. Get Session ID
  const { data: sessions } = api.session.getSessions.useQuery()
  const currentSessionId = sessions?.[0]?.sessionId

  // 2. Fetch Existing Salaries
  const { data: salaryData, isLoading: isLoadingSalaries } = api.salary.getAll.useQuery({
    month,
    year,
    sessionId: currentSessionId,
    limit: 100
  }, { enabled: !!currentSessionId })

  // 3. Fetch Employees WITHOUT Salary Records
  const { data: missingEmployees, isLoading: isLoadingMissing } = api.salary.getUnpaidEmployees.useQuery({
    month,
    year,
    sessionId: currentSessionId ?? ""
  }, { enabled: !!currentSessionId })

  // --- Mutations ---

  const createSalaryMutation = api.salary.create.useMutation({
    onSuccess: () => {
      toast({ title: "Payroll Generated", description: "Salary record created as PENDING." })
      void utils.salary.getAll.invalidate()
      void utils.salary.getUnpaidEmployees.invalidate()
      setGeneratingId(null)
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message})
      setGeneratingId(null)
    }
  })

  const bulkGenerateMutation = api.salary.generateMonthlySalaries.useMutation({
    onSuccess: (data) => {
      toast({ title: "Bulk Generation Complete", description: `Generated ${data.generatedCount} records.` })
      void utils.salary.getAll.invalidate()
      void utils.salary.getUnpaidEmployees.invalidate()
      setIsBulkGenerating(false)
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message})
      setIsBulkGenerating(false)
    }
  })

  const paySalaryMutation = api.salary.update.useMutation({
    onSuccess: () => {
      toast({ title: "Status Updated", description: "Salary marked as PAID" })
      void utils.salary.getAll.invalidate()
    }
  })

  const deleteSalaryMutation = api.salary.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Deleted", description: "Salary record deleted. Employee moved to Unpaid list." })
      void utils.salary.getAll.invalidate()
      void utils.salary.getUnpaidEmployees.invalidate()
      setSelectedIds([])
    }
  })

  const bulkDeleteMutation = api.salary.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast({ title: "Bulk Deleted", description: `${data.count} salary records deleted.` })
      void utils.salary.getAll.invalidate()
      void utils.salary.getUnpaidEmployees.invalidate()
      setSelectedIds([])
    }
  })

  // --- Handlers ---

  const handleGeneratePayroll = (employeeId: string) => {
    if (!currentSessionId) return toast({ title: "Error", description: "No active session found" })
    
    setGeneratingId(employeeId)
    // Sending amount 0 triggers the backend to auto-fill from assigned salary
    createSalaryMutation.mutate({
      employeeId,
      amount: 0, 
      month,
      year,
      status: "PENDING",
      sessionId: currentSessionId,
      deductions: 0,
      allowances: 0,
      bonus: 0,
    })
  }

  const handleBulkGenerate = () => {
    if (!currentSessionId) return toast({ title: "Error", description: "No active session found" })
    if (confirm("This will generate PENDING payroll records for all employees who don't have one yet. Continue?")) {
      setIsBulkGenerating(true)
      bulkGenerateMutation.mutate({
        month,
        year,
        sessionId: currentSessionId
      })
    }
  }

  const handlePay = (id: string) => {
    paySalaryMutation.mutate({ id, status: "PAID", paymentDate: new Date() })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? This will remove the payroll record and move the employee back to the 'Not Generated' list.")) {
      deleteSalaryMutation.mutate({ id })
    }
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} records? They will be moved back to 'Not Generated'.`)) {
      bulkDeleteMutation.mutate({ ids: selectedIds })
    }
  }

  // --- Selection Logic ---

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select "existing" salary records
      const allIds = salaryData?.salaries.map(s => s.id) ?? []
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  // --- Data Combination ---
  const combinedData = useMemo(() => {
    const existing = salaryData?.salaries.map(s => ({
      type: 'existing' as const,
      data: s as unknown as SalaryRecord
    })) ?? []

    const missing = missingEmployees?.map(emp => ({
      type: 'missing' as const,
      data: emp as UnpaidEmployee
    })) ?? []

    return [...existing, ...missing].sort((a, b) => {
      const nameA = a.type === 'existing' ? a.data.Employees.employeeName : a.data.employeeName
      const nameB = b.type === 'existing' ? b.data.Employees.employeeName : b.data.employeeName
      return nameA.localeCompare(nameB)
    })
  }, [salaryData, missingEmployees])

  // --- PDF Logic ---
  const handlePrint = () => {
    const content = slipRef.current
    if (!content) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`<html><head><title>Payslip</title><script>window.onload=()=>{window.print();window.close();}</script><script src="https://cdn.tailwindcss.com"></script></head><body>${content.outerHTML}</body></html>`)
    printWindow.document.close()
  }

  const handleDownloadPdf = async () => {
    if (!slipRef.current || !previewRecord) return
    try {
      setIsDownloading(true)
      const canvas = await html2canvas.default(slipRef.current, { scale: 2, backgroundColor: "#ffffff" })
      const pdf = new jsPDF.default({ orientation: "portrait", unit: "mm", format: "a4" })
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 10, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width)
      pdf.save(`Payslip-${previewRecord.Employees.employeeName}.pdf`)
    } catch (e) { console.error(e) } finally { setIsDownloading(false) }
  }

  if (isLoadingSalaries || isLoadingMissing) return <div className="p-8 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Loading payroll data...</div>

  return (
    <div className="space-y-4">
      {/* Top Actions Bar */}
      <div className="flex flex-colsm:flex-row sm:justify-between sm:items-center p-4">
        {selectedIds.length > 0 ? (
          <div className="bg-red-50 p-2 rounded-lg flex items-center gap-4 px-4 border border-red-100 w-full sm:w-auto">
            <span className="text-sm font-medium text-red-700">{selectedIds.length} records selected</span>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </div>
        ) : (
          <div className="text-sm text-slate-500 hidden sm:block">
            {/* Placeholder to keep layout balanced if needed */}
          </div>
        )}

        {missingEmployees && missingEmployees.length > 0 && (
          <Button 
            onClick={handleBulkGenerate} 
            disabled={isBulkGenerating}
            className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4"
          >
            {isBulkGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4" />}
            Generate All Pending ({missingEmployees.length})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={
                    salaryData?.salaries.length && selectedIds.length === salaryData?.salaries.length
                      ? true 
                      : selectedIds.length > 0 ? "indeterminate" : false
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-slate-500">No employees found.</TableCell>
              </TableRow>
            ) : (
              combinedData.map((row) => {
                if (row.type === 'missing') {
                  const emp = row.data
                  return (
                    <TableRow key={`missing-${emp.employeeId}`} className="bg-slate-50/50">
                      <TableCell>
                        <Checkbox disabled aria-label="Cannot select missing record" />
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{emp.employeeName}</TableCell>
                      <TableCell className="text-slate-500">{emp.designation}</TableCell>
                      <TableCell colSpan={4} className="text-center text-slate-400 text-xs italic">
                        Payroll not generated yet
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-300 text-slate-400">
                          <AlertCircle className="w-3 h-3 mr-1" /> Not Generated
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGeneratePayroll(emp.employeeId)}
                          disabled={generatingId === emp.employeeId}
                          className="h-8 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          {generatingId === emp.employeeId ? <Loader2 className="w-3 h-3 animate-spin"/> : <PlusCircle className="w-3 h-3"/>}
                          Generate
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                } else {
                  const salary = row.data
                  const netPay = salary.amount + (salary.allowances ?? 0) + (salary.bonus ?? 0) - (salary.deductions ?? 0)
                  const isSelected = selectedIds.includes(salary.id)

                  return (
                    <TableRow key={salary.id} data-state={isSelected ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(salary.id, checked as boolean)}
                          aria-label="Select row"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{salary.Employees.employeeName}</TableCell>
                      <TableCell className="text-slate-500">{salary.Employees.designation}</TableCell>
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
                        <div className="flex items-center justify-end gap-2">
                          {salary.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handlePay(salary.id)}
                            >
                              <Banknote className="w-4 h-4" />
                              Mark Paid
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setPreviewRecord(salary)}>
                                <Eye className="mr-2 h-4 w-4" /> View Slip
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(salary.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Slip Preview Dialog (No Changes needed here) */}
      <Dialog open={!!previewRecord} onOpenChange={(open) => !open && setPreviewRecord(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-gray-100 p-4 rounded-md overflow-auto max-h-[70vh]">
             {previewRecord && (
                <div ref={slipRef} className="bg-white p-8 w-[210mm] min-h-[140mm] shadow-md text-sm text-gray-800">
                  <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">Academic Institute</h1>
                    <p className="text-slate-500">Salary Slip</p>
                    <p className="font-medium mt-1">{MONTHS[previewRecord.month - 1]} {previewRecord.year}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-slate-500">Employee Name</span><span className="font-semibold">{previewRecord.Employees.employeeName}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-slate-500">Designation</span><span>{previewRecord.Employees.designation}</span></div>
                    </div>
                    <div>
                      <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-slate-500">Employee ID</span><span className="font-mono">{previewRecord.Employees.registrationNumber || 'N/A'}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100"><span className="text-slate-500">Payment Date</span><span>{previewRecord.paymentDate ? new Date(previewRecord.paymentDate).toLocaleDateString() : 'Pending'}</span></div>
                    </div>
                  </div>
                  <div className="mb-6 border rounded-sm">
                    <div className="grid grid-cols-2 bg-slate-100 font-semibold p-2 border-b"><div>Description</div><div className="text-right">Amount (PKR)</div></div>
                    <div className="p-2 border-b flex justify-between"><span>Base Salary</span><span>{previewRecord.amount.toLocaleString()}</span></div>
                    {(previewRecord.allowances ?? 0) > 0 && <div className="p-2 border-b flex justify-between text-green-700"><span>Allowances</span><span>+{(previewRecord.allowances ?? 0).toLocaleString()}</span></div>}
                    {(previewRecord.deductions ?? 0) > 0 && <div className="p-2 border-b flex justify-between text-red-600"><span>Deductions</span><span>-{(previewRecord.deductions ?? 0).toLocaleString()}</span></div>}
                    <div className="p-4 bg-slate-50 flex justify-between items-center mt-auto"><span className="font-bold text-lg">Net Pay</span><span className="font-bold text-xl text-slate-900">PKR {(previewRecord.amount + (previewRecord.allowances ?? 0) + (previewRecord.bonus ?? 0) - (previewRecord.deductions ?? 0)).toLocaleString()}</span></div>
                  </div>
                  <div className="mt-12 text-center text-xs text-slate-400"><p>Computer-generated document.</p></div>
                </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4" /> Print</Button>
            <Button onClick={handleDownloadPdf} disabled={isDownloading} className="gap-2">{isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}