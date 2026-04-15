import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";

export const dynamic = "force-dynamic";

export default async function PrincipalDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="grid gap-4 p-4 md:min-h-min">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

