import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";

export const dynamic = "force-dynamic";

export default function ClerkDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      {/* 1. Changed w-screen to w-full to prevent horizontal overflow 
        2. Added overflow-hidden to prevent body scrollbars
      */}
      <div className="flex h-screen w-full overflow-hidden bg-card">
        <AppSidebar />

        <SidebarInset className="relative flex h-full flex-1 flex-col overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 ease-in-out dark:bg-slate-950 dark:text-foreground">
          {/* Main Background Wrapper */}
          <div className="relative flex h-full w-full flex-col">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 z-0">
              {/* Cyber Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)]" />

              {/* Deep Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-slate-50/50 to-slate-100/40 dark:from-emerald-950/30 dark:via-slate-950/90 dark:to-slate-950" />

              {/* Animated Ambient Glows */}
              <div className="absolute -top-20 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-300/10 opacity-30 blur-[120px] dark:bg-emerald-500/10 dark:opacity-50" />
              <div className="absolute -bottom-20 right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-300/10 opacity-30 blur-[120px] delay-1000 dark:bg-teal-500/10 dark:opacity-50" />
            </div>
            <main className="relative z-10 w-full flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
