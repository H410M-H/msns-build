"use client";

import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { api } from "~/trpc/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { LateFeeDialog } from "~/components/forms/fee/late-fee-dialog"; // Corrected path assumption
import { type ExportData, exportToCSV } from "~/lib/export-utils";
import { FeeWaiverDialog } from "~/components/forms/fee/fee-waiver-dialog"; // Corrected path assumption
import { FeeReceipt } from "../forms/fee/fee-reciept";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { cn } from "~/lib/utils";

export type FeeProps = {
  tuitionFee: number;
  examFund: number;
  computerLabFund?: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  admissionFee: number;
  type?: string;
  level?: string;
};

export type ClassFeeProps = {
  sfcId: string;
  studentClassId: string;
  feeId: string;
  discount: number;
  discountByPercent: number;
  discountDescription: string;
  tuitionPaid: boolean;
  examFundPaid: boolean;
  computerLabPaid: boolean;
  studentIdCardPaid: boolean;
  infoAndCallsPaid: boolean;
  month?: number;
  year?: number;
  lateFee?: number;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fees: FeeProps;
  studentClass: {
    student: {
      studentId: string;
      registrationNumber: string;
      studentName: string;
      fatherMobile?: string;
    };
    class?: {
      grade: string;
      section: string;
    };
  };
};

interface ClassFeeTableProps {
  classId: string;
  sessionId: string;
}

