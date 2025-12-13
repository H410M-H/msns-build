import React from "react"
import { Building2, Phone, Mail, Globe } from "lucide-react"

interface SalaryRecord {
  id: string
  amount: number
  allowances: number | null
  bonus: number | null
  deductions: number | null
  status: string
  month: number
  year: number
  paymentDate: Date | null
}

interface AnnualSalarySlipProps {
  year: number
  employee: {
    name: string
    designation: string
    registrationNumber: string
  }
  records: SalaryRecord[]
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export const AnnualSalarySlip = React.forwardRef<HTMLDivElement, AnnualSalarySlipProps>(
  ({ year, employee, records }, ref) => {
    
    // Sort records by month
    const sortedRecords = [...records].sort((a, b) => a.month - b.month)

    // Calculate Totals
    const totals = sortedRecords.reduce(
      (acc, record) => ({
        basic: acc.basic + record.amount,
        allowances: acc.allowances + (record.allowances ?? 0),
        bonus: acc.bonus + (record.bonus ?? 0),
        deductions: acc.deductions + (record.deductions ?? 0),
        net: acc.net + (
          record.amount + 
          (record.allowances ?? 0) + 
          (record.bonus ?? 0) - 
          (record.deductions ?? 0)
        )
      }),
      { basic: 0, allowances: 0, bonus: 0, deductions: 0, net: 0 }
    )

    return (
      <div 
        ref={ref} 
        className="bg-white p-8 w-[210mm] min-h-[297mm] shadow-lg text-sm text-gray-800 border border-gray-200 relative overflow-hidden mx-auto"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full opacity-50 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-indigo-100 pb-6 mb-8">
          <div className="flex gap-4 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png" 
              alt="School Logo" 
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-indigo-950 tracking-tight">M. S. NAZ HIGH SCHOOL®</h1>
              <p className="text-indigo-600 font-medium">Annual Salary Statement</p>
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <p className="flex items-center gap-1"><Building2 className="w-3 h-3" /> G.T. Road, Ghakhar, Pakistan</p>
                <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> +92 (318) 7625415</p>
                <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> info@msns.edu.pk</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-indigo-50 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-bold inline-block mb-2 border border-indigo-100">
              FISCAL YEAR {year}
            </div>
            <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Employee Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Employee Information</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee Name</span>
              <span className="font-semibold text-gray-900">{employee.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registration ID</span>
              <span className="font-mono font-medium text-gray-900">{employee.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Designation</span>
              <span className="font-medium text-gray-900">{employee.designation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Months Paid</span>
              <span className="font-medium text-gray-900">{records.length}</span>
            </div>
          </div>
        </div>

        {/* Annual Totals Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
            <p className="text-[10px] text-blue-500 uppercase font-semibold mb-1">Total Basic</p>
            <p className="text-lg font-bold text-blue-900">{totals.basic.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
            <p className="text-[10px] text-green-500 uppercase font-semibold mb-1">Allowances + Bonus</p>
            <p className="text-lg font-bold text-green-900">{(totals.allowances + totals.bonus).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
            <p className="text-[10px] text-red-500 uppercase font-semibold mb-1">Total Deductions</p>
            <p className="text-lg font-bold text-red-900">{totals.deductions.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
            <p className="text-[10px] text-indigo-500 uppercase font-semibold mb-1">Net Annual Pay</p>
            <p className="text-lg font-bold text-indigo-900">{totals.net.toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="mb-12">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Monthly Breakdown</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white uppercase">
                <th className="py-2 px-3 text-left rounded-tl-md">Month</th>
                <th className="py-2 px-3 text-right">Basic</th>
                <th className="py-2 px-3 text-right">Allowances</th>
                <th className="py-2 px-3 text-right">Bonus</th>
                <th className="py-2 px-3 text-right">Deductions</th>
                <th className="py-2 px-3 text-right rounded-tr-md">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-x border-b border-gray-200">
              {sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 font-medium text-gray-700">
                    {MONTHS[record.month - 1]}
                    <div className="text-[10px] text-gray-400 font-normal">
                      Paid: {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'Pending'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">{record.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-green-600">{(record.allowances ?? 0) > 0 ? `+${(record.allowances ?? 0).toLocaleString()}` : '-'}</td>
                  <td className="py-2.5 px-3 text-right text-green-600">{(record.bonus ?? 0) > 0 ? `+${(record.bonus ?? 0).toLocaleString()}` : '-'}</td>
                  <td className="py-2.5 px-3 text-right text-red-500">{(record.deductions ?? 0) > 0 ? `-${(record.deductions ?? 0).toLocaleString()}` : '-'}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                    {(
                      record.amount + 
                      (record.allowances ?? 0) + 
                      (record.bonus ?? 0) - 
                      (record.deductions ?? 0)
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
              {sortedRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">No payroll records found for this year.</td>
                </tr>
              )}
            </tbody>
            {sortedRecords.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 font-bold border-x border-b border-gray-200">
                  <td className="py-3 px-3 text-left">TOTAL</td>
                  <td className="py-3 px-3 text-right">{totals.basic.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">{totals.allowances.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">{totals.bonus.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-red-600">{totals.deductions.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-indigo-700 text-sm">PKR {totals.net.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer / Signatures */}
        <div className="mt-auto">
          <div className="flex justify-between items-end pb-8">
            <div className="text-center">
              <div className="w-40 border-b border-gray-300 mb-2"></div>
              <p className="text-[10px] text-gray-500 font-medium uppercase">Principal Signature</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-gray-300 mb-2"></div>
              <p className="text-[10px] text-gray-500 font-medium uppercase">Admin / Finance Signature</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
            <p>This document is computer generated.</p>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> www.msns.edu.pk
            </div>
          </div>
        </div>
      </div>
    )
  }
)

AnnualSalarySlip.displayName = "AnnualSalarySlip"
