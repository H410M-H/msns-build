"use client"

import { useState, useRef } from "react"
import { api } from "~/trpc/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Loader2, Printer, Download, FileText } from "lucide-react"
import { toast } from "~/hooks/use-toast"
import * as jsPDF from "jspdf"
import * as html2canvas from "html2canvas-pro"
import { AnnualSalarySlip } from "./AnnualSalarySlip"

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

interface AnnualSalaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: {
    id: string
    name: string
    designation: string
    registrationNumber: string
  }
}

export function AnnualSalaryDialog({
  open,
  onOpenChange,
  employee
}: AnnualSalaryDialogProps) {
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()))
  const [isDownloading, setIsDownloading] = useState(false)
  const annualRef = useRef<HTMLDivElement>(null)

  const { data: history, isLoading } = api.salary.getEmployeeSalarySummary.useQuery(
    { employeeId: employee.id },
    { enabled: open }
  )

  const annualRecords = history?.records.filter(r => r.year === Number(selectedYear)) ?? []

  // --- Print/Download Logic ---
  const handlePrint = () => {
    const content = annualRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Annual Statement - ${employee.name}</title>
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

  const handleDownloadPdf = async () => {
    if (!annualRef.current) return

    try {
      setIsDownloading(true)
      const element = annualRef.current
      
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
      pdf.save(`Annual-Statement-${employee.name}-${selectedYear}.pdf`)
    } catch (error) {
      console.error("PDF Generation Error:", error)
      toast({ title: "Error", description: "Failed to generate PDF" })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Annual Salary Statement
          </DialogTitle>
          
          <div className="flex items-center gap-2 mr-8">
            <span className="text-sm font-medium text-slate-500">Fiscal Year:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="flex-1 bg-gray-100 p-6 overflow-auto rounded-md">
            <div className="flex justify-center min-h-full">
              <AnnualSalarySlip 
                ref={annualRef}
                year={Number(selectedYear)}
                employee={{
                  name: employee.name,
                  designation: employee.designation,
                  registrationNumber: employee.registrationNumber
                }}
                records={annualRecords as unknown as SalaryRecord[]}
              />
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button 
            onClick={handleDownloadPdf} 
            disabled={isDownloading} 
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
