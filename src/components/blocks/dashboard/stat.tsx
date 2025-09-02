import { Activity } from "lucide-react";
import { StatsCards } from "~/components/cards/StatCard";
import { getStatTheme } from "~/lib/utils";
import { auth } from "~/server/auth";



export async function StatsSection() {
    const session = await auth();

  const roleTheme = getStatTheme(session?.user.accountType ?? "");

  return (
    <section className="mb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div
            className={`bg-gradient-to-br p-3 ${roleTheme.gradient} -rotate-1 transform rounded-2xl shadow-xl transition-transform duration-300 hover:rotate-0`}
          >
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-green-400"></div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">
            {/* {isStudent ? "Your Academic Overview" : "Institutional Overview"} */}
            Institutional overview
          </h2>
          <p className="text-gray-600">Real-time performance metrics</p>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Live Data
          </span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
        </div>
      </div>

      <div className="group relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${roleTheme.bg}/30 scale-95 transform rounded-3xl blur-xl transition-all duration-500 group-hover:scale-100`}
        ></div>
        <div className="relative rounded-3xl border border-white/30 bg-white/60 p-8 shadow-2xl backdrop-blur-sm">
          <StatsCards />
        </div>
      </div>
    </section>
  );
}


