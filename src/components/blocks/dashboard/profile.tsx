"use client";

import { User } from "lucide-react";
import ProfileCard from "~/components/cards/ProfileCard";

export const ProfileSection = () => {
  return (
    <section className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-4 space-x-4">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 p-1 shadow-lg shadow-emerald-500/20">
          <div className="rotate-2 transform rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <User className="h-4 w-4 text-foreground" />
          </div>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Profile Overview
        </h2>
      </div>

      <div className="group relative flex-1">
        <div className="absolute inset-0 scale-95 transform rounded-3xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl transition-all duration-500 group-hover:scale-100"></div>
        <div className="relative h-full transform rounded-3xl border border-slate-200 bg-white/50 p-4 shadow-sm backdrop-blur-xl transition-all duration-500 hover:bg-white/70 dark:border-border dark:bg-card dark:shadow-2xl dark:hover:bg-card/80 sm:p-6">
          <ProfileCard />
        </div>
      </div>
    </section>
  );
};
