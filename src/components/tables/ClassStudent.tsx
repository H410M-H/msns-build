"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { type ClassCategory, type FeeCategory } from "@prisma/client";
import { RefreshCcw } from "lucide-react";

type StudentClassProps = {
    sfcId: string
    studentClassId: string
    feeId: string
    discount: number
    discountbypercent: number
    discountDescription: string
    createdAt: Date
    updatedAt: Date
    fee: {
      feeId: string
      level: string
      type: FeeCategory
      tuitionFee: number
      examFund: number
      computerLabFund: number | null
      studentIdCardFee: number
      infoAndCallsFee: number
      admissionFee: number
      createdAt: Date
      updatedAt: Date
    }
    ClassStudent: {
      student: {
        studentId: string
        registrationNumber: string
        studentName: string
        studentMobile: string
        fatherMobile: string
        gender: string
        dateOfBirth: string
        fatherName: string
        studentCNIC: string
        fatherCNIC: string
        fatherProfession: string
        address: string
        isAssign: boolean
        createdAt?: Date
        updatedAt?: Date
      }
      }
      class: {
        classId: string
        grade: string
        section: string
        category: ClassCategory
        fee: number
      }
    }


type ClassStudentTableProps = {
  classId: string;
  sessionId: string;
};

export function ClassStudentTable({ classId, sessionId }: ClassStudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { refetch: refetchClassStudents } = api.allotment.getStudentsByClassAndSession.useQuery(
    { classId, sessionId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const columns: ColumnDef<StudentClassProps>[] = [
    {
      accessorFn: (row) => row.ClassStudent.student.registrationNumber,
      id: "registrationNumber",
      header: "Registration Number",
    },
    {
      accessorFn: (row) => row.ClassStudent.student.studentName,
      id: "studentName",
      header: "Student Name",
    },
    {
      accessorFn: (row) => row.ClassStudent.student.gender,
      id: "gender",
      header: "Gender",
    },
    {
      accessorFn: (row) => row.ClassStudent.student.studentMobile,
      id: "studentMobile",
      header: "Student Mobile",
    },
    {
      accessorFn: (row) => row.ClassStudent.student.fatherMobile,
      id: "fatherMobile",
      header: "Father Mobile",
    },
    {
      accessorFn: (row) => row.ClassStudent.student.fatherName,
      id: "fatherName",
      header: "Father Name",
    },
    {
      accessorFn: (row) => row.ClassStudent.student.address,
      id: "address",
      header: "Address",
    },
  ];

  const table = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search students..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
                  <Button
            variant="outline"
            size="sm"
            onClick={() => refetchClassStudents()}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No students found in this class.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
