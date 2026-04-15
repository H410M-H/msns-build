import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* SidebarInset handles the main content area width calculation automatically */}
      <SidebarInset className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 ease-in-out dark:bg-card dark:text-foreground">
        {/* --- GLOBAL BACKGROUND (Fixed for all admin pages) --- */}
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
          {/* Light Mode Pattern */}
          <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:hidden"></div>

          {/* Dark Mode Pattern */}
          <div className="absolute inset-0 hidden h-full w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:block"></div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="relative z-10 flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
