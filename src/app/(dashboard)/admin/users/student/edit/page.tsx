import { PageHeader } from "~/components/blocks/nav/PageHeader";
import StudentCredDetails from "~/components/cards/StudentCredCard";
import { Separator } from "~/components/ui/separator";

export default function StudentCred() {
    const breadcrumbs = [
        { href: "/dashboard", label: "Dashboard", },
        { href: "/admin/users/student/edit", label: "Registered Students", current: true },
      ]
      
      return (
        <section className="w-full">
            <PageHeader breadcrumbs={breadcrumbs}/>
            <div className="pt-16">
            <div className="flex-1 p-4">
            <h1 className="text-center text-5xl p-4 font-serif font-semibold text-green-800">Edit Students Credentials Detail</h1>
            <Separator className="bg-green-900" />
                <StudentCredDetails />
                <Separator className="bg-green-900" />
            </div>
            </div>
        </section>
    )
}