// File: src/components/tables/ClassFeeTable.tsx
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
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { LateFeeDialog } from "~/components/forms/fee/late-fee-dialog";
import { type ExportData, exportToCSV } from "~/lib/export-utils";
import { FeeWaiverDialog } from "~/components/forms/fee/fee-waiver-dialog";
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

// --- Types ---
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

// Type for the mutation payload to ensure type safety
type UpdateFeePayload = {
  feeStudentClassId: string;
  tuitionPaid?: boolean;
  examFundPaid?: boolean;
  computerLabPaid?: boolean;
  studentIdCardPaid?: boolean;
  infoAndCallsPaid?: boolean;
  paidAt?: Date;
};

// Valid fee types matching the columns
type FeeType =
  | "tuition"
  | "examFund"
  | "computerLab"
  | "studentIdCard"
  | "infoAndCalls";

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
    if (!classFeesData?.studentClasses) {
      return [] as ClassFeeProps[];
    }

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
      // Optimistic update handled by invalidation
    },
  });

  const handleBatchUpdate = async (markAllPaid: boolean) => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    setIsBatchUpdating(true);
    try {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

      const promises = selectedRows.map((row) =>
        updatePayment({
          feeStudentClassId: row.sfcId,
          tuitionPaid: markAllPaid,
          examFundPaid: markAllPaid,
          computerLabPaid: markAllPaid,
          studentIdCardPaid: markAllPaid,
          infoAndCallsPaid: markAllPaid,
          paidAt: markAllPaid ? new Date() : undefined,
        }),
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

  // Fixed: Strictly typed handlePaymentToggle to remove 'any'
  const handlePaymentToggle = async (
    sfcId: string,
    feeType: FeeType,
    paid: boolean,
  ) => {
    // Initialize payload with correct type
    const payload: UpdateFeePayload = { feeStudentClassId: sfcId };

    // Map feeType to specific payload properties
    if (feeType === "tuition") payload.tuitionPaid = paid;
    else if (feeType === "examFund") payload.examFundPaid = paid;
    else if (feeType === "computerLab") payload.computerLabPaid = paid;
    else if (feeType === "studentIdCard") payload.studentIdCardPaid = paid;
    else if (feeType === "infoAndCalls") payload.infoAndCallsPaid = paid;

    // Set paidAt date if marking as paid
    if (paid) payload.paidAt = new Date();

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

  // --- Columns Definition ---
  const columns: ColumnDef<ClassFeeProps>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground dark:border-emerald-500/50"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground dark:border-emerald-500/50"
        />
      ),
    },
    {
      accessorKey: "studentClass.student.registrationNumber",
      header: "Reg. No.",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-slate-50 font-mono text-slate-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          {row.original.studentClass.student.registrationNumber}
        </Badge>
      ),
    },
    {
      accessorKey: "studentClass.student.studentName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 dark:text-foreground">
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
          <div className="flex max-w-[250px] flex-wrap gap-1.5">
            {items.map((item) => (
              <Badge
                key={item.label}
                variant={item.paid ? "default" : "outline"}
                className={cn(
                  "cursor-pointer select-none border px-1.5 py-0.5 text-[10px] font-medium transition-all",
                  item.paid
                    ? "border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
                    : "border-slate-200 bg-white text-muted-foreground hover:bg-slate-50 hover:text-slate-600 dark:border-border dark:bg-transparent dark:text-muted-foreground dark:hover:bg-white/5 dark:hover:text-foreground",
                  item.isAnnual && item.paid
                    ? "ring-1 ring-emerald-400/30"
                    : null,
                )}
                onClick={() =>
                  handlePaymentToggle(row.original.sfcId, item.type, !item.paid)
                }
              >
                {item.paid ? (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3 opacity-50" />
                )}
                {item.label}
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
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-foreground">
              Rs. {total.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">
                -Rs. {discount.toLocaleString()} waiver
              </span>
            )}
            {lateFee > 0 && (
              <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">
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
          <div
            className={cn(
              "font-bold",
              isPaid
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            Rs. {paidFee.toLocaleString()}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-emerald-600 dark:text-muted-foreground dark:hover:text-emerald-400"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl border-slate-200 bg-white dark:border-emerald-500/20 dark:bg-card">
                <DialogHeader>
                  <DialogTitle className="dark:text-foreground">
                    Fee Receipt
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[70vh]">
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
        { key: "totalFee", label: "Total Fee", width: 15 },
        { key: "paidAmount", label: "Paid", width: 15 },
      ],
      rows: data.map((f: ClassFeeProps) => {
        const baseFee = calculateTotalFee(f.fees, 0);
        const discount =
          f.discount ||
          (f.discountByPercent > 0 ? (baseFee * f.discountByPercent) / 100 : 0);
        const total = baseFee - discount + (f.lateFee ?? 0);
        const paid = calculatePaidFee(f);
        return {
          regNo: f.studentClass.student.registrationNumber,
          studentName: f.studentClass.student.studentName,
          totalFee: total,
          paidAmount: paid,
        };
      }),
      sheetName: `Fee-${months[selectedMonth - 1]?.label}-${selectedYear}`,
      title: `Class Fee Report`,
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
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-border dark:bg-card">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full bg-slate-100 dark:bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-border dark:bg-card dark:backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-[200px] border-slate-200 bg-slate-50 pl-9 dark:border-border dark:bg-card dark:text-foreground"
            />
          </div>
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[140px] border-slate-200 bg-slate-50 dark:border-border dark:bg-card dark:text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:border-border dark:bg-card">
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
            <SelectTrigger className="w-[100px] border-slate-200 bg-slate-50 dark:border-border dark:bg-card dark:text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:border-border dark:bg-card">
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
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Button
                size="sm"
                onClick={() => handleBatchUpdate(true)}
                disabled={isBatchUpdating}
                className="bg-emerald-600 text-foreground hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
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
                className="dark:border-border dark:bg-card dark:text-foreground"
              >
                Mark Unpaid
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="dark:border-border dark:bg-card dark:text-foreground dark:hover:text-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-border dark:bg-card dark:shadow-xl dark:backdrop-blur-sm">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-slate-200 bg-slate-50 dark:border-border dark:bg-emerald-950/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 font-semibold text-slate-600 dark:text-emerald-100/80"
                  >
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
                <TableRow
                  key={row.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50 dark:border-border dark:hover:bg-white/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  className="h-32 text-center text-muted-foreground dark:text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="mb-2 h-8 w-8 opacity-20" />
                    <p>No fee records found for this period.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Footer / Summary */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-card dark:backdrop-blur-md sm:flex-row">
        <div className="flex gap-8 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
              Expected
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-foreground">
              Rs. {totals.totalFee.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
              Collected
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Rs. {totals.totalPaid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
              Outstanding
            </p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
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
            className="dark:border-border dark:bg-card dark:text-foreground"
          >
            Previous
          </Button>
          <span className="px-2 text-sm text-slate-600 dark:text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="dark:border-border dark:bg-card dark:text-foreground"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
