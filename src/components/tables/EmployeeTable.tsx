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
import {
  DotSquareIcon,
  RefreshCcw,
  Pencil,
  Eye,
  FileText,
  Plus,
  LayoutGrid,
} from "lucide-react";
import type { Employees } from "@prisma/client";
import { EmployeeEditDialog } from "../forms/employee/EmployeeEditDialog";

// Define the shape of data including relations
type EmployeeData = Employees & {
  BioMetric: { fingerId: string } | null;
};

export function EmployeeTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingEmployee, setEditingEmployee] = useState<Employees | null>(
    null,
  );

  const { data: employees, refetch } = api.employee.getEmployees.useQuery();

  const columns: ColumnDef<EmployeeData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "registrationNumber",
      header: "Reg #",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-200/70">
          {row.original.registrationNumber}
        </span>
      ),
    },
    {
      accessorKey: "employeeName",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 dark:text-foreground">
          {row.original.employeeName}
        </span>
      ),
    },
    {
      accessorKey: "fatherName",
      header: "Father Name",
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-foreground">
          {row.original.fatherName}
        </span>
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          {row.original.designation}
        </span>
      ),
    },
    {
      accessorKey: "mobileNo",
      header: "Mobile",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground dark:text-muted-foreground">
          {row.original.mobileNo}
        </span>
      ),
    },
    {
      accessorKey: "isAssign",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            row.original.isAssign
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400"
          }`}
        >
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
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-emerald-500/20 dark:hover:text-foreground"
            >
              <DotSquareIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-emerald-500/20" />
            <DropdownMenuItem
              onClick={() => setEditingEmployee(row.original)}
              className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
            >
              <Link
                href={`/dashboard/employee/view/${row.original.employeeId}`}
              >
                <Eye className="mr-2 h-3.5 w-3.5" /> View Details
              </Link>
            </DropdownMenuItem>
            {row.original.cv && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
              >
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
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-md transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-lg xl:flex-row">
        <div className="flex w-full items-center gap-2 xl:max-w-md">
          <Input
            placeholder="Filter by name..."
            value={
              (table.getColumn("employeeName")?.getFilterValue() as string) ??
              ""
            }
            onChange={(e) =>
              table.getColumn("employeeName")?.setFilterValue(e.target.value)
            }
            className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-muted-foreground focus:ring-emerald-500 dark:border-emerald-500/30 dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 xl:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-10 border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:bg-muted dark:text-emerald-400 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>

          <EmployeeDeletionDialog
            employeeIds={table
              .getSelectedRowModel()
              .rows.map((r) => r.original.employeeId)}
          />

          <CSVUploadDialog />

          {/* Create Button */}
          <Button
            asChild
            size="sm"
            className="h-10 border-0 bg-emerald-600 text-foreground shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20 dark:hover:bg-emerald-500"
          >
            <Link href="/admin/users/faculty/create">
              <Plus className="mr-2 h-4 w-4" /> New Employee
            </Link>
          </Button>

          {/* View Cards Button */}
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="h-10 border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-foreground dark:hover:bg-slate-600 dark:hover:text-foreground"
          >
            <Link href="/admin/users/faculty/edit">
              <LayoutGrid className="mr-2 h-4 w-4" /> View Cards
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/60 shadow-lg backdrop-blur-sm transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-slate-200 bg-slate-50 dark:border-emerald-500/20 dark:bg-emerald-950/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-11 font-semibold text-slate-600 dark:text-emerald-100/70"
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
                    className="border-slate-100 transition-colors hover:bg-slate-50 data-[state=selected]:bg-emerald-50 dark:border-emerald-500/10 dark:hover:bg-emerald-900/10 dark:data-[state=selected]:bg-emerald-900/20"
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
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <span className="text-sm text-muted-foreground dark:text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/30 dark:bg-muted dark:text-foreground dark:hover:bg-emerald-900/20 dark:hover:text-foreground"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-emerald-500/30 dark:bg-muted dark:text-foreground dark:hover:bg-emerald-900/20 dark:hover:text-foreground"
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
