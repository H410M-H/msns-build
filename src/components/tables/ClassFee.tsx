"use client"

import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { api } from "~/trpc/react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, Download, RefreshCw, CheckCircle2, XCircle, Search, Printer } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "~/components/ui/skeleton"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import { LateFeeDialog } from "../forms/fee/late-fee-dialog"
import { type ExportData, exportToCSV } from "~/lib/export-utils"
import { FeeWaiverDialog } from "../forms/fee/fee-waiver-dialog"


export type FeeProps = {
  tuitionFee: number
  examFund: number
  computerLabFund?: number | null
  studentIdCardFee: number
  infoAndCallsFee: number
  admissionFee: number
  type?: string
  level?: string
}

export type ClassFeeProps = {
  sfcId: string
  studentClassId: string
  feeId: string
  discount: number
  discountByPercent: number
  discountDescription: string
  tuitionPaid: boolean
  examFundPaid: boolean
  computerLabPaid: boolean
  studentIdCardPaid: boolean
  infoAndCallsPaid: boolean
  month?: number
  year?: number
  lateFee?: number
  paidAt?: Date | null
  createdAt: Date
  updatedAt: Date
  fees: FeeProps
  studentClass: {
    student: {
      studentId: string
      registrationNumber: string
      studentName: string
      fatherMobile?: string
    }
    class: {
      grade: string
      section: string
    }
  }
}

interface ClassFeeTableProps {
  classId: string
  sessionId: string
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

export function ClassFeeTable({ classId, sessionId }: ClassFeeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const utils = api.useUtils()

  const {
    data: classFeesData,
    isLoading,
    refetch,
  } = api.fee.getFeeAssignmentsByClassAndSession.useQuery(
    { classId, sessionId, month: selectedMonth, year: selectedYear },
    { refetchOnWindowFocus: false },
  )

  const classFees = classFeesData as ClassFeeProps[] | undefined

  const { mutate: updatePayment } = api.fee.updatePaymentStatus.useMutation({
    onSuccess: async () => {
      await utils.fee.getFeeAssignmentsByClassAndSession.invalidate()
      toast.success("Payment status updated")
    },
  })

  const { mutate: batchUpdate, isPending: isBatchUpdating } = api.fee.batchUpdatePaymentStatus.useMutation({
    onSuccess: async (data: { updatedCount: number }) => {
      await utils.fee.getFeeAssignmentsByClassAndSession.invalidate()
      toast.success(`Updated ${data.updatedCount} records`)
      setRowSelection({})
    },
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handlePaymentToggle = (
    sfcId: string,
    feeType: "tuition" | "examFund" | "computerLab" | "studentIdCard" | "infoAndCalls",
    paid: boolean,
  ) => {
    updatePayment({ sfcId, feeType, paid })
  }

  const calculateTotalFee = (fee: FeeProps, lateFee = 0): number => {
    return (
      fee.tuitionFee + fee.examFund + (fee.computerLabFund ?? 0) + fee.studentIdCardFee + fee.infoAndCallsFee + lateFee
    )
  }

  const calculatePaidFee = (classFee: ClassFeeProps): number => {
    const { fees } = classFee
    let paidTotal = 0

    if (classFee.tuitionPaid) paidTotal += fees.tuitionFee
    if (classFee.examFundPaid) paidTotal += fees.examFund
    if (classFee.computerLabPaid) paidTotal += fees.computerLabFund ?? 0
    if (classFee.studentIdCardPaid) paidTotal += fees.studentIdCardFee
    if (classFee.infoAndCallsPaid) paidTotal += fees.infoAndCallsFee

    return Math.max(paidTotal - classFee.discount, 0)
  }

  const columns: ColumnDef<ClassFeeProps>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
    },
    {
      accessorKey: "studentClass.student.registrationNumber",
      header: "Reg. No.",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          {row.original.studentClass.student.registrationNumber}
        </Badge>
      ),
    },
    {
      accessorKey: "studentClass.student.studentName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.studentClass.student.studentName}</span>,
    },
    {
      id: "feeBreakdown",
      header: "Payment Status",
      cell: ({ row }) => {
        const fee = row.original.fees
        const items = [
          { label: "Tuition", value: fee.tuitionFee, paid: row.original.tuitionPaid, type: "tuition" as const },
          { label: "Exam", value: fee.examFund, paid: row.original.examFundPaid, type: "examFund" as const },
          {
            label: "Lab",
            value: fee.computerLabFund ?? 0,
            paid: row.original.computerLabPaid,
            type: "computerLab" as const,
          },
          {
            label: "ID",
            value: fee.studentIdCardFee,
            paid: row.original.studentIdCardPaid,
            type: "studentIdCard" as const,
          },
          {
            label: "Info",
            value: fee.infoAndCallsFee,
            paid: row.original.infoAndCallsPaid,
            type: "infoAndCalls" as const,
          },
        ]

        return (
          <div className="flex flex-wrap gap-1">
            {items.map((item) => (
              <Badge
                key={item.label}
                variant={item.paid ? "default" : "destructive"}
                className="cursor-pointer text-xs"
                onClick={() => handlePaymentToggle(row.original.sfcId, item.type, !item.paid)}
              >
                {item.paid ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {item.label}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: "totalFee",
      header: "Total Fee",
      cell: ({ row }) => {
        const baseFee = calculateTotalFee(row.original.fees, 0)
        const discount =
          row.original.discount ||
          (row.original.discountByPercent > 0 ? (baseFee * row.original.discountByPercent) / 100 : 0)
        const lateFee = row.original.lateFee ?? 0
        const total = baseFee - discount + lateFee

        return (
          <div>
            <span className="font-semibold">Rs. {total.toLocaleString()}</span>
            {discount > 0 && (
              <span className="text-xs text-purple-600 block">-Rs. {discount.toLocaleString()} waiver</span>
            )}
            {lateFee > 0 && <span className="text-xs text-orange-600 block">+Rs. {lateFee.toLocaleString()} late</span>}
          </div>
        )
      },
    },
    {
      id: "totalPaid",
      header: "Paid",
      cell: ({ row }) => {
        const paidFee = calculatePaidFee(row.original)
        const baseFee = calculateTotalFee(row.original.fees, row.original.lateFee ?? 0)
        const discount =
          row.original.discount ||
          (row.original.discountByPercent > 0 ? (baseFee * row.original.discountByPercent) / 100 : 0)
        const total = baseFee - discount
        const isPaid = paidFee >= total

        return (
          <div className={isPaid ? "text-emerald-600" : "text-orange-600"}>
            <span className="font-semibold">Rs. {paidFee.toLocaleString()}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const baseFee = calculateTotalFee(row.original.fees, 0)
        const dueDate = new Date(row.original.year ?? currentYear, (row.original.month ?? 1) - 1, 10)

        return (
          <div className="flex items-center gap-1">
            <LateFeeDialog
              sfcId={row.original.sfcId}
              studentName={row.original.studentClass.student.studentName}
              currentLateFee={row.original.lateFee ?? 0}
              baseFee={baseFee}
              dueDate={dueDate}
              onUpdate={handleRefresh}
            />
            <FeeWaiverDialog
              sfcId={row.original.sfcId}
              studentName={row.original.studentClass.student.studentName}
              baseFee={baseFee}
              currentDiscount={row.original.discount}
              currentDiscountPercent={row.original.discountByPercent}
              currentDescription={row.original.discountDescription}
              onUpdate={handleRefresh}
            />
            <Button variant="ghost" size="icon" onClick={() => toast.info("Receipt printing...")}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: classFees ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  const selectedSfcIds = table.getSelectedRowModel().rows.map((row) => row.original.sfcId)

  const totals = useMemo(() => {
    const data = classFees ?? []
    return {
      totalFee: data.reduce((sum: number, f: ClassFeeProps) => {
        const baseFee = calculateTotalFee(f.fees, f.lateFee ?? 0)
        const discount = f.discount || (f.discountByPercent > 0 ? (baseFee * f.discountByPercent) / 100 : 0)
        return sum + baseFee - discount
      }, 0),
      totalPaid: data.reduce((sum: number, f: ClassFeeProps) => sum + calculatePaidFee(f), 0),
    }
  }, [classFees])

  const handleExport = () => {
    const data = classFees ?? []
    if (data.length === 0) {
      toast.error("No data to export")
      return
    }

    const exportData: ExportData = {
      columns: [
        { key: "regNo", label: "Reg. No.", width: 15 },
        { key: "studentName", label: "Student Name", width: 25 },
        { key: "tuition", label: "Tuition", width: 12 },
        { key: "examFund", label: "Exam Fund", width: 12 },
        { key: "computerLab", label: "Computer Lab", width: 12 },
        { key: "idCard", label: "ID Card", width: 12 },
        { key: "infoAndCalls", label: "Info & Calls", width: 12 },
        { key: "discount", label: "Discount", width: 12 },
        { key: "lateFee", label: "Late Fee", width: 12 },
        { key: "totalFee", label: "Total Fee", width: 15 },
        { key: "paidAmount", label: "Paid", width: 15 },
        { key: "status", label: "Status", width: 10 },
      ],
      rows: data.map((f: ClassFeeProps) => {
        const baseFee = calculateTotalFee(f.fees, 0)
        const discount = f.discount || (f.discountByPercent > 0 ? (baseFee * f.discountByPercent) / 100 : 0)
        const total = baseFee - discount + (f.lateFee ?? 0)
        const paid = calculatePaidFee(f)
        const allPaid =
          f.tuitionPaid && f.examFundPaid && f.computerLabPaid && f.studentIdCardPaid && f.infoAndCallsPaid

        return {
          regNo: f.studentClass.student.registrationNumber,
          studentName: f.studentClass.student.studentName,
          tuition: f.tuitionPaid ? f.fees.tuitionFee : 0,
          examFund: f.examFundPaid ? f.fees.examFund : 0,
          computerLab: f.computerLabPaid ? (f.fees.computerLabFund ?? 0) : 0,
          idCard: f.studentIdCardPaid ? f.fees.studentIdCardFee : 0,
          infoAndCalls: f.infoAndCallsPaid ? f.fees.infoAndCallsFee : 0,
          discount,
          lateFee: f.lateFee ?? 0,
          totalFee: total,
          paidAmount: paid,
          status: allPaid ? "Paid" : "Pending",
        }
      }),
      sheetName: `Fee-${months[selectedMonth - 1]?.label}-${selectedYear}`,
      title: `Class Fee Report - ${months[selectedMonth - 1]?.label} ${selectedYear}`,
    }

    exportToCSV(exportData, `class-fee-${months[selectedMonth - 1]?.label}-${selectedYear}`)
    toast.success("Fee data exported successfully")
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 w-[200px] bg-white"
            />
          </div>
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[100px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedSfcIds.length > 0 && (
            <>
              <Button
                size="sm"
                onClick={() => batchUpdate({ sfcIds: selectedSfcIds, markAllPaid: true })}
                disabled={isBatchUpdating}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Mark {selectedSfcIds.length} as Paid
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => batchUpdate({ sfcIds: selectedSfcIds, markAllPaid: false })}
                disabled={isBatchUpdating}
              >
                Mark Unpaid
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
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
            {isLoading || isRefreshing ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-slate-500">
                  No fee records found for this month
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-500">Total Expected</p>
            <p className="font-bold text-slate-900">Rs. {totals.totalFee.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Collected</p>
            <p className="font-bold text-emerald-600">Rs. {totals.totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="font-bold text-orange-600">Rs. {(totals.totalFee - totals.totalPaid).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
