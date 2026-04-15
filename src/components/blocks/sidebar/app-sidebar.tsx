"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  User,
  GraduationCap,
  FileText,
  ClipboardList,
  BookOpen,
  TrendingUp,
  Briefcase,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { cn } from "~/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

type NavigationConfig = Record<string, NavItem[] | undefined>;

const data: NavigationConfig = {
  ADMIN: [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    {
      title: "Sessions & Classes",
      url: "/admin/sessions",
      icon: Calendar,
      items: [
        { title: "All Sessions", url: "/admin/sessions" },
        { title: "Timetable", url: "/admin/sessions/timetable" },
        { title: "Fee Ledger", url: "/admin/sessions/fee" },
      ],
    },
    {
      title: "Examinations",
      url: "/admin/exams",
      icon: FileText,
      items: [
        { title: "Exams Overview", url: "/admin/exams" },
        { title: "Promotions", url: "/admin/exams/promotion" },
      ],
    },
    {
      title: "Revenue",
      url: "/admin/revenue",
      icon: TrendingUp,
      items: [
        { title: "Overview", url: "/admin/revenue" },
        { title: "Fee Management", url: "/admin/revenue/fee" },
        { title: "Salary", url: "/admin/revenue/salary" },
        { title: "Expenses", url: "/admin/revenue/expense" },
      ],
    },
    {
      title: "Attendance",
      url: "/admin/attendance",
      icon: ClipboardList,
      items: [
        { title: "Student Attendance", url: "/admin/attendance" },
        { title: "Employee Attendance", url: "/admin/sessions/attendance/employees/monthly" },
      ],
    },
    { title: "Faculty", url: "/admin/users/faculty/view", icon: Briefcase },
    { title: "Students", url: "/admin/users/student/view", icon: GraduationCap },
    { title: "Profile", url: "/admin/users/profile", icon: User },
  ],

  HEAD: [
    { title: "Dashboard", url: "/head", icon: LayoutDashboard },
    { title: "Sessions", url: "/admin/sessions", icon: Calendar },
    { title: "Faculty", url: "/admin/users/faculty/view", icon: Briefcase },
    { title: "Students", url: "/admin/users/student/view", icon: GraduationCap },
    { title: "Profile", url: "/admin/users/profile", icon: User },
  ],

  PRINCIPAL: [
    { title: "Dashboard", url: "/principal", icon: LayoutDashboard },
    { title: "Sessions", url: "/admin/sessions", icon: Calendar },
    { title: "Faculty", url: "/admin/users/faculty/view", icon: Briefcase },
    { title: "Students", url: "/admin/users/student/view", icon: GraduationCap },
    { title: "Profile", url: "/admin/users/profile", icon: User },
  ],

  CLERK: [
    { title: "Dashboard", url: "/clerk", icon: LayoutDashboard },
    {
      title: "Sessions & Classes",
      url: "/clerk/sessions",
      icon: Calendar,
      items: [
        { title: "All Sessions", url: "/clerk/sessions" },
        { title: "Timetable", url: "/clerk/sessions/timetable" },
        { title: "Fee Ledger", url: "/clerk/sessions/fee" },
      ],
    },
    { title: "Students", url: "/clerk/users/student/view", icon: GraduationCap },
    { title: "Faculty", url: "/clerk/users/faculty/view", icon: Briefcase },
    {
      title: "Attendance",
      url: "/clerk/attendance",
      icon: ClipboardList,
      items: [
        { title: "Student Attendance", url: "/clerk/attendance" },
        { title: "Employee Attendance", url: "/clerk/sessions/attendance/employees/monthly" },
      ],
    },
    { title: "Transactions", url: "/clerk/sessions/fee", icon: Receipt },
    { title: "Profile", url: "/clerk/users/profile", icon: User },
  ],

  TEACHER: [
    { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
    {
      title: "Exams & Marks",
      url: "/teacher/exams",
      icon: FileText,
      items: [
        { title: "Enter Marks", url: "/teacher/exams/marks" },
      ],
    },
    { title: "Profile", url: "/admin/users/profile", icon: User },
  ],

  STUDENT: [
    { title: "Dashboard", url: "/student", icon: LayoutDashboard },
    { title: "My Class", url: "/student/sessions/class", icon: BookOpen },
    { title: "Profile", url: "/admin/users/profile", icon: User },
  ],

  NONE: [],
  ALL: [],
  WORKER: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  const { state } = useSidebar();

  const items = useMemo<NavItem[]>(() => {
    const accountType = session?.data?.user?.accountType ?? "NONE";
    return data[accountType] ?? [];
  }, [session?.data?.user?.accountType]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-emerald-500/20 bg-white/70 text-slate-800 shadow-[4px_0_24px_rgba(16,185,129,0.05)] backdrop-blur-2xl transition-all duration-300 dark:bg-[#020806] dark:text-slate-100"
    >
      {/* Premium Background Texture */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-slate-50/50 to-slate-100/50 transition-colors duration-300 dark:from-emerald-900/10 dark:via-black/50 dark:to-black" />
        <div className="absolute -top-40 left-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-500/10" />
      </div>

      {/* Sidebar Header */}
      <SidebarHeader className="relative z-10 flex h-24 items-center justify-center border-b border-emerald-900/30 bg-transparent p-4 transition-all duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:h-20 backdrop-blur-xl">
        <div
          className={cn(
            "group relative flex items-center justify-center transition-all duration-300",
            state === "collapsed" ? "h-12 w-12" : "h-16 w-full",
          )}
        >
          {/* Emerald Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

          <Link
            href="https://msns.edu.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex h-full w-full items-center justify-center"
          >
            <Image
              className={cn(
                "object-contain drop-shadow-xl transition-all duration-500 group-hover:scale-110",
                state === "collapsed" ? "p-0" : "p-1"
              )}
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
              alt="Institution Logo"
              fill
              sizes="(max-width: 768px) 64px, 180px"
              priority
            />
          </Link>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent relative z-10 py-6 transition-all duration-300 group-data-[collapsible=icon]:py-4">
        <NavMain items={items} />
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="relative z-10 border-t border-emerald-500/20 bg-transparent p-4 transition-all duration-300 group-data-[collapsible=icon]:p-2 backdrop-blur-xl">
        {/* System Status - Only show when expanded */}
        {state !== "collapsed" && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-50/50 px-3 py-2 dark:bg-emerald-950/30">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              System Online
            </span>
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        )}

        <NavUser />
      </SidebarFooter>

      {/* Styled Rail */}
      <SidebarRail className="transition-all hover:w-1 hover:bg-emerald-500/20" />
    </Sidebar>
  );
}
