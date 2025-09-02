import { Shield, Trophy } from "lucide-react";
import AdminCards from "~/components/cards/AdminCard";

export const AdminSection= ()=> {
  return (
    <section className="mb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="rotate-1 transform rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-orange-400"></div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Quick Management</h2>
          <p className="text-gray-600">Administrative tools and controls</p>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-500">Admin Access</span>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute inset-0 scale-95 transform rounded-3xl bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-xl transition-all duration-500 group-hover:scale-100"></div>
        <div className="relative rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-sm">
          <AdminCards />
        </div>
      </div>
    </section>
  );
}