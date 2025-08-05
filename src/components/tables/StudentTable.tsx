"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { api } from "~/trpc/react"
import Link from "next/link"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import {
  type ColumnDef,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { CSVUploadDialog } from "../forms/student/FileInput"
import { StudentDeletionDialog } from "../forms/student/StudentDeletion"
import { PlusCircle, RefreshCw, Search } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"
import { DownloadPdfButton } from "../ui/DownloadPdfButton"
import type { Students } from "@prisma/client"

// Updated type to match the actual API response structure
type StudentProps = Students & {
  // Optional properties that might not be present in all responses
  address?: string
  additionalContact?: string | null
  education?: string | null
  maritalStatus?: string | null
  fatherOccupation?: string | null
  fatherDesignation?: string | null
}

const columns: ColumnDef<StudentProps>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "registrationNumber",
    header: "Registration #",
  },
  {
    accessorKey: "admissionNumber",
    header: "Adm #",
  },
  {
    accessorKey: "studentName",
    header: "Student Name",
  },
  {
    accessorKey: "fatherName",
    header: "Father Name",
  },
  {
    accessorKey: "fatherMobile",
    header: "Father Mobile",
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      const dateValue = row.getValue("dateOfBirth")
      if (!dateValue || dateValue === "none") return <span>Not provided</span>
      const date = new Date(dateValue as string)
      return <span>{date.toLocaleDateString()}</span>
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.getValue("gender")
      return <span className="capitalize">{gender?.toString().toLowerCase() ?? "Not specified"}</span>
    },
  },
 {
    accessorKey: "createdAt",
    header: "Admission Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <span>{date.toLocaleDateString()}</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <DotsHorizontalIcon className="w-4 h-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/student/edit/${row.original.studentId}`}>Edit Student</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.admissionNumber)}>
            Copy Student ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export const StudentTable = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const { data: students, refetch, isLoading } = api.student.getStudents.useQuery()

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
  })

  return (
    <div className="w-full space-y-4">
      {/* Table Controls */}
      <div className="rounded-lg bg-white p-4 shadow-sm border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("studentName")?.setFilterValue(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">
              <RefreshCw className="h-4 w-4 mr-2" />
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
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/admin/users/student/create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Student
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/users/student/edit">View Cards</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-gray-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Search className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-600">No students found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or create a new student</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4">
        <div className="text-sm text-gray-600">
          Showing {table.getFilteredRowModel().rows.length} students • {table.getFilteredSelectedRowModel().rows.length}{" "}
          selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-300"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
