"use client"

import { useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Download, Loader2, FileText, Printer } from "lucide-react"
import * as jsPDF from "jspdf"
import * as html2canvas from "html2canvas-pro"

type SalaryData = {
  id: string
  employeeId: string
  baseSalary: number
  increment: number
  totalSalary: number
  assignedDate: Date
  sessionId: string
  Employees: {
    employeeName: string
    designation?: string // Optional if not in your current query
    registrationNumber?: string
  }
  Sessions: {
    sessionName: string
  }
}

interface SalarySlipProps {
  salary: SalaryData
}

export function SalarySlip({ salary }: SalarySlipProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const slipRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
      const content = slipRef.current
      if (!content) return
  
      const printWindow = window.open("", "_blank")
      if (!printWindow) return
  
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Salary Slip - ${salary.Employees.employeeName}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; -webkit-print-color-adjust: exact; }
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

  const handleGeneratePDF = async () => {
    if (!slipRef.current) return
    
    try {
      setIsGenerating(true)
      const element = slipRef.current
      
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
      pdf.save(`Salary_Slip_${salary.Employees.employeeName}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salary Slip Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Slip Design */}
          <div ref={slipRef} className="bg-white p-10 w-full max-w-[210mm] border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">Academic Institute</h1>
              <p className="text-gray-500 text-sm">Salary Slip</p>
              <p className="text-sm font-medium mt-1">
                {new Date(salary.assignedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold text-gray-600">Employee Name</span>
                  <span className="text-gray-900">{salary.Employees.employeeName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold text-gray-600">Employee ID</span>
                  <span className="text-gray-900">{salary.employeeId.slice(-6).toUpperCase()}</span>
                </div>
              </div>
              <div>
                 <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold text-gray-600">Payment Date</span>
                  <span className="text-gray-900">{new Date(salary.assignedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold text-gray-600">Session</span>
                  <span className="text-gray-900">{salary.Sessions.sessionName}</span>
                </div>
              </div>
            </div>

            {/* Earnings Table */}
            <div className="mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left font-semibold text-gray-700">Earnings</th>
                    <th className="py-2 px-4 text-right font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-4">Basic Salary</td>
                    <td className="py-2 px-4 text-right">PKR {salary.baseSalary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Increment / Allowances</td>
                    <td className="py-2 px-4 text-right">PKR {salary.increment.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4">Gross Salary</td>
                    <td className="py-3 px-4 text-right">PKR {(salary.baseSalary + salary.increment).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net Pay */}
            <div className="flex justify-end mb-12">
              <div className="bg-gray-100 p-4 rounded-lg w-1/2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Net Pay</span>
                  <span className="text-xl font-bold text-green-700">PKR {salary.totalSalary.toLocaleString()}</span>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1 uppercase">
                  (Paid)
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-8 text-center text-xs text-gray-400">
              <p>This is a computer generated document and does not require signature.</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 w-full justify-end max-w-[210mm]">
             <Button variant="outline" onClick={handlePrint}>
               <Printer className="mr-2 h-4 w-4" /> Print
             </Button>
            <Button onClick={handleGeneratePDF} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}