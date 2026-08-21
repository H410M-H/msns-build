"use client";

import { useEffect, useState, useMemo } from "react";
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
  Edit,
  UserCircle,
  Shield,
  Award,
  BookOpen,
  FileText,
  Wrench,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { CSVUploadDialog } from "../forms/student/FileInput";
import { EmployeeEditDialog } from "../forms/employee/EmployeeEditDialog";
import Link from "next/link";
import type { Employees } from "@prisma/client";

// Shape of Employee data
type Employee = Employees & {
  BioMetric?: { fingerId: string } | null;
};

// --- Theme Helpers based on Designation & Gender ---

interface DesignationTheme {
  label: string;
  badge: string;
  ribbon: string;
  cardGlow: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getDesignationTheme(designation: string): DesignationTheme {
  switch (designation?.toUpperCase()) {
    case "ADMIN":
      return {
        label: "Administrator",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        ribbon: "from-rose-500 via-red-500 to-amber-500",
        cardGlow: "hover:border-rose-500/40 hover:shadow-rose-950/20",
        icon: Shield,
      };
    case "PRINCIPAL":
      return {
        label: "Principal",
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        ribbon: "from-purple-500 via-fuchsia-500 to-pink-500",
        cardGlow: "hover:border-purple-500/40 hover:shadow-purple-950/20",
        icon: Award,
      };
    case "HEAD":
      return {
        label: "Headmaster",
        badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        ribbon: "from-indigo-500 via-blue-500 to-cyan-500",
        cardGlow: "hover:border-indigo-500/40 hover:shadow-indigo-950/20",
        icon: Briefcase,
      };
    case "TEACHER":
      return {
        label: "Faculty Teacher",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        ribbon: "from-emerald-500 via-teal-500 to-cyan-500",
        cardGlow: "hover:border-emerald-500/40 hover:shadow-emerald-950/20",
        icon: BookOpen,
      };
    case "CLERK":
      return {
        label: "Clerical Staff",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        ribbon: "from-amber-500 via-orange-500 to-yellow-500",
        cardGlow: "hover:border-amber-500/40 hover:shadow-amber-950/20",
        icon: FileText,
      };
    case "WORKER":
      return {
        label: "Support Staff",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        ribbon: "from-cyan-500 via-slate-500 to-zinc-500",
        cardGlow: "hover:border-cyan-500/40 hover:shadow-cyan-950/20",
        icon: Wrench,
      };
    default:
      return {
        label: designation || "Staff",
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        ribbon: "from-slate-500 via-zinc-500 to-emerald-500",
        cardGlow: "hover:border-slate-500/40 hover:shadow-slate-950/20",
        icon: User,
      };
  }
}

interface GenderTheme {
  label: string;
  avatarRing: string;
  avatarFallback: string;
  genderChip: string;
  indicatorColor: string;
}

export function getGenderTheme(gender: string): GenderTheme {
  switch (gender?.toUpperCase()) {
    case "FEMALE":
      return {
        label: "Female",
        avatarRing: "border-pink-500/50 ring-2 ring-pink-500/30 shadow-pink-500/15",
        avatarFallback: "bg-gradient-to-br from-pink-950 via-rose-900 to-slate-950 text-pink-300",
        genderChip: "bg-pink-500/10 text-pink-400 border-pink-500/30",
        indicatorColor: "bg-pink-400 shadow-pink-400/50",
      };
    case "MALE":
      return {
        label: "Male",
        avatarRing: "border-sky-500/50 ring-2 ring-sky-500/30 shadow-sky-500/15",
        avatarFallback: "bg-gradient-to-br from-sky-950 via-blue-900 to-slate-950 text-sky-300",
        genderChip: "bg-sky-500/10 text-sky-400 border-sky-500/30",
        indicatorColor: "bg-sky-400 shadow-sky-400/50",
      };
    default:
      return {
        label: gender || "Custom",
        avatarRing: "border-teal-500/50 ring-2 ring-teal-500/30 shadow-teal-500/15",
        avatarFallback: "bg-gradient-to-br from-teal-950 via-emerald-900 to-slate-950 text-teal-300",
        genderChip: "bg-teal-500/10 text-teal-400 border-teal-500/30",
        indicatorColor: "bg-teal-400 shadow-teal-400/50",
      };
  }
}

export default function EmployeeCredDetails() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Dialog states
  const [editingEmployee, setEditingEmployee] = useState<Employees | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = api.employee.getEmployees.useQuery();

  useEffect(() => {
    if (data) {
      setEmployees(data as unknown as Employee[]);
    }
  }, [data]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        employee.employeeName.toLowerCase().includes(query) ||
        employee.registrationNumber.toLowerCase().includes(query) ||
        employee.admissionNumber.toLowerCase().includes(query) ||
        employee.mobileNo.includes(query);

      // Designation match
      const matchesDesignation =
        selectedDesignation === "ALL" ||
        employee.designation?.toUpperCase() === selectedDesignation;

      // Gender match
      const matchesGender =
        selectedGender === "ALL" ||
        employee.gender?.toUpperCase() === selectedGender;

      // Status match
      const status = employee.status ?? "Active";
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && status === "Active") ||
        (selectedStatus === "LEFT" && status === "Left") ||
        (selectedStatus === "RETIRED" && status === "Retired");

