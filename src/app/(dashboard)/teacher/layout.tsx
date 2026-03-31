import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";

export default function TeacherDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      {/* Outer container: Full viewport height, no scroll on body */}
      <div className="flex h-screen w-full overflow-hidden bg-card">
        <AppSidebar />

        {/* SidebarInset handles the remaining width automatically */}
        <SidebarInset className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Main Background Wrapper */}
          <div className="relative flex h-full w-full flex-col">
            {/* Background Effects (Consistent with other dashboards) */}
            <div className="pointer-events-none absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-blue-950/10" />
            </div>

            {/* Scrollable Content Area */}
            <main className="relative z-10 w-full flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
