"use client";

import { useState } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  Coffee,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

// Defined type for mock data to prevent TS inference errors
type AttendanceRecord = {
  date: Date;
  status: string;
  checkIn: string;
  checkOut: string;
  duration: string;
};

// Mock Data
const MOCK_ATTENDANCE: AttendanceRecord[] = Array.from({ length: 30 }).map(
  (_, i) => {
    const statuses = ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "LEAVE"];
    const status =
      statuses[Math.floor(Math.random() * statuses.length)] ?? "ABSENT"; // Fallback ensures string
    return {
      date: new Date(2024, 2, i + 1),
      status,
      checkIn: status === "ABSENT" ? "--:--" : "08:00 AM",
      checkOut: status === "ABSENT" ? "--:--" : "02:30 PM",
      duration: status === "ABSENT" ? "0h 0m" : "6h 30m",
    };
  },
);

export default function EmployeeAttendanceDetails() {
  // Removed unused 'params' hook to fix ESLint error
  const [selectedMonth, setSelectedMonth] = useState("march");

  // Breadcrumbs
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users/faculty/view", label: "Faculty" },
    { href: "#", label: "Attendance Details", current: true },
  ];

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ABSENT":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "LATE":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "LEAVE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-muted-foreground border-slate-500/20";
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* === BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-8 pt-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* === LEFT COLUMN: PROFILE CARD === */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="sticky top-24 overflow-hidden border border-emerald-500/20 bg-card shadow-xl backdrop-blur-xl">
                <div className="h-24 bg-gradient-to-br from-emerald-600/20 to-teal-900/20" />
                <CardContent className="relative px-6 pb-6">
                  <div className="absolute -top-12 left-6 h-24 w-24 overflow-hidden rounded-2xl border-4 border-slate-900 bg-muted shadow-2xl">
                    {/* Placeholder for Profile Pic */}
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-emerald-500">
                      <User className="h-12 w-12" />
                    </div>
                  </div>

                  <div className="mt-14 space-y-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      John Doe
                    </h2>
                    <p className="text-sm font-medium text-emerald-400">
                      Senior Mathematics Teacher
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-200/60"
                    >
                      ID: EMP-2024-001
                    </Badge>
                  </div>

                  <Separator className="my-6 bg-emerald-500/10" />

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-foreground">
                      <Phone className="h-4 w-4 text-emerald-500/50" />
                      <span>+92 300 1234567</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <Mail className="h-4 w-4 text-emerald-500/50" />
                      <span className="truncate">john.doe@msns.edu.pk</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <MapPin className="h-4 w-4 text-emerald-500/50" />
                      <span className="truncate">Ghakhar, Gujranwala</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* === RIGHT COLUMN: ATTENDANCE DETAILS === */}
            <div className="space-y-6 lg:col-span-3">
              {/* Controls & Title */}
              <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-500/10 bg-card p-4 backdrop-blur-sm sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-foreground">
                    Attendance History
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Overview of monthly performance
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-[140px] border-emerald-500/20 bg-muted text-foreground">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="border-emerald-500/20 bg-card text-foreground">
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="february">February</SelectItem>
                      <SelectItem value="march">March</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-emerald-500/20 bg-muted text-emerald-400 hover:bg-emerald-900/20"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  {
                    label: "Present",
                    value: "22",
                    icon: CheckCircle2,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    label: "Absent",
                    value: "03",
                    icon: XCircle,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                  },
                  {
                    label: "Late Arrival",
                    value: "04",
                    icon: Clock,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                  },
                  {
                    label: "Leaves",
                    value: "01",
                    icon: Coffee,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                ].map((stat, i) => (
                  <Card
                    key={i}
                    className="border-emerald-500/10 bg-card shadow-lg backdrop-blur-sm"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detail Table */}
              <Card className="overflow-hidden border-emerald-500/10 bg-card shadow-xl backdrop-blur-md">
                <CardHeader className="border-b border-emerald-500/10 px-6 py-4">
                  <CardTitle className="text-lg text-foreground">
                    Daily Logs
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-950/20 text-xs uppercase text-emerald-100/60">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Check In</th>
                        <th className="px-6 py-3">Check Out</th>
                        <th className="px-6 py-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                      {MOCK_ATTENDANCE.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="transition-colors hover:bg-emerald-500/5"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-emerald-500/50" />
                              {row.date.toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${getStatusColor(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-muted-foreground">
                            {row.checkIn}
                          </td>
                          <td className="px-6 py-4 font-mono text-muted-foreground">
                            {row.checkOut}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-emerald-400">
                            <span className="rounded bg-emerald-500/5 px-2 py-1">
                              {row.duration}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
