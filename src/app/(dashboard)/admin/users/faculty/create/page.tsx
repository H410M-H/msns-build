import { PageHeader } from "~/components/blocks/nav/PageHeader";
import EmployeeCreationDialog from "~/components/forms/employee/employeeCreation";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function EmployeeRegistration() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard", },
    { href: "/academics", label: "Academics", },
    { href: "/userReg/faculty/create", label: "Employee Registration", current: true },
  ]
  
  return (
    <ScrollArea className="items-center ">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="pt-14">
        <div className="flex-1">
          <EmployeeCreationDialog />
        </div>
      </div>
    </ScrollArea>
    )
}
