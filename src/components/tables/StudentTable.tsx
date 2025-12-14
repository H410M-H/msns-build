"use client";

import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import Link from "next/link";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
  type ColumnDef,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { CSVUploadDialog } from "../forms/student/FileInput"; 
import { StudentDeletionDialog } from "../forms/student/StudentDeletion"; 
import { StudentEditDialog } from "../forms/student/StudentEdit"; 
import { PlusCircle, RefreshCw, Search, Pencil, Copy } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { DownloadPdfButton } from "../ui/DownloadPdfButton"; 
import type { Students } from "@prisma/client";

// Matches your Prisma Schema & API
type StudentProps = Students & {
  address?: string;
  additionalContact?: string | null;
  education?: string | null;
  maritalStatus?: string | null;
  fatherOccupation?: string | null;
  fatherDesignation?: string | null;
};

export const StudentTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingStudent, setEditingStudent] = useState<StudentProps | null>(null);
  const { data: students, refetch, isLoading } = api.student.getStudents.useQuery();
  const columns = useMemo<ColumnDef<StudentProps>[]>(
    () => [
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
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "registrationNumber",
        header: "Reg #",
        cell: ({ row }) => <span className="font-mono text-emerald-200">{row.getValue("registrationNumber")}</span>
      },
      {
        accessorKey: "admissionNumber",
        header: "Adm #",
        cell: ({ row }) => <span className="font-mono text-slate-300">{row.getValue("admissionNumber")}</span>
      },
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => <span className="font-medium text-white">{row.getValue("studentName")}</span>
      },
      {
        accessorKey: "fatherName",
        header: "Father Name",
        cell: ({ row }) => <span className="text-slate-300">{row.getValue("fatherName")}</span>
      },
      {
        accessorKey: "fatherMobile",
        header: "Father Mobile",
        cell: ({ row }) => <span className="text-slate-400 font-mono text-xs">{row.getValue("fatherMobile")}</span>
      },
      {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => {
          const dateValue = row.getValue("dateOfBirth");
          if (!dateValue || dateValue === "none") return <span className="text-slate-500 italic">N/A</span>;
          const date = new Date(dateValue as string);
          return <span className="text-slate-300">{date.toLocaleDateString()}</span>;
        },
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
          // FIX: Access via row.original to get precise type from Prisma
          const gender = row.original.gender; 
          
          return (
            <span className={`capitalize text-xs px-2 py-1 rounded-full ${
              gender === 'MALE' ? 'bg-blue-900/30 text-blue-300' : 
              gender === 'FEMALE' ? 'bg-pink-900/30 text-pink-300' : 
              'bg-purple-900/30 text-purple-300'
            }`}>
              {/* Now safe to call .toLowerCase() directly */}
              {gender ? gender.toLowerCase() : "N/A"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-emerald-500/20">
                <DotsHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-emerald-500/20 text-slate-200">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-emerald-500/20" />
              <DropdownMenuItem 
                onClick={() => setEditingStudent(row.original)}
                className="cursor-pointer hover:bg-emerald-500/20 focus:bg-emerald-500/20"
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit Student
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(row.original.admissionNumber || "")}
                className="cursor-pointer hover:bg-emerald-500/20 focus:bg-emerald-500/20"
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable<StudentProps>({
    data: students ?? [],
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
      <div className="rounded-xl bg-slate-900/60 p-4 shadow-lg border border-emerald-500/20 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-500/50" />
            <Input
              placeholder="Search students..."
              value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("studentName")?.setFilterValue(e.target.value)}
              className="pl-9 bg-slate-950/50 border-emerald-500/30 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                className="shrink-0 bg-slate-800 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Refresh
            </Button>
            
            <StudentDeletionDialog
              studentIds={table
                .getSelectedRowModel()
                .rows.map((row) => row.original.studentId)
                .filter(Boolean)}
            />
            <CSVUploadDialog />
            <DownloadPdfButton reportType="students" />
            
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Link href="/admin/users/student/create" className="flex items-center gap-2">
                <PlusCircle className="h-3.5 w-3.5" />
                New Student
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="bg-slate-700 text-slate-200 hover:bg-slate-600">
              <Link href="/admin/users/student/edit">View Cards</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 shadow-xl backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-emerald-950/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-emerald-500/20 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-emerald-100/80 h-10">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-emerald-500/10">
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full bg-slate-800" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-emerald-900/10 transition-colors border-emerald-500/10 data-[state=selected]:bg-emerald-900/20"
                  data-state={row.getIsSelected() ? "selected" : ""}
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Search className="h-8 w-8 opacity-50" />
                    <p>No students found</p>
                    <p className="text-xs">Try adjusting your search</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="text-sm text-slate-400">
          Showing {table.getFilteredRowModel().rows.length} students • {table.getFilteredSelectedRowModel().rows.length}{" "}
          selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-emerald-500/30 bg-slate-800 text-slate-300 hover:bg-emerald-900/20 hover:text-white"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-emerald-500/30 bg-slate-800 text-slate-300 hover:bg-emerald-900/20 hover:text-white"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog Logic */}
      {editingStudent && (
        <StudentEditDialog
          student={editingStudent}
          onClose={() => {
            setEditingStudent(null);
            void refetch(); 
          }}
        />
      )}
    </div>
  );
};