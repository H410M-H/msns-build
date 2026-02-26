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
        <div className="relative flex h-full w-full flex-col">
          {children}
          <Toaster />
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}
