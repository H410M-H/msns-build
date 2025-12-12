import React from "react"
import { Separator } from "~/components/ui/separator"
import { format } from "date-fns"
import { cn } from "~/lib/utils"

// [FIX] Added 'export' keyword here
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// [FIX] Added 'export' keyword here
export interface VoucherData {
  studentName: string
  registrationNumber: string
  fatherName: string
  className: string
  section: string
  
  // Fee Entry Details
  sfcId: string
  month: number
  year: number
  issueDate: Date
  
  // Financials
  tuitionFee: number
  examFund: number
  computerLabFund: number
  studentIdCardFee: number
  infoAndCallsFee: number
  admissionFee: number
  lateFee: number
  discount: number
  
  // Totals
  totalDue: number
  totalPaid: number
  isPaid: boolean
  paidAt?: Date | null
}

// [FIX] Ensure the component accepts the interface
export const FeeVoucher = React.forwardRef<HTMLDivElement, { data: VoucherData }>(
  ({ data }, ref) => {
    const voucherTitle = data.isPaid ? "FEE RECEIPT" : "FEE VOUCHER"
    const statusColor = data.isPaid ? "text-emerald-700 bg-emerald-50" : "text-slate-700 bg-slate-50"

    return (
      <div 
        ref={ref} 
        className="w-full max-w-[210mm] min-h-[148mm] bg-white p-8 border border-slate-200 mx-auto print:border-none print:mx-0 font-sans"
      >
        {/* ... (Keep the rest of your JSX exactly the same as before) ... */}
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
             <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">M.S. Naz High School</h1>
             <p className="text-sm text-slate-500">Ghakhar, Gujranwala</p>
          </div>
          <div className="text-right">
             <div className="text-xl font-bold text-slate-900">{voucherTitle}</div>
             <div className="text-sm text-slate-500">
               {MONTH_NAMES[data.month - 1]} {data.year}
             </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Student Details */}
          <div className="space-y-1">
             <div className="flex text-sm">
               <span className="w-24 text-slate-500">Name:</span>
               <span className="font-semibold uppercase">{data.studentName}</span>
             </div>
             <div className="flex text-sm">
               <span className="w-24 text-slate-500">Father:</span>
               <span className="font-medium uppercase">{data.fatherName}</span>
             </div>
             <div className="flex text-sm">
               <span className="w-24 text-slate-500">Reg No:</span>
               <span className="font-mono">{data.registrationNumber}</span>
             </div>
             <div className="flex text-sm">
               <span className="w-24 text-slate-500">Class:</span>
               <span className="font-medium">{data.className} - {data.section}</span>
             </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-1 text-right">
            <div className="flex justify-end text-sm">
               <span className="text-slate-500 mr-4">Voucher ID:</span>
               <span className="font-mono">{data.sfcId.slice(-8).toUpperCase()}</span>
             </div>
             <div className="flex justify-end text-sm">
               <span className="text-slate-500 mr-4">{data.isPaid ? "Paid Date:" : "Issue Date:"}</span>
               <span className="font-medium">
                 {data.isPaid && data.paidAt 
                   ? format(new Date(data.paidAt), "dd MMM yyyy") 
                   : format(new Date(), "dd MMM yyyy")
                 }
               </span>
             </div>
          </div>
        </div>

        {/* Fee Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-200">
              <th className="py-2 px-4 text-left font-semibold text-slate-700">Description</th>
              <th className="py-2 px-4 text-right font-semibold text-slate-700">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2 px-4">Tuition Fee</td>
              <td className="py-2 px-4 text-right">{data.tuitionFee.toLocaleString()}</td>
            </tr>
            {data.examFund > 0 && (
              <tr>
                <td className="py-2 px-4">Exam Fund</td>
                <td className="py-2 px-4 text-right">{data.examFund.toLocaleString()}</td>
              </tr>
            )}
             {data.computerLabFund > 0 && (
              <tr>
                <td className="py-2 px-4">Computer Lab Fund</td>
                <td className="py-2 px-4 text-right">{data.computerLabFund.toLocaleString()}</td>
              </tr>
            )}
            {data.admissionFee > 0 && (
              <tr>
                <td className="py-2 px-4">Admission Fee</td>
                <td className="py-2 px-4 text-right">{data.admissionFee.toLocaleString()}</td>
              </tr>
            )}
            
            {/* Totals */}
            <tr className="bg-slate-50 font-medium">
              <td className="py-2 px-4">Subtotal</td>
              <td className="py-2 px-4 text-right">
                {(data.tuitionFee + data.examFund + data.computerLabFund + data.studentIdCardFee + data.infoAndCallsFee + data.admissionFee).toLocaleString()}
              </td>
            </tr>
            {data.lateFee > 0 && (
               <tr className="text-orange-600">
               <td className="py-2 px-4">Late Fee</td>
               <td className="py-2 px-4 text-right">+{data.lateFee.toLocaleString()}</td>
             </tr>
            )}
            {data.discount > 0 && (
               <tr className="text-red-600">
               <td className="py-2 px-4">Discount</td>
               <td className="py-2 px-4 text-right">-{data.discount.toLocaleString()}</td>
             </tr>
            )}
            <tr className={cn("border-t-2 border-slate-300 font-bold text-lg", statusColor)}>
              <td className="py-3 px-4">{data.isPaid ? "TOTAL PAID" : "NET PAYABLE"}</td>
              <td className="py-3 px-4 text-right">
                {data.isPaid 
                  ? data.totalPaid.toLocaleString() 
                  : data.totalDue.toLocaleString()
                }
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Signature Area */}
        <div className="mt-12 pt-8 border-t flex justify-between items-end text-sm text-slate-500">
          <div className="text-center w-32">
            <div className="border-t border-slate-400 pt-1">Accountant</div>
          </div>
          <div className="text-center w-32">
            <div className="border-t border-slate-400 pt-1">Principal</div>
          </div>
        </div>
      </div>
    )
  }
)
FeeVoucher.displayName = "FeeVoucher"