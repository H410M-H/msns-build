import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";

export const dynamic = "force-dynamic";

export default async function HeadDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950 text-foreground transition-colors duration-300 ease-in-out">
          {/* === SHARED GLOBAL BACKGROUND === */}
          <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
            {/* Cyber Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />

            {/* Deep Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-950/90 to-slate-950" />

            {/* Animated Ambient Glows */}
            <div className="absolute -top-20 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-500/10 opacity-50 blur-[120px]" />
            <div className="absolute -bottom-20 right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-500/10 opacity-50 blur-[120px] delay-1000" />
          </div>

          <div className="relative z-10 grid gap-4 p-4 md:min-h-min sm:gap-6 sm:p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
