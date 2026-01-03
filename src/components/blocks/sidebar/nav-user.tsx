"use client";

import { signOut, useSession } from "next-auth/react";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useState } from "react";
import Link from "next/link";

export const NavUser = () => {
  const { isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const session = useSession();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <User className="h-8 w-8 rounded-lg" />
              <p className="line-clamp-1 text-xs text-white">
                {session.data?.user.email}
              </p>
              <ChevronsUpDown className="ml-auto size-4 opacity-70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg z-1000000"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 rounded-lg" />
                  <p className="text-xs text-muted-foreground">
                    {session.data?.user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin/users/profile">
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-950/50"
            >
              <LogOut className="mr-2 size-4" />
              <span>{isLoggingOut ? "/https://lms.msns.edu.pk/sign-in" : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}