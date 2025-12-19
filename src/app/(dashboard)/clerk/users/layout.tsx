import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | User Management",
    default: "Directory | MSNS Admin",
  },
  description: "Comprehensive management dashboard for students, faculty, and administrative staff registrations.",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* === SHARED GLOBAL BACKGROUND === */}
      {/* This persists across all user pages (Create, Edit, Table) so the background doesn't flash on navigation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* Cyber Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        
        {/* Deep Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-slate-950/90 to-slate-950" />
        
        {/* Animated Ambient Glows */}
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute -bottom-20 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] opacity-50 animate-pulse delay-1000" />
      </div>

      {/* === CONTENT WRAPPER === */}
      {/* z-10 ensures content sits above the background */}
      <main className="relative z-10 w-full h-full flex flex-col">
        {children}
      </main>
      
    </div>
  );
}