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
    <section className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-size-[3rem_3rem] sm:bg-size-[4rem_4rem]" />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          
          {/* Header Section */}
          <div className="mb-10 text-center space-y-4 relative">
             <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900/50 border border-emerald-500/20 backdrop-blur-xs mb-2 shadow-lg">
                <Users className="w-8 h-8 text-emerald-400" />
             </div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-emerald-200 to-emerald-400 drop-shadow-xs">
                Employee Management
             </h1>
             <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Centralized hub for managing faculty credentials, processing salaries, and tracking daily attendance records.
             </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="credentials" className="w-full space-y-8">
            
            {/* Tab Navigation - Responsive */}
            <div className="flex justify-center">
                <TabsList className="grid w-full max-w-3xl grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/60 backdrop-blur-md border border-emerald-500/20 p-1.5 rounded-xl h-auto">
                <TabsTrigger
                    value="credentials"
                    className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                    <UserCog className="h-4 w-4" />
                    <span>Credentials</span>
                </TabsTrigger>
                <TabsTrigger
                    value="salaries"
                    className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                    <DollarSign className="h-4 w-4" />
                    <span>Salaries</span>
                </TabsTrigger>
                <TabsTrigger
                    value="attendance"
                    className="flex items-center justify-center gap-2 py-3 rounded-lg text-slate-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                    <CheckCircle2Icon className="h-4 w-4" />
                    <span>Attendance</span>
                </TabsTrigger>
                </TabsList>
            </div>

            {/* Content Areas */}
            <div className="relative min-h-[500px]">
                <TabsContent value="credentials" className="mt-0 focus-visible:outline-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmployeeTable />
                </TabsContent>

                <TabsContent value="salaries" className="mt-0 focus-visible:outline-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Wrap external page content in glass container for consistency if needed */}
                    <div className="rounded-xl border border-emerald-500/20 bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 shadow-xl">
                        <SalaryPage />
                    </div>
                </TabsContent>

                <TabsContent value="attendance" className="mt-0 focus-visible:outline-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-xl border border-emerald-500/20 bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 shadow-xl">
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