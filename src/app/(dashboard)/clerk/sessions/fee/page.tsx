import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ClassFeeTable } from "~/components/tables/ClassFee";
import { PageHeader } from "~/components/blocks/nav/PageHeader";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string }>;
};

export default async function FeeDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard" }];
  return (
    <div className="w-full">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Fee details</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <ClassFeeTable
                sessionId={searchProps.sessionId}
                classId={searchProps.classId}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
