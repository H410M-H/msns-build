// app/dashboard/page.tsx
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { EmployeeTable } from "~/components/tables/EmployeeTable";
import SalaryPage from "../../../revenue/salary/page";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, UserCog, DollarSign, CheckCircle2Icon } from "lucide-react";
import AttendancePage from "../../../attendance/page";

export default function EmployeesTable() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/academics", label: "Academics" },
    {
      href: "/admin/users/faculty/view",
      label: "Faculty Management",
      current: true,
    },
  ];

  return (
            <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm">

      <PageHeader breadcrumbs={breadcrumbs} />

          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-sm lg:p-6">
                <div className="flex-1 text-center p-2 space-y-4 lg:pb-8">
        {/* Header Section */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/40 blur-2xl border-y-2"></div>
              <h1 className="text-6xl font-serif font-semibold text-green-800 mb-2">
                Employees Management
              </h1>
              <p className="text-slate-600 text-lg">
                Manage employee credentials and salary information
              </p>
          </div>
            
            {/* Main Tabs */}
            <Tabs defaultValue="credentials" className="w-full items-center">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100 p-1.5 rounded-lg">
                <TabsTrigger
                  value="credentials"
                  className="flex items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 rounded-md"
                >
                  <UserCog className="h-4 w-4" />
                  Employee Credentials
                </TabsTrigger>
                <TabsTrigger
                  value="salaries"
                  className="flex items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 rounded-md"
                >
                  <DollarSign className="h-4 w-4" />
                  Employee Salaries
                </TabsTrigger>
                                <TabsTrigger
                  value="attendance"
                  className="flex items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 rounded-md"
                >
                  <CheckCircle2Icon className="h-4 w-4" />
                  Employee Attendance
                </TabsTrigger>
              </TabsList>

                <TabsContent value="credentials">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                          <Users className="h-5 w-5 text-green-600" />
                          Employees Credentials Detail
                        </CardTitle>
                        <CardDescription>
                          View and manage employee information and credentials
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EmployeeTable />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="salaries">
                      <SalaryPage />
                </TabsContent>
                <TabsContent value="attendance">
                      <AttendancePage />
                </TabsContent>
            </Tabs>
              </div>

        </section>
  );
}