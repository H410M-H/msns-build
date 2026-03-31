import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { StudentTable } from "~/components/tables/StudentTable";
import { Separator } from "~/components/ui/separator";

export default function StudentsTablePage() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users/student", label: "Student Directory", current: true },
  ];

  return (
    <section className="min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* BACKGROUND START - Consistent across your app */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>
      {/* BACKGROUND END */}

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-8 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Registered Students
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Manage the complete directory of registered students. Use the
                table below to filter, sort, edit, or export student data.
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
