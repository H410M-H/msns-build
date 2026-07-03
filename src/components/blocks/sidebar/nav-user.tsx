"use client";

import { signOut, useSession } from "next-auth/react";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
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
import { useTheme } from "next-themes";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export const NavUser = () => {
  const { isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const session = useSession();
  const { theme, setTheme } = useTheme();
  
  const { data: userProfile } = api.profile.getProfile.useQuery();
  const profilePic = userProfile?.profilePic;
  const username = userProfile?.username ?? session.data?.user.username ?? "User";
  const initials = username.charAt(0).toUpperCase();

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
              <Avatar className="h-8 w-8 rounded-lg">
                {profilePic && profilePic !== "/user.jpg" ? (
                  <AvatarImage src={profilePic} className="object-cover" />
                ) : (
                  <AvatarFallback className="rounded-lg bg-emerald-500/10 font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="line-clamp-1 text-xs text-foreground">
                {session.data?.user.email}
              </p>
              <ChevronsUpDown className="ml-auto size-4 opacity-70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="z-[1000000] w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {profilePic && profilePic !== "/user.jpg" ? (
                      <AvatarImage src={profilePic} className="object-cover" />
                    ) : (
                      <AvatarFallback className="rounded-lg bg-emerald-500/10 font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{username}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.data?.user.email}
                    </p>
                  </div>
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
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 size-4 text-amber-500" />
                ) : (
                  <Moon className="mr-2 size-4 text-slate-500" />
                )}
                <span>Toggle Theme</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-950/50"
            >
              <LogOut className="mr-2 size-4" />
              <span>
                {isLoggingOut ? "/sign-in" : "Log out"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
