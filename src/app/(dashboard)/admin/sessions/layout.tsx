// app/(dashboard)/admin/sessions/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
// REMOVE ThemeProvider import - it's already in root layout

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Session Management | Admin Dashboard",
  description: "Manage academic sessions, view statistics, and handle session fees",
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
        <div className={`${inter.className} antialiased relative min-h-screen`}>
          {/* Global Background */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm -z-10" />
                    <main className="relative">
            {children}
          </main>
          
          {/* Notifications */}
          <Toaster />
          
          {/* Mobile Navigation Helper */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none" />
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}