import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { EmployeeTable } from "~/components/tables/EmployeeTable";
import { Separator } from "~/components/ui/separator";

export default function EmployeesTable() {
    const breadcrumbs = [
        { href: "/admin", label: "Dashboard", },
        { href: "/academics", label: "Academics", },
        { href: "/admin/users/faculty/create", label: "Employee Registration", current: true },
      ]
    
    return (
        <section className="w-full">
            <PageHeader breadcrumbs={breadcrumbs}/>
            <div className="pt-16">
            <div className="flex-1 p-4">
            <h1 className="text-center text-5xl p-4 font-serif font-semibold text-green-800">Employees Credentials Detail</h1>
            <Separator className="bg-green-900" />
            <EmployeeTable />
            <Separator className="bg-green-900" />
            </div>
            </div>
        </section>
    )
}