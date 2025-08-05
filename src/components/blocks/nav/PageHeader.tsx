import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";

interface PageHeaderProps {
  breadcrumbs: Array<{
    href: string;
    label: string;
    current?: boolean;
  }>;
}

export function PageHeader({ breadcrumbs }: PageHeaderProps) {
  return (
      <div className="flex items-center">
            <header className="sticky z-30 flex h-12 pt-6md:h-16 w-full items-center bg-gradient-to-r from-emerald-200 via-emerald-400 to-green-700 px-4 md:px-6 shadow-md rounded-lg">

        <SidebarTrigger className="md:mr-4 shrink-0" />
        
        <Breadcrumb className="flex-1 min-w-0">
          <BreadcrumbList className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className="max-w-[120px] md:max-w-none truncate">
                  <BreadcrumbLink href={crumb.href}>
                    <BreadcrumbPage className="text-md md:text-sm font-medium truncate">
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
    </div>

  );
}
