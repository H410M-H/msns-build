"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import RegistrationCards from "~/components/cards/RegistrationCard";

export default function RegistrationPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "User Management", current: true },
  ];

  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile for optimization
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* 🎯 OPTIMIZED GRID BACKGROUND (Dark Theme) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>

      {/* 🎯 AMBIENT GLOW EFFECTS */}
      {!prefersReducedMotion && !isMobile && (
        <>
          <motion.div
            className="absolute left-[20%] top-[20%] h-[25rem] w-[25rem] rounded-full bg-emerald-500/10 blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[10%] right-[10%] h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-[100px]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </>
      )}

      <div className="relative z-10 max-w-[100vw] px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex flex-1 flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
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
