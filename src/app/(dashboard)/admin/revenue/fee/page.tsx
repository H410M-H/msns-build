import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { FeeTable } from "~/components/tables/FeeTable";
import { FeeAssignmentTable } from "~/components/tables/StudentFeeTable";
import { Separator } from "~/components/ui/separator";

export default async function FeeDetails(){
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/revenue", label: "Revenue" },
    { href: "/revenue/fee", label: "Fee Management", current: true },
  ];
  return (
    <main className="min-h-screen bg-yellow-100/50 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="pt-20 ">
        <FeeTable />
      <Separator className="bg-green-900" />
      <FeeAssignmentTable />
      </div>
    </main>
  )
}