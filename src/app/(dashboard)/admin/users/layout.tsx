import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin User Management",
    default: "Admin User Directory | MSNS LMS",
  },
  description:
    "Manage system administrator, teacher, student, and parent user accounts, role-based permissions, and login credentials across the MSNS portal.",
  robots: {
    index: false,
    follow: false,
  },
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
