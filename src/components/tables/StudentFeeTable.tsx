"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import { FileSearch } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

export function FeeAssignmentTable() {
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")

  const { data: sessions, isLoading: isLoadingSessions } = api.session.getSessions.useQuery()
  const { data: classes, isLoading: isLoadingClasses } = api.class.getClasses.useQuery()
  const { data: feeAssignments, isLoading: isLoadingFeeAssignments } =
    api.fee.getFeeAssignmentsByClassAndSession.useQuery(
      { classId: selectedClass, sessionId: selectedSession },
      { enabled: !!(selectedClass && selectedSession) },
    )

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">Fee Assignments</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Filters Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-[240px]">
                {isLoadingSessions ? (
                  <Skeleton className="h-4 w-[160px]" />
                ) : (
                  <SelectValue placeholder="Select Session" />
                )}
              </SelectTrigger>
              <SelectContent>
                {sessions?.map((session) => (
                  <SelectItem key={session.sessionId} value={session.sessionId}>
                    <div className="flex items-center gap-2">
                      <span>{session.sessionName}</span>
                      <Badge variant="outline" className="ml-2">
                        {session.sessionName}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[240px]">
                {isLoadingClasses ? (
                  <Skeleton className="h-4 w-[160px]" />
                ) : (
                  <SelectValue placeholder="Select Class" />
                )}
              </SelectTrigger>
              <SelectContent>
                {classes?.map((class_) => (
                  <SelectItem key={class_.classId} value={class_.classId}>
                    <div className="flex items-center gap-2">
                      <span>Grade {class_.grade}</span>
                      <Badge variant="outline" className="ml-2">
                        {class_.section}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {feeAssignments && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Total Assignments:</span>
              <Badge variant="secondary">{feeAssignments.length}</Badge>
            </div>
          )}
        </div>

        {/* Table Section */}
        {isLoadingFeeAssignments ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : feeAssignments && feeAssignments.length > 0 ? (
          <div className="rounded-md border">
            <div className="relative overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-[25%]">Student</TableHead>
                    <TableHead>Fee Details</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Final Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeAssignments.map((assignment) => (
                    <TableRow 
                      key={assignment.sfcId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {assignment.studentClass.student.studentName}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="w-fit text-xs font-mono"
                          >
                            Reg: {assignment.studentClass.student.registrationNumber}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{assignment.fees.level}</span>
                          <span className="text-sm text-muted-foreground">
                            {assignment.fees.level}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹ {assignment.fees.tuitionFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="text-red-600">
                            - ₹ {assignment.discount.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({assignment.discountByPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-700">
                        ₹ {(assignment.fees.tuitionFee - assignment.discount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center border-2 border-dashed rounded-lg">
            <FileSearch className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-medium">No fee assignments found</h3>
              <p className="text-sm text-muted-foreground">
                {selectedClass && selectedSession 
                  ? "Try selecting different filters" 
                  : "Select a class and session to view assignments"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}