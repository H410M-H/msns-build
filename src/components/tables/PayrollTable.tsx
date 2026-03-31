// File: src/components/tables/PayrollTable.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  CheckCircle,
  Clock,
  MoreHorizontal,
  Printer,
  Download,
  Eye,
  Loader2,
  Zap,
  FileText,
  Trash2,
  Banknote,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { toast } from "~/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AnnualSalaryDialog } from "../blocks/salary/AnnualSalaryDialog";

// Defined interface based on the query output
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
  Employees: {
    employeeId: string;
    employeeName: string;
    designation: string;
    registrationNumber: string;
  };
}

// Interface for employees who don't have a salary record yet
interface UnpaidEmployee {
  employeeId: string;
  employeeName: string;
  designation: string;
  registrationNumber: string;
}

interface PayrollTableProps {
  month: number;
  year: number;
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

export function PayrollTable({ month, year }: PayrollTableProps) {
  const [previewRecord, setPreviewRecord] = useState<SalaryRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // State for Annual Summary
  const [annualEmployee, setAnnualEmployee] = useState<{
    id: string;
    name: string;
    designation: string;
    registrationNumber: string;
  } | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const slipRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  // 1. Get Session ID
  const { data: sessions } = api.session.getSessions.useQuery();
  const currentSessionId = sessions?.[0]?.sessionId;

  // 2. Fetch Existing Salaries
  const { data: salaryData, isLoading: isLoadingSalaries } =
    api.salary.getAll.useQuery(
      {
        month,
        year,
        sessionId: currentSessionId,
        limit: 100,
      },
      { enabled: !!currentSessionId },
    );

  // 3. Fetch Employees WITHOUT Salary Records
  const { data: missingEmployees, isLoading: isLoadingMissing } =
    api.salary.getUnpaidEmployees.useQuery(
      {
        month,
        year,
        sessionId: currentSessionId ?? "",
      },
      { enabled: !!currentSessionId },
    );

  // --- Mutations ---

  const createSalaryMutation = api.salary.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Payroll Generated",
        description: "Salary record created as PENDING.",
      });
      void utils.salary.getAll.invalidate();
      void utils.salary.getUnpaidEmployees.invalidate();
      setGeneratingId(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setGeneratingId(null);
    },
  });

  const bulkGenerateMutation = api.salary.generateMonthlySalaries.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Bulk Generation Complete",
        description: `Generated ${data.generatedCount} records.`,
      });
      void utils.salary.getAll.invalidate();
      void utils.salary.getUnpaidEmployees.invalidate();
      setIsBulkGenerating(false);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setIsBulkGenerating(false);
    },
  });

  const paySalaryMutation = api.salary.update.useMutation({
    onSuccess: () => {
      toast({ title: "Status Updated", description: "Salary marked as PAID" });
      void utils.salary.getAll.invalidate();
    },
  });

  const deleteSalaryMutation = api.salary.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Salary record deleted. Employee moved to Unpaid list.",
      });
      void utils.salary.getAll.invalidate();
      void utils.salary.getUnpaidEmployees.invalidate();
      setSelectedIds([]);
    },
  });

  const bulkDeleteMutation = api.salary.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Bulk Deleted",
        description: `${data.count} salary records deleted.`,
      });
      void utils.salary.getAll.invalidate();
      void utils.salary.getUnpaidEmployees.invalidate();
      setSelectedIds([]);
    },
  });

  // --- Handlers ---

  const handleGeneratePayroll = (employeeId: string) => {
    if (!currentSessionId)
      return toast({ title: "Error", description: "No active session found" });

    setGeneratingId(employeeId);
    createSalaryMutation.mutate({
      employeeId,
      amount: 0,
      month,
      year,
      status: "PENDING",
      sessionId: currentSessionId,
      deductions: 0,
      allowances: 0,
      bonus: 0,
    });
  };

  const handleBulkGenerate = () => {
    if (!currentSessionId)
      return toast({ title: "Error", description: "No active session found" });
    if (
      confirm(
        "This will generate PENDING payroll records for all employees who don't have one yet. Continue?",
      )
    ) {
      setIsBulkGenerating(true);
      bulkGenerateMutation.mutate({
        month,
        year,
        sessionId: currentSessionId,
      });
    }
  };

  const handlePay = (id: string) => {
    paySalaryMutation.mutate({ id, status: "PAID", paymentDate: new Date() });
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Are you sure? This will remove the payroll record and move the employee back to the 'Not Generated' list.",
      )
    ) {
      deleteSalaryMutation.mutate({ id });
    }
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Delete ${selectedIds.length} records? They will be moved back to 'Not Generated'.`,
      )
    ) {
      bulkDeleteMutation.mutate({ ids: selectedIds });
    }
  };

  // --- Selection Logic ---

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = salaryData?.salaries.map((s) => s.id) ?? [];
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // --- Data Combination ---
  const combinedData = useMemo(() => {
    const existing =
      salaryData?.salaries.map((s) => ({
        type: "existing" as const,
        data: s as unknown as SalaryRecord,
      })) ?? [];

    const missing =
      missingEmployees?.map((emp) => ({
        type: "missing" as const,
        data: emp as UnpaidEmployee,
      })) ?? [];

    return [...existing, ...missing].sort((a, b) => {
      const nameA =
        a.type === "existing"
          ? a.data.Employees.employeeName
          : a.data.employeeName;
      const nameB =
        b.type === "existing"
          ? b.data.Employees.employeeName
          : b.data.employeeName;
      return nameA.localeCompare(nameB);
    });
  }, [salaryData, missingEmployees]);

  // --- PDF Logic ---
  const handlePrint = () => {
    const content = slipRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(
      `<html><head><title>Payslip</title><script>window.onload=()=>{window.print();window.close();}</script><script src="https://cdn.tailwindcss.com"></script></head><body>${content.outerHTML}</body></html>`,
    );
    printWindow.document.close();
  };

  const handleDownloadPdf = async () => {
    if (!slipRef.current || !previewRecord) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        10,
        pdf.internal.pageSize.getWidth(),
        (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width,
      );
      pdf.save(`Payslip-${previewRecord.Employees.employeeName}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoadingSalaries || isLoadingMissing)
    return (
      <div className="flex animate-pulse flex-col items-center justify-center p-12 text-emerald-600 dark:text-emerald-500">
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p>Loading payroll data...</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Top Actions Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 backdrop-blur-sm transition-colors dark:border-emerald-500/10 dark:bg-card sm:flex-row sm:items-center sm:justify-between">
        {selectedIds.length > 0 ? (
          <div className="flex w-full items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-2 px-4 transition-all animate-in fade-in zoom-in-95 dark:border-red-500/20 dark:bg-red-500/10 sm:w-auto">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {selectedIds.length} records selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2 border-none bg-red-600 text-foreground shadow-md hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        ) : (
          <div className="hidden text-sm text-muted-foreground dark:text-muted-foreground sm:block">
            Showing all payroll records for{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {MONTHS[month - 1]} {year}
            </span>
          </div>
        )}

        {missingEmployees && missingEmployees.length > 0 && (
          <Button
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating}
            className="w-full gap-2 bg-emerald-600 text-foreground shadow-md transition-all hover:bg-emerald-700 dark:shadow-emerald-900/20 dark:hover:bg-emerald-500 sm:w-auto"
          >
            {isBulkGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Generate All Pending ({missingEmployees.length})
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-xl">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-slate-200 bg-slate-50 dark:border-emerald-500/20 dark:bg-emerald-950/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px] text-slate-600 dark:text-emerald-100/80">
                <Checkbox
                  checked={
                    salaryData?.salaries.length &&
                    selectedIds.length === salaryData?.salaries.length
                      ? true
                      : selectedIds.length > 0
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground dark:border-emerald-500/50"
                />
              </TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-emerald-100/80">
                Employee
              </TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-emerald-100/80">
                Designation
              </TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-emerald-100/80">
                Base Salary
              </TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-emerald-100/80">
                Allowances
              </TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-emerald-100/80">
                Deductions
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-600 dark:text-emerald-100/80">
                Net Payable
              </TableHead>
              <TableHead className="font-semibold text-slate-600 dark:text-emerald-100/80">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-600 dark:text-emerald-100/80">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-muted-foreground"
                >
                  No employees found for this period.
                </TableCell>
              </TableRow>
            ) : (
              combinedData.map((row) => {
                if (row.type === "missing") {
                  const emp = row.data;
                  return (
                    <TableRow
                      key={`missing-${emp.employeeId}`}
                      className="border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100 dark:border-emerald-500/10 dark:bg-card dark:hover:bg-emerald-900/10"
                    >
                      <TableCell>
                        <Checkbox
                          disabled
                          aria-label="Cannot select missing record"
                          className="opacity-50"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 dark:text-foreground">
                        {emp.employeeName}
                      </TableCell>
                      <TableCell className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {emp.designation}
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        className="text-center text-xs italic text-muted-foreground dark:text-muted-foreground"
                      >
                        Payroll not generated yet
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-slate-300 bg-slate-100 text-muted-foreground dark:border-slate-700 dark:bg-muted dark:text-muted-foreground"
                        >
                          <AlertCircle className="mr-1 h-3 w-3" /> Not Generated
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGeneratePayroll(emp.employeeId)}
                          disabled={generatingId === emp.employeeId}
                          className="h-7 gap-2 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                        >
                          {generatingId === emp.employeeId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <PlusCircle className="h-3 w-3" />
                          )}
                          Generate
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  const salary = row.data;
                  const netPay =
                    salary.amount +
                    (salary.allowances ?? 0) +
                    (salary.bonus ?? 0) -
                    (salary.deductions ?? 0);
                  const isSelected = selectedIds.includes(salary.id);

                  return (
                    <TableRow
                      key={salary.id}
                      data-state={isSelected ? "selected" : undefined}
                      className="border-slate-100 transition-colors hover:bg-slate-50 data-[state=selected]:bg-emerald-50 dark:border-emerald-500/10 dark:hover:bg-emerald-900/10 dark:data-[state=selected]:bg-emerald-900/20"
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectOne(salary.id, checked as boolean)
                          }
                          aria-label="Select row"
                          className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground dark:border-emerald-500/50"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-foreground">
                        {salary.Employees.employeeName}
                      </TableCell>
                      <TableCell className="text-xs font-medium uppercase text-muted-foreground dark:text-muted-foreground">
                        {salary.Employees.designation}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-700 dark:text-foreground">
                        {salary.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                        +{salary.allowances?.toLocaleString() ?? 0}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-rose-600 dark:text-rose-400">
                        -{salary.deductions?.toLocaleString() ?? 0}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-foreground">
                        Rs. {netPay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            salary.status === "PAID" ? "default" : "outline"
                          }
                          className={
                            salary.status === "PAID"
                              ? "border-0 bg-emerald-600 text-foreground hover:bg-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-400"
                          }
                        >
                          {salary.status === "PAID" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {salary.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {salary.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 border-emerald-200 bg-white text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                              onClick={() => handlePay(salary.id)}
                            >
                              <Banknote className="h-3.5 w-3.5" />
                              Pay
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-emerald-500/20 dark:hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => setPreviewRecord(salary)}
                                className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Slip
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setAnnualEmployee({
                                    id: salary.Employees.employeeId,
                                    name: salary.Employees.employeeName,
                                    designation: salary.Employees.designation,
                                    registrationNumber:
                                      salary.Employees.registrationNumber,
                                  })
                                }
                                className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
                              >
                                <FileText className="mr-2 h-4 w-4" /> Annual
                                Statement
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-200 dark:bg-emerald-500/20" />
                              <DropdownMenuItem
                                onClick={() => handleDelete(salary.id)}
                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-900/20 dark:focus:text-red-300"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }
              })
            )}
          </TableBody>
        </Table>
                      </div>
      </div>

      {/* Slip Preview Dialog */}
      <Dialog
        open={!!previewRecord}
        onOpenChange={(open) => !open && setPreviewRecord(null)}
      >
        <DialogContent className="max-w-3xl border-slate-200 bg-white text-slate-900 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
          <DialogHeader>
            <DialogTitle>Payslip Preview</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[70vh] justify-center overflow-auto rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-emerald-500/10 dark:bg-card">
            {previewRecord && (
              <div
                ref={slipRef}
                className="min-h-[140mm] w-[210mm] bg-white p-8 text-sm text-gray-800 shadow-md"
              >
                <div className="mb-6 border-b pb-4 text-center">
                  <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                    Academic Institute
                  </h1>
                  <p className="text-muted-foreground">Salary Slip</p>
                  <p className="mt-1 font-medium">
                    {MONTHS[previewRecord.month - 1]} {previewRecord.year}
                  </p>
                </div>
                <div className="mb-6 grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-muted-foreground">
                        Employee Name
                      </span>
                      <span className="font-semibold">
                        {previewRecord.Employees.employeeName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-muted-foreground">Designation</span>
                      <span>{previewRecord.Employees.designation}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-muted-foreground">Employee ID</span>
                      <span className="font-mono">
                        {previewRecord.Employees.registrationNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                      <span className="text-muted-foreground">
                        Payment Date
                      </span>
                      <span>
                        {previewRecord.paymentDate
                          ? new Date(
                              previewRecord.paymentDate,
                            ).toLocaleDateString()
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-6 rounded-sm border">
                  <div className="grid grid-cols-2 border-b bg-slate-100 p-2 font-semibold">
                    <div>Description</div>
                    <div className="text-right">Amount (PKR)</div>
                  </div>
                  <div className="flex justify-between border-b p-2">
                    <span>Base Salary</span>
                    <span>{previewRecord.amount.toLocaleString()}</span>
                  </div>
                  {(previewRecord.allowances ?? 0) > 0 && (
                    <div className="flex justify-between border-b p-2 text-green-700">
                      <span>Allowances</span>
                      <span>
                        +{(previewRecord.allowances ?? 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {(previewRecord.deductions ?? 0) > 0 && (
                    <div className="flex justify-between border-b p-2 text-red-600">
                      <span>Deductions</span>
                      <span>
                        -{(previewRecord.deductions ?? 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between bg-slate-50 p-4">
                    <span className="text-lg font-bold">Net Pay</span>
                    <span className="text-xl font-bold text-slate-900">
                      PKR{" "}
                      {(
                        previewRecord.amount +
                        (previewRecord.allowances ?? 0) +
                        (previewRecord.bonus ?? 0) -
                        (previewRecord.deductions ?? 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-12 text-center text-xs text-muted-foreground">
                  <p>Computer-generated document.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700 dark:hover:bg-emerald-500"
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

      {/* Annual Summary Dialog */}
      {annualEmployee && (
        <AnnualSalaryDialog
          open={!!annualEmployee}
          onOpenChange={(open) => !open && setAnnualEmployee(null)}
          employee={annualEmployee}
        />
      )}
    </div>
  );
}
