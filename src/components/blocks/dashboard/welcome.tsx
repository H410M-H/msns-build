import { Sparkles, Star } from "lucide-react";
import { CalendarDialog } from "~/components/blocks/dashboard/calendar-dialog";
import { getRoleTheme } from "~/lib/utils";
import { auth } from "~/server/auth";

export const WelcomeSection = async () => {
  const session = await auth();

  const roleTheme = getRoleTheme(session?.user.accountType ?? "");
  const RoleIcon = roleTheme.icon;

  return (
    <div className="mb-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-sm lg:p-12">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 blur-2xl"></div>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className={`bg-gradient-to-br p-4 ${roleTheme.gradient} -rotate-3 transform rounded-2xl shadow-xl transition-transform duration-300 hover:rotate-0`}
              >
                <RoleIcon className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
                {roleTheme.badge}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-black text-transparent lg:text-4xl">
                  Welcome back,
                </h1>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-6 w-6 animate-pulse text-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
              </div>

              <h2
                className={`bg-gradient-to-r text-2xl font-bold lg:text-3xl ${roleTheme.gradient} bg-clip-text text-transparent`}
              >
                {session?.user.username}!
              </h2>

              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                <span>Active Session • {new Date().toLocaleDateString()}</span>
              </div> */}
            </div>
          </div>

          <CalendarDialog />
        </div>
      </div>
    </div>
  );
};
