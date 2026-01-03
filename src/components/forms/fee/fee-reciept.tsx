"use client";

import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Printer, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import * as jsPDF from "jspdf";
import * as html2canvas from "html2canvas-pro";

interface FeeReceiptProps {
  student: {
    studentId: string;
    studentName: string;
    registrationNumber: string;
    fatherName: string;
    fatherMobile: string;
  };
  entry: {
    sfcId: string;
    month?: number | null;
    year?: number | null;
    baseFee: number;
    discountAmount: number;
    totalDue: number;
    paidAmount: number;
    paidAt?: Date | null;
    fees: {
      level: string;
      tuitionFee: number;
      examFund: number;
      computerLabFund?: number | null;
      studentIdCardFee: number;
      infoAndCallsFee: number;
      admissionFee: number;
    };
  };
  className: string;
  section: string;
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
];

export function FeeReceipt({
  student,
  entry,
  className,
  section,
}: FeeReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - ${student.studentName}</title>
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
    `);
    printWindow.document.close();
  };

  const handleGeneratePDF = async () => {
    if (!receiptRef.current) return;

    try {
      setIsGenerating(true);
      const element = receiptRef.current;

      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF.default({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(
        `Fee_Receipt_${student.studentName}_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const receiptNo = `RCP-${entry.sfcId.slice(-8).toUpperCase()}`;

  return (
    <div className="space-y-4">
      {/* Receipt Container */}
      <div
        ref={receiptRef}
        className="mx-auto max-w-[210mm] rounded-lg border bg-white p-8 shadow-xs"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
            School Management System
          </h1>
          <p className="text-slate-600">Fee Payment Receipt</p>
          <Separator className="my-4" />
        </div>

        {/* Receipt Info */}
        <div className="mb-8 flex justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-slate-500">
              Receipt No
            </p>
            <p className="font-mono text-lg font-bold">{receiptNo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-wider text-slate-500">
              Date
            </p>
            <p className="font-medium">
              {entry.paidAt
                ? format(new Date(entry.paidAt), "dd MMM yyyy")
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Student Info */}
        <div className="mb-8 rounded-lg border border-slate-100 bg-slate-50 p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Student Details
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-900">
                {student.studentName}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Reg. No</span>
              <span className="font-mono text-slate-900">
                {student.registrationNumber}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Class</span>
              <span className="font-medium text-slate-900">
                {className} - {section}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-500">Father Name</span>
              <span className="font-medium text-slate-900">
                {student.fatherName}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Fee Details ({months[(entry.month ?? 1) - 1]} {entry.year})
          </h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="rounded-bl-md rounded-tl-md p-3 text-left font-semibold">
                  Description
                </th>
                <th className="rounded-br-md rounded-tr-md p-3 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3">Tuition Fee</td>
                <td className="p-3 text-right">
                  Rs. {entry.fees.tuitionFee.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="p-3">Exam Fund</td>
                <td className="p-3 text-right">
                  Rs. {entry.fees.examFund.toLocaleString()}
                </td>
              </tr>
              {(entry.fees.computerLabFund && entry.fees.computerLabFund > 0) ? (
                <tr>
                  <td className="p-3">Computer Lab Fund</td>
                  <td className="p-3 text-right">
                    Rs. {entry.fees.computerLabFund.toLocaleString()}
                  </td>
                </tr>
              ) : null}
              <tr>
                <td className="p-3">Info & Calls Fee</td>
                <td className="p-3 text-right">
                  Rs. {entry.fees.infoAndCallsFee.toLocaleString()}
                </td>
              </tr>

              <tr className="bg-slate-50 font-semibold">
                <td className="p-3">Subtotal</td>
                <td className="p-3 text-right">
                  Rs. {entry.baseFee.toLocaleString()}
                </td>
              </tr>

              {entry.discountAmount > 0 && (
                <tr className="text-red-600">
                  <td className="p-3">Discount</td>
                  <td className="p-3 text-right">
                    - Rs. {entry.discountAmount.toLocaleString()}
                  </td>
                </tr>
              )}

              <tr className="bg-emerald-50 text-base font-bold text-emerald-800">
                <td className="rounded-l-md p-4">TOTAL PAID</td>
                <td className="rounded-r-md p-4 text-right">
                  Rs. {entry.paidAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          <p>This is a computer-generated receipt.</p>
          <p>Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>
    </div>
  );
}
