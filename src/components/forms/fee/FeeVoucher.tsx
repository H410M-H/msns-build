import React from "react";
import { Separator } from "~/components/ui/separator";
import { format } from "date-fns";
import { cn, getParentagePrefix } from "~/lib/utils";

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
  gender?: string;
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
      <div className="mb-6 flex items-start justify-between border-b border-emerald-900/30 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="MSNS Logo"
            className="w-12 h-12 object-contain print:w-12 print:h-12 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-emerald-950 font-serif">
                M.S. Naz High School®
              </h1>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                Est. 2004
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-serif mt-0.5">
              Know Thyself • Pursuit of Excellence
            </p>
            <p className="text-[11px] text-muted-foreground">
              G.T. Road, Opp. Model Police Station, Ghakhar Mandi • BISE Gujranwala Code: 112199
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-emerald-900">{voucherTitle}</div>
          <div className="text-xs font-semibold text-muted-foreground">
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
            <span className="w-24 text-muted-foreground">
              {getParentagePrefix(data.gender)}:
            </span>
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