const months = [
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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function ClassFeeTable({
  classId,
  sessionId: _sessionId,
}: ClassFeeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const utils = api.useUtils();

  const {
    data: classFeesData,
    isLoading,
    refetch,
  } = api.fee.getClassFees.useQuery(
    { classId, year: selectedYear },
    { refetchOnWindowFocus: false, enabled: !!classId },
  );

  const classFees = useMemo(() => {
    // Robust check for undefined data
    if (!classFeesData?.studentClasses) {
      return [] as ClassFeeProps[];
    }

    // Explicitly typed flatMap to avoid implicit 'any'
    const assignments = classFeesData.studentClasses.flatMap((sc) => {
      if (!sc.FeeStudentClass) return [];

      return sc.FeeStudentClass.map((f) => ({
        ...f,
        studentClass: {
          student: sc.Students,
          class: { grade: "", section: "" },
        },
      })) as ClassFeeProps[];
    });

    return assignments.filter((f) => f.month === selectedMonth);
  }, [classFeesData, selectedMonth]);

  const { mutateAsync: updatePayment } = api.fee.updateFeePayment.useMutation({
    onSuccess: async () => {
      // Optional: await utils.fee.getClassFees.invalidate()
    },
  });

const handleBatchUpdate = async (markAllPaid: boolean) => {
  const selectedIds = Object.keys(rowSelection);
  if (selectedIds.length === 0) return;

  setIsBatchUpdating(true);
  try {
    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

    const promises = selectedRows.map((row) => 
      updatePayment({
        feeStudentClassId: row.sfcId,
        tuitionPaid: markAllPaid,
        examFundPaid: markAllPaid,
        computerLabPaid: markAllPaid,
        studentIdCardPaid: markAllPaid,
        infoAndCallsPaid: markAllPaid,
        paidAt: markAllPaid ? new Date() : undefined, 
      })
    );

    await Promise.all(promises);
    toast.success(`Successfully updated ${selectedRows.length} students`);
    setRowSelection({});
    await utils.fee.getClassFees.invalidate();
  } catch {
    toast.error("Batch update encountered an error");
  } finally {
    setIsBatchUpdating(false);
  }
};

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePaymentToggle = async (
    sfcId: string,
    feeType:
      | "tuition"
      | "examFund"
      | "computerLab"
      | "studentIdCard"
      | "infoAndCalls",
    paid: boolean,
  ) => {
    const payload: {
      feeStudentClassId: string;
      tuitionPaid?: boolean;
      examFundPaid?: boolean;
      computerLabPaid?: boolean;
      studentIdCardPaid?: boolean;
      infoAndCallsPaid?: boolean;
    } = { feeStudentClassId: sfcId };

    switch (feeType) {
      case "tuition":
        payload.tuitionPaid = paid;
        break;
      case "examFund":
        payload.examFundPaid = paid;
        break;
      case "computerLab":
        payload.computerLabPaid = paid;
        break;
      case "studentIdCard":
        payload.studentIdCardPaid = paid;
        break;
      case "infoAndCalls":
        payload.infoAndCallsPaid = paid;
        break;
    }

    try {
      await updatePayment(payload);
      await utils.fee.getClassFees.invalidate();
      toast.success("Payment status updated");
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const calculateTotalFee = (fee: FeeProps, lateFee = 0): number => {
    return (
      fee.tuitionFee +
      fee.examFund +
      (fee.computerLabFund ?? 0) +
      fee.studentIdCardFee +
      fee.infoAndCallsFee +
      lateFee
    );
  };

  const calculatePaidFee = (classFee: ClassFeeProps): number => {
    const { fees } = classFee;
    let paidTotal = 0;

    if (classFee.tuitionPaid) paidTotal += fees.tuitionFee;
    if (classFee.examFundPaid) paidTotal += fees.examFund;
    if (classFee.computerLabPaid) paidTotal += fees.computerLabFund ?? 0;
    if (classFee.studentIdCardPaid) paidTotal += fees.studentIdCardFee;
    if (classFee.infoAndCallsPaid) paidTotal += fees.infoAndCallsFee;

    return Math.max(paidTotal - classFee.discount, 0);
  };

  const columns: ColumnDef<ClassFeeProps>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "studentClass.student.registrationNumber",
      header: "Reg. No.",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          {row.original.studentClass.student.registrationNumber}
        </Badge>
      ),
    },
    {
      accessorKey: "studentClass.student.studentName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.studentClass.student.studentName}
        </span>
      ),
    },
    {
      id: "feeBreakdown",
      header: "Payment Status",
      cell: ({ row }) => {
        const fee = row.original.fees;
        const items = [
          {
            label: "Tuition",
            value: fee.tuitionFee,
            paid: row.original.tuitionPaid,
            type: "tuition" as const,
            isAnnual: false,
          },
          {
            label: "Exam",
            value: fee.examFund,
            paid: row.original.examFundPaid,
            type: "examFund" as const,
            isAnnual: true,
          },
          {
            label: "Lab",
            value: fee.computerLabFund ?? 0,
            paid: row.original.computerLabPaid,
            type: "computerLab" as const,
            isAnnual: true,
          },
          {
            label: "ID",
            value: fee.studentIdCardFee,
            paid: row.original.studentIdCardPaid,
            type: "studentIdCard" as const,
            isAnnual: true,
          },
          {
            label: "Info",
            value: fee.infoAndCallsFee,
            paid: row.original.infoAndCallsPaid,
            type: "infoAndCalls" as const,
            isAnnual: true,
          },
        ];

        return (
          <div className="flex flex-wrap gap-1">
            {items.map((item) => (
              <Badge
                key={item.label}
                variant={item.paid ? "default" : "destructive"}
                className={cn(
                  "cursor-pointer px-1.5 py-0 text-[10px]",
                  item.paid
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-500 hover:bg-rose-600",
                  item.isAnnual && item.paid
                    ? "ring-1 ring-emerald-400 ring-offset-1"
                    : null,
                )}
                onClick={() =>
                  handlePaymentToggle(row.original.sfcId, item.type, !item.paid)
                }
              >
                {item.paid ? (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {item.label}
                {item.isAnnual ? (
                  <span className="ml-1 text-[8px] opacity-70">(Y)</span>
                ) : null}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "totalFee",
      header: "Total Fee",
      cell: ({ row }) => {
        const baseFee = calculateTotalFee(row.original.fees, 0);
        const discount =
          row.original.discount ||
          (row.original.discountByPercent > 0
            ? (baseFee * row.original.discountByPercent) / 100
            : 0);
        const lateFee = row.original.lateFee ?? 0;
        const total = baseFee - discount + lateFee;

        return (
          <div>
            <span className="font-semibold">Rs. {total.toLocaleString()}</span>
            {discount > 0 && (
              <span className="block text-xs text-purple-600">
                -Rs. {discount.toLocaleString()} waiver
              </span>
            )}
            {lateFee > 0 && (
              <span className="block text-xs text-orange-600">
                +Rs. {lateFee.toLocaleString()} late
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "totalPaid",
      header: "Paid",
      cell: ({ row }) => {
        const paidFee = calculatePaidFee(row.original);
        const baseFee = calculateTotalFee(
          row.original.fees,
          row.original.lateFee ?? 0,
        );
        const discount =
          row.original.discount ||
          (row.original.discountByPercent > 0
            ? (baseFee * row.original.discountByPercent) / 100
            : 0);
        const total = baseFee - discount;
        const isPaid = paidFee >= total;

        return (
          <div className={isPaid ? "text-emerald-600" : "text-orange-600"}>
            <span className="font-semibold">
              Rs. {paidFee.toLocaleString()}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const baseFee = calculateTotalFee(row.original.fees, 0);
        const dueDate = new Date(
          row.original.year ?? currentYear,
          (row.original.month ?? 1) - 1,
          10,
        );

        return (
          <div className="flex items-center gap-1">
            <LateFeeDialog
              sfcId={row.original.sfcId}
              studentName={row.original.studentClass.student.studentName}
              currentLateFee={row.original.lateFee ?? 0}
              baseFee={baseFee}
              dueDate={dueDate}
              onUpdate={handleRefresh}
            />
            <FeeWaiverDialog
              sfcId={row.original.sfcId}
              studentName={row.original.studentClass.student.studentName}
              baseFee={baseFee}
              currentDiscount={row.original.discount}
              currentDiscountPercent={row.original.discountByPercent}
              currentDescription={row.original.discountDescription}
              onUpdate={handleRefresh}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Printer className="h-4 w-4" />
                  Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Fee Receipt</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[800px]">
                  <FeeReceipt
                    student={{
                      studentId: row.original.studentClass.student.studentId,
                      studentName:
                        row.original.studentClass.student.studentName,
                      registrationNumber:
                        row.original.studentClass.student.registrationNumber,
                      fatherName: "-",
                      fatherMobile:
                        row.original.studentClass.student.fatherMobile ??
                        "0000-000000000",
                    }}
                    entry={{
                      sfcId: row.original.sfcId,
                      month: row.original.month,
                      year: row.original.year,
                      baseFee: 0,
                      discountAmount: row.original.discount,
                      totalDue: 0,
                      paidAmount: 0,
                      paidAt: row.original.paidAt,
                      fees: {
                        level: row.original.fees.level ?? "-",
                        tuitionFee: row.original.fees.tuitionFee ?? "-",
                        examFund: row.original.fees.examFund,
                        computerLabFund: row.original.fees.computerLabFund,
                        studentIdCardFee: row.original.fees.studentIdCardFee,
                        infoAndCallsFee: row.original.fees.infoAndCallsFee,
                        admissionFee: row.original.fees.admissionFee,
                      },
                    }}
                    className={row.original.studentClass.class?.grade ?? "-"}
                    section={row.original.studentClass.class?.section ?? "-"}
                  />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: classFees ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  const selectedRowsCount = Object.keys(rowSelection).length;

  const totals = useMemo(() => {
    const data = classFees ?? [];
    return {
      totalFee: data.reduce((sum: number, f: ClassFeeProps) => {
        const baseFee = calculateTotalFee(f.fees, f.lateFee ?? 0);
        const discount =
          f.discount ||
          (f.discountByPercent > 0 ? (baseFee * f.discountByPercent) / 100 : 0);
        return sum + baseFee - discount;
      }, 0),
      totalPaid: data.reduce(
        (sum: number, f: ClassFeeProps) => sum + calculatePaidFee(f),
        0,
      ),
    };
  }, [classFees]);

  const handleExport = () => {
    const data = classFees ?? [];
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData: ExportData = {
      columns: [
        { key: "regNo", label: "Reg. No.", width: 15 },
        { key: "studentName", label: "Student Name", width: 25 },
        { key: "tuition", label: "Tuition", width: 12 },
        { key: "examFund", label: "Exam Fund", width: 12 },
        { key: "computerLab", label: "Computer Lab", width: 12 },
        { key: "idCard", label: "ID Card", width: 12 },
        { key: "infoAndCalls", label: "Info & Calls", width: 12 },
        { key: "discount", label: "Discount", width: 12 },
        { key: "lateFee", label: "Late Fee", width: 12 },
        { key: "totalFee", label: "Total Fee", width: 15 },
        { key: "paidAmount", label: "Paid", width: 15 },
        { key: "status", label: "Status", width: 10 },
      ],
      rows: data.map((f: ClassFeeProps) => {
        const baseFee = calculateTotalFee(f.fees, 0);
        const discount =
          f.discount ||
          (f.discountByPercent > 0 ? (baseFee * f.discountByPercent) / 100 : 0);
        const total = baseFee - discount + (f.lateFee ?? 0);
        const paid = calculatePaidFee(f);
        const allPaid =
          f.tuitionPaid &&
          f.examFundPaid &&
          f.computerLabPaid &&
          f.studentIdCardPaid &&
          f.infoAndCallsPaid;

        return {
          regNo: f.studentClass.student.registrationNumber,
          studentName: f.studentClass.student.studentName,
          tuition: f.tuitionPaid ? f.fees.tuitionFee : 0,
          examFund: f.examFundPaid ? f.fees.examFund : 0,
          computerLab: f.computerLabPaid ? (f.fees.computerLabFund ?? 0) : 0,
          idCard: f.studentIdCardPaid ? f.fees.studentIdCardFee : 0,
          infoAndCalls: f.infoAndCallsPaid ? f.fees.infoAndCallsFee : 0,
          discount,
          lateFee: f.lateFee ?? 0,
          totalFee: total,
          paidAmount: paid,
          status: allPaid ? "Paid" : "Pending",
        };
      }),
      sheetName: `Fee-${months[selectedMonth - 1]?.label}-${selectedYear}`,
      title: `Class Fee Report - ${months[selectedMonth - 1]?.label} ${selectedYear}`,
    };

    exportToCSV(
      exportData,
      `class-fee-${months[selectedMonth - 1]?.label}-${selectedYear}`,
    );
    toast.success("Fee data exported successfully");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-[200px] bg-white pl-9"
            />
          </div>
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[100px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedRowsCount > 0 && (
            <>
              <Button
                size="sm"
                onClick={() => handleBatchUpdate(true)}
                disabled={isBatchUpdating}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isBatchUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Mark ${selectedRowsCount} Paid`
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchUpdate(false)}
                disabled={isBatchUpdating}
              >
                Mark Unpaid
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  No fee records found for this month
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 sm:flex-row">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-500">Total Expected</p>
            <p className="font-bold text-slate-900">
              Rs. {totals.totalFee.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Collected</p>
            <p className="font-bold text-emerald-600">
              Rs. {totals.totalPaid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="font-bold text-orange-600">
              Rs. {(totals.totalFee - totals.totalPaid).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
