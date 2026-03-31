import { PageHeader } from "~/components/blocks/nav/PageHeader";
import StudentCredDetails from "~/components/cards/StudentCredCard";
import { Separator } from "~/components/ui/separator";

export default function StudentCred() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    {
      href: "/admin/users/student/edit",
      label: "Directory & Editing",
      current: true,
    },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* BACKGROUND START - Consistent with Creation/Edit pages */}
      <div className="pointer-events-none fixed inset-0 z-0 w-screen">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>
      {/* BACKGROUND END */}

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-12 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">
            {/* Header Section */}
            <div className="space-y-4 text-center duration-500 animate-in fade-in slide-in-from-top-4">
              <h1 className="bg-gradient-to-r from-emerald-200 to-teal-400 bg-clip-text font-serif text-4xl font-bold text-transparent drop-shadow-sm sm:text-5xl">
                Student Management
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-100">
                View detailed records, manage credentials, and update student
                profiles.
              </p>
            </div>

            <Separator className="bg-emerald-500/20" />

            {/* Content Card Wrapper */}
            <div className="w-full overflow-hidden rounded-2xl border border-emerald-500/10 bg-card shadow-2xl backdrop-blur-xl sm:p-8">
              <StudentCredDetails />
            </div>

            <Separator className="bg-emerald-500/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
