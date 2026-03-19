import type { Metadata } from "next";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Session Management | Admin Dashboard",
  description:
    "Manage academic sessions, view statistics, and handle session fees",
  keywords: ["sessions", "academic", "dashboard", "management", "fees"],
};

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <TooltipProvider delayDuration={300}>
        {/* Clean Layout: 
            Backgrounds, Fonts, and Sidebar logic are handled by the parent DashboardLayout.
            We only render the children and page-specific providers here.
        */}
        <div className="relative flex h-full w-full flex-col">
          {children}
          <Toaster />
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}
