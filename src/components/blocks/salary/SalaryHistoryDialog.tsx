"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  Loader2,
  Printer,
  Plus,
  FileX,
  Banknote,
  Download,
  Eye,
  Building2,
  Phone,
  Mail,
  Globe,
  FileText,
} from "lucide-react";
import { toast } from "~/hooks/use-toast";
import * as jsPDF from "jspdf";
import * as html2canvas from "html2canvas-pro";
import { AnnualSalarySlip } from "./AnnualSalarySlip";

// Define proper type for salary record
interface SalaryRecord {
  id: string;
  amount: number;
  allowances: number | null;
  bonus: number | null;
  deductions: number | null;
  status: "PAID" | "PENDING" | "PARTIAL";
  month: number;
  year: number;
  paymentDate: Date | null;
}

interface SalaryHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  designation: string;
  registrationNumber: string;
  currentSessionId: string;
  baseSalary: number;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function SalaryHistoryDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  designation,
  registrationNumber,
  currentSessionId,
  baseSalary,
}: SalaryHistoryDialogProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // States for Slip Preview/Download
  const [previewRecord, setPreviewRecord] = useState<SalaryRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  // State for Annual Slip Preview
  const [showAnnualPreview, setShowAnnualPreview] = useState(false);
  const annualRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  const { data: history, isLoading } =
    api.salary.getEmployeeSalarySummary.useQuery(
      { employeeId },
      { enabled: open },
    );

  const createSalaryMutation = api.salary.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary record generated successfully.",
      });
      void utils.salary.getEmployeeSalarySummary.invalidate();
      setIsGenerating(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message });
      setIsGenerating(false);
    },
  });

  // Mutation to update salary status
  const updateSalaryMutation = api.salary.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Payment Recorded",
        description: "Salary marked as PAID.",
      });
      void utils.salary.getEmployeeSalarySummary.invalidate();
      setIsUpdating(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setIsUpdating(null);
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    createSalaryMutation.mutate({
      employeeId,
      amount: baseSalary,
      month: Number(selectedMonth),
      year: Number(selectedYear),
      sessionId: currentSessionId,
      status: "PENDING",
      deductions: 0,
      allowances: 0,
      bonus: 0,
    });
  };

  const handleMarkAsPaid = (id: string) => {
    setIsUpdating(id);
    updateSalaryMutation.mutate({
      id,
      status: "PAID",
      paymentDate: new Date(),
    });
  };

  // --- HTML to PDF Generation Logic ---
  const handlePrint = (ref: React.RefObject<HTMLDivElement>) => {
    const content = ref.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Document</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; -webkit-print-color-adjust: exact; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
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

  const handleDownloadPdf = async (
    ref: React.RefObject<HTMLDivElement>,
    filename: string,
  ) => {
    if (!ref.current) return;

    try {
      setIsDownloading(true);
      const element = ref.current;

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
      pdf.save(filename);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({ title: "Error", description: "Failed to generate PDF" });
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter records for the Annual Slip
  const annualRecords =
    history?.records.filter((r) => r.year === Number(selectedYear)) ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Salary Details: {employeeName}</DialogTitle>
            <DialogDescription>
              View payment history and generate individual salary slips.
            </DialogDescription>
          </DialogHeader>

          {/* Generator & Actions Section */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-lg border bg-slate-50 p-4 sm:flex-row">
            {/* Left: Generator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Select Period:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[110px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[90px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="sm"
                className="ml-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </div>

            {/* Right: Annual Slip */}
            <Button
              variant="outline"
              onClick={() => setShowAnnualPreview(true)}
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <FileText className="h-4 w-4" />
              Annual Statement ({selectedYear})
            </Button>
          </div>

          {/* History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Base Amount</TableHead>
                  <TableHead>Additions</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading history...
                    </TableCell>
                  </TableRow>
                ) : !history?.records || history.records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileX className="h-8 w-8 text-foreground" />
                        No salary records found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.records.map((record) => {
                    const typedRecord = record as unknown as SalaryRecord;
                    const additions =
                      (typedRecord.allowances ?? 0) + (typedRecord.bonus ?? 0);
                    const net =
                      typedRecord.amount +
                      additions -
                      (typedRecord.deductions ?? 0);

                    return (
                      <TableRow key={typedRecord.id}>
                        <TableCell>
                          {MONTHS[typedRecord.month - 1]?.label}{" "}
                          {typedRecord.year}
                        </TableCell>
                        <TableCell>
                          {typedRecord.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-green-600">
                          +{additions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600">
                          -{typedRecord.deductions?.toLocaleString() ?? 0}
                        </TableCell>
                        <TableCell className="font-bold">
                          {net.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              typedRecord.status === "PAID"
                                ? "default"
                                : "outline"
                            }
                          >
                            {typedRecord.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Payment Button */}
                            {typedRecord.status !== "PAID" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsPaid(typedRecord.id)}
                                disabled={isUpdating === typedRecord.id}
                                title="Mark as Paid"
                                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                {isUpdating === typedRecord.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Banknote className="h-4 w-4" />
                                )}
                              </Button>
                            )}

                            {/* Slip Preview Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewRecord(typedRecord)}
                              title="View & Download Slip"
                            >
                              <Eye className="h-4 w-4 text-slate-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* -------------------- ANNUAL SLIP PREVIEW DIALOG -------------------- */}
      <Dialog open={showAnnualPreview} onOpenChange={setShowAnnualPreview}>
        <DialogContent className="h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Annual Salary Statement ({selectedYear})</DialogTitle>
          </DialogHeader>

          <div className="flex h-full justify-center overflow-auto rounded-md bg-gray-100 p-6">
            <AnnualSalarySlip
              ref={annualRef}
              year={Number(selectedYear)}
              employee={{
                name: employeeName,
                designation: designation,
                registrationNumber: registrationNumber,
              }}
              records={annualRecords as unknown as SalaryRecord[]}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handlePrint(annualRef)}
              className="gap-2"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              onClick={() =>
                handleDownloadPdf(
                  annualRef,
                  `Annual-Statement-${employeeName}-${selectedYear}.pdf`,
                )
              }
              disabled={isDownloading}
              className="gap-2 bg-indigo-600 text-foreground hover:bg-indigo-700"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Annual PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------- MONTHLY SLIP PREVIEW DIALOG -------------------- */}
      <Dialog
        open={!!previewRecord}
        onOpenChange={(open) => !open && setPreviewRecord(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[80vh] justify-center overflow-auto rounded-md bg-gray-100 p-6">
            {/* The Slip Content to be Captured */}
            {previewRecord && (
              <div
                ref={slipRef}
                className="relative min-h-[140mm] w-[210mm] overflow-hidden border border-gray-200 bg-white p-8 text-sm text-gray-800 shadow-lg"
              >
                {/* Decorative Background Element */}
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-emerald-50 opacity-50" />

                {/* Header Section */}
                <div className="mb-6 flex items-start justify-between border-b-2 border-emerald-100 pb-6">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
                      alt="School Logo"
                      className="h-20 w-20 object-contain drop-shadow-sm"
                    />
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-emerald-900">
                        M. S. NAZ HIGH SCHOOL®
                      </h1>
                      <p className="font-medium text-emerald-600">
                        Excellence in Education
                      </p>
                      <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> G.T. Road, Ghakhar,
                          Pakistan
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
                    <div className="mb-2 inline-block rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-800">
                      SALARY SLIP
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {MONTHS[previewRecord.month - 1]?.label}{" "}
                      {previewRecord.year}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Ref: {previewRecord.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Employee Info Grid */}
                <div className="mb-8 rounded-lg border border-gray-100 bg-gray-50 p-5">
                  <h3 className="mb-4 border-b border-gray-200 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Employee Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Employee Name</span>
                      <span className="font-semibold text-gray-900">
                        {employeeName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Registration ID</span>
                      <span className="rounded border bg-white px-2 py-0.5 font-mono font-medium text-gray-900">
                        {registrationNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Designation</span>
                      <span className="font-medium text-gray-900">
                        {designation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Date</span>
                      <span className="font-medium text-gray-900">
                        {previewRecord.paymentDate
                          ? new Date(
                              previewRecord.paymentDate,
                            ).toLocaleDateString()
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financials Table */}
                <div className="mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-emerald-900 text-xs uppercase text-foreground">
                        <th className="rounded-tl-md px-4 py-2 text-left">
                          Description
                        </th>
                        <th className="px-4 py-2 text-right">Type</th>
                        <th className="rounded-tr-md px-4 py-2 text-right">
                          Amount (PKR)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 border-x border-b border-gray-200 text-sm">
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          Basic Salary
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">
                          Earning
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {previewRecord.amount.toLocaleString()}
                        </td>
                      </tr>

                      {(previewRecord.allowances ?? 0) > 0 && (
                        <tr className="bg-emerald-50/30">
                          <td className="px-4 py-3 text-emerald-700">
                            Allowances
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-emerald-600">
                            Addition
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-700">
                            +{(previewRecord.allowances ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {(previewRecord.bonus ?? 0) > 0 && (
                        <tr className="bg-emerald-50/30">
                          <td className="px-4 py-3 text-emerald-700">
                            Performance Bonus
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-emerald-600">
                            Addition
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-700">
                            +{(previewRecord.bonus ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      )}

                      {(previewRecord.deductions ?? 0) > 0 && (
                        <tr className="bg-red-50/30">
                          <td className="px-4 py-3 text-red-700">
                            Deductions / Tax
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-red-600">
                            Deduction
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-700">
                            -{(previewRecord.deductions ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-800 text-foreground">
                        <td className="rounded-bl-md px-6 py-4 text-lg font-bold">
                          NET PAYABLE
                        </td>
                        <td
                          colSpan={2}
                          className="rounded-br-md px-6 py-4 text-right text-xl font-bold"
                        >
                          <span className="mr-1 text-emerald-400">PKR</span>
                          {(
                            previewRecord.amount +
                            (previewRecord.allowances ?? 0) +
                            (previewRecord.bonus ?? 0) -
                            (previewRecord.deductions ?? 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Signatures */}
                <div className="mt-16 flex justify-between px-4 pt-8">
                  <div className="text-center">
                    <div className="mb-2 w-40 border-b border-gray-300"></div>
                    <p className="text-xs font-medium uppercase text-gray-500">
                      Employee Signature
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 w-40 border-b border-gray-300"></div>
                    <p className="text-xs font-medium uppercase text-gray-500">
                      Authority Signature
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 flex items-end justify-between border-t border-gray-100 pt-6 text-[10px] text-gray-400">
                  <div>
                    <p>
                      This document is system generated and does not require a
                      physical stamp.
                    </p>
                    <p className="mt-0.5">
                      Generated on: {new Date().toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> www.msns.edu.pk
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handlePrint(slipRef)}
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Printer className="h-4 w-4" /> Print Slip
            </Button>
            <Button
              onClick={() =>
                handleDownloadPdf(
                  slipRef,
                  `Payslip-${employeeName}-${previewRecord?.month}-${previewRecord?.year}.pdf`,
                )
              }
              disabled={isDownloading}
              className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
