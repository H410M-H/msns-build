import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { ClassAllotmentTable } from "~/components/tables/ClassAlotment";
import { Users } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string; }>;
};

export default async function ClassDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;
  
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: `/admin/sessions/${searchProps.sessionId}`, label: "Session Details" },
    { href: "#", label: "Class Roster", current: true },
  ];

  return (
    <section className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          
          <div className="max-w-[1920px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Section */}
            {/* <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                        <BookOpen className="w-6 h-6 text-emerald-400" />
                    </span>
                    Class Details
                </h1>
                <p className="text-slate-400 ml-1 max-w-2xl">
                    Manage student enrollments, view allotment details, and oversee class composition for the current academic session.
                </p>
            </div> */}

            {/* Main Content Card */}
            <Card className="border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-emerald-500/10 bg-slate-900/50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl text-white flex items-center gap-2 font-semibold">
                                <Users className="w-5 h-5 text-emerald-400" />
                                Student Allotment Registry
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Detailed list of students currently assigned to this class.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0">
                    <div className="p-6">
                        <ClassAllotmentTable 
                            classId={searchProps.classId} 
                            sessionId={searchProps.sessionId} 
                        />
                    </div>
                </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
}