import { PageHeader } from "~/components/blocks/nav/PageHeader";
import StudentCredDetails from "~/components/cards/StudentCredCard";
import { Separator } from "~/components/ui/separator";

export default function StudentCred() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users/student/edit", label: "Directory & Editing", current: true },
  ];

  return (
    <section className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      {/* BACKGROUND START - Consistent with Creation/Edit pages */}
      <div className="w-screen inset-0 z-0 pointer-events-none fixed">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>
      {/* BACKGROUND END */}

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
          <div className="flex flex-col gap-8 max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h1 className="text-4xl sm:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400 drop-shadow-sm">
                Student Management
              </h1>
              <p className="text-slate-100 text-lg max-w-2xl mx-auto">
                View detailed records, manage credentials, and update student profiles.
              </p>
            </div>

            <Separator className="bg-emerald-500/20" />

            {/* Content Card Wrapper */}
            <div className="w-full backdrop-blur-xl bg-slate-900/60 border border-emerald-500/10 rounded-2xl shadow-2xl overflow-hidden sm:p-8">
              <StudentCredDetails />
            </div>
            
            <Separator className="bg-emerald-500/20" />
          </div>
        </div>
      </div>
    </section>
  );
}