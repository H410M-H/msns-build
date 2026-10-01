import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Clerk Directory",
    default: "Clerk Student & Staff Directory | MSNS LMS",
  },
  description:
    "Clerk administrative directory for student admission record verification, employee biometric logs, and guardian contact detail maintenance.",
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
