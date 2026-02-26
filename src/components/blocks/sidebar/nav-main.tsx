"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

// Define NavItem type here if not imported globally
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

type UnifiedNavProps = {
  items: NavItem[];
};

export const NavMain = ({ items }: UnifiedNavProps) => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu className="text-foreground">
        {items.map((item) => {
          const isActive =
            pathname.startsWith(item.url) ||
            item.items?.some((sub) => pathname.startsWith(sub.url));

          return item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive} // Keep open if child is active
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      "transition-colors hover:bg-emerald-500/10 hover:text-emerald-300",
                      isActive && "font-medium text-emerald-400",
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          isActive ? "text-emerald-400" : "text-emerald-500/60",
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover/collapsible:text-emerald-400 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="border-l-emerald-500/20">
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={cn(
                              "transition-colors hover:text-emerald-300",
                              isSubActive &&
                                "bg-emerald-500/10 font-medium text-emerald-400",
                            )}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.url}
                className={cn(
                  "transition-colors hover:bg-emerald-500/10 hover:text-emerald-300",
                  pathname === item.url &&
                    "bg-emerald-500/10 font-medium text-emerald-400 shadow-[inset_3px_0_0_0_rgba(16,185,129,1)]",
                )}
              >
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon
                      className={cn(
                        pathname === item.url
                          ? "text-emerald-400"
                          : "text-emerald-500/60",
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};
