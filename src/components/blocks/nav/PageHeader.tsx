"use client";

import * as React from "react";
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

interface PageHeaderProps {
  breadcrumbs: Array<{
    href: string;
    label: string;
    current?: boolean;
  }>;
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-30 flex flex-col items-center w-full mb-6">
      <header className="flex h-16 w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10" />
          
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="font-semibold text-slate-900 dark:text-white">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.href}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-slate-400 dark:text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-3">
            {session?.user && (
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
                        ID: <span className="font-mono text-slate-700 dark:text-slate-200">{session.user.accountId}</span>
                    </span>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-transparent dark:text-emerald-400 dark:border-emerald-500/30">
                        {session.user.accountType}
                    </Badge>
                </div>
            )}
        </div>
      </header>
    </div>
  );
}