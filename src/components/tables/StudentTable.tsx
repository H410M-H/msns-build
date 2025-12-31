// File: src/components/tables/StudentTable.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import Link from "next/link";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  type VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type RowData, 
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "~/hooks/use-toast";

import { CSVUploadDialog } from "../forms/student/FileInput";
import { StudentDeletionDialog } from "../forms/student/StudentDeletion";
import { StudentEditDialog } from "../forms/student/StudentEdit";
import { 
  PlusCircle, 
  RefreshCw, 
  Search, 
  Pencil, 
  Copy, 
  Settings2, 
  IdCard, 
  UserPlus, 
  Loader2, 
  ArrowUpDown 
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { DownloadPdfButton } from "../ui/DownloadPdfButton";
import type { Students } from "@prisma/client";

// --- Types ---
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

type StudentProps = Students & {
  address?: string;
  additionalContact?: string | null;
  education?: string | null;
  maritalStatus?: string | null;
  fatherOccupation?: string | null;
  fatherDesignation?: string | null;
};

// --- Helper Hook: Debounce ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Add To Class Dialog ---
const addToClassSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  sessionId: z.string().min(1, "Session is required"),
})

function AddToClassDialog({ 
  student, 
  open, 
  onOpenChange 
}: { 
  student: StudentProps | null
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const { toast } = useToast()
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof addToClassSchema>>({
    resolver: zodResolver(addToClassSchema),
    defaultValues: {
      classId: "",
      sessionId: "",
    },
  })

  // Queries
  const { data: sessions, isLoading: sessionsLoading } = api.session.getSessions.useQuery()
  const { data: classes, isLoading: classesLoading } = api.class.getClasses.useQuery()

  const addToClass = api.allotment.addToClass.useMutation({
    onSuccess: async () => {
      toast({ title: "Success", description: "Student added to class successfully." })
      await utils.allotment.invalidate() // Invalidate allotment data
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const onSubmit = (values: z.infer<typeof addToClassSchema>) => {
    if (!student) return
    addToClass.mutate({
      studentId: student.studentId,
      classId: values.classId,
      sessionId: values.sessionId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-emerald-600 dark:text-emerald-400">Add to Class</DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign <span className="text-slate-900 dark:text-white font-medium">{student?.studentName}</span> to a class.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Session Select */}
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-200">Session</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900 dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-200" disabled={sessionsLoading}>
                        <SelectValue placeholder={sessionsLoading ? "Loading..." : "Select Session"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
                      {sessions?.map((session) => (
                        <SelectItem key={session.sessionId} value={session.sessionId}>
                          {session.sessionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Select */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-200">Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900 dark:bg-slate-950 dark:border-emerald-500/30 dark:text-slate-200" disabled={classesLoading}>
                        <SelectValue placeholder={classesLoading ? "Loading..." : "Select Class"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
                      {classes?.map((cls) => (
                        <SelectItem key={cls.classId} value={cls.classId}>
                          Grade {cls.grade} {cls.section ? `(${cls.section})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={addToClass.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto dark:hover:bg-emerald-500"
              >
                {addToClass.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Class
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// --- Main Table Component ---
export const StudentTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  // Dialog States
  const [editingStudent, setEditingStudent] = useState<StudentProps | null>(null);
  const [studentToAssign, setStudentToAssign] = useState<StudentProps | null>(null);
  
  // Search State
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const { data: students, refetch, isLoading, isRefetching } = api.student.getStudents.useQuery();

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
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-emerald-500/20 hover:text-emerald-700 px-2 -ml-2 font-semibold text-slate-600 dark:text-emerald-100/80 dark:hover:text-white"
            >
              Reg #
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          )
        },
        cell: ({ row }) => <span className="font-mono text-emerald-700 dark:text-emerald-200 text-xs sm:text-sm">{row.getValue("registrationNumber")}</span>,
      },
      {
        accessorKey: "admissionNumber",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-emerald-500/20 hover:text-emerald-700 px-2 -ml-2 font-semibold text-slate-600 dark:text-emerald-100/80 dark:hover:text-white"
            >
              Adm #
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          )
        },
        cell: ({ row }) => <span className="font-mono text-slate-600 dark:text-slate-300 text-xs sm:text-sm">{row.getValue("admissionNumber")}</span>,
      },
      {
        accessorKey: "studentName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-emerald-500/20 hover:text-emerald-700 px-2 -ml-2 font-semibold text-slate-600 dark:text-emerald-100/80 dark:hover:text-white"
            >
              Student Name
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          )
        },
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-white">{row.getValue("studentName")}</span>
                <span className="text-xs text-slate-500 md:hidden">{row.original.fatherName}</span>
            </div>
        ),
      },
      {
        accessorKey: "fatherName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-emerald-500/20 hover:text-emerald-700 px-2 -ml-2 font-semibold text-slate-600 dark:text-emerald-100/80 dark:hover:text-white"
            >
              Father Name
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          )
        },
        cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.getValue("fatherName")}</span>,
        meta: { className: "hidden md:table-cell" }, 
      },
      {
        accessorKey: "fatherMobile",
        header: "Father Mobile",
        cell: ({ row }) => <span className="text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">{row.getValue("fatherMobile")}</span>,
        meta: { className: "hidden lg:table-cell" },
      },
      {
        accessorKey: "dateOfBirth",
        header: "DOB",
        cell: ({ row }) => {
          const dateValue = row.getValue("dateOfBirth");
          if (!dateValue || dateValue === "none") return <span className="text-slate-400 dark:text-slate-500 italic text-xs">N/A</span>;
          const date = new Date(dateValue as string);
          return <span className="text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">{!isNaN(date.getTime()) ? date.toLocaleDateString() : dateValue as string}</span>;
        },
        meta: { className: "hidden xl:table-cell" },
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => {
          const gender = row.original.gender;
          return (
            <span className={`capitalize text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${
              gender === 'MALE' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-500/30' : 
              gender === 'FEMALE' ? 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-500/30' : 
              'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500/30'
            }`}>
              {gender ? gender.toLowerCase() : "N/A"}
            </span>
          );
        },
        meta: { className: "hidden sm:table-cell" },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full dark:text-slate-400 dark:hover:text-white dark:hover:bg-emerald-500/20">
                <DotsHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700 w-56 shadow-xl dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-emerald-500/20" />
              
              <DropdownMenuItem 
                onClick={() => setStudentToAssign(row.original)}
                className="cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 text-emerald-600 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20 dark:text-emerald-400"
              >
                <UserPlus className="mr-2 h-3.5 w-3.5" />
                Add to Class
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setEditingStudent(row.original)}
                className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit Student
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => {
                    void navigator.clipboard.writeText(row.original.admissionNumber || "");
                }}
                className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-emerald-500/20 dark:focus:bg-emerald-500/20"
              >
                <Copy className="mr-2 h-3.5 w-3.5 text-slate-400" />
                Copy Adm #
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
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      globalFilter: debouncedGlobalFilter,
    },
    onGlobalFilterChange: setGlobalFilter, 
    globalFilterFn: "auto", 
  });

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      {/* --- Top Controls --- */}
      <div className="rounded-xl bg-white/80 p-4 shadow-sm border border-slate-200 backdrop-blur-md sticky top-2 z-30 transition-colors dark:bg-slate-900/80 dark:border-emerald-500/20 dark:shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-emerald-500/50" />
              <Input
                placeholder="Search by name, reg, or father..."
                value={globalFilter} 
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all dark:bg-slate-950/50 dark:border-emerald-500/30 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
             {/* Column Visibility Toggle */}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-200 bg-white text-slate-600 hover:text-emerald-600 dark:border-emerald-500/30 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:text-emerald-400">
                  <Settings2 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-emerald-500/20" />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize focus:bg-slate-100 dark:focus:bg-emerald-500/20"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id.replace(/([A-Z])/g, ' $1').trim()} 
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                disabled={isRefetching}
                className="shrink-0 bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <StudentDeletionDialog
                    studentIds={table
                    .getFilteredSelectedRowModel()
                    .rows.map((row) => row.original.studentId)
                    .filter(Boolean)}
                />
            )}
            
            <CSVUploadDialog onSuccess={() => refetch()} />
            <DownloadPdfButton reportType="students" />
            
            {/* View Cards Button */}
            <Button asChild size="sm" className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-emerald-500/30">
              <Link href="/admin/users/student/edit" className="flex items-center gap-2">
                <IdCard className="h-3.5 w-3.5" />
                View Cards
              </Link>
            </Button>

            <Button asChild size="sm" className="col-span-2 sm:col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/20 dark:hover:bg-emerald-500">
              <Link href="/admin/users/student/create" className="flex items-center gap-2">
                <PlusCircle className="h-3.5 w-3.5" />
                New Student
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Main Table Container --- */}
      <div className="rounded-xl border border-slate-200 bg-white/60 shadow-lg backdrop-blur-sm overflow-hidden flex flex-col transition-colors dark:border-emerald-500/20 dark:bg-slate-900/60 dark:shadow-xl">
        {/* Horizontal Scroll Wrapper for Mobile */}
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-slate-50 dark:bg-emerald-950/40 sticky top-0 z-20">
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-slate-200 dark:border-emerald-500/20 hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                        const metaClass = header.column.columnDef.meta?.className ?? "";
                        
                        return (
                            <TableHead key={header.id} className={`font-semibold text-slate-600 dark:text-emerald-100/80 h-11 whitespace-nowrap ${metaClass}`}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        )
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-slate-100 dark:border-emerald-500/10">
                    {columns.map((col, j) => {
                          const metaClass = col.meta?.className ?? "";
                          return (
                            <TableCell key={j} className={metaClass}> 
                              <Skeleton className="h-5 w-full bg-slate-100 dark:bg-slate-800/50 rounded" />
                            </TableCell>
                          )
                    })}
                    </TableRow>
                ))
                ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors border-slate-100 data-[state=selected]:bg-emerald-50 group dark:hover:bg-emerald-900/10 dark:border-emerald-500/10 dark:data-[state=selected]:bg-emerald-900/20"
                    data-state={row.getIsSelected() ? "selected" : ""}
                    >
                    {row.getVisibleCells().map((cell) => {
                          const metaClass = cell.column.columnDef.meta?.className ?? "";
                        return (
                            <TableCell key={cell.id} className={`py-3 ${metaClass}`}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        )
                    })}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-500">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800/50">
                            <Search className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No students found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        {/* --- Pagination Footer --- */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 py-4 border-t border-slate-200 bg-slate-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="text-center sm:text-left">
              Showing {table.getFilteredRowModel().rows.length} results
            </span>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">Rows per page</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-white border-slate-300 text-slate-700 text-xs dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top" className="bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-slate-200">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-300 bg-white text-slate-600 hover:bg-slate-100 w-24 dark:border-emerald-500/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-slate-300 bg-white text-slate-600 hover:bg-slate-100 w-24 dark:border-emerald-500/30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-white"
            >
              Next
            </Button>
          </div>
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

      {/* Add To Class Dialog Logic */}
      <AddToClassDialog 
        student={studentToAssign} 
        open={!!studentToAssign} 
        onOpenChange={(open) => !open && setStudentToAssign(null)} 
      />
    </div>
  );
};