import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { StudentTable } from "~/components/tables/StudentTable";
import { Separator } from "~/components/ui/separator";

export default function StudentsTablePage() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users/student", label: "Student Directory", current: true },
  ];

  return (
    <section className="min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      {/* BACKGROUND START - Consistent across your app */}
      <div className="inset-0 z-0 pointer-events-none fixed">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>
      {/* BACKGROUND END */}

      <div className="w-full relative z-10 flex flex-col min-h-screen">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="flex flex-col gap-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-serif">
                Registered Students
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
                Manage the complete directory of registered students. Use the table below to filter, sort, edit, or export student data.
              </p>
            </div>

            <Separator className="bg-emerald-500/20" />

            {/* Table Container */}
            <div className="backdrop-blur-sm">
                <StudentTable />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}