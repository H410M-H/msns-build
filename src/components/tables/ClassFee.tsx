"use client";

import { useState, useMemo, useEffect } from "react";
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
import { ArrowUpDown, Download, FileSearch, RefreshCw } from "lucide-react";
import FeeAllotmentDialog from "../forms/fee/FeeAllot";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";

export type FeeProps = {
  tuitionFee: number;
  examFund: number;
  computerLabFund?: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  admissionFee: number;
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
  createdAt: Date;
  updatedAt: Date;
  fees: FeeProps & {
    type?: string;
    level?: string;
  };
  studentClass: {
    student: {
      studentId: string;
      registrationNumber: string;
      studentName: string;
    };
    class: {
      grade: string;
      section: string;
    };
  };
};

interface ClassFeeTableProps {
  classId: string;
  sessionId: string;
}

export function ClassFeeTable({ classId, sessionId }: ClassFeeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = api.useUtils();

  const { data: classFees, isLoading, isError, refetch } =
    api.fee.getFeeAssignmentsByClassAndSession.useQuery(
      { classId, sessionId },
      { refetchOnWindowFocus: false }
    );

  const { mutate: updatePayment } = api.fee.updatePaymentStatus.useMutation({
    onSuccess: async () => {
      await utils.fee.getFeeAssignmentsByClassAndSession.invalidate();
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load fee assignments");
    }
  }, [isError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePaymentToggle = (
    sfcId: string,
    feeType: "tuition" | "examFund" | "computerLab" | "studentIdCard" | "infoAndCalls",
    paid: boolean
  ) => {
    updatePayment({ sfcId, feeType, paid });
  };

  const calculateTotalFee = (fee: FeeProps): number => {
    return (
      fee.tuitionFee +
      fee.examFund +
      (fee.computerLabFund ?? 0) +
      fee.studentIdCardFee +
      fee.infoAndCallsFee +
      fee.admissionFee
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
      accessorKey: "studentClass.student.registrationNumber",
      header: "Reg. No.",
      cell: ({ row }) => (
        <Badge variant="secondary">
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
    },
    {
      accessorKey: "studentClass.class.grade",
      header: "Class",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.studentClass.class.grade} -{" "}
          {row.original.studentClass.class.section}
        </div>
      ),
    },
    {
      id: "feeBreakdown",
      header: "Fee Breakdown",
      cell: ({ row }) => {
        const fee = row.original.fees;
        return (
          <div className="space-y-1 text-sm">
            {[
              {
                label: "Tuition:",
                value: fee.tuitionFee,
                paid: row.original.tuitionPaid,
                type: "tuition",
              },
              {
                label: "Exam Fund:",
                value: fee.examFund,
                paid: row.original.examFundPaid,
                type: "examFund",
              },
              {
                label: "Computer Lab:",
                value: fee.computerLabFund ?? 0,
                paid: row.original.computerLabPaid,
                type: "computerLab",
              },
              {
                label: "ID Card:",
                value: fee.studentIdCardFee,
                paid: row.original.studentIdCardPaid,
                type: "studentIdCard",
              },
              {
                label: "Info/Calls:",
                value: fee.infoAndCallsFee,
                paid: row.original.infoAndCallsPaid,
                type: "infoAndCalls",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span>Rs. {item.value.toLocaleString()}</span>
                  <Badge
                    variant={item.paid ? "default" : "destructive"}
                    className="h-5 text-xs cursor-pointer"
                    onClick={() =>
                      handlePaymentToggle(
                        row.original.sfcId,
                        item.type as never,
                        !item.paid
                      )
                    }
                  >
                    {item.paid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: "totalFee",
      header: "Total Fee",
      cell: ({ row }) => {
        const total = calculateTotalFee(row.original.fees);
        return (
          <div className="font-semibold text-gray-700">
            Rs. {total.toLocaleString()}
            {row.original.discount > 0 && (
              <span className="block text-xs text-red-500">
                - Rs. {row.original.discount.toLocaleString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "totalPaid",
      header: "Total Paid",
      cell: ({ row }) => {
        const paidFee = calculatePaidFee(row.original);
        return (
          <div className="font-semibold text-green-700">
            Rs. {paidFee.toLocaleString()}
          </div>
        );
      },
    },
    {
      id: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.discountByPercent}%</div>
          <div className="text-xs text-muted-foreground">
            {row.original.discountDescription}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <FeeAllotmentDialog
          sfcId={row.original.sfcId}
          studentClassId={row.original.studentClassId}
          feeId={row.original.feeId}
          initialDiscount={row.original.discount}
          initialDiscountPercent={row.original.discountByPercent}
          initialDiscountDescription={row.original.discountDescription}
          onUpdate={handleRefresh}
          onRemove={handleRefresh}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: (classFees ?? []) as unknown as ClassFeeProps[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const totalFeeForClass = useMemo(() => {
    return (classFees ?? []).reduce((total: number, classFee: ClassFeeProps) => {
      return total + calculatePaidFee(classFee);
    }, 0);
  }, [classFees]);

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        Failed to load fee data. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-md">
        <Input
          placeholder="Search students..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm bg-white focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 hover:bg-gray-100 border-gray-300"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="default"
            onClick={() =>
              toast.promise(generateFeeReport(), {
                loading: "Generating report...",
                success: "Report generated!",
                error: "Failed to generate report",
              })
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 font-semibold text-gray-700 border-b-2 border-gray-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {isLoading || isRefreshing ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      {columns.map((_, j) => (
                        <TableCell key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 text-sm text-gray-600"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-32 text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSearch className="h-8 w-8 text-gray-400" />
                      No fee assignments found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {classFees?.length}{" "}
          students
        </div>
        <div className="bg-green-50 px-4 py-2 rounded-md">
          <div className="font-semibold text-green-800 text-lg">
            ₹ {Number(totalFeeForClass).toLocaleString()}
          </div>
          <div className="text-sm text-green-600">
            (Total Paid Fees)
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-3">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

async function generateFeeReport(): Promise<void> {
  type GenerateFeeReportOutput = { pdf: string; filename: string };

  try {
    const report: GenerateFeeReportOutput = await (
      api.fee.generateFeeReport as unknown as {
        query: () => Promise<GenerateFeeReportOutput>;
      }
    ).query();
    if (report && typeof report.pdf === "string") {
      const binaryString = atob(report.pdf);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = report.filename || `fee-report-${Date.now()}.pdf`;
      link.click();
    }
  } catch (error: unknown) {
    console.error("Error generating fee report:", error);
    throw error;
  }
}