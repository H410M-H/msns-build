import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { EmployeeTable } from "~/components/tables/EmployeeTable";
import { Separator } from "~/components/ui/separator";
import SalaryPage from "../../../revenue/salary/page";

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
    <section className="w-full">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="pt-16">
        <div className="flex-1 p-4">
          <h1 className="p-4 text-center font-serif text-5xl font-semibold text-green-800">
            Employees Credentials Detail
          </h1>
          <Separator className="bg-green-900" />
          <EmployeeTable />
          <Separator className="bg-green-900" />
        </div>
        <Separator className="bg-green-900" />
                <h1 className="p-4 text-center font-serif text-5xl font-semibold text-green-800">
          Employees Salaries
        </h1>
        <SalaryPage />
        <Separator className="bg-green-900" />
      </div>
    </section>
  );
}
