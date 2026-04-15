import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { EmployeeTable } from "~/components/tables/EmployeeTable";
import SalaryPage from "../../../revenue/salary/page"; // Ensure this path is correct
import AttendancePage from "../../../attendance/page"; // Ensure this path is correct
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, UserCog, DollarSign, CheckCircle2Icon } from "lucide-react";

export default function EmployeesDashboard() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    {
      href: "/admin/users/faculty/view",
      label: "Faculty Management",
      current: true,
    },
  ];

  return (
    <section className="relative w-full">
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="relative mb-10 space-y-4 text-center">
            <div className="mb-2 inline-flex items-center justify-center rounded-2xl border border-emerald-500/20 bg-card p-3 shadow-lg backdrop-blur-sm">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-4xl md:text-5xl">
              Employee Management
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Centralized hub for managing faculty credentials, processing
              salaries, and tracking daily attendance records.
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="credentials" className="w-full space-y-8">
            {/* Tab Navigation - Responsive */}
            <div className="flex justify-center">
              <TabsList className="grid h-auto w-full max-w-3xl grid-cols-1 gap-2 rounded-xl border border-emerald-500/20 bg-card p-1.5 backdrop-blur-md sm:grid-cols-3">
                <TabsTrigger
                  value="credentials"
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-muted-foreground transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg"
                >
                  <UserCog className="h-4 w-4" />
                  <span>Credentials</span>
                </TabsTrigger>
                <TabsTrigger
                  value="salaries"
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-muted-foreground transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Salaries</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-muted-foreground transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg"
                >
                  <CheckCircle2Icon className="h-4 w-4" />
                  <span>Attendance</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Areas */}
            <div className="relative min-h-[500px]">
              <TabsContent
                value="credentials"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                <EmployeeTable />
              </TabsContent>

              <TabsContent
                value="salaries"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                {/* Wrap external page content in glass container for consistency if needed */}
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 shadow-xl backdrop-blur-md sm:p-6">
                  <SalaryPage />
                </div>
              </TabsContent>

              <TabsContent
                value="attendance"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 shadow-xl backdrop-blur-md sm:p-6">
                  <AttendancePage />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
