"use client";

import Image from "next/image";
import Link from "next/link"; // Import Link
import {
  Briefcase,
  Calendar,
  DollarSignIcon,
  Home,
  List,
  ListOrdered,
  Package,
  Settings,
  User,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

// Define type explicitly to handle undefined case
type NavigationConfig = Record<string, NavItem[] | undefined>;

const data: NavigationConfig = {
  ADMIN: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Briefcase,
    },
    {
      title: "Session",
      url: "/admin/sessions",
      icon: Package,
    },
    {
      title: "Revenue",
      url: "/admin/revenue",
      icon: DollarSignIcon,
    },
    {
      title: "Registeration",
      url: "/admin/users",
      icon: List,
      items: [
        {
          url: "/admin/users/faculty/view",
          title: "Manage Faculty",
        },
        {
          url: "/admin/users/student/view",
          title: "Manage Students",
        }
      ],
    },
    {
      title: "Profile",
      url: "/admin/users/profile",
      icon: User,
    },
  ],
  HEAD: [
    {
      title: "Dashboard",
      url: "/head",
      icon: Briefcase,
    },
    {
      title: "Session",
      url: "/admin/sessions",
      icon: ListOrdered,
    },
    {
      title: "Students",
      url: "/admin/users/student/view",
      icon: User,
      items: [
        {
          title: "All Students",
          url: "/admin/users/student/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/student/create",
        },
      ],
    },
    {
      title: "Faculty",
      url: "/admin/users/faculty/view",
      icon: User,
      items: [
        {
          title: "All Employees",
          url: "/admin/users/faculty/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/faculty/create",
        },
      ],
    },
    {
      title: "Profile",
      url: "/admin/users/profile",
      icon: User,
    },
  ],
  NONE: [],
  PRINCIPAL: [
     {
      title: "Dashboard",
      url: "/principal",
      icon: Home,
    },
    {
      title: "Session",
      url: "/admin/sessions",
      icon: Calendar,
    },
    {
      title: "Students",
      url: "/admin/users/student/view",
      icon: User,
      items: [
        {
          title: "All Students",
          url: "/admin/users/student/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/student/create",
        },
      ],
    },
    {
      title: "Faculty",
      url: "/admin/users/faculty/view",
      icon: User,
      items: [
        {
          title: "All Employees",
          url: "/admin/users/faculty/view",
        },
        {
          title: "Attendance",
          url: "/admin/attendance",
        },
        {
          title: "Create Employee",
          url: "/admin/users/faculty/create",
        },
      ],
    },
    {
      title: "Profile",
      url: "/admin/users/account/profile",
      icon: User,
    },
  ],
  ALL: [],
  CLERK:  [
     {
      title: "Dashboard",
      url: "/principal",
      icon: Home,
    },
    {
      title: "Session",
      url: "/admin/sessions",
      icon: Calendar,
    },
    {
      title: "Students",
      url: "/admin/users/student/view",
      icon: User,
      items: [
        {
          title: "All Students",
          url: "/admin/users/student/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/student/create",
        },
      ],
    },
    {
      title: "Faculty",
      url: "/admin/users/faculty/view",
      icon: User,
      items: [
        {
          title: "All Employees",
          url: "/admin/users/faculty/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/faculty/create",
        },
      ],
    },
    {
      title: "Profile",
      url: "/admin/users/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/admin/users/profile",
      icon: Settings,
    },
  ],
  TEACHER:  [
     {
      title: "Dashboard",
      url: "/principal",
      icon: Home,
    },
    {
      title: "Session",
      url: "/admin/sessions",
      icon: Calendar,
    },
    {
      title: "Students",
      url: "/admin/users/student/view",
      icon: User,
      items: [
        {
          title: "All Students",
          url: "/admin/users/student/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/student/create",
        },
      ],
    },
    {
      title: "Faculty",
      url: "/admin/users/faculty/view",
      icon: User,
      items: [
        {
          title: "All Employees",
          url: "/admin/users/faculty/view",
        },
        {
          title: "Create Student",
          url: "/admin/users/faculty/create",
        },
      ],
    },
    {
      title: "Profile",
      url: "/admin/users/profile",
      icon: User,
    },
    {
      title: "Settings",
      url: "/admin/users/profile",
      icon: Settings,
    },
  ],
  WORKER: [],
  STUDENT: []
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();

  // Fix: Explicitly return NavItem[] to resolve TS error
  // Also ensures stability by not relying on potentially undefined indexing
  const items = useMemo<NavItem[]>(() => {
    const accountType = (session?.data?.user?.accountType) ?? "NONE";
    const navItems = data[accountType];
    return navItems ?? [];
  }, [session?.data?.user?.accountType]);

  return (
    <Sidebar 
      collapsible="icon" 
      {...props} 
      // Override CSS variables for Light Gray / Light Yellow / Green Theme
      style={{
        "--sidebar-background": "#f8fafc", // Slate-50 (Light Gray background)
        "--sidebar-foreground": "#334155", // Slate-700 (Dark Gray text)
        "--sidebar-primary": "#10b981", // Emerald-500 (Green primary icons)
        "--sidebar-primary-foreground": "#ffffff", // White text on primary
        "--sidebar-accent": "#fef9c3", // Yellow-100 (Light Yellow accent background)
        "--sidebar-accent-foreground": "#15803d", // Green-700 (Dark Green accent text)
        "--sidebar-border": "#e2e8f0", // Slate-200 (Light Gray border)
        "--sidebar-ring": "#10b981", // Emerald-500
      } as React.CSSProperties}
      className="border-r border-slate-200 bg-slate-50/95 backdrop-blur-sm z-50 shadow-xl"
    >
      {/* Sidebar Header */}
      <SidebarHeader className="relative h-24 flex items-center justify-center p-4 border-b border-slate-200 bg-white/50">
        <div className="relative w-full h-16 flex items-center justify-center group">
          {/* Light yellow glow effect on hover */}
          <div className="absolute inset-0 bg-yellow-200/40 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Link href="https://msns.edu.pk" target="_blank" rel="noopener noreferrer">
            <Image
              className="object-contain relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
              alt="Institution Logo"
              fill
              sizes="(max-width: 768px) 100px, 150px"
              priority
            />
          </Link>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <NavMain items={items} />
        
        {/* Quick Actions Section */}
        <div className="mt-8 px-3">
            <div className="text-xs font-bold text-slate-400 px-2 mb-2 uppercase tracking-wider">
                Quick Access
            </div>
            <div className="space-y-1">
                <button className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-yellow-50 hover:text-green-700 transition-all duration-200 group border border-transparent hover:border-yellow-200">
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-500 group-hover:text-green-600 transition-colors" />
                    <span>Recent Activity</span>
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-yellow-50 hover:text-green-700 transition-all duration-200 group border border-transparent hover:border-yellow-200">
                    <Settings className="mr-2 h-4 w-4 text-yellow-500 group-hover:text-green-600 transition-colors" />
                    <span>System Status</span>
                </button>
            </div>
        </div>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-4 border-t border-slate-200 bg-white/50">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            System Online
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <NavUser />
      </SidebarFooter>

      {/* Styled Rail */}
      <SidebarRail className="hover:bg-slate-100 hover:w-1 transition-all" />
    </Sidebar>
  );
}