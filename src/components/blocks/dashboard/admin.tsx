// File: src/components/blocks/dashboard/admin.tsx
"use client";

import { Shield, Trophy } from "lucide-react";
import AdminCards from "~/components/cards/AdminCard";

export const AdminSection = () => {
  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rotate-1 transform rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg shadow-emerald-500/20 transition-transform duration-300 hover:rotate-0 dark:shadow-emerald-900/20">
              <Shield className="h-5 w-5 text-foreground" />
            </div>
            {/* Decorative dot */}
            <div className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-white dark:ring-slate-900"></div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Quick Management
            </h2>
            <p className="text-sm text-muted-foreground dark:text-emerald-100/50">
              Administrative tools and controls
            </p>
          </div>
        </div>

        {/* Admin Access Badge */}
        <div className="ml-auto hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-border dark:bg-white/5 dark:shadow-none lg:flex">
          <Trophy className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-100/80">
            Admin Access
          </span>
        </div>
      </div>

      {/* Card Container with Themed Backdrop */}
      <div className="group relative">
        {/* Ambient Glow: Pastel in Light, Neon in Dark */}
        <div className="absolute inset-0 scale-[0.99] transform rounded-3xl bg-gradient-to-r from-emerald-100/50 to-teal-100/50 blur-2xl transition-all duration-500 dark:from-emerald-500/5 dark:to-teal-500/5"></div>

        <div className="relative rounded-3xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-border dark:bg-card dark:shadow-2xl">
          <AdminCards />
        </div>
      </div>
    </section>
  );
};
