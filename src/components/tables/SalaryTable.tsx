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
      toast({ title: "Deleted", description: "Selected records deleted successfully." });
      setRowSelection({});
      void utils.salary.getSalaries.invalidate();
    },
    onError: (err: { message: string }) => {
        toast({ 
            title: "Error", 
            description: err.message || "Failed to delete records", 
            variant: "destructive" 
        });
    }
  });

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (!selectedIds.length) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) {
        deleteMutation.mutate({ ids: selectedIds });
    }
  };

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }, [sortField, sortOrder]);

  // Define Columns
  const columns = useMemo<ColumnDef<SalaryData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white dark:border-emerald-500/50"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white dark:border-emerald-500/50"
          />
        ),
      },
      {
        accessorKey: "Employees.employeeName",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("employeeName")} className="hover:text-emerald-600 dark:hover:text-emerald-400 p-0 font-semibold text-slate-600 dark:text-emerald-100/80">
            Employee Name <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-slate-900 dark:text-white">{row.original.Employees.employeeName}</span>,
      },
      {
        accessorKey: "baseSalary",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("baseSalary")} className="hover:text-emerald-600 dark:hover:text-emerald-400 p-0 font-semibold text-slate-600 dark:text-emerald-100/80">
            Base Salary <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-slate-600 font-mono text-xs dark:text-slate-300">{row.original.baseSalary.toLocaleString()}</span>,
      },
      {
        accessorKey: "increment",
        header: "Increment",
        cell: ({ row }) => <span className="text-emerald-600 font-mono text-xs dark:text-emerald-400">+{row.original.increment.toLocaleString()}</span>,
      },
      {
        accessorKey: "totalSalary",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("totalSalary")} className="hover:text-emerald-600 dark:hover:text-emerald-400 p-0 font-semibold text-slate-600 dark:text-emerald-100/80">
            Total <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-slate-900 font-mono text-xs dark:text-white">{row.original.totalSalary.toLocaleString()}</span>,
      },
      {
        accessorKey: "assignedDate",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("assignedDate")} className="hover:text-emerald-600 dark:hover:text-emerald-400 p-0 font-semibold text-slate-600 dark:text-emerald-100/80">
            Date <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-slate-500 text-xs dark:text-slate-400">{new Date(row.original.assignedDate).toLocaleDateString()}</span>,
      },
      {
        accessorKey: "Sessions.sessionName",
        header: "Session",
        cell: ({ row }) => <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">{row.original.Sessions.sessionName}</span>,
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
    [handleSort]
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

  if (isLoading) return <div className="p-8 text-center text-emerald-600 animate-pulse dark:text-emerald-500">Loading records...</div>;
  if (error) return <div className="p-8 text-center text-red-500 dark:text-red-400">Error: {error.message}</div>;

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 min-h-[50px] dark:bg-slate-900/40 dark:border-emerald-500/10 transition-colors">
        
        <div className="flex items-center gap-4 pl-2">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total: <span className="text-emerald-600 font-bold dark:text-emerald-400">{data?.totalCount ?? 0}</span>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    {selectedCount} Selected
                </span>
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBulkDelete}
                    className="h-7 px-3 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 hover:border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-500/20 dark:hover:border-red-500/50"
                >
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 pr-2">
            <Button variant="ghost" size="icon" onClick={() => void utils.salary.getSalaries.invalidate()} className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10">
                <RefreshCcw className="w-3 h-3" />
            </Button>
            <span className="text-xs text-slate-500 hidden sm:inline dark:text-slate-500">Rows:</span>
            <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
            >
            <SelectTrigger className="w-[70px] h-8 bg-white border-slate-200 text-slate-700 text-xs dark:bg-slate-950 dark:border-emerald-500/20 dark:text-white">
                <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-white">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white/60 shadow-xs overflow-hidden backdrop-blur-xs dark:border-emerald-500/20 dark:bg-slate-900/60 dark:shadow-xl transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200 dark:bg-emerald-950/40 dark:border-emerald-500/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-600 font-semibold h-10 dark:text-emerald-100/80">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    className="border-slate-100 hover:bg-slate-50 transition-colors data-[state=selected]:bg-emerald-50 dark:border-emerald-500/10 dark:hover:bg-emerald-900/10 dark:data-[state=selected]:bg-emerald-900/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500 dark:text-slate-500">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-500">
          Showing <span className="text-slate-700 font-medium dark:text-slate-300">{((page - 1) * pageSize) + 1}</span> to <span className="text-slate-700 font-medium dark:text-slate-300">{Math.min(page * pageSize, data?.totalCount ?? 0)}</span> of <span className="text-slate-700 font-medium dark:text-slate-300">{data?.totalCount ?? 0}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-emerald-500/20"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-emerald-500/20"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 min-w-12 text-center dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20">
            {page} / {totalPages || 1}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-emerald-500/20"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-emerald-500/20"
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