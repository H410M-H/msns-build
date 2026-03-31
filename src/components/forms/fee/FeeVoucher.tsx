import React from "react";
import { Separator } from "~/components/ui/separator";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

// [FIX] Added 'export' keyword here
export const MONTH_NAMES = [
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

// [FIX] Added 'export' keyword here
export interface VoucherData {
  studentName: string;
  registrationNumber: string;
  fatherName: string;
  className: string;
  section: string;

  // Fee Entry Details
  sfcId: string;
  month: number;
  year: number;
  issueDate: Date;

  // Financials
  tuitionFee: number;
  examFund: number;
  computerLabFund: number;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  admissionFee: number;
  lateFee: number;
  discount: number;

  // Totals
  totalDue: number;
  totalPaid: number;
  isPaid: boolean;
  paidAt?: Date | null;
}

// [FIX] Ensure the component accepts the interface
export const FeeVoucher = React.forwardRef<
  HTMLDivElement,
  { data: VoucherData }
>(({ data }, ref) => {
  const voucherTitle = data.isPaid ? "FEE RECEIPT" : "FEE VOUCHER";
  const statusColor = data.isPaid
    ? "text-emerald-700 bg-emerald-50"
    : "text-slate-700 bg-slate-50";

  return (
    <div
      ref={ref}
      className="mx-auto min-h-[148mm] w-full max-w-[210mm] border border-slate-200 bg-white p-8 font-sans print:mx-0 print:border-none"
    >
      {/* ... (Keep the rest of your JSX exactly the same as before) ... */}
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
            M.S. Naz High School
          </h1>
          <p className="text-sm text-muted-foreground">Ghakhar, Gujranwala</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-slate-900">{voucherTitle}</div>
          <div className="text-sm text-muted-foreground">
            {MONTH_NAMES[data.month - 1]} {data.year}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Info Grid */}
      <div className="mb-6 grid grid-cols-2 gap-8">
        {/* Student Details */}
        <div className="space-y-1">
          <div className="flex text-sm">
            <span className="w-24 text-muted-foreground">Name:</span>
            <span className="font-semibold uppercase">{data.studentName}</span>
          </div>
          <div className="flex text-sm">
            <span className="w-24 text-muted-foreground">Father:</span>
            <span className="font-medium uppercase">{data.fatherName}</span>
          </div>
          <div className="flex text-sm">
            <span className="w-24 text-muted-foreground">Reg No:</span>
            <span className="font-mono">{data.registrationNumber}</span>
          </div>
          <div className="flex text-sm">
            <span className="w-24 text-muted-foreground">Class:</span>
            <span className="font-medium">
              {data.className} - {data.section}
            </span>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-1 text-right">
          <div className="flex justify-end text-sm">
            <span className="mr-4 text-muted-foreground">Voucher ID:</span>
            <span className="font-mono">
              {data.sfcId.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-end text-sm">
            <span className="mr-4 text-muted-foreground">
              {data.isPaid ? "Paid Date:" : "Issue Date:"}
            </span>
            <span className="font-medium">
              {data.isPaid && data.paidAt
                ? format(new Date(data.paidAt), "dd MMM yyyy")
                : format(new Date(), "dd MMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Fee Table */}
      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-y border-slate-200 bg-slate-100">
            <th className="px-4 py-2 text-left font-semibold text-slate-700">
              Description
            </th>
            <th className="px-4 py-2 text-right font-semibold text-slate-700">
              Amount (PKR)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="px-4 py-2">Tuition Fee</td>
            <td className="px-4 py-2 text-right">
              {data.tuitionFee.toLocaleString()}
            </td>
          </tr>
          {data.examFund > 0 && (
            <tr>
              <td className="px-4 py-2">Exam Fund</td>
              <td className="px-4 py-2 text-right">
                {data.examFund.toLocaleString()}
              </td>
            </tr>
          )}
          {data.computerLabFund > 0 && (
            <tr>
              <td className="px-4 py-2">Computer Lab Fund</td>
              <td className="px-4 py-2 text-right">
                {data.computerLabFund.toLocaleString()}
              </td>
            </tr>
          )}
          {data.admissionFee > 0 && (
            <tr>
              <td className="px-4 py-2">Admission Fee</td>
              <td className="px-4 py-2 text-right">
                {data.admissionFee.toLocaleString()}
              </td>
            </tr>
          )}

          {/* Totals */}
          <tr className="bg-slate-50 font-medium">
            <td className="px-4 py-2">Subtotal</td>
            <td className="px-4 py-2 text-right">
              {(
                data.tuitionFee +
                data.examFund +
                data.computerLabFund +
                data.studentIdCardFee +
                data.infoAndCallsFee +
                data.admissionFee
              ).toLocaleString()}
            </td>
          </tr>
          {data.lateFee > 0 && (
            <tr className="text-orange-600">
              <td className="px-4 py-2">Late Fee</td>
              <td className="px-4 py-2 text-right">
                +{data.lateFee.toLocaleString()}
              </td>
            </tr>
          )}
          {data.discount > 0 && (
            <tr className="text-red-600">
              <td className="px-4 py-2">Discount</td>
              <td className="px-4 py-2 text-right">
                -{data.discount.toLocaleString()}
              </td>
            </tr>
          )}
          <tr
            className={cn(
              "border-t-2 border-slate-300 text-lg font-bold",
              statusColor,
            )}
          >
            <td className="px-4 py-3">
              {data.isPaid ? "TOTAL PAID" : "NET PAYABLE"}
            </td>
            <td className="px-4 py-3 text-right">
              {data.isPaid
                ? data.totalPaid.toLocaleString()
                : data.totalDue.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer Signature Area */}
      <div className="mt-12 flex items-end justify-between border-t pt-8 text-sm text-muted-foreground">
        <div className="w-32 text-center">
          <div className="border-t border-slate-400 pt-1">Accountant</div>
        </div>
        <div className="w-32 text-center">
          <div className="border-t border-slate-400 pt-1">Principal</div>
        </div>
      </div>
    </div>
  );
});
FeeVoucher.displayName = "FeeVoucher";
