// File: src/components/tables/SalaryTable.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { SalarySlip } from "./SalarySlip";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "~/hooks/use-toast";

type SortField = "employeeName" | "baseSalary" | "totalSalary" | "assignedDate";
type SortOrder = "asc" | "desc";

// Data Type
type SalaryData = {
  id: string;
  employeeId: string;
  baseSalary: number;
  increment: number;
  totalSalary: number;
  assignedDate: Date;
  sessionId: string;
  Employees: {
    employeeName: string;
  };
  Sessions: {
    sessionName: string;
  };
};

type SalaryTableProps = {
  page: number;
  pageSize: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  searchTerm: string;
};

export function SalaryTable({
  page,
  pageSize,
  setPage,
  setPageSize,
  searchTerm,
}: SalaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("assignedDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const utils = api.useUtils();

  // Fetch Data
  const { data, isLoading, error } = api.salary.getSalaries.useQuery({
    page,
    pageSize,
    searchTerm,
    sortField,
    sortOrder,
  });

  // Delete Mutation
  const deleteMutation = api.salary.deleteSalariesByIds.useMutation({
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Selected records deleted successfully.",
      });
      setRowSelection({});
      void utils.salary.getSalaries.invalidate();
    },
    onError: (err: { message: string }) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete records",
        variant: "destructive",
      });
    },
  });

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (!selectedIds.length) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.length} records?`)
    ) {
      deleteMutation.mutate({ ids: selectedIds });
    }
  };

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField, sortOrder],
  );

  // Define Columns
  const columns = useMemo<ColumnDef<SalaryData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        accessorKey: "Employees.employeeName",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("employeeName")}
            className="p-0 font-semibold text-slate-600 hover:text-emerald-600 dark:text-emerald-100/80 dark:hover:text-emerald-400"
          >
            Employee Name <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-foreground">
            {row.original.Employees.employeeName}
          </span>
        ),
      },
      {
        accessorKey: "baseSalary",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("baseSalary")}
            className="p-0 font-semibold text-slate-600 hover:text-emerald-600 dark:text-emerald-100/80 dark:hover:text-emerald-400"
          >
            Base Salary <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-foreground">
            {row.original.baseSalary.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "increment",
        header: "Increment",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
            +{row.original.increment.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "totalSalary",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("totalSalary")}
            className="p-0 font-semibold text-slate-600 hover:text-emerald-600 dark:text-emerald-100/80 dark:hover:text-emerald-400"
          >
            Total <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-foreground">
            {row.original.totalSalary.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "assignedDate",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("assignedDate")}
            className="p-0 font-semibold text-slate-600 hover:text-emerald-600 dark:text-emerald-100/80 dark:hover:text-emerald-400"
          >
            Date <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground dark:text-muted-foreground">
            {new Date(row.original.assignedDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "Sessions.sessionName",
        header: "Session",
        cell: ({ row }) => (
          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-muted dark:text-muted-foreground">
            {row.original.Sessions.sessionName}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <SalarySlip salary={row.original} />
          </div>
        ),
      },
    ],
    [handleSort],
  );

  const table = useReactTable({
    data: data?.salaries ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    getRowId: (row) => row.id,
  });

  const selectedCount = Object.keys(rowSelection).length;

  if (isLoading)
    return (
      <div className="animate-pulse p-8 text-center text-emerald-600 dark:text-emerald-500">
        Loading records...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        Error: {error.message}
      </div>
    );

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex min-h-[50px] flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-2 transition-colors dark:border-emerald-500/10 dark:bg-card sm:flex-row">
        <div className="flex items-center gap-4 pl-2">
          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
            Total:{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {data?.totalCount ?? 0}
            </span>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                {selectedCount} Selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="h-7 border border-red-200 bg-red-100 px-3 text-red-700 hover:border-red-300 hover:bg-red-200 dark:border-red-500/20 dark:bg-red-900/20 dark:text-red-400 dark:hover:border-red-500/50 dark:hover:bg-red-900/40"
              >
                <Trash2 className="mr-2 h-3 w-3" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void utils.salary.getSalaries.invalidate()}
            className="h-8 w-8 text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-foreground"
          >
            <RefreshCcw className="h-3 w-3" />
          </Button>
          <span className="hidden text-xs text-muted-foreground dark:text-muted-foreground sm:inline">
            Rows:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] border-slate-200 bg-white text-xs text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-xl">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-slate-200 bg-slate-50 dark:border-emerald-500/20 dark:bg-emerald-950/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 font-semibold text-slate-600 dark:text-emerald-100/80"
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
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-100 transition-colors hover:bg-slate-50 data-[state=selected]:bg-emerald-50 dark:border-emerald-500/10 dark:hover:bg-emerald-900/10 dark:data-[state=selected]:bg-emerald-900/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
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
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
        <div className="text-xs text-muted-foreground dark:text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-slate-700 dark:text-foreground">
            {(page - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-700 dark:text-foreground">
            {Math.min(page * pageSize, data?.totalCount ?? 0)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700 dark:text-foreground">
            {data?.totalCount ?? 0}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/20 dark:bg-card dark:text-muted-foreground dark:hover:bg-emerald-500/20 dark:hover:text-foreground"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/20 dark:bg-card dark:text-muted-foreground dark:hover:bg-emerald-500/20 dark:hover:text-foreground"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-[3rem] rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-xs font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            {page} / {totalPages || 1}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/20 dark:bg-card dark:text-muted-foreground dark:hover:bg-emerald-500/20 dark:hover:text-foreground"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/20 dark:bg-card dark:text-muted-foreground dark:hover:bg-emerald-500/20 dark:hover:text-foreground"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
