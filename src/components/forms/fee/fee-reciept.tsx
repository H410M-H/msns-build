"use client"

import { useRef } from "react"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Printer, Download } from "lucide-react"
import { format } from "date-fns"

interface FeeReceiptProps {
  student: {
    studentId: string
    studentName: string
    registrationNumber: string
    fatherName: string
    fatherMobile: string
  }
  entry: {
    sfcId: string
    month?: number | null
    year?: number | null
    baseFee: number
    discountAmount: number
    totalDue: number
    paidAmount: number
    paidAt?: Date | null
    fees: {
      level: string
      tuitionFee: number
      examFund: number
      computerLabFund?: number | null
      studentIdCardFee: number
      infoAndCallsFee: number
      admissionFee: number
    }
  }
  className: string
  section: string
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function FeeReceipt({ student, entry, className, section }: FeeReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = receiptRef.current
    if (!content) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - ${student.studentName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-green { color: #059669; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const receiptNo = `RCP-${entry.sfcId.slice(-8).toUpperCase()}`

  return (
    <div className="space-y-4">
      <div ref={receiptRef} className="bg-white p-6 border rounded-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">School Management System</h1>
          <p className="text-slate-600">Fee Payment Receipt</p>
          <Separator className="my-4" />
        </div>

        {/* Receipt Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-500">Receipt No.</p>
            <p className="font-mono font-bold">{receiptNo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-medium">{entry.paidAt ? format(new Date(entry.paidAt), "dd MMM yyyy") : "N/A"}</p>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">STUDENT DETAILS</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Name:</span>
              <span className="ml-2 font-medium">{student.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500">Reg. No:</span>
              <span className="ml-2 font-mono">{student.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500">Class:</span>
              <span className="ml-2 font-medium">
                {className} - {section}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Father:</span>
              <span className="ml-2 font-medium">{student.fatherName}</span>
            </div>
          </div>
        </div>

        {/* Fee Period */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">FEE PERIOD</h3>
          <p className="font-medium">
            {months[(entry.month ?? 1) - 1]} {entry.year}
          </p>
        </div>

        {/* Fee Breakdown */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 text-left text-sm font-semibold">Description</th>
              <th className="p-2 text-right text-sm font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Tuition Fee</td>
              <td className="p-2 text-right">Rs. {entry.fees.tuitionFee.toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Exam Fund</td>
              <td className="p-2 text-right">Rs. {entry.fees.examFund.toLocaleString()}</td>
            </tr>
            {entry.fees.computerLabFund && (
              <tr className="border-b">
                <td className="p-2">Computer Lab Fund</td>
                <td className="p-2 text-right">Rs. {entry.fees.computerLabFund.toLocaleString()}</td>
              </tr>
            )}
            <tr className="border-b">
              <td className="p-2">Student ID Card Fee</td>
              <td className="p-2 text-right">Rs. {entry.fees.studentIdCardFee.toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Info & Calls Fee</td>
              <td className="p-2 text-right">Rs. {entry.fees.infoAndCallsFee.toLocaleString()}</td>
            </tr>
            <tr className="border-b bg-slate-50">
              <td className="p-2 font-semibold">Subtotal</td>
              <td className="p-2 text-right font-semibold">Rs. {entry.baseFee.toLocaleString()}</td>
            </tr>
            {entry.discountAmount > 0 && (
              <tr className="border-b">
                <td className="p-2 text-red-600">Discount</td>
                <td className="p-2 text-right text-red-600">- Rs. {entry.discountAmount.toLocaleString()}</td>
              </tr>
            )}
            <tr className="bg-emerald-50">
              <td className="p-3 font-bold text-emerald-700">TOTAL PAID</td>
              <td className="p-3 text-right font-bold text-emerald-700 text-lg">
                Rs. {entry.paidAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 mt-8 pt-4 border-t">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p className="mt-1">Thank you for your payment!</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  )
}
