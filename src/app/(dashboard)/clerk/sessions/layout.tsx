import type { Metadata } from "next";
import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Clerk Session Billing & Student Enrollment",
  description:
    "Front-desk clerk portal to verify student session enrollments, generate monthly tuition challans, and record fee voucher receipts at MSNS.",
  robots: {
    index: false,
    follow: false,
  },
  keywords: ["clerk", "sessions", "challans", "enrollment", "fees"],
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
