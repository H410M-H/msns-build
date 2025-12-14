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

  // Wrapped in useCallback to stabilize the reference for useMemo
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
            className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
          />
        ),
      },
      {
        accessorKey: "Employees.employeeName",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("employeeName")} className="hover:text-emerald-400 p-0 font-semibold text-emerald-100/80">
            Employee Name <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-white">{row.original.Employees.employeeName}</span>,
      },
      {
        accessorKey: "baseSalary",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("baseSalary")} className="hover:text-emerald-400 p-0 font-semibold text-emerald-100/80">
            Base Salary <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-slate-300 font-mono text-xs">{row.original.baseSalary.toLocaleString()}</span>,
      },
      {
        accessorKey: "increment",
        header: "Increment",
        cell: ({ row }) => <span className="text-emerald-400 font-mono text-xs">+{row.original.increment.toLocaleString()}</span>,
      },
      {
        accessorKey: "totalSalary",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("totalSalary")} className="hover:text-emerald-400 p-0 font-semibold text-emerald-100/80">
            Total <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-bold text-white font-mono text-xs">{row.original.totalSalary.toLocaleString()}</span>,
      },
      {
        accessorKey: "assignedDate",
        header: () => (
          <Button variant="ghost" onClick={() => handleSort("assignedDate")} className="hover:text-emerald-400 p-0 font-semibold text-emerald-100/80">
            Date <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        ),
        cell: ({ row }) => <span className="text-slate-400 text-xs">{new Date(row.original.assignedDate).toLocaleDateString()}</span>,
      },
      {
        accessorKey: "Sessions.sessionName",
        header: "Session",
        cell: ({ row }) => <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-xs text-slate-400">{row.original.Sessions.sessionName}</span>,
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
    [handleSort] // handleSort is now stable due to useCallback
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

  if (isLoading) return <div className="p-8 text-center text-emerald-500 animate-pulse">Loading records...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error.message}</div>;

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-2 rounded-lg border border-emerald-500/10 min-h-[50px]">
        
        <div className="flex items-center gap-4 pl-2">
          <div className="text-sm text-slate-400">
            Total: <span className="text-emerald-400 font-bold">{data?.totalCount ?? 0}</span>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    {selectedCount} Selected
                </span>
                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBulkDelete}
                    className="h-7 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/20 hover:border-red-500/50"
                >
                    <Trash2 className="w-3 h-3 mr-2" /> Delete
                </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 pr-2">
            <Button variant="ghost" size="icon" onClick={() => void utils.salary.getSalaries.invalidate()} className="h-8 w-8 text-slate-400 hover:text-white">
                <RefreshCcw className="w-3 h-3" />
            </Button>
            <span className="text-xs text-slate-500 hidden sm:inline">Rows:</span>
            <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
            >
            <SelectTrigger className="w-[70px] h-8 bg-slate-950 border-emerald-500/20 text-white text-xs">
                <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-emerald-500/20 text-white">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 shadow-xl overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-emerald-950/40 border-b border-emerald-500/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-emerald-100/80 font-semibold h-10">
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
                    className="border-emerald-500/10 hover:bg-emerald-900/10 transition-colors data-[state=selected]:bg-emerald-900/20"
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500">
          Showing <span className="text-slate-300 font-medium">{((page - 1) * pageSize) + 1}</span> to <span className="text-slate-300 font-medium">{Math.min(page * pageSize, data?.totalCount ?? 0)}</span> of <span className="text-slate-300 font-medium">{data?.totalCount ?? 0}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-emerald-500/20 bg-slate-900 text-slate-400 hover:text-white hover:bg-emerald-500/20"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-emerald-500/20 bg-slate-900 text-slate-400 hover:text-white hover:bg-emerald-500/20"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 min-w-[3rem] text-center">
            {page} / {totalPages || 1}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-emerald-500/20 bg-slate-900 text-slate-400 hover:text-white hover:bg-emerald-500/20"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-emerald-500/20 bg-slate-900 text-slate-400 hover:text-white hover:bg-emerald-500/20"
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