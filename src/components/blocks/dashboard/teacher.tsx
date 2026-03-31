"use client";

import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { GraduationCap, Users, BookOpen, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ClassDiaryForm } from "~/components/forms/class/ClassDiaryForm";

export const TeacherSection = () => {
  const { data: session } = useSession();
  
  const { data: profile, isLoading } = api.employee.getProfileByUserId.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const classSubjects = profile?.ClassSubject ?? [];

  return (
    <section className="mb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="-rotate-1 transform rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <GraduationCap className="h-6 w-6 text-foreground" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Your Classes</h2>
          <p className="text-muted-foreground">Manage your teaching schedule and diaries</p>
        </div>
      </div>

      {classSubjects.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card/70 p-8 shadow-2xl backdrop-blur-sm">
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
              <GraduationCap className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No Classes Assigned
            </h3>
            <p className="text-muted-foreground">
              Your teaching assignments will appear here once allocated.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classSubjects.map((cs) => (
            <div key={cs.csId} className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                    Grade {cs.Grades?.grade} ({cs.Grades?.section})
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">{cs.Subject?.subjectName}</h3>
              <div className="mb-6 mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Class ID: {cs.classId.slice(-4)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                 <ClassDiaryForm 
                   classSubjectId={cs.csId} 
                   teacherId={profile?.employeeId ?? ""} 
                 />
                 <Link href={`/teacher/sessions/class?sessionId=${cs.sessionId}&classId=${cs.classId}`} className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
                   View Class <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
