"use client";

import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import RegistrationCards from "~/components/cards/RegistrationCard";

export default function RegistrationPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "User Management", current: true },
  ];

  return (
    <div className="relative w-full">
      <div className="relative z-10 max-w-[100vw] px-4 py-4 sm:px-6 lg:px-8">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex flex-1 flex-col items-center justify-center py-6 sm:py-8 lg:py-12">
          {/* Hero Header */}
          <div className="mx-auto mb-16 max-w-4xl space-y-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="mb-4 inline-flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-lg shadow-emerald-900/20"
            >
              <GraduationCap className="h-12 w-12 text-emerald-400 sm:h-16 sm:w-16" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              Online{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Registration
              </span>{" "}
              Portal
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2 text-lg font-medium text-emerald-100/60 sm:text-xl"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-amber-400" />
              <span>Begin Your Academic Journey</span>
              <ArrowRight className="mx-2 h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-emerald-300">
                Register Now
              </span>
            </motion.div>
          </div>

          {/* Cards Section */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full"
          >
            <RegistrationCards />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
