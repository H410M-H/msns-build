"use client";

import Image from "next/image";
import {
  Briefcase,
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
      url: "/admin/users/account/settings",
      icon: User,
    },
    {
      title: "Setting",
      url: "/admin/user/account/settings",
      icon: Settings,
    },
  ],
  HEAD: [
    {
      title: "Overview",
      url: "/head",
      icon: Home,
    },
    {
      title: "Tour",
      url: "#",
      icon: Package,
      items: [
        {
          title: "All Tours",
          url: "/safari/tour",
        },
        {
          title: "Create Tour",
          url: "/safari/tour/create",
        },
      ],
    },
    {
      title: "Booking",
      url: "/safari/booking",
      icon: List,
    },
    {
      title: "Profile",
      url: "/safari/profile",
      icon: User,
    },
    {
      title: "Setting",
      url: "/safari/setting",
      icon: Settings,
    },
  ],
  NONE: [],
  PRINCIPAL: [
    {
      title: "Overview",
      url: "/clerk",
      icon: Home,
    },
    {
      title: "Classes",
      url: "#",
      icon: ListOrdered,
      items: [
        {
          title: "All Classes",
          url: "/principal/class",
        },
        {
          title: "Create Class",
          url: "/principal/class/create",
        },
      ],
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
          url: "/users/student/create",
        },
      ],
    },
    {
      title: "Profile",
      url: "/users/account/settings",
      icon: User,
    },
    {
      title: "Setting",
      url: "/principal/setting",
      icon: Settings,
    },
  ],
  ALL: [],
  CLERK: [],
  TEACHER: [],
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="relative my-2 mt-16 h-16 w-full">
        <Image
          className="object-contain"
            src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
          alt="logo"
          fill
          sizes="100%"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}