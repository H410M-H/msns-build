import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { StudentTable } from "~/components/tables/StudentTable";
import { Separator } from "~/components/ui/separator";

export default function StudentsTablePage() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users/student", label: "Student Directory", current: true },
  ];

  return (
    <section className="relative w-full">
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
