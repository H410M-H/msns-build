"use client";

import Image from "next/image";
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

type NavigationConfig = Record<AccountTypeEnum, NavItem[]>;

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

  const items = useMemo(() => {
    const accountType =
      (session?.data?.user?.accountType as AccountTypeEnum) ?? "NONE";
    return data[accountType] ?? data.NONE;
  }, [session?.data?.user?.accountType]);

  return (
<Sidebar collapsible="icon" {...props} className="border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
  {/* Sidebar Header with improved logo presentation */}
  <SidebarHeader className="relative h-24 flex items-center justify-center p-4 border-b border-slate-200/50">
    <div className="relative w-full h-16">
      <Image
        className="object-contain"
        src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
        alt="Institution Logo"
        fill
        sizes="(max-width: 768px) 100px, 150px"
        priority
      />
    </div>
  </SidebarHeader>

  {/* Sidebar Content with enhanced navigation */}
  <SidebarContent className="py-6">
    <div className="px-3 mb-4">

    </div>
    <NavMain items={items} />
    
    {/* Optional: Additional section for quick actions */}
    <div className="mt-8 px-3">

      <div className="space-y-1">
        <button className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-blue-700 bg-blue-50/80 hover:bg-blue-100 transition-colors">
          <span className="mr-2">⭐</span>
          <span>Starred Items</span>
        </button>
        <button className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-100/80 transition-colors">
          <span className="mr-2">🕒</span>
          <span>Recent</span>
        </button>
      </div>
    </div>
  </SidebarContent>

  {/* Enhanced Footer with user profile */}
  <SidebarFooter className="p-4 border-t border-slate-200/50 bg-white/50">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-slate-600">Status</span>
      <span className="flex h-2 w-2">
        <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
    </div>
    <NavUser />
  </SidebarFooter>

  {/* Styled Rail */}
  <SidebarRail className="bg-slate-100/50" />
</Sidebar>
  );
}