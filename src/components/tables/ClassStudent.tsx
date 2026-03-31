// File: src/components/tables/ClassStudent.tsx
"use client";

import { useState } from "react";
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
import { RefreshCcw, Search, Users, User, Phone, MapPin } from "lucide-react";

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
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// --- Types ---
type StudentClassProps = {
  sfcId: string;
  studentClassId: string;
  feeId: string;
  discount: number;
  discountbypercent: number;
  discountDescription: string;
  createdAt: Date;
  updatedAt: Date;
  fee: {
    feeId: string;
    level: string;
    type: FeeCategory;
    tuitionFee: number;
    examFund: number;
    computerLabFund: number | null;
    studentIdCardFee: number;
    infoAndCallsFee: number;
    admissionFee: number;
    createdAt: Date;
    updatedAt: Date;
  };
  ClassStudent: {
    student: {
      studentId: string;
      registrationNumber: string;
      studentName: string;
      studentMobile: string;
      fatherMobile: string;
      gender: string;
      dateOfBirth: string;
      fatherName: string;
      studentCNIC: string;
      fatherCNIC: string;
      fatherProfession: string;
      address: string;
      isAssign: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    };
  };
  class: {
    classId: string;
    grade: string;
    section: string;
    category: ClassCategory;
    fee: number;
  };
};

type ClassStudentTableProps = {
  classId: string;
  sessionId: string;
};

// --- Helper Components ---
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-64 bg-slate-200 dark:bg-white/5" />
      <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-white/5" />
    </div>
    <div className="rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card">
      <div className="border-b border-slate-100 p-4 dark:border-border">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-6 w-full bg-slate-200 dark:bg-white/5"
            />
          ))}
        </div>
      </div>
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-12 w-full bg-slate-100 dark:bg-white/5"
          />
        ))}
      </div>
    </div>
  </div>
);

export function ClassStudentTable({
  classId,
  sessionId,
}: ClassStudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch data
  const {
    data: studentsData,
    isLoading,
    isRefetching,
    refetch: refetchClassStudents,
  } = api.allotment.getStudentsByClassAndSession.useQuery(
    { classId, sessionId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const columns: ColumnDef<StudentClassProps>[] = [
    {
      accessorFn: (row) => row.ClassStudent.student.registrationNumber,
      id: "registrationNumber",
      header: "Reg. No",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">
          {row.original.ClassStudent.student.registrationNumber}
        </span>
      ),
    },
    {
      accessorFn: (row) => row.ClassStudent.student.studentName,
      id: "studentName",
      header: "Student Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium text-slate-900 dark:text-foreground">
            {row.original.ClassStudent.student.studentName}
          </span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.ClassStudent.student.gender,
      id: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.ClassStudent.student.gender === "Male"
              ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
              : "border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-400",
          )}
        >
          {row.original.ClassStudent.student.gender}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.ClassStudent.student.fatherName,
      id: "fatherName",
      header: "Father Name",
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-foreground">
          {row.original.ClassStudent.student.fatherName}
        </span>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-muted-foreground dark:text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-500/50" />
            <span>{row.original.ClassStudent.student.studentMobile}</span>
          </div>
          {row.original.ClassStudent.student.fatherMobile && (
            <div className="mt-0.5 flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-muted-foreground dark:text-slate-600" />
              <span>{row.original.ClassStudent.student.fatherMobile}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.ClassStudent.student.address,
      id: "address",
      header: "Address",
      cell: ({ row }) => (
        <div
          className="flex max-w-[200px] items-center gap-1.5 truncate"
          title={row.original.ClassStudent.student.address}
        >
          <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground dark:text-muted-foreground" />
          <span className="truncate text-sm text-muted-foreground dark:text-muted-foreground">
            {row.original.ClassStudent.student.address}
          </span>
        </div>
      ),
    },
    {
      id: "discount",
      header: "Fee Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.discount > 0 ? (
            <Badge
              variant="secondary"
              className="border border-amber-200 bg-amber-100 text-[10px] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
            >
              {row.original.discount}% Off
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground dark:text-muted-foreground">
              Standard
            </span>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: (studentsData as unknown as StudentClassProps[]) ?? [],
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

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {/* --- Controls --- */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors dark:border-border dark:bg-card dark:backdrop-blur-md">
        <div className="group relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-600 dark:text-muted-foreground dark:group-focus-within:text-emerald-400" />
          <Input
            placeholder="Search students..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-slate-900 placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchClassStudents()}
          className="h-9 w-9 border-slate-200 bg-white p-0 text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
          disabled={isRefetching}
        >
          <RefreshCcw
            className={cn("h-4 w-4", isRefetching && "animate-spin")}
          />
        </Button>
      </div>

      {/* --- Table --- */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-border dark:bg-card dark:shadow-xl dark:backdrop-blur-sm">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-white/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-slate-200 hover:bg-transparent dark:border-border"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 font-semibold text-slate-600 dark:text-muted-foreground"
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group border-slate-100 transition-colors hover:bg-slate-50 dark:border-border dark:hover:bg-white/5"
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
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground dark:text-muted-foreground">
                    <div className="mb-4 rounded-full border border-slate-200 bg-slate-100 p-4 dark:border-border dark:bg-card">
                      <Users className="h-8 w-8 text-muted-foreground dark:text-slate-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-700 dark:text-foreground">
                      No students found
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      There are no students assigned to this class yet.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* --- Pagination --- */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8 border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8 border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-white/10"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
