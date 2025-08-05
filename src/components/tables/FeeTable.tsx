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
import { api } from "~/trpc/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnSort,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { DollarSign, RefreshCw, Search, Plus, Trash2, FileSearch } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FeeCreationDialog } from "../forms/fee/FeeCreation";
import { FeeAssignmentDialog } from "../forms/fee/feeAssignment";
import { FeeDeletionDialog } from "../forms/fee/FeeDeletion";

type FeeProps = {
  feeId: string;
  level: string;
  admissionFee: number;
  tuitionFee: number;
  examFund: number;
  computerLabFund: number | null;
  studentIdCardFee: number;
  infoAndCallsFee: number;
  createdAt: Date | string;
  type: string;
};

const columns: ColumnDef<FeeProps>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-600">
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "admissionFee",
    header: "Admission Fee",
    cell: ({ getValue }) => (
      <span className="font-medium text-gray-700">
        {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    id: "tuitionFee",
    header: "Monthly Fee",
    cell: ({ row }) => (
      <span className="font-medium text-purple-700">
        {row.original.tuitionFee.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "examFund",
    header: "Exam Fund",
    cell: ({ getValue }) => (
      <span className="text-gray-600">
        {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "computerLabFund",
    header: "Computer Lab Fund",
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value ? (
        <span className="text-gray-600">₹{value.toLocaleString()}</span>
      ) : (
        <span className="text-gray-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "studentIdCardFee",
    header: "ID Card Fee",
    cell: ({ getValue }) => (
      <span className="text-gray-600">
        {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "infoAndCallsFee",
    header: "Info & Calls Fee",
    cell: ({ getValue }) => (
      <span className="text-gray-600">
        {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    id: "annualFee",
    header: "Annual Fee",
    cell: ({ row }) => {
      const annualFee =
        row.original.admissionFee +
        row.original.examFund +
        (row.original.computerLabFund ?? 0) +
        row.original.studentIdCardFee +
        row.original.infoAndCallsFee;
      return (
        <span className="font-medium text-green-700">
          {annualFee.toLocaleString()}
        </span>
      );
    },
  },
  {
    id: "totalFee",
    header: "Total Fee",
    cell: ({ row }) => {
      const annualFee =
        row.original.admissionFee +
        row.original.examFund +
        (row.original.computerLabFund ?? 0) +
        row.original.studentIdCardFee +
        row.original.infoAndCallsFee;
      const totalFee = row.original.tuitionFee + annualFee;
      return (
        <span className="font-bold text-green-900">
          {totalFee.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) => {
      const rawValue = getValue();
      const date =
        rawValue instanceof Date
          ? rawValue
          : typeof rawValue === "string" || typeof rawValue === "number"
          ? new Date(rawValue)
          : new Date();
      return (
        <span className="text-sm text-gray-500">
          {format(date, "dd MMM yyyy HH:mm")}
        </span>
      );
    },
  },
];

export function FeeTable() {
  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: fees, refetch, isLoading } = api.fee.getAllFees.useQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDeleteSuccess = () => {
    void refetch();
    setRowSelection({});
  };

  const table = useReactTable({
    data: fees ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const selectedFeeIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.feeId);

  const totalFeesByClass = useMemo(() => {
    if (!fees) return {};
    return fees.reduce((acc, fee) => {
      const totalFee =
        fee.tuitionFee +
        fee.admissionFee +
        fee.examFund +
        (fee.computerLabFund ?? 0) +
        fee.studentIdCardFee +
        fee.infoAndCallsFee;
      acc[fee.level] = (acc[fee.level] ?? 0) + totalFee;
      return acc;
    }, {} as Record<string, number>);
  }, [fees]);

  return (
    <div className="space-y-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-6">
      <div className="relative space-y-6 rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-xl ring-1 ring-gray-100/10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fee Management
            </h1>
            <p className="text-sm text-gray-600">
              Manage fee structures and financial analytics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search fees..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 bg-white/95 w-full sm:w-64 focus:ring-2 focus:ring-purple-500 rounded-xl shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <FeeCreationDialog>
                <Button
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </FeeCreationDialog>
              <FeeDeletionDialog feeIds={selectedFeeIds} onDeleteSuccess={handleDeleteSuccess}>
                <Button variant="destructive" size="sm" className="gap-2 rounded-xl">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </FeeDeletionDialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-gray-600 hover:bg-purple-100 rounded-xl gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
            <FeeAssignmentDialog />
          </div>
        </div>
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Object.entries(totalFeesByClass).map(([level, totalFee]) => (
            <div
              key={level}
              className="relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-100/30" />
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 rounded-lg">
                  {level}
                </Badge>
                <DollarSign className="h-6 w-6 text-purple-400" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-800">
                  Rs.{totalFee.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Total Annual Fee</p>
              </div>
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="rounded-xl border border-gray-100 bg-white/95 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-gray-50 border-b border-gray-100 sticky top-0">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-gray-50/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-6 py-4 font-semibold text-gray-700 hover:bg-gray-100/50 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc"
                            ? " 🔼"
                            : header.column.getIsSorted() === "desc"
                            ? " 🔽"
                            : null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i} className="even:bg-gray-50/30">
                        {columns.map((_, j) => (
                          <TableCell key={j} className="px-6 py-4">
                            <Skeleton className="h-4 w-full rounded-lg animate-pulse" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors even:bg-gray-50/30 group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-6 py-4 text-sm",
                            cell.column.id === "totalFee" ? "font-bold text-green-700" : "text-gray-600"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <FileSearch className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-600 font-medium">No fee records found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or creating a new fee</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {table.getRowModel().rows.length} of {fees?.length} entries
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Rows per page:
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="gap-2 rounded-xl"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="gap-2 rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
