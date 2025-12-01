// app/(dashboard)/admin/sessions/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

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
    // Remove html/body tags - Next.js provides these
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <TooltipProvider delayDuration={300}>
          <div className={`${inter.className} antialiased relative min-h-screen`}>
            {/* Global Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 -z-10" />
            
            {/* Main Content */}
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
    </ThemeProvider>
  );
}