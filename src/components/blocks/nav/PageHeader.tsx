"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useSession } from "next-auth/react";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Badge } from "~/components/ui/badge";
import { NotificationBell } from "~/components/blocks/dashboard/NotificationBell";
import { CommandPalette } from "~/components/blocks/dashboard/CommandPalette";

interface PageHeaderProps {
  breadcrumbs?: Array<{
    href: string;
    label: string;
    current?: boolean;
  }>;
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const computedBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs && breadcrumbs.length > 0) return breadcrumbs;
    if (!pathname) return [{ href: "/", label: "Dashboard", current: true }];

    const segments = pathname.split("/").filter(Boolean);
    const crumbs: Array<{ href: string; label: string; current?: boolean }> = [
      { href: "/", label: "Home" },
    ];

    let accumPath = "";
    segments.forEach((seg, idx) => {
      accumPath += `/${seg}`;
      const label =
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      crumbs.push({
        href: accumPath,
        label,
        current: idx === segments.length - 1,
      });
    });

    return crumbs;
  }, [breadcrumbs, pathname]);

  return (
    <div className="sticky top-0 z-40 mb-4 flex w-full flex-col items-center pt-2 sm:pt-3">
      <header className="flex h-14 sm:h-16 w-full items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200/90 bg-white/85 px-3 sm:px-6 shadow-sm backdrop-blur-xl transition-all dark:border-border dark:bg-card/90 dark:shadow-none">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <SidebarTrigger className="text-slate-600 hover:bg-slate-100 dark:text-foreground dark:hover:bg-white/10 shrink-0" />

          <Breadcrumb className="hidden sm:block overflow-hidden text-ellipsis whitespace-nowrap">
            <BreadcrumbList>
              {computedBreadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href + index}>
                  <BreadcrumbItem>
                    {index === computedBreadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="font-semibold text-slate-900 dark:text-foreground">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-muted-foreground transition-colors hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < computedBreadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-muted-foreground dark:text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:flex items-center justify-center">
            <CommandPalette />
          </div>
          <NotificationBell />
          {session?.user && (
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                ID:{" "}
                <span className="font-mono text-slate-700 dark:text-foreground">
                  {session.user.accountId}
                </span>
              </span>
              <Badge
                variant="outline"
                className="h-5 border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-400"
              >
                {session.user.accountType}
              </Badge>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
