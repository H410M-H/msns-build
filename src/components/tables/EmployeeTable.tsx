// File: src/components/tables/EmployeeTable.tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  type ColumnDef,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { EmployeeDeletionDialog } from "../forms/employee/EmployeeDeletion";
import { CSVUploadDialog } from "../forms/student/FileInput";
import { DotSquareIcon, RefreshCcw, Pencil, Eye, FileText, Plus, LayoutGrid } from "lucide-react";
import type { Employees } from "@prisma/client";
import { EmployeeEditDialog } from "../forms/employee/EmployeeEditDialog";

// Define the shape of data including relations
type EmployeeData = Employees & {
  BioMetric: { fingerId: string } | null;
};

export function EmployeeTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingEmployee, setEditingEmployee] = useState<Employees | null>(null);

  const { data: employees, refetch } = api.employee.getEmployees.useQuery();

  const columns: ColumnDef<EmployeeData>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "registrationNumber",
      header: "Reg #",
      cell: ({ row }) => <span className="font-mono text-xs text-emerald-700 dark:text-emerald-200/70">{row.original.registrationNumber}</span>,
    },
    {
      accessorKey: "employeeName",
      header: "Name",
      cell: ({ row }) => <span className="font-semibold text-slate-900 dark:text-white">{row.original.employeeName}</span>,
    },
    {
      accessorKey: "fatherName",
      header: "Father Name",
      cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.original.fatherName}</span>,
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          {row.original.designation}
        </span>
      ),
    },
    {
      accessorKey: "mobileNo",
      header: "Mobile",
      cell: ({ row }) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.original.mobileNo}</span>,
    },
    {
      accessorKey: "isAssign",
      header: "Status",
      cell: ({ row }) => (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
            row.original.isAssign 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
        }`}>
          {row.original.isAssign ? "Active" : "Pending"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-emerald-500/20">
              <DotSquareIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-emerald-500/20" />
            <DropdownMenuItem onClick={() => setEditingEmployee(row.original)} className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20">
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20">
              <Link href={`/dashboard/employee/view/${row.original.employeeId}`}>
                <Eye className="mr-2 h-3.5 w-3.5" /> View Details
              </Link>
            </DropdownMenuItem>
            {row.original.cv && (
              <DropdownMenuItem asChild className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20">
                <Link href={row.original.cv} target="_blank">
                  <FileText className="mr-2 h-3.5 w-3.5" /> View CV
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: (employees as EmployeeData[]) ?? [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
  });

  return (
    <div className="w-full space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-md dark:border-emerald-500/20 dark:bg-slate-900/60 dark:shadow-lg transition-colors">
        <div className="flex w-full items-center gap-2 xl:max-w-md">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("employeeName")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("employeeName")?.setFilterValue(e.target.value)}
            className="h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-emerald-500 dark:bg-slate-950/50 dark:border-emerald-500/30 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 justify-end w-full xl:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="h-10 border-slate-200 text-emerald-600 bg-white hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-slate-800/50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300 dark:hover:border-emerald-500/50"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          
          <EmployeeDeletionDialog 
            employeeIds={table.getSelectedRowModel().rows.map(r => r.original.employeeId)} 
          />
          
          <CSVUploadDialog />
          
          {/* Create Button */}
          <Button asChild size="sm" className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md shadow-emerald-200 dark:shadow-emerald-900/20 dark:hover:bg-emerald-500">
            <Link href="/admin/users/faculty/create">
                <Plus className="h-4 w-4 mr-2" /> New Employee
            </Link>
          </Button>

          {/* View Cards Button */}
          <Button asChild size="sm" variant="secondary" className="h-10 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:text-white dark:border-slate-600">
            <Link href="/admin/users/faculty/edit">
                <LayoutGrid className="h-4 w-4 mr-2" /> View Cards
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white/60 shadow-lg backdrop-blur-sm overflow-hidden dark:border-emerald-500/20 dark:bg-slate-900/60 dark:shadow-xl transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200 dark:bg-emerald-950/40 dark:border-emerald-500/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-600 font-semibold h-11 dark:text-emerald-100/70">
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
                    className="border-slate-100 hover:bg-slate-50 transition-colors data-[state=selected]:bg-emerald-50 dark:border-emerald-500/10 dark:hover:bg-emerald-900/10 dark:data-[state=selected]:bg-emerald-900/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500 dark:text-slate-500">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4 px-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
            className="border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-white"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-white"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog Logic */}
      {editingEmployee && (
        <EmployeeEditDialog 
          employee={editingEmployee} 
          onClose={() => {
            setEditingEmployee(null);
            void refetch();
          }} 
        />
      )}
    </div>
  );
}