"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import {
  Loader2,
  MapPin,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  RefreshCcw,
  Search,
  Filter,
  User,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CSVUploadDialog } from "../forms/student/FileInput"; // Assuming shared or similar path
import Link from "next/link";
import Image from "next/image";

// Keep local type or import from Prisma if available
type Employee = {
  employeeId: string;
  registrationNumber: string;
  admissionNumber: string;
  employeeName: string;
  fatherName: string;
  gender: "MALE" | "FEMALE" | "CUSTOM";
  dob: string;
  doj: string;
  designation: string;
  education: string;
  mobileNo: string;
  profilePic?: string | null;
  residentialAddress: string;
};

export default function EmployeeCredDetails() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } =
    api.employee.getEmployees.useQuery();

  useEffect(() => {
    if (data) {
      setEmployees(data as unknown as Employee[]);
    }
  }, [data]);

  const filteredEmployees = employees.filter((employee) =>
    employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const isValidImageSrc = (src: string | null | undefined): boolean => {
    if (!src) return false;
    return src.startsWith("http") || src.startsWith("/");
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
        </div>
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-emerald-500" />
        <p className="relative z-10 animate-pulse text-sm text-emerald-500/80">
          Loading faculty directory...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-4 flex h-64 items-center justify-center rounded-xl border border-red-500/20 bg-red-900/10 backdrop-blur-sm">
        <p className="font-medium text-red-400">
          Failed to load employee data. Please try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-card">
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 mx-auto w-full max-w-[1920px] space-y-6 p-4 pb-20 sm:p-6 lg:p-8">
        {/* === Header Controls === */}
        <div className="sticky top-4 z-40 flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-card p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:flex-row lg:items-center">
          {/* Search Bar */}
          <div className="group relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500/50 transition-colors group-focus-within:text-emerald-400" />
            <Input
              placeholder="Search faculty by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border-emerald-500/20 bg-card pl-10 text-foreground transition-all placeholder:text-muted-foreground hover:bg-card focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-11 rounded-xl border-emerald-500/20 bg-muted px-4 text-emerald-400 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-emerald-900/30 hover:text-emerald-300"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Refresh</span>
            </Button>

            <div className="hidden sm:block">
              <CSVUploadDialog />
            </div>

            <Button
              asChild
              size="sm"
              className="h-11 rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-foreground shadow-lg shadow-emerald-900/20 transition-all hover:from-emerald-500 hover:to-teal-500"
            >
              <Link href="/admin/users/faculty/create">
                <span className="whitespace-nowrap font-semibold tracking-wide">
                  Create New
                </span>
              </Link>
            </Button>
            {/* View Table Button (Optional if grid is default view) */}
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="h-11 rounded-xl bg-muted px-4 text-foreground hover:bg-slate-700"
            >
              <Link href="/admin/users/faculty/view">View List</Link>
            </Button>
          </div>
        </div>

        {/* === Results Meta === */}
        <div className="flex items-center justify-between px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>
            Showing{" "}
            <span className="text-emerald-400">{filteredEmployees.length}</span>{" "}
            Employees
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block">Sort by: Name</span>
            <Filter className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* === Card Grid === */}
        <AnimatePresence mode="popLayout">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {filteredEmployees.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-32 text-muted-foreground"
              >
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/10 bg-card">
                  <Search className="h-10 w-10 text-emerald-500 opacity-30" />
                </div>
                <p className="text-lg">No employees found</p>
              </motion.div>
            ) : (
              filteredEmployees.map((employee) => (
                <motion.div
                  key={employee.employeeId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  <Card className="group relative h-full overflow-hidden rounded-2xl border border-emerald-500/10 bg-card shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-900/20">
                    {/* Decorative Elements */}
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <CardContent className="relative z-10 flex h-full flex-col p-5">
                      {/* Header Row: Image & Name */}
                      <div className="mb-5 flex items-start gap-4">
                        {/* Profile Image */}
                        <div className="relative shrink-0">
                          {isValidImageSrc(employee.profilePic) ? (
                            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-emerald-500/20 shadow-lg transition-colors group-hover:border-emerald-500/50 sm:h-20 sm:w-20">
                              <Image
                                src={employee.profilePic!}
                                alt={employee.employeeName}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-700 bg-muted shadow-inner transition-colors group-hover:border-emerald-500/30 sm:h-20 sm:w-20">
                              <span className="text-2xl font-bold text-muted-foreground transition-colors group-hover:text-emerald-400">
                                {employee.employeeName.charAt(0)}
                              </span>
                            </div>
                          )}
                          {/* Active Indicator (assuming all shown are active for now) */}
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        </div>

                        {/* Name & Designation */}
                        <div className="min-w-0 flex-1 space-y-1 pt-1">
                          <h2 className="truncate text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-emerald-300">
                            {employee.employeeName}
                          </h2>
                          <div className="flex items-center gap-1.5 truncate text-sm font-medium text-emerald-400">
                            <Briefcase className="h-3.5 w-3.5" />
                            {employee.designation}
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Badge
                              variant="outline"
                              className="h-5 border-emerald-500/20 bg-emerald-500/5 px-2 text-[15px] text-pink-300/50"
                            >
                              ID: {employee.admissionNumber}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="mb-4 grid flex-1 grid-cols-2 content-start gap-3 text-sm">
                        {/* Education */}
                        <div className="group/item col-span-2 flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-colors hover:border-emerald-500/20">
                          <GraduationCap className="h-3.5 w-3.5 text-emerald-500/70 group-hover/item:text-emerald-400" />
                          <span className="truncate text-xs text-foreground sm:text-sm">
                            {employee.education}
                          </span>
                        </div>

                        {/* Joining Date */}
                        <div className="group/item col-span-1 flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-colors hover:border-emerald-500/20">
                          <Clock className="h-3.5 w-3.5 text-emerald-500/70 group-hover/item:text-emerald-400" />
                          <span className="truncate text-xs text-foreground sm:text-sm">
                            Joined:{" "}
                            {new Date(employee.doj).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Gender */}
                        <div className="group/item col-span-1 flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-colors hover:border-emerald-500/20">
                          <User className="h-3.5 w-3.5 text-emerald-500/70 group-hover/item:text-emerald-400" />
                          <span className="truncate text-xs capitalize text-foreground sm:text-sm">
                            {employee.gender.toLowerCase()}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="group/item col-span-2 flex items-center gap-2 rounded-lg border border-border bg-card p-2 transition-colors hover:border-emerald-500/20">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500/70 group-hover/item:text-emerald-400" />
                          <span
                            className="truncate text-xs text-foreground sm:text-sm"
                            title={employee.residentialAddress}
                          >
                            {employee.residentialAddress || "No Address"}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Contacts & Actions */}
                      <div className="mt-auto flex items-center justify-between border-t border-emerald-500/10 pt-4">
                        <div className="flex flex-col gap-1 text-xs text-yellow-400/70">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-emerald-500/50" />
                            <span>{employee.mobileNo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-emerald-500/50" />
                            <span className="max-w-[120px] truncate sm:max-w-none">
                              {employee.admissionNumber
                                ? `${employee.admissionNumber.toLowerCase().replace(/\s/g, ".")}@msns.edu.pk`
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end">
                          {/* Placeholder for actions */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg border border-emerald-500/20 bg-emerald-900/10 p-0 text-emerald-400 transition-all hover:bg-emerald-600/20 hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
