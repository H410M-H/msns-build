import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Registration | Admin Dashboard",
  description: "Manage student and faculty registrations and view active directories.",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}