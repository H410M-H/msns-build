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
import { DotSquareIcon, Fingerprint, RefreshCcw } from "lucide-react";
import { cn } from "~/lib/utils";

// Use the exact type structure from your Prisma schema
type EmployeeFromDB = {
  employeeId: string;
  registrationNumber: string;
  employeeName: string;
  fatherName: string;
  admissionNumber: string;
  gender: "MALE" | "FEMALE" | "CUSTOM";
  dob: string;
  cnic: string;
  maritalStatus: "Married" | "Unmarried" | "Widow" | "Divorced";
  doj: string;
  designation:
    | "PRINCIPAL"
    | "ADMIN"
    | "HEAD"
    | "CLERK"
    | "TEACHER"
    | "WORKER"
    | "NONE"
    | "ALL"
    | "STUDENT"
    | "FACULTY";
  residentialAddress: string;
  mobileNo: string;
  additionalContact?: string | null;
  education: string;
  isAssign: boolean;
  profilePic?: string | null;
  BioMetric: { fingerId: string } | null;
  cv?: string | null;
};

const columns = [
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
    id: "registrationNumber",
    accessorFn: (row: EmployeeFromDB) => row.registrationNumber,
    header: "Reg #",
    cell: ({ getValue }) => (
      <div className="font-medium">{getValue() as string}</div>
    ),
  },
  {
    id: "employeeName",
    accessorFn: (row: EmployeeFromDB) => row.employeeName,
    header: "Name",
    cell: ({ getValue }) => (
      <div className="font-bold">{getValue() as string}</div>
    ),
  },
  {
    id: "fatherName",
    accessorFn: (row: EmployeeFromDB) => row.fatherName,
    header: "Father Name",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    id: "gender",
    accessorFn: (row: EmployeeFromDB) => row.gender,
    header: "Gender",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    id: "dob",
    accessorFn: (row: EmployeeFromDB) => row.dob,
    header: "Date of Birth",
    cell: ({ getValue }) => {
      const dateStr = getValue() as string;
      if (dateStr === "none") return <span>Not provided</span>;
      const date = new Date(dateStr);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "designation",
    accessorFn: (row: EmployeeFromDB) => row.designation,
    header: "Designation",
    cell: ({ getValue }) => (
      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
        {getValue() as string}
      </span>
    ),
  },
  {
    id: "mobileNo",
    accessorFn: (row: EmployeeFromDB) => row.mobileNo,
    header: "Mobile",
    cell: ({ getValue }) => {
      const mobile = getValue() as string;
      return <span>{mobile === "none" ? "Not provided" : mobile}</span>;
    },
  },
  {
    id: "doj",
    accessorFn: (row: EmployeeFromDB) => row.doj,
    header: "Date of Joining",
    cell: ({ getValue }) => {
      const dateStr = getValue() as string;
      if (dateStr === "none") return <span>Not provided</span>;
      const date = new Date(dateStr);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "education",
    accessorFn: (row: EmployeeFromDB) => row.education,
    header: "Education",
    cell: ({ getValue }) => {
      const education = getValue() as string;
      return <span>{education === "none" ? "Not provided" : education}</span>;
    },
  },
  {
    id: "maritalStatus",
    accessorFn: (row: EmployeeFromDB) => row.maritalStatus,
    header: "Marital Status",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    id: "isAssign",
    accessorFn: (row: EmployeeFromDB) => row.isAssign,
    header: "Assignment Status",
    cell: ({ getValue }) => (
      <span
        className={`rounded-full px-2 py-1 text-xs ${
          getValue()
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {getValue() ? "Assigned" : "Unassigned"}
      </span>
    ),
  },
  {
    id: "biometric",
    header: "Bio metric",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/users/faculty/bio-metric?employeeId=${row.original.employeeId}&employeeName=${row.original.employeeName}`}
        >
          <Fingerprint
            className={cn(
              "h-4 w-4",
              row.original.BioMetric ? "text-green-500" : "text-red-500",
            )}
          />
        </Link>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }: { row: { original: EmployeeFromDB } }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <DotSquareIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/employee/edit/${row.original.employeeId}`}>
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/employee/view/${row.original.employeeId}`}>
              View Details
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link
              href={`/admin/users/faculty/bio-metric?employeeId=${row.original.employeeId}&employeeName=${row.original.employeeName}`}
            >
              Bio Metric
            </Link>
          </DropdownMenuItem> */}
          {row.original.cv && (
            <DropdownMenuItem asChild>
              <Link href={row.original.cv} target="_blank">
                View CV
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
] satisfies ColumnDef<EmployeeFromDB, unknown>[];

export function EmployeeTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const { data: employees, refetch } = api.employee.getEmployees.useQuery();

  const table = useReactTable<EmployeeFromDB>({
    data: employees ?? [],
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
    <div className="w-full">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name"
            value={
              (table.getColumn("employeeName")?.getFilterValue() as string) ??
              ""
            }
            onChange={(e) =>
              table.getColumn("employeeName")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Search by designation"
            value={
              (table.getColumn("designation")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("designation")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="shrink-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <EmployeeDeletionDialog
            employeeIds={table
              .getSelectedRowModel()
              .rows.map((row) => row.original.employeeId)
              .filter(Boolean)}
          />
          <CSVUploadDialog />
          <Button asChild>
            <Link href="/admin/users/faculty/create">Create</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/faculty/edit">View Cards</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-md border p-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id}>
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
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <span className="text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </span>
        <div className="flex gap-2">
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
