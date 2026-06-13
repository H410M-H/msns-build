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
    <div className="relative w-full overflow-x-hidden selection:bg-emerald-500/30">
      <main className="relative z-10 flex h-full w-full flex-col">
        {children}
      </main>
    </div>
  );
}
