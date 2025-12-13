'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select"
import { api } from "~/trpc/react"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown
} from "lucide-react"
import { SalarySlip } from './SalarySlip'

type SortField = 'employeeName' | 'baseSalary' | 'totalSalary' | 'assignedDate'
type SortOrder = 'asc' | 'desc'

// Matches the type expected by SalarySlip
type SalaryData = {
  id: string
  employeeId: string
  baseSalary: number
  increment: number
  totalSalary: number
  assignedDate: Date
  sessionId: string
  Employees: {
    employeeName: string
  }
  Sessions: {
    sessionName: string
  }
}

type SalaryTableProps = {
  page: number
  pageSize: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  searchTerm: string
}

export function SalaryTable({ 
  page,
  pageSize,
  setPage,
  setPageSize,
  searchTerm
}: SalaryTableProps) {
  const [sortField, setSortField] = useState<SortField>('assignedDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data, isLoading, error } = api.salary.getSalaries.useQuery({
    page,
    pageSize,
    searchTerm,
    sortField,
    sortOrder
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select 
          value={pageSize.toString()} 
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="20">20 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button variant="ghost" onClick={() => handleSort('employeeName')}>
                  Employee Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('baseSalary')}>
                  Base Salary
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Increment</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('totalSalary')}>
                  Total Salary
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('assignedDate')}>
                  Assigned Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Session</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.salaries.map((salary: SalaryData) => (
              <TableRow key={salary.id}>
                <TableCell className="font-medium">
                  {salary.Employees.employeeName}
                </TableCell>
                <TableCell>{salary.baseSalary.toLocaleString()} PKR</TableCell>
                <TableCell>{salary.increment.toLocaleString()} PKR</TableCell>
                <TableCell>{salary.totalSalary.toLocaleString()} PKR</TableCell>
                <TableCell>
                  {new Date(salary.assignedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{salary.Sessions.sessionName}</TableCell>
                <TableCell className="text-right">
                  {/* Trigger the PDF Slip Dialog */}
                  <SalarySlip salary={salary} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data?.totalCount ?? 0)} of {data?.totalCount ?? 0} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}