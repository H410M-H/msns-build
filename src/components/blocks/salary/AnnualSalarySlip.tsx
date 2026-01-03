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
        className="bg-white w-[210mm] min-h-[297mm] mx-auto relative text-slate-800 font-sans"
        style={{ padding: "15mm" }} // Standard A4 margins
      >
        {/* Decorative Watermark/Background */}
        <div className="absolute top-0 right-0 w-[80mm] h-[80mm] bg-indigo-50/50 rounded-bl-[100px] pointer-events-none" />

        {/* ---------------- HEADER ---------------- */}
        <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-6 mb-8 relative z-10">
          <div className="flex gap-5 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png" 
              alt="School Logo" 
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-indigo-950 tracking-tight uppercase">M. S. NAZ HIGH SCHOOL®</h1>
              <p className="text-indigo-700 font-semibold text-sm tracking-wide">ANNUAL SALARY STATEMENT</p>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Building2 className="w-3 h-3 text-indigo-500" /> 
                  <span>G.T. Road, Ghakhar, Pakistan</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Phone className="w-3 h-3 text-indigo-500" /> 
                  <span>+92 (318) 7625415</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Mail className="w-3 h-3 text-indigo-500" /> 
                  <span>info@msns.edu.pk</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-indigo-900 text-white px-4 py-2 rounded text-sm font-bold inline-block shadow-sm">
              FISCAL YEAR {year}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* ---------------- EMPLOYEE INFO ---------------- */}
        {/* Fixed layout using grid to prevent overlapping */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
            Employee Details
          </h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs">
            
            {/* Row 1 */}
            <div className="grid grid-cols-[100px_1fr] items-center">
              <span className="text-slate-500 font-medium">Employee Name:</span>
              <span className="font-bold text-slate-900 text-sm">{employee.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center">
              <span className="text-slate-500 font-medium">Designation:</span>
              <span className="font-bold text-slate-900">{employee.designation}</span>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-[100px_1fr] items-center">
              <span className="text-slate-500 font-medium">Registration ID:</span>
              <span className="font-mono font-bold text-slate-700 bg-white border px-2 py-0.5 rounded w-fit">
                {employee.registrationNumber}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center">
              <span className="text-slate-500 font-medium">Total Months:</span>
              <span className="font-bold text-slate-900">{records.length}</span>
            </div>

          </div>
        </div>

        {/* ---------------- SUMMARY CARDS ---------------- */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
            <p className="text-[10px] text-blue-500 uppercase font-bold mb-1">Total Basic</p>
            <p className="text-base font-bold text-blue-900">{totals.basic.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
            <p className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Allowances + Bonus</p>
            <p className="text-base font-bold text-emerald-900">{(totals.allowances + totals.bonus).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
            <p className="text-[10px] text-red-500 uppercase font-bold mb-1">Total Deductions</p>
            <p className="text-base font-bold text-red-900">{totals.deductions.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-center shadow-sm">
            <p className="text-[10px] text-indigo-600 uppercase font-bold mb-1">Net Annual Pay</p>
            <p className="text-lg font-extrabold text-indigo-900">PKR {totals.net.toLocaleString()}</p>
          </div>
        </div>

        {/* ---------------- MONTHLY BREAKDOWN TABLE ---------------- */}
        <div className="mb-8">
          <div className="overflow-hidden rounded-t-lg border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-indigo-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4 text-left font-semibold">Month</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Basic Salary</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Allowances</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Bonus</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Deductions</th>
                  <th className="py-2.5 px-4 text-right font-semibold bg-indigo-950">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="py-2 px-4">
                      <div className="font-bold text-slate-700">{MONTHS[record.month - 1]}</div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        Paid: {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'Pending'}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-slate-600">
                      {record.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-emerald-600 font-medium">
                      {(record.allowances ?? 0) > 0 ? `+${(record.allowances ?? 0).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-4 text-right text-emerald-600 font-medium">
                      {(record.bonus ?? 0) > 0 ? `+${(record.bonus ?? 0).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-4 text-right text-red-500 font-medium">
                      {(record.deductions ?? 0) > 0 ? `-${(record.deductions ?? 0).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-indigo-900 bg-indigo-50/30">
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
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      No payroll records generated for the selected year.
                    </td>
                  </tr>
                )}
              </tbody>
              {sortedRecords.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-200 text-slate-800">
                    <td className="py-3 px-4 text-left">ANNUAL TOTALS</td>
                    <td className="py-3 px-4 text-right">{totals.basic.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-700">{totals.allowances.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-700">{totals.bonus.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">{totals.deductions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-indigo-900 bg-indigo-100 text-sm">
                      {totals.net.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ---------------- FOOTER / SIGNATURES ---------------- */}
        <div className="absolute bottom-[15mm] left-[15mm] right-[15mm]">
          <div className="flex justify-between items-end pb-6">
            <div className="text-center">
              <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Employee Signature</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b-2 border-slate-300 mb-2"></div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Principal / Authority Signature</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
            <div className="flex gap-4">
              <p>• System Generated Document</p>
              <p>• No Stamp Required</p>
            </div>
            <div className="flex items-center gap-1 font-medium text-slate-500">
              <Globe className="w-3 h-3" /> www.msns.edu.pk
            </div>
          </div>
        </div>
      </div>
    )
  }
)

AnnualSalarySlip.displayName = "AnnualSalarySlip"
