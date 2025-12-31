import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassAllotmentTable } from "~/components/tables/ClassAlotment";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string; }>;
};

export default async function ClassDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;
  
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: `/admin/sessions/${searchProps.sessionId}`, label: "Session Details" },
  ];

  return (
    // Wrapper: Full width, standard spacing
    <div className="w-full space-y-6">
      
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Render Table Directly without redundant Card wrapper */}
      <div className="animate-in fade-in duration-500">
        <ClassAllotmentTable 
          classId={searchProps.classId} 
          sessionId={searchProps.sessionId} 
        />
      </div>
    </div>
  );
}