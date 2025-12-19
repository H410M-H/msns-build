import { PageHeader } from "~/components/blocks/nav/PageHeader";
import EmployeeCredDetails from "~/components/cards/CredentialCard";
// FIX: Import from the file we created in the previous step
import { Separator } from "~/components/ui/separator";

export default function EmployeeCardsPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users/faculty/view", label: "Faculty List" },
    { href: "/admin/users/faculty/edit", label: "Employee Cards", current: true },
  ];

  return (
    <section className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="flex flex-col gap-8 max-w-[1920px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Section */}
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-400 drop-shadow-sm">
                Employee Credentials
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                View detailed profile cards for all registered faculty members and staff. Manage contact details, designations, and biometric IDs.
              </p>
            </div>

            <Separator className="bg-emerald-500/20" />

            {/* Cards Container */}
            <div className="backdrop-blur-sm min-h-[500px]">
                <EmployeeCredDetails />
            </div>
            
            <Separator className="bg-emerald-500/20" />
          </div>
        </div>
      </div>
    </section>
  );
}