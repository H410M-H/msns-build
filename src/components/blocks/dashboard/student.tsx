import { BookOpen } from "lucide-react";

export const StudentSection=()=> {
  return (
    <section className="mb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="rotate-1 transform rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
          <p className="text-gray-600">Track your academic progress</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xs">
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">Course Information Coming Soon</h3>
          <p className="text-gray-600">Your enrolled courses will appear here</p>
        </div>
      </div>
    </section>
  );
}