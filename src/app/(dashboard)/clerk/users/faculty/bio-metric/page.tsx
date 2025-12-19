import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { RegisterEmployeeBioMetric } from "~/components/attendance/register-bio";
import { ScrollArea } from "~/components/ui/scroll-area";

export default async function EmployeeRegistration(
  props: PageProps<"/admin/users/faculty/bio-metric">,
) {
  const { employeeId, employeeName } = (await props.searchParams) as {
    employeeId: string;
    employeeName: string;
  };
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    {
      href: "/clerk/users/faculty/view",
      label: "Employee Table",
      current: true,
    },
  ];

  return (
    <ScrollArea className="items-center">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="pt-14">
        <RegisterEmployeeBioMetric employeeId={employeeId} employeeName={employeeName} />
      </div>
    </ScrollArea>
  );
}
