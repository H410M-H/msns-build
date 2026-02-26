import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | User Management",
    default: "Directory | MSNS Admin",
  },
  description:
    "Comprehensive management dashboard for students, faculty, and administrative staff registrations.",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* === SHARED GLOBAL BACKGROUND === */}
      {/* This persists across all user pages (Create, Edit, Table) so the background doesn't flash on navigation */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Cyber Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />

        {/* Deep Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-950/90 to-slate-950" />

        {/* Animated Ambient Glows */}
        <div className="absolute -top-20 left-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-500/10 opacity-50 blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-500/10 opacity-50 blur-[120px] delay-1000" />
      </div>

      {/* === CONTENT WRAPPER === */}
      {/* z-10 ensures content sits above the background */}
      <main className="relative z-10 flex h-full w-full flex-col">
        {children}
      </main>
    </div>
  );
}
