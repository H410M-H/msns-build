import React from "react";
import { Building2, Phone, Mail, Globe } from "lucide-react";

interface SalaryRecord {
  id: string;
  amount: number;
  allowances: number | null;
  bonus: number | null;
  deductions: number | null;
  status: string;
  month: number;
  year: number;
  paymentDate: Date | null;
}

interface AnnualSalarySlipProps {
  year: number;
  employee: {
    name: string;
    designation: string;
    registrationNumber: string;
  };
  records: SalaryRecord[];
}

const MONTHS = [
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
];

export const AnnualSalarySlip = React.forwardRef<
  HTMLDivElement,
  AnnualSalarySlipProps
>(({ year, employee, records }, ref) => {
  // Sort records by month
  const sortedRecords = [...records].sort((a, b) => a.month - b.month);

  // Calculate Totals
  const totals = sortedRecords.reduce(
    (acc, record) => ({
      basic: acc.basic + record.amount,
      allowances: acc.allowances + (record.allowances ?? 0),
      bonus: acc.bonus + (record.bonus ?? 0),
      deductions: acc.deductions + (record.deductions ?? 0),
      net:
        acc.net +
        (record.amount +
          (record.allowances ?? 0) +
          (record.bonus ?? 0) -
          (record.deductions ?? 0)),
    }),
    { basic: 0, allowances: 0, bonus: 0, deductions: 0, net: 0 },
  );

  return (
    <div
      ref={ref}
      className="relative mx-auto min-h-[297mm] w-[210mm] overflow-hidden border border-gray-200 bg-white p-8 text-sm text-gray-800 shadow-lg"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-indigo-50 opacity-50" />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between border-b-2 border-indigo-100 pb-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
            alt="School Logo"
            className="h-20 w-20 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-950">
              M. S. NAZ HIGH SCHOOL®
            </h1>
            <p className="font-medium text-indigo-600">
              Annual Salary Statement
            </p>
            <div className="mt-2 space-y-0.5 text-xs text-gray-500">
              <p className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> G.T. Road, Ghakhar, Pakistan
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> +92 (318) 7625415
              </p>
              <p className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> info@msns.edu.pk
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="mb-2 inline-block rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-800">
            FISCAL YEAR {year}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Employee Summary */}
      <div className="mb-8 rounded-lg border border-gray-100 bg-gray-50 p-6">
        <h3 className="mb-4 border-b border-gray-200 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
          Employee Information
        </h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Employee Name</span>
            <span className="font-semibold text-gray-900">{employee.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Registration ID</span>
            <span className="font-mono font-medium text-gray-900">
              {employee.registrationNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Designation</span>
            <span className="font-medium text-gray-900">
              {employee.designation}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Months Paid</span>
            <span className="font-medium text-gray-900">{records.length}</span>
          </div>
        </div>
      </div>

      {/* Annual Totals Cards */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center">
          <p className="mb-1 text-[10px] font-semibold uppercase text-blue-500">
            Total Basic
          </p>
          <p className="text-lg font-bold text-blue-900">
            {totals.basic.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center">
          <p className="mb-1 text-[10px] font-semibold uppercase text-green-500">
            Allowances + Bonus
          </p>
          <p className="text-lg font-bold text-green-900">
            {(totals.allowances + totals.bonus).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center">
          <p className="mb-1 text-[10px] font-semibold uppercase text-red-500">
            Total Deductions
          </p>
          <p className="text-lg font-bold text-red-900">
            {totals.deductions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-center">
          <p className="mb-1 text-[10px] font-semibold uppercase text-indigo-500">
            Net Annual Pay
          </p>
          <p className="text-lg font-bold text-indigo-900">
            {totals.net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="mb-12">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Monthly Breakdown
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800 uppercase text-foreground">
              <th className="rounded-tl-md px-3 py-2 text-left">Month</th>
              <th className="px-3 py-2 text-right">Basic</th>
              <th className="px-3 py-2 text-right">Allowances</th>
              <th className="px-3 py-2 text-right">Bonus</th>
              <th className="px-3 py-2 text-right">Deductions</th>
              <th className="rounded-tr-md px-3 py-2 text-right">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-x border-b border-gray-200">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/50">
                <td className="px-3 py-2.5 font-medium text-gray-700">
                  {MONTHS[record.month - 1]}
                  <div className="text-[10px] font-normal text-gray-400">
                    Paid:{" "}
                    {record.paymentDate
                      ? new Date(record.paymentDate).toLocaleDateString()
                      : "Pending"}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right">
                  {record.amount.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-green-600">
                  {(record.allowances ?? 0) > 0
                    ? `+${(record.allowances ?? 0).toLocaleString()}`
                    : "-"}
                </td>
                <td className="px-3 py-2.5 text-right text-green-600">
                  {(record.bonus ?? 0) > 0
                    ? `+${(record.bonus ?? 0).toLocaleString()}`
                    : "-"}
                </td>
                <td className="px-3 py-2.5 text-right text-red-500">
                  {(record.deductions ?? 0) > 0
                    ? `-${(record.deductions ?? 0).toLocaleString()}`
                    : "-"}
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-gray-900">
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
                <td
                  colSpan={6}
                  className="py-8 text-center italic text-gray-400"
                >
                  No payroll records found for this year.
                </td>
              </tr>
            )}
          </tbody>
          {sortedRecords.length > 0 && (
            <tfoot>
              <tr className="border-x border-b border-gray-200 bg-gray-100 font-bold">
                <td className="px-3 py-3 text-left">TOTAL</td>
                <td className="px-3 py-3 text-right">
                  {totals.basic.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right">
                  {totals.allowances.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right">
                  {totals.bonus.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right text-red-600">
                  {totals.deductions.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right text-sm text-indigo-700">
                  PKR {totals.net.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer / Signatures */}
      <div className="mt-auto">
        <div className="flex items-end justify-between pb-8">
          <div className="text-center">
            <div className="mb-2 w-40 border-b border-gray-300"></div>
            <p className="text-[10px] font-medium uppercase text-gray-500">
              Principal Signature
            </p>
          </div>
          <div className="text-center">
            <div className="mb-2 w-40 border-b border-gray-300"></div>
            <p className="text-[10px] font-medium uppercase text-gray-500">
              Admin / Finance Signature
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] text-gray-400">
          <p>This document is computer generated.</p>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" /> www.msns.edu.pk
          </div>
        </div>
      </div>
    </div>
  );
});

AnnualSalarySlip.displayName = "AnnualSalarySlip";
