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
import { 
  RefreshCcw, 
  Search, 
  Users, 
  User, 
  Phone, 
  MapPin, 
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
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
    <div className="rounded-xl border border-slate-200 bg-white dark:border-white/5 dark:bg-slate-900/40">
      <div className="border-b border-slate-100 dark:border-white/5 p-4">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
             <Skeleton key={i} className="h-6 w-full bg-slate-200 dark:bg-white/5" />
          ))}
        </div>
      </div>
      <div className="p-4 space-y-4">
         {Array.from({ length: 5 }).map((_, i) => (
           <Skeleton key={i} className="h-12 w-full bg-slate-100 dark:bg-white/5" />
         ))}
      </div>
    </div>
  </div>
);

export function ClassStudentTable({ classId, sessionId }: ClassStudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch data
  const { 
    data: studentsData, 
    isLoading, 
    isRefetching, 
    refetch: refetchClassStudents 
  } = api.allotment.getStudentsByClassAndSession.useQuery(
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
      header: "Reg. No",
      cell: ({ row }) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
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
           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-white/10">
             <User className="h-4 w-4" />
           </div>
           <span className="font-medium text-slate-900 dark:text-white">{row.original.ClassStudent.student.studentName}</span>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.ClassStudent.student.gender,
      id: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
          "border",
          row.original.ClassStudent.student.gender === "Male" 
            ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" 
            : "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20"
        )}>
          {row.original.ClassStudent.student.gender}
        </Badge>
      ),
    },
    {
      accessorFn: (row) => row.ClassStudent.student.fatherName,
      id: "fatherName",
      header: "Father Name",
      cell: ({ row }) => (
        <span className="text-slate-600 dark:text-slate-300">{row.original.ClassStudent.student.fatherName}</span>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-slate-500 dark:text-slate-400">
           <div className="flex items-center gap-1.5">
             <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-500/50" />
             <span>{row.original.ClassStudent.student.studentMobile}</span>
           </div>
           {row.original.ClassStudent.student.fatherMobile && (
             <div className="flex items-center gap-1.5 mt-0.5">
               <Phone className="h-3 w-3 text-slate-400 dark:text-slate-600" />
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
        <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={row.original.ClassStudent.student.address}>
           <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
           <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{row.original.ClassStudent.student.address}</span>
        </div>
      ),
    },
    {
      id: "discount",
      header: "Fee Status",
      cell: ({ row }) => (
         <div className="flex items-center gap-1.5">
            {row.original.discount > 0 ? (
               <Badge variant="secondary" className="bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[10px]">
                  {row.original.discount}% Off
               </Badge>
            ) : (
               <span className="text-xs text-slate-400 dark:text-slate-500">Standard</span>
            )}
         </div>
      )
    }
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
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-slate-900/40 dark:backdrop-blur-md transition-colors">
        <div className="relative w-full max-w-sm group">
           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:text-slate-500 dark:group-focus-within:text-emerald-400 transition-colors" />
           <Input
             placeholder="Search students..."
             value={globalFilter ?? ""}
             onChange={(event) => setGlobalFilter(event.target.value)}
             className="pl-9 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-emerald-500/50 focus:border-emerald-500/50 h-9 rounded-lg dark:bg-slate-950/50 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500"
           />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchClassStudents()}
          className="h-9 w-9 p-0 border-slate-200 bg-white text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
          disabled={isRefetching}
        >
          <RefreshCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
        </Button>
      </div>

      {/* --- Table --- */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-white/5 dark:bg-slate-900/40 dark:backdrop-blur-sm dark:shadow-xl transition-colors">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-white/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-200 dark:border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-slate-600 font-semibold h-11 dark:text-slate-400">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  className="border-slate-100 hover:bg-slate-50 transition-colors group dark:border-white/5 dark:hover:bg-white/5"
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
                <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-500">
                       <div className="mb-4 rounded-full bg-slate-100 p-4 border border-slate-200 dark:bg-slate-900 dark:border-white/5">
                         <Users className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                       </div>
                       <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No students found</p>
                       <p className="text-sm text-slate-500 dark:text-slate-500">There are no students assigned to this class yet.</p>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex items-center justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => table.previousPage()} 
          disabled={!table.getCanPreviousPage()}
          className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-8 text-xs dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-white/10"
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => table.nextPage()} 
          disabled={!table.getCanNextPage()}
          className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-8 text-xs dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-white/10"
        >
          Next
        </Button>
      </div>
    </div>
  );
}