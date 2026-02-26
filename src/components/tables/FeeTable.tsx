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
import {
  DollarSign,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  FileSearch,
} from "lucide-react";
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
import { FeeCreationDialog } from "~/components/forms/fee/FeeCreation";
import { FeeDeletionDialog } from "~/components/forms/fee/FeeDeletion";

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
        className="h-4 w-4 rounded border-gray-300"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="border-blue-200 bg-blue-50 text-blue-700"
      >
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "tuitionFee",
    header: "Monthly Fee",
    cell: ({ getValue }) => (
      <span className="font-semibold text-emerald-700">
        Rs. {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "admissionFee",
    header: "Admission",
    cell: ({ getValue }) => (
      <span className="text-slate-600">
        Rs. {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "examFund",
    header: "Exam Fund",
    cell: ({ getValue }) => (
      <span className="text-slate-600">
        Rs. {(getValue() as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "computerLabFund",
    header: "Lab Fee",
    cell: ({ getValue }) => {
      const value = getValue() as number | null;
      return value ? (
        <span className="text-slate-600">Rs. {value.toLocaleString()}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
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
        <span className="font-medium text-purple-700">
          Rs. {annualFee.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const rawValue = getValue();
      const date =
        rawValue instanceof Date ? rawValue : new Date(rawValue as string);
      return (
        <span className="text-sm text-muted-foreground">
          {format(date, "dd MMM yyyy")}
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

  const { data: feesData, refetch, isLoading } = api.fee.getAllFees.useQuery();

  const fees = feesData as FeeProps[] | undefined;

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
    state: { sorting, globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
  });

  const selectedFeeIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.feeId);

  const totalFeesByClass = useMemo(() => {
    if (!fees) return {} as Record<string, number>;
    return fees.reduce(
      (acc: Record<string, number>, fee: FeeProps) => {
        const monthlyTotal = fee.tuitionFee;
        acc[fee.level] = (acc[fee.level] ?? 0) + monthlyTotal;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [fees]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Fee Structures
          </h2>
          <p className="text-sm text-slate-600">
            Manage fee templates for different class levels
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fees..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-[200px] bg-white pl-9"
            />
          </div>
          <FeeCreationDialog>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Fee
            </Button>
          </FeeCreationDialog>
          {selectedFeeIds.length > 0 && (
            <FeeDeletionDialog
              feeIds={selectedFeeIds}
              onDeleteSuccess={handleDeleteSuccess}
            >
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete ({selectedFeeIds.length})
              </Button>
            </FeeDeletionDialog>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {Object.entries(totalFeesByClass).map(([level, fee]) => (
          <div key={level} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {level}
              </Badge>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-slate-900">
              Rs. {fee.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Monthly Fee</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-slate-700"
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
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
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
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileSearch className="h-8 w-8 text-foreground" />
                    <p className="text-muted-foreground">
                      No fee structures found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {table.getRowModel().rows.length} of {fees?.length ?? 0}{" "}
          entries
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
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
