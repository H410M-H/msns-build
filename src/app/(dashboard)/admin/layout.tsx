import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      
      {/* SidebarInset handles the main content area width calculation automatically */}
      <SidebarInset className="bg-slate-950 text-slate-200 overflow-x-hidden transition-all duration-300 ease-in-out">
        
        {/* --- GLOBAL BACKGROUND (Applied once here for all admin pages) --- */}
        <div className="fixed inset-0 z-0 h-full w-full bg-slate-950 pointer-events-none">
           {/* Dot Pattern */}
           <div className="absolute h-full w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        {/* --- LAYOUT HEADER (Trigger + Consistency) --- */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-slate-950/50 backdrop-blur-md transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
            {/* The breadcrumbs from your pages (PageHeader) will appear visually below this, 
                or you can move breadcrumbs here if you want them global. */}
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="relative z-10 flex flex-1 flex-col gap-4 p-4 pt-0 sm:gap-6 sm:p-6">
          {children}
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}