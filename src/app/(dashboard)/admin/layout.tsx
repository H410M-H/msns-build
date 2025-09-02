import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger className="m-4" />
          <div className="grid gap-4 p-4 md:min-h-min">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
