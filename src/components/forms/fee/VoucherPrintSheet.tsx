"use client";

import React, { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";
import {
  PrintableVoucher,
  type PrintableVoucherData,
  type SchoolBankDetails,
  type SchoolInfo,
} from "./PrintableVoucher";
import { cn } from "~/lib/utils";

export interface VoucherPrintSheetProps {
  vouchers?: PrintableVoucherData[];
  data?: PrintableVoucherData[]; // alias for vouchers
  onClose?: () => void;
  title?: string;
  bankDetails?: SchoolBankDetails | null;
  schoolInfo?: Partial<SchoolInfo>;
  autoPrint?: boolean;
  className?: string;
}

export function VoucherPrintSheet({
  vouchers: rawVouchers,
  data: aliasVouchers,
  onClose,
  title = "Class Fee Vouchers Print Sheet",
  bankDetails,
  schoolInfo,
  autoPrint = false,
  className,
}: VoucherPrintSheetProps) {
  const vouchers = rawVouchers ?? aliasVouchers ?? [];

  useEffect(() => {
    if (autoPrint && vouchers.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, vouchers.length]);

  const handlePrint = () => {
    window.print();
  };

  // Derive Grade/Section Summary
  const gradeSectionSummary = React.useMemo(() => {
    if (vouchers.length === 0) return "No Vouchers";
    const set = new Set<string>();
    for (const v of vouchers) {
      const g = v.grade?.grade || "Class";
      const s = v.grade?.section || "All";
      set.add(`${g} - ${s}`);
    }
    const arr = Array.from(set);
    if (arr.length === 1) return arr[0];
    if (arr.length <= 3) return arr.join(", ");
    return `${arr.slice(0, 2).join(", ")} +${arr.length - 2} more`;
  }, [vouchers]);

  // Total payable summary
  const totalPayable = React.useMemo(() => {
    return vouchers.reduce((acc, v) => acc + (Number(v.breakdown?.netPayableBeforeDue) || 0), 0);
  }, [vouchers]);

  if (vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-slate-200 shadow-sm max-w-md mx-auto my-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Vouchers Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          There are no fee vouchers available in this print batch. Please select one or more vouchers from the fee management hub.
        </p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="mt-5">
            Close Preview
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("voucher-print-sheet-root min-h-screen bg-slate-100 print:bg-white print:min-h-0", className)}>
      {/* ========================================================= */}
      {/* Strict CSS Page Breaks for A4 Portrait Isolation */}
      {/* ========================================================= */}
      <style type="text/css" media="print">
        {`
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .voucher-page {
            break-after: page !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            max-height: 281mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .voucher-page:last-child {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
        `}
      </style>

      {/* Styled JSX fallback for Next.js App Router */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .voucher-page {
            break-after: page !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            max-height: 281mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .voucher-page:last-child {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* Top Action Toolbar (Hidden during print) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 shadow-xs backdrop-blur print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Class: <strong className="text-slate-800">{gradeSectionSummary}</strong>
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Total Vouchers: <span className="font-bold text-emerald-700">{vouchers.length}</span>
              {totalPayable > 0 && (
                <span className="ml-2 pl-2 border-l border-slate-200">
                  Total Payable: <span className="font-bold text-slate-800">Rs. {Math.round(totalPayable).toLocaleString("en-PK")}</span>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-1.5 text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print All Vouchers ({vouchers.length})</span>
          </Button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* Printable Voucher Pages Stream */}
      {/* ========================================================= */}
      <main className="py-6 px-4 print:p-0 print:m-0">
        <div className="mx-auto max-w-[210mm] space-y-6 print:space-y-0 print:max-w-none">
          {vouchers.map((voucher, index) => {
            const isLast = index === vouchers.length - 1;
            return (
              <div
                key={voucher.sfcId || voucher.voucherNumber || index}
                className={cn(
                  "voucher-page bg-white shadow-sm border border-slate-200 rounded p-2 print:p-0 print:border-none print:shadow-none print:rounded-none",
                  isLast ? "break-after-avoid" : "break-after-page"
                )}
              >
                <PrintableVoucher
                  data={voucher}
                  bankDetails={bankDetails}
                  schoolInfo={schoolInfo}
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default VoucherPrintSheet;
