import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassList } from "~/components/tables/ClassList";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type PageProps = {
  params: Promise<{ sessionId: string, }>;
};

export default async function SessionDetailPage({ params }: PageProps) {
  const searchProps = await params;
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: `/admin/sessions/${searchProps.sessionId}`, label: "Sessional Details", current: true },
  ];
  return (
    <div className="w-full">
      <PageHeader breadcrumbs={breadcrumbs} />
      <Card className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group pt-20">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardTitle className="text-2xl font-bold text-gray-800 relative flex items-center gap-2">Session </CardTitle>
        </CardHeader>
        <CardContent>
            <ClassList sessionId={searchProps.sessionId} />
        </CardContent>
      </Card>
    </div>
  );
}
