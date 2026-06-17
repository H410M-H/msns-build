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
      <SidebarInset className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 ease-in-out dark:bg-slate-950 dark:text-foreground">
        {/* === SHARED GLOBAL BACKGROUND === */}
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
          {/* Cyber Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)]" />

          {/* Deep Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 via-slate-50/50 to-slate-100/40 dark:from-emerald-950/30 dark:via-slate-950/90 dark:to-slate-950" />

          {/* Animated Ambient Glows */}
          <div className="absolute -top-20 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-300/10 opacity-30 blur-[120px] dark:bg-emerald-500/10 dark:opacity-50" />
          <div className="absolute -bottom-20 right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-300/10 opacity-30 blur-[120px] delay-1000 dark:bg-teal-500/10 dark:opacity-50" />
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="relative z-10 flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
