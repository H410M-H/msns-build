import { User } from "lucide-react";
import ProfileCard from "~/components/cards/ProfileCard";

export const ProfileSection = () => {
  return (
    <section className="flex flex-col">
      <div className="mb-4 flex items-center gap-4 space-x-4">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
          <div className="rotate-2 transform rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>



      <div className="group">
        <div className="absolute inset-0 scale-95 transform rounded-3xl bg-gradient-to-r from-indigo-200/20 to-purple-200/20 blur-xl transition-all duration-500 group-hover:scale-100"></div>
        <div className="hover:shadow-3xl relative transform rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-1">
          <ProfileCard />
        </div>
      </div>
            </div>

    </section>
  );
}