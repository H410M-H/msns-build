import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar className="h-screen" />
        <SidebarInset>
          <main className="w-full h-screen bg-from-yellow-100/20 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}


