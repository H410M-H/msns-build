"use client"

import { useState, useRef } from "react"
import { api } from "~/trpc/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { 
  Loader2, 
  Printer, 
  Plus, 
  FileX, 
  Banknote, 
  Download, 
  Eye,
  Building2,
  Phone,
  Mail,
  Globe,
  FileText
} from "lucide-react"
import { toast } from "~/hooks/use-toast"
import * as jsPDF from "jspdf"
import * as html2canvas from "html2canvas-pro"
import { AnnualSalarySlip } from "./AnnualSalarySlip"

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
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
  // States for Slip Preview/Download
  const [previewRecord, setPreviewRecord] = useState<SalaryRecord | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const slipRef = useRef<HTMLDivElement>(null)

  // State for Annual Slip Preview
  const [showAnnualPreview, setShowAnnualPreview] = useState(false)
  const annualRef = useRef<HTMLDivElement>(null)

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

  // Mutation to update salary status
  const updateSalaryMutation = api.salary.update.useMutation({
    onSuccess: () => {
      toast({ title: "Payment Recorded", description: "Salary marked as PAID." })
      void utils.salary.getEmployeeSalarySummary.invalidate()
      setIsUpdating(null)
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
      setIsUpdating(null)
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

  const handleMarkAsPaid = (id: string) => {
    setIsUpdating(id)
    updateSalaryMutation.mutate({
      id,
      status: "PAID",
      paymentDate: new Date()
    })
  }

  // --- HTML to PDF Generation Logic ---
  const handlePrint = (ref: React.RefObject<HTMLDivElement>) => {
    const content = ref.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Document</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; -webkit-print-color-adjust: exact; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${content.outerHTML}
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleDownloadPdf = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return

    try {
      setIsDownloading(true)
      const element = ref.current
      
      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      const pdf = new jsPDF.default({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight)
      pdf.save(filename)
    } catch (error) {
      console.error("PDF Generation Error:", error)
      toast({ title: "Error", description: "Failed to generate PDF" })
    } finally {
      setIsDownloading(false)
    }
  }

  // Filter records for the Annual Slip
  const annualRecords = history?.records.filter(r => r.year === Number(selectedYear)) ?? []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Salary Details: {employeeName}</DialogTitle>
            <DialogDescription>
              View payment history and generate individual salary slips.
            </DialogDescription>
          </DialogHeader>

          {/* Generator & Actions Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-lg border justify-between">
            {/* Left: Generator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Select Period:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[110px] bg-white"><SelectValue /></SelectTrigger>
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
              <Button onClick={handleGenerate} disabled={isGenerating} size="sm" className="ml-2">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Generate
              </Button>
            </div>

            {/* Right: Annual Slip */}
            <Button 
              variant="outline" 
              onClick={() => setShowAnnualPreview(true)}
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <FileText className="w-4 h-4" />
              Annual Statement ({selectedYear})
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
                          <div className="flex items-center justify-end gap-1">
                            {/* Payment Button */}
                            {typedRecord.status !== "PAID" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsPaid(typedRecord.id)}
                                disabled={isUpdating === typedRecord.id}
                                title="Mark as Paid"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {isUpdating === typedRecord.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Banknote className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            
                            {/* Slip Preview Button */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setPreviewRecord(typedRecord)}
                              title="View & Download Slip"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </Button>
                          </div>
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

      {/* -------------------- ANNUAL SLIP PREVIEW DIALOG -------------------- */}
      <Dialog open={showAnnualPreview} onOpenChange={setShowAnnualPreview}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Annual Salary Statement ({selectedYear})</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center bg-gray-100 p-6 rounded-md overflow-auto h-full">
            <AnnualSalarySlip 
              ref={annualRef}
              year={Number(selectedYear)}
              employee={{
                name: employeeName,
                designation: designation,
                registrationNumber: registrationNumber
              }}
              records={annualRecords as unknown as SalaryRecord[]}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handlePrint(annualRef)} className="gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button 
              onClick={() => handleDownloadPdf(annualRef, `Annual-Statement-${employeeName}-${selectedYear}.pdf`)} 
              disabled={isDownloading} 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Annual PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------- MONTHLY SLIP PREVIEW DIALOG -------------------- */}
      <Dialog open={!!previewRecord} onOpenChange={(open) => !open && setPreviewRecord(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center bg-gray-100 p-6 rounded-md overflow-auto max-h-[80vh]">
             {/* The Slip Content to be Captured */}
             {previewRecord && (
                <div 
                  ref={slipRef} 
                  className="bg-white p-8 w-[210mm] min-h-[140mm] shadow-lg text-sm text-gray-800 border border-gray-200 relative overflow-hidden"
                >
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none" />

                  {/* Header Section */}
                  <div className="flex justify-between items-start border-b-2 border-emerald-100 pb-6 mb-6">
                    <div className="flex gap-4 items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png" 
                        alt="School Logo" 
                        className="w-20 h-20 object-contain drop-shadow-sm"
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">M. S. NAZ HIGH SCHOOL®</h1>
                        <p className="text-emerald-600 font-medium">Excellence in Education</p>
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          <p className="flex items-center gap-1"><Building2 className="w-3 h-3" /> G.T. Road, Ghakhar, Pakistan</p>
                          <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> +92 (318) 7625415</p>
                          <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> info@msns.edu.pk</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold inline-block mb-2 border border-emerald-100">
                        SALARY SLIP
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        {MONTHS[previewRecord.month - 1]?.label} {previewRecord.year}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Ref: {previewRecord.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Employee Info Grid */}
                  <div className="bg-gray-50 rounded-lg p-5 mb-8 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Employee Details</h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Employee Name</span>
                        <span className="font-semibold text-gray-900">{employeeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registration ID</span>
                        <span className="font-mono font-medium text-gray-900 bg-white px-2 py-0.5 rounded border">{registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Designation</span>
                        <span className="font-medium text-gray-900">{designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Date</span>
                        <span className="font-medium text-gray-900">
                          {previewRecord.paymentDate ? new Date(previewRecord.paymentDate).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financials Table */}
                  <div className="mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-emerald-900 text-white text-xs uppercase">
                          <th className="py-2 px-4 text-left rounded-tl-md">Description</th>
                          <th className="py-2 px-4 text-right">Type</th>
                          <th className="py-2 px-4 text-right rounded-tr-md">Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100 border-x border-b border-gray-200">
                        <tr>
                          <td className="py-3 px-4 font-medium text-gray-700">Basic Salary</td>
                          <td className="py-3 px-4 text-right text-gray-400 text-xs">Earning</td>
                          <td className="py-3 px-4 text-right font-medium">{previewRecord.amount.toLocaleString()}</td>
                        </tr>
                        
                        {(previewRecord.allowances ?? 0) > 0 && (
                          <tr className="bg-emerald-50/30">
                            <td className="py-3 px-4 text-emerald-700">Allowances</td>
                            <td className="py-3 px-4 text-right text-emerald-600 text-xs">Addition</td>
                            <td className="py-3 px-4 text-right font-medium text-emerald-700">+{ (previewRecord.allowances ?? 0).toLocaleString()}</td>
                          </tr>
                        )}

                        {(previewRecord.bonus ?? 0) > 0 && (
                          <tr className="bg-emerald-50/30">
                            <td className="py-3 px-4 text-emerald-700">Performance Bonus</td>
                            <td className="py-3 px-4 text-right text-emerald-600 text-xs">Addition</td>
                            <td className="py-3 px-4 text-right font-medium text-emerald-700">+{ (previewRecord.bonus ?? 0).toLocaleString()}</td>
                          </tr>
                        )}

                        {(previewRecord.deductions ?? 0) > 0 && (
                          <tr className="bg-red-50/30">
                            <td className="py-3 px-4 text-red-700">Deductions / Tax</td>
                            <td className="py-3 px-4 text-right text-red-600 text-xs">Deduction</td>
                            <td className="py-3 px-4 text-right font-medium text-red-700">-{ (previewRecord.deductions ?? 0).toLocaleString()}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-800 text-white">
                          <td className="py-4 px-6 font-bold text-lg rounded-bl-md">NET PAYABLE</td>
                          <td colSpan={2} className="py-4 px-6 text-right font-bold text-xl rounded-br-md">
                            <span className="text-emerald-400 mr-1">PKR</span> 
                            {(
                              previewRecord.amount + 
                              (previewRecord.allowances ?? 0) + 
                              (previewRecord.bonus ?? 0) - 
                              (previewRecord.deductions ?? 0)
                            ).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between mt-16 pt-8 px-4">
                    <div className="text-center">
                      <div className="w-40 border-b border-gray-300 mb-2"></div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Employee Signature</p>
                    </div>
                    <div className="text-center">
                      <div className="w-40 border-b border-gray-300 mb-2"></div>
                      <p className="text-xs text-gray-500 font-medium uppercase">Authority Signature</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-end text-[10px] text-gray-400">
                    <div>
                      <p>This document is system generated and does not require a physical stamp.</p>
                      <p className="mt-0.5">Generated on: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> www.msns.edu.pk
                    </div>
                  </div>
                </div>
             )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handlePrint(slipRef)} className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Printer className="w-4 h-4" /> Print Slip
            </Button>
            <Button onClick={() => handleDownloadPdf(slipRef, `Payslip-${employeeName}-${previewRecord?.month}-${previewRecord?.year}.pdf`)} disabled={isDownloading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
