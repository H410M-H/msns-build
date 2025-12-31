"use client";

import { Shield, Trophy } from "lucide-react";
import AlumniCard from "~/components/cards/AlumniCard";

export const ClerkSection = () => {
  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rotate-1 transform rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg shadow-purple-500/20 dark:shadow-purple-900/20 transition-transform duration-300 hover:rotate-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {/* Decorative dot */}
            <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-orange-400 ring-2 ring-white dark:ring-slate-900"></div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Quick Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-purple-100/50">
              Clerical tools and controls
            </p>
          </div>
        </div>

        {/* Access Badge */}
        <div className="ml-auto hidden items-center gap-2 lg:flex bg-white border border-slate-200 px-3 py-1.5 rounded-full dark:bg-white/5 dark:border-white/10 shadow-sm dark:shadow-none">
          <Trophy className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-purple-100/80 uppercase tracking-wider">
            Clerical Access
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="group relative">
        {/* Ambient Glow: Purple/Pink */}
        <div className="absolute inset-0 scale-[0.99] transform rounded-3xl bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-500/10 dark:to-pink-500/10 blur-2xl transition-all duration-500 group-hover:scale-100"></div>
        
        <div className="relative rounded-3xl border border-slate-200 bg-white/50 p-8 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl">
          <AlumniCard />
        </div>
      </div>
    </section>
  );
}