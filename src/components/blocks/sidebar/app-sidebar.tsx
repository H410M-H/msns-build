"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  DollarSignIcon,
  Home,
  List,
  ListOrdered,
  Package,
  Settings,
  User,
  Users,
  ShieldCheck,
  GraduationCap,
  FileText
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

// Define NavItem type if not imported globally
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

// Icon mapping for cleaner data structure
const Icons = {
  Dashboard: Home,
  Session: Calendar,
  Revenue: DollarSignIcon,
  Registration: List,
  Profile: User,
  Faculty: Users,
  Student: GraduationCap,
  Admin: ShieldCheck,
  Settings: Settings,
};

const data: NavigationConfig = {
  ADMIN: [
    { title: "Dashboard", url: "/admin", icon: Icons.Dashboard },
    { title: "Session", url: "/admin/sessions", icon: Package },
    { title: "Exams", url: "/admin/exams", icon: Package },
    { title: "Revenue", url: "/admin/revenue", icon: Icons.Revenue },
    {
      title: "Registration",
      url: "/admin/users",
      icon: Icons.Registration,
      items: [
        { url: "/admin/users/faculty/view", title: "Manage Faculty" },
        { url: "/admin/users/student/view", title: "Manage Students" },
      ],
    },
    { title: "Profile", url: "/admin/users/profile", icon: Icons.Profile },
  ],
  HEAD: [
    { title: "Dashboard", url: "/head", icon: Icons.Dashboard },
    { title: "Session", url: "/admin/sessions", icon: ListOrdered },
    {
      title: "Students",
      url: "/admin/users/student/view",
      icon: Icons.Student,
      items: [
        { title: "All Students", url: "/admin/users/student/view" },
        { title: "Create Student", url: "/admin/users/student/create" },
      ],
    },
    {
      title: "Faculty",
      url: "/admin/users/faculty/view",
      icon: Icons.Faculty,
      items: [
        { title: "All Employees", url: "/admin/users/faculty/view" },
        { title: "Create Employee", url: "/admin/users/faculty/create" },
      ],
    },
    { title: "Profile", url: "/admin/users/profile", icon: Icons.Profile },
  ],
  PRINCIPAL: [
    { title: "Dashboard", url: "/principal", icon: Icons.Dashboard },
    { title: "Session", url: "/admin/sessions", icon: Calendar },
    {
      title: "Students",
      url: "/admin/users/student/view",
      icon: Icons.Student,
      items: [
        { title: "All Students", url: "/admin/users/student/view" },
        { title: "Create Student", url: "/admin/users/student/create" },
      ],
    },
    {
      title: "Faculty",
      url: "/admin/users/faculty/view",
      icon: Icons.Faculty,
      items: [
        { title: "All Employees", url: "/admin/users/faculty/view" },
        { title: "Attendance", url: "/admin/attendance" },
        { title: "Create Employee", url: "/admin/users/faculty/create" },
      ],
    },
    { title: "Profile", url: "/admin/users/profile", icon: Icons.Profile },
  ],
  CLERK: [
    { title: "Dashboard", url: "/clerk", icon: Icons.Dashboard },
    { title: "Fee Collection", url: "/clerk/fees", icon: Icons.Revenue },
    { title: "Students", url: "/clerk/users/student/view", icon: Icons.Student },
    { title: "Transactions", url: "/clerk/transactions", icon: ListOrdered },
    { title: "Expenses", url: "/clerk/expenses", icon: DollarSignIcon },
    { title: "Profile", url: "/clerk/users/profile", icon: Icons.Profile },
  ],
  TEACHER: [
    { title: "Dashboard", url: "/teacher", icon: Icons.Dashboard },
    { title: "My Timetable", url: "/teacher/timetable", icon: Calendar },
    { title: "Exams & Marks", url: "/teacher/exams", icon: Package },
    { title: "Leave Request", url: "/teacher/leaves", icon: FileText },
    { title: "Profile", url: "/teacher/profile", icon: Icons.Profile },
  ],
  STUDENT: [
    { title: "Dashboard", url: "/student", icon: Icons.Dashboard },
    { title: "My Results", url: "/student/results", icon: GraduationCap },
    { title: "Fee History", url: "/student/fees", icon: Icons.Revenue },
    { title: "Timetable", url: "/student/timetable", icon: List },
    { title: "Profile", url: "/student/profile", icon: Icons.Profile },
  ],

  NONE: [],
  ALL: [],
  WORKER: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();
  const { state } = useSidebar();

  const items = useMemo<NavItem[]>(() => {
    const accountType = (session?.data?.user?.accountType) ?? "NONE";
    return data[accountType] ?? [];
  }, [session?.data?.user?.accountType]);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r border-emerald-500/20 bg-slate-950 text-white shadow-2xl transition-all duration-300"
    >
      {/* Background Texture for Sidebar */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      {/* Sidebar Header */}
      <SidebarHeader className="relative z-10 h-24 flex items-center justify-center p-4 border-b border-emerald-500/20 bg-slate-900/50 backdrop-blur-xl">
        <div className={cn(
            "relative flex items-center justify-center transition-all duration-300 group",
            state === "collapsed" ? "w-10 h-10" : "w-full h-16"
        )}>
          {/* Emerald Glow Effect */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <Link href="https://msns.edu.pk" target="_blank" rel="noopener noreferrer" className="relative z-10 w-full h-full">
            <Image
              className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
              alt="Institution Logo"
              fill
              sizes="(max-width: 768px) 50px, 150px"
              priority
            />
          </Link>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="relative z-10 py-6 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
        <NavMain items={items} />
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="relative z-10 p-4 border-t border-emerald-500/20 bg-slate-900/50 backdrop-blur-xl">
        
        {/* System Status - Only show when expanded */}
        {state !== "collapsed" && (
            <div className="flex items-center justify-between mb-4 px-2 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                System Online
            </span>
            <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            </div>
        )}

        <NavUser />
      </SidebarFooter>

      {/* Styled Rail */}
      <SidebarRail className="hover:bg-emerald-500/20 hover:w-1 transition-all" />
    </Sidebar>
  );
}