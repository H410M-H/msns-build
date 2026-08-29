"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

interface AnimatedSplashScreenProps {
  onComplete?: () => void;
  adminPicUrl?: string;
  logoUrl?: string;
  durationMs?: number;
  showProgress?: boolean;
}

export function AnimatedSplashScreen({
  onComplete,
  adminPicUrl = "/admin-profile.jpg",
  logoUrl = "/api/images/logos/Official_LOGO_grn_ic9ldd.png",
  durationMs = 3800,
  showProgress = true,
}: AnimatedSplashScreenProps) {
  // Phase 0: Admin Profile Pic, Phase 1: Morphing Transition, Phase 2: School Logo Settle
  const [phase, setPhase] = useState<"admin" | "morphing" | "logo">("admin");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage 1: Show Admin profile pic for 1.2s
    const timer1 = setTimeout(() => {
      setPhase("morphing");
    }, 1200);

    // Stage 2: Morph into School Logo at 2.2s
    const timer2 = setTimeout(() => {
      setPhase("logo");
    }, 2200);

    // Stage 3: Complete splash screen
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    // Progress bar ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, durationMs / 40);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
    };
  }, [durationMs, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/90 to-slate-900 font-sans text-white select-none"
    >
      {/* Dynamic Animated Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.6, 0.35],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 h-[70vw] w-[70vw] rounded-full bg-emerald-600/30 blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.5, 0.25],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 h-[70vw] w-[70vw] rounded-full bg-teal-500/25 blur-[140px]"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)]"
        />

        {/* Floating Particles */}
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-emerald-300/40 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: (i % 5) * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Center Stage Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Morphing Avatar / Logo Frame */}
        <div className="relative flex items-center justify-center">
          {/* Animated Morphing Rings */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: phase === "morphing" ? [1, 1.15, 1] : 1,
              borderRadius:
                phase === "morphing"
                  ? ["50%", "35%", "50%"]
                  : "50%",
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-6 rounded-full border-2 border-dashed border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          />

          <motion.div
            animate={{
              rotate: [360, 0],
              scale: phase === "morphing" ? [1, 0.9, 1] : 1,
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-3 rounded-full border border-teal-300/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
          />

          {/* Morphing Frame */}
          <motion.div
            className="relative h-44 w-44 sm:h-52 sm:w-52 overflow-hidden border-2 border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.5)] backdrop-blur-xl bg-slate-900/80"
            animate={{
              borderRadius:
                phase === "admin"
                  ? "50%"
                  : phase === "morphing"
                  ? ["50%", "30%", "20%", "40%", "50%"]
                  : "24%",
              scale:
                phase === "admin"
                  ? 1
                  : phase === "morphing"
                  ? [1, 1.12, 0.95, 1.05]
                  : 1,
              rotate:
                phase === "morphing" ? [0, -15, 15, 0] : 0,
              boxShadow:
                phase === "logo"
                  ? "0 0 60px rgba(52,211,153,0.6), inset 0 0 20px rgba(16,185,129,0.4)"
                  : "0 0 40px rgba(16,185,129,0.4)",
            }}
            transition={{
              duration: phase === "morphing" ? 1.0 : 0.6,
              ease: "easeInOut",
            }}
          >
            <AnimatePresence mode="wait">
              {phase === "admin" && (
                <motion.div
                  key="admin-pic"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2, filter: "blur(8px)" }}
                  transition={{ duration: 0.5 }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={adminPicUrl}
                    alt="Admin Profile"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-emerald-500/20" />
                  <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 bg-black/50 py-1 text-[11px] font-semibold tracking-wider text-emerald-300 uppercase backdrop-blur-sm">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Admin Profile</span>
                  </div>
                </motion.div>
              )}

              {phase === "morphing" && (
                <motion.div
                  key="morphing-bridge"
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{
                    opacity: [0.3, 1, 0.8],
                    scale: [0.7, 1.2, 0.9],
                    rotate: [0, 180, 360],
                    filter: ["blur(4px)", "blur(0px)", "blur(2px)"],
                  }}
                  exit={{ opacity: 0, scale: 1.3 }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                  className="relative flex h-full w-full items-center justify-center bg-emerald-900/60 p-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="h-16 w-16 rounded-full border-4 border-emerald-400 border-t-transparent shadow-lg"
                  />
                  <Sparkles className="absolute h-10 w-10 text-amber-300 animate-pulse" />
                </motion.div>
              )}

              {phase === "logo" && (
                <motion.div
                  key="school-logo"
                  initial={{ opacity: 0, scale: 0.6, rotate: 15, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative flex h-full w-full items-center justify-center p-4 bg-slate-900/90"
                >
                  <Image
                    src={logoUrl}
                    alt="School Logo"
                    fill
                    className="object-contain p-2 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]"
                    priority
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dynamic Title / Subtitle Text */}
        <div className="mt-8 flex flex-col items-center text-center space-y-2 max-w-sm">
          <AnimatePresence mode="wait">
            {phase === "admin" ? (
              <motion.div
                key="admin-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <h1 className="text-2xl font-bold tracking-tight text-emerald-200 drop-shadow-md sm:text-3xl">
                  Admin Verification
                </h1>
                <p className="mt-1 text-xs font-medium text-emerald-400/80 tracking-wide">
                  M.S. Naz High School® LMS
                </p>
              </motion.div>
            ) : phase === "morphing" ? (
              <motion.div
                key="morph-text"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent sm:text-3xl animate-pulse">
                  Morphing Identity...
                </h1>
                <p className="mt-1 text-xs text-teal-300/80">
                  Transforming Profile into Official School Emblem
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="logo-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <h1 className="font-serif text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_15px_rgba(16,185,129,0.5)] sm:text-4xl">
                  M.S. NAZ HIGH SCHOOL®
                </h1>
                <span className="mt-1 inline-block rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/40">
                  Pursuit of Excellence
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar & Footer */}
          {showProgress && (
            <div className="mt-6 w-64 space-y-2">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80 border border-emerald-500/30 p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-emerald-400/90 px-1">
                <span>{phase === "admin" ? "Authenticating Admin..." : phase === "morphing" ? "Morphing Logo..." : "Readying Dashboard..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