      return matchesSearch && matchesDesignation && matchesGender && matchesStatus;
    });
  }, [employees, searchQuery, selectedDesignation, selectedGender, selectedStatus]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
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
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-black to-slate-950" />
        </div>
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-emerald-500" />
        <p className="relative z-10 animate-pulse text-sm text-emerald-400 font-medium">
          Loading faculty & staff directory...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-4 flex h-64 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 backdrop-blur-sm">
        <p className="font-medium text-red-400">
          Failed to load employee data. Please try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-6 pb-20">
      {/* === Header Controls Bar === */}
      <div className="sticky top-4 z-40 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-card p-4 shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          {/* Search Bar */}
          <div className="group relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500/50 transition-colors group-focus-within:text-emerald-400" />
            <Input
              placeholder="Search by name, ID, phone, or registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border-emerald-500/20 bg-muted/40 pl-10 text-foreground transition-all placeholder:text-muted-foreground hover:bg-muted/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="h-11 rounded-xl border-emerald-500/20 bg-muted/50 px-4 text-emerald-400 backdrop-blur-md transition-all hover:bg-emerald-950/40 hover:text-emerald-300"
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
              className="h-11 rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500"
            >
              <Link href="/admin/users/faculty/create">
                <span className="whitespace-nowrap font-semibold tracking-wide">
                  Create New
                </span>
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="secondary"
              className="h-11 rounded-xl bg-muted px-4 text-foreground hover:bg-muted/80"
            >
              <Link href="/admin/users/faculty/view">View Table</Link>
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-500/10 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] mr-1">
            <SlidersHorizontal className="h-3 w-3" /> Filters:
          </span>

          {/* Designation Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "ADMIN", "PRINCIPAL", "HEAD", "TEACHER", "CLERK", "WORKER"].map((desig) => (
              <button
                key={desig}
                onClick={() => setSelectedDesignation(desig)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  selectedDesignation === desig
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {desig === "ALL" ? "All Roles" : desig}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Gender Filter Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { key: "ALL", label: "All Genders" },
              { key: "MALE", label: "Male" },
              { key: "FEMALE", label: "Female" },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => setSelectedGender(g.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  selectedGender === g.key
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { key: "ALL", label: "All Status" },
              { key: "ACTIVE", label: "Active" },
              { key: "LEFT", label: "Left" },
              { key: "RETIRED", label: "Retired" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStatus(st.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  selectedStatus === st.key
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === Results Count Meta === */}
      <div className="flex items-center justify-between px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>
          Showing <span className="text-emerald-400 font-bold">{filteredEmployees.length}</span> of{" "}
          <span className="text-slate-300">{employees.length}</span> Employees
        </span>
        <div className="flex items-center gap-2">
          <span>Sort: Alphabetical</span>
          <Filter className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* === Employee Cards Grid === */}
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
              className="col-span-full flex flex-col items-center justify-center py-28 text-muted-foreground"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/15 bg-card/60">
                <Search className="h-8 w-8 text-emerald-500 opacity-40" />
              </div>
              <p className="text-lg font-semibold text-foreground">No employees found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search keyword</p>
            </motion.div>
          ) : (
            filteredEmployees.map((employee) => {
              const desigTheme = getDesignationTheme(employee.designation);
              const genderTheme = getGenderTheme(employee.gender);
              const DesigIcon = desigTheme.icon;
              const initials = (employee.employeeName || "E")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const status = employee.status ?? "Active";

              return (
                <motion.div
                  key={employee.employeeId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  <Card
                    className={`group relative h-full flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl backdrop-blur-md transition-all duration-300 ${desigTheme.cardGlow} hover:shadow-2xl hover:-translate-y-1`}
                  >
                    {/* Dynamic Designation Gradient Ribbon */}
                    <div
                      className={`h-1.5 w-full bg-gradient-to-r ${desigTheme.ribbon} transition-opacity`}
                    />

                    <CardContent className="relative z-10 flex h-full flex-col p-5">
                      {/* Top Row: Avatar, Name & Designation */}
                      <div className="mb-4 flex items-start gap-4">
                        {/* Avatar with Dynamic Gender Ring */}
                        <div
                          className="relative shrink-0 cursor-pointer group/avatar"
                          onClick={() => {
                            if (isValidImageSrc(employee.profilePic)) {
                              setPreviewPhoto({
                                src: employee.profilePic!,
                                name: employee.employeeName,
                              });
                            }
                          }}
                        >
                          <Avatar
                            className={`h-16 w-16 rounded-2xl border-2 transition-all duration-300 group-hover/avatar:scale-105 sm:h-18 sm:w-18 ${genderTheme.avatarRing}`}
                          >
                            {isValidImageSrc(employee.profilePic) && (
                              <AvatarImage
                                src={employee.profilePic!}
                                alt={employee.employeeName}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback
                              className={`rounded-2xl font-black text-lg ${genderTheme.avatarFallback}`}
                            >
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          {/* Gender Indicator Badge on Avatar */}
                          <div
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${genderTheme.indicatorColor} flex items-center justify-center shadow-xs`}
                            title={`Gender: ${genderTheme.label}`}
                          />
                        </div>

                        {/* Employee Name, Designation Badge & ID */}
                        <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-emerald-400">
                              {employee.employeeName}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {/* Designation Badge */}
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${desigTheme.badge}`}
                            >
                              <DesigIcon className="h-3 w-3" />
                              {employee.designation}
                            </Badge>

                            {/* Gender Badge */}
                            <Badge
                              variant="outline"
                              className={`px-2 py-0.5 text-[10px] font-semibold ${genderTheme.genderChip}`}
                            >
                              {genderTheme.label}
                            </Badge>
                          </div>

                          {/* ID Pill */}
                          <div className="pt-1">
                            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                              Reg: {employee.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Chips Grid */}
                      <div className="mb-4 grid flex-1 grid-cols-2 content-start gap-2.5 text-xs">
                        {/* Father Name */}
                        <div className="col-span-2 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span className="truncate text-foreground font-medium">
                            S/O: {employee.fatherName}
                          </span>
                        </div>

                        {/* Education */}
                        <div className="col-span-2 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate text-foreground font-medium">
                            {employee.education && employee.education !== "none"
                              ? employee.education
                              : "Qualification: N/A"}
                          </span>
                        </div>

                        {/* Joining / Left Date */}
                        <div className="col-span-1 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                          <span className="truncate text-foreground text-[11px]">
                            {status === "Left" ? (
                              <span className="text-red-400 font-semibold">
                                Left: {employee.leftDate ? new Date(employee.leftDate).toLocaleDateString("en-PK", { month: "short", year: "numeric" }) : "Left"}
                              </span>
                            ) : (
                              <>
                                Joined: {employee.doj && employee.doj !== "none" ? new Date(employee.doj).toLocaleDateString("en-PK", { month: "short", year: "numeric" }) : "N/A"}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Status Chip */}
                        <div className="col-span-1 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                          {status === "Active" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="truncate font-semibold text-foreground text-[11px]">
                            {status}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="col-span-2 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="truncate text-foreground text-[11px]" title={employee.residentialAddress}>
                            {employee.residentialAddress || "Address not provided"}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Contacts & Action Menu */}
                      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                          {employee.mobileNo && employee.mobileNo !== "none" && (
                            <a
                              href={`tel:${employee.mobileNo}`}
                              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                            >
                              <Phone className="h-3 w-3 text-emerald-400" />
                              <span className="font-mono">{employee.mobileNo}</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${employee.admissionNumber ? employee.admissionNumber.toLowerCase() : "user"}@msns.edu.pk`}
                            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                          >
                            <Mail className="h-3 w-3 text-sky-400" />
                            <span className="max-w-[140px] truncate sm:max-w-none font-mono">
                              {employee.admissionNumber ? `${employee.admissionNumber.toLowerCase()}@msns.edu.pk` : "N/A"}
                            </span>
                          </a>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Quick Edit Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingEmployee(employee)}
                            className="h-9 w-9 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-950/30 text-muted-foreground hover:text-emerald-300"
                            title="Edit Employee Profile & Photo"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Full Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-950/30 text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 border-border bg-popover">
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Employee Management
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                                <Link href={`/admin/users/faculty/${employee.employeeId}/profile`}>
                                  <UserCircle className="mr-2 h-4 w-4 text-emerald-400" />
                                  <span>View Full Profile</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingEmployee(employee)}
                                className="cursor-pointer rounded-xl"
                              >
                                <Edit className="mr-2 h-4 w-4 text-amber-400" />
                                <span>Edit Information & Photo</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                                <Link href={`/admin/users/faculty/${employee.employeeId}`}>
                                  <Clock className="mr-2 h-4 w-4 text-sky-400" />
                                  <span>Attendance Record</span>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <EmployeeEditDialog
          employee={editingEmployee}
          onClose={() => {
            setEditingEmployee(null);
            void refetch();
          }}
        />
      )}

      {/* Photo Full Preview Modal */}
      {previewPhoto && (
        <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
          <DialogContent className="max-w-md p-4 bg-slate-950 border-slate-800 text-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-center text-emerald-400">
                {previewPhoto.name}
              </DialogTitle>
            </DialogHeader>
            <div className="relative mt-2 h-80 w-full overflow-hidden rounded-2xl border border-slate-800 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.src}
                alt={previewPhoto.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-2 text-center text-xs text-slate-400">
              Hosted securely in Cloudflare R2 Storage
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
