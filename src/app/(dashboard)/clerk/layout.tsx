import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/blocks/sidebar/app-sidebar";

export default function ClerkDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      {/* 1. Changed w-screen to w-full to prevent horizontal overflow 
        2. Added overflow-hidden to prevent body scrollbars
      */}
      <div className="flex h-screen w-full overflow-hidden bg-slate-950">
        <AppSidebar />
        
        {/* SidebarInset handles the width calculation automatically */}
        <SidebarInset className="flex flex-1 flex-col h-full overflow-hidden">
          
          {/* Main Background Wrapper */}
          <div className="relative flex flex-col h-full w-full">
             
             {/* Background Effects - set to absolute to not take up layout flow */}
             <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.03)_1px,transparent_1px)] bg-size-[3rem_3rem]" />
                <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-950/90 to-emerald-950/20" />
             </div>
             <main className="relative z-10 flex-1 overflow-y-auto w-full p-4 md:p-6 lg:p-8">
                {children}
             </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}