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
    <div className="flex flex-col items-center">
      <header className="sticky z-20 flex h-10 md:h-16 w-full items-center bg-gradient-to-r from-pink-200/40 via-purple-300/40 to-green-600 px-4 md:px-6 shadow-md rounded-lg">
                    <SidebarTrigger className="m-4" />
        <Breadcrumb className="flex min-w-0">
          <BreadcrumbList className="flex items-center md:gap-2 overflow-x-auto scrollbar-hide">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className="max-w-[120px] md:max-w-none truncate">
                  <BreadcrumbLink href={crumb.href}>
                    <BreadcrumbPage className="text-lg md:text-sm font-medium truncate">
                      {index === 0 ? (
                        <span className="hidden md:inline">{crumb.label}</span>
                      ) : (
                        crumb.label
                      )}
                    </BreadcrumbPage>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="mx-1 md:mx-2" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="ml-auto flex items-center space-x-4 mt-2">
        <span className="text-sm text-gray-700">
          {session?.user.accountType}
        </span>
        <span className="text-sm text-gray-500">{session?.user.accountId}</span>
      </div>
    </div>
  );
}