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

interface PageHeaderPropsWithBreadcrumbs {
  breadcrumbs: Array<{
    href: string;
    label: string;
    current?: boolean;
  }>;
  children?: React.ReactNode;
}

interface PageHeaderPropsWithTitle {
  title: string;
  description: string;
  children?: React.ReactNode;
}

type PageHeaderProps = PageHeaderPropsWithBreadcrumbs | PageHeaderPropsWithTitle;

function isWithBreadcrumbs(props: PageHeaderProps): props is PageHeaderPropsWithBreadcrumbs {
    return (props as PageHeaderPropsWithBreadcrumbs).breadcrumbs !== undefined;
}

export function PageHeader(props: PageHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-30 mb-6 flex w-full flex-col items-center">
      <header className="flex h-24 w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-xl transition-all dark:border-border dark:bg-card dark:shadow-none md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-slate-600 hover:bg-slate-100 dark:text-foreground dark:hover:bg-white/10" />

          {isWithBreadcrumbs(props) ? (
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                {props.breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {index === props.breadcrumbs.length - 1 ? (
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
                    {index < props.breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="text-muted-foreground dark:text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{props.title}</h1>
              <p className="text-sm text-muted-foreground">{props.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {props.children}
          {session?.user && (
            <div className="flex flex-col items-end gap-0.5">
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
