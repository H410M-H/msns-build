import { PageHeader } from "~/components/blocks/nav/PageHeader";
import EmployeeCredDetails from "~/components/cards/CredentialCard";
// FIX: Import from the file we created in the previous step
import { Separator } from "~/components/ui/separator";

export default function EmployeeCardsPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users/faculty/view", label: "Faculty List" },
    {
      href: "/admin/users/faculty/edit",
      label: "Employee Cards",
      current: true,
    },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-8 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Section */}
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-4xl lg:text-5xl">
                Employee Credentials
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                View detailed profile cards for all registered faculty members
                and staff. Manage contact details, designations, and biometric
                IDs.
              </p>
            </div>

            <Separator className="bg-emerald-500/20" />

            {/* Cards Container */}
            <div className="min-h-[500px] backdrop-blur-sm">
              <EmployeeCredDetails />
            </div>

            <Separator className="bg-emerald-500/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
