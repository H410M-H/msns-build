import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassAllotmentTable } from "~/components/tables/ClassAlotment";
import { ClassTimetableTab } from "~/components/blocks/class/ClassTimetableTab";
import { ClassAttendanceTab } from "~/components/blocks/class/ClassAttendanceTab";
import { ClassExamsTab } from "~/components/blocks/class/ClassExamsTab";
import { ClassDiariesTab } from "~/components/blocks/class/ClassDiariesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Users,
  BookOpen,
  Clock,
  FileText,
  ClipboardCheck,
} from "lucide-react";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string }>;
};

export default async function ClassDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    {
      href: `/admin/sessions/${searchProps.sessionId}`,
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
          <TabsList className="mb-8 grid w-full grid-cols-2 bg-card p-1 md:grid-cols-5">
            <TabsTrigger
              value="roster"
              className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400"
            >
              <Users className="mr-2 h-4 w-4" /> Roster
            </TabsTrigger>
            <TabsTrigger
              value="timetable"
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
            >
              <Clock className="mr-2 h-4 w-4" /> Timetable
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger
              value="exams"
              className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400"
            >
              <FileText className="mr-2 h-4 w-4" /> Exams
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

          <TabsContent value="timetable" className="m-0">
            <ClassTimetableTab
              classId={searchProps.classId}
              sessionId={searchProps.sessionId}
            />
          </TabsContent>

          <TabsContent value="attendance" className="m-0">
            <ClassAttendanceTab
              classId={searchProps.classId}
              sessionId={searchProps.sessionId}
            />
          </TabsContent>

          <TabsContent value="exams" className="m-0">
            <ClassExamsTab
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
