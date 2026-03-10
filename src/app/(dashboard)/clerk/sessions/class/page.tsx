import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassAllotmentTable } from "~/components/tables/ClassAlotment";
import { ClassSubjectManagement } from "~/components/blocks/class/ClassSubjectManagement";
import { ClassDiariesTab } from "~/components/blocks/class/ClassDiariesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, BookOpen } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string }>;
};

export default async function ClassDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;

  const breadcrumbs = [
    { href: "/clerk", label: "Dashboard" },
    {
      href: `/clerk/sessions/${searchProps.sessionId}`,
      label: "Session Details",
    },
  ];

  return (
    // Wrapper: Full width, standard spacing
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Render Table Directly without redundant Card wrapper */}
      <div className="duration-500 animate-in fade-in">
        <Tabs defaultValue="roster" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3 gap-1 bg-card p-1">
            <TabsTrigger
              value="roster"
              className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400"
            >
              <Users className="mr-2 h-4 w-4" /> Roster
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-400"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Subjects
            </TabsTrigger>
            <TabsTrigger
              value="diaries"
              className="data-[state=active]:bg-indigo-600/20 data-[state=active]:text-indigo-400"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Diaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="m-0">
            <ClassAllotmentTable
              classId={searchProps.classId}
              sessionId={searchProps.sessionId}
            />
          </TabsContent>

          <TabsContent value="subjects" className="m-0">
            <ClassSubjectManagement
              classId={searchProps.classId}
              sessionId={searchProps.sessionId}
            />
          </TabsContent>

          <TabsContent value="diaries" className="m-0">
            <ClassDiariesTab
              classId={searchProps.classId}
              sessionId={searchProps.sessionId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
