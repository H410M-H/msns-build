import { ScrollArea } from "@radix-ui/react-scroll-area";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { StudentTable } from "~/components/tables/StudentTable";

export default function StudentsTable() {
    const breadcrumbs = [
        { href: "/dashboard", label: "Dashboard", },
        { href: "/admin/academics", label: "Academics", },
        { href: "/admin/users/student", label: "Registered Students", current: true },
      ]
      
      return (
        <ScrollArea className="items-center ">
          <PageHeader breadcrumbs={breadcrumbs} />
          <div className="pt-16">
            <div className="flex-1 p-4">
                <StudentTable />
            </div>
            </div>
        </ScrollArea>
    )
}
