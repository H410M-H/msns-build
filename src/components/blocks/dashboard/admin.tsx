"use client";

import { Shield, Trophy } from "lucide-react";
import AdminCards from "~/components/cards/AdminCard";

export const AdminSection = () => {
  return (
    <section className="mb-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <div className="rotate-1 transform rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-xl shadow-emerald-900/20 transition-transform duration-300 hover:rotate-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-black"></div>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-white">Quick Management</h2>
          <p className="text-sm text-emerald-100/50">Administrative tools and controls</p>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <span className="text-xs font-medium text-emerald-100/70">Admin Access</span>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute inset-0 scale-[0.98] transform rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-xl transition-all duration-500 group-hover:scale-100"></div>
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
          <AdminCards />
        </div>
      </div>
    </section>
  );
}