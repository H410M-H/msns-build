"use client";

import type React from "react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { Progress } from "~/components/ui/progress";
import { Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { cn } from "~/lib/utils";

interface PaymentInfo {
  isPaid: boolean;
  studentId: string;
  amount: number;
}

interface ClassFeeData {
  className: string;
  studentCount: number;
  totalExpected: number;
  totalPaid: number;
  payments: PaymentInfo[];
}

interface MonthlyFeeData {
  grandExpected: number;
  grandTotal: number;
  outstanding: number;
  feesByClass: ClassFeeData[];
}

interface MonthlyFeeSummaryProps {
  sessionId: string;
  year: number;
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
];

export function MonthlyFeeSummary({ sessionId, year }: MonthlyFeeSummaryProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const monthlyData = api.fee.getFeeByEachMonth.useQuery(
    { month: selectedMonth, year },
    { enabled: !!sessionId },
  );

  const data = monthlyData.data as MonthlyFeeData | undefined;

  return (
    <div className="space-y-6">
      {/* Month Selector and Summary */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={String(month.value)}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="font-medium text-slate-600">{year}</span>
        </div>

        {data && (
          <div className="flex flex-wrap gap-4">
            <SummaryBadge
              icon={DollarSign}
              label="Expected"
              value={`Rs. ${data.grandExpected.toLocaleString()}`}
              color="blue"
            />
            <SummaryBadge
              icon={TrendingUp}
              label="Collected"
              value={`Rs. ${data.grandTotal.toLocaleString()}`}
              color="green"
            />
            <SummaryBadge
              icon={Users}
              label="Outstanding"
              value={`Rs. ${data.outstanding.toLocaleString()}`}
              color="orange"
            />
          </div>
        )}
      </div>

      {/* Class-wise Summary Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">
            Class-wise Collection for{" "}
            {months.find((m) => m.value === selectedMonth)?.label} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.isLoading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
          ) : !data?.feesByClass.length ? (
            <div className="py-8 text-center text-muted-foreground">
              No fee data for this month
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.feesByClass.map((cls: ClassFeeData) => {
                    const collectionRate =
                      cls.totalExpected > 0
                        ? (cls.totalPaid / cls.totalExpected) * 100
                        : 0;
                    const paidStudents = cls.payments.filter(
                      (p: PaymentInfo) => p.isPaid,
                    ).length;

                    return (
                      <TableRow
                        key={cls.className}
                        className="hover:bg-slate-50"
                      >
                        <TableCell>
                          <span className="font-medium text-slate-900">
                            {cls.className}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-mono">
                            {paidStudents}/{cls.studentCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rs. {cls.totalExpected.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          Rs. {cls.totalPaid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          Rs.{" "}
                          {(cls.totalExpected - cls.totalPaid).toLocaleString()}
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={collectionRate}
                              className="h-2 flex-1"
                            />
                            <span
                              className={cn(
                                "w-12 text-right text-xs font-medium",
                                collectionRate >= 90
                                  ? "text-emerald-600"
                                  : collectionRate >= 50
                                    ? "text-amber-600"
                                    : "text-red-600",
                              )}
                            >
                              {collectionRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface SummaryBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "blue" | "green" | "orange";
}

function SummaryBadge({ icon: Icon, label, value, color }: SummaryBadgeProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2",
        colorClasses[color],
      )}
    >
      <Icon className="h-4 w-4" />
      <div>
        <p className="text-xs opacity-80">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
