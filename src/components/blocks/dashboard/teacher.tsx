import { GraduationCap } from "lucide-react";

export const TeacherSection=()=> {
  return (
    <section className="mb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="-rotate-1 transform rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Your Classes</h2>
          <p className="text-gray-600">Manage your teaching schedule</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-sm">
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">Class Management Coming Soon</h3>
          <p className="text-gray-600">Your teaching assignments will appear here</p>
        </div>
      </div>
    </section>
  );
}