"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AnimatedSplashScreenProps {
  onComplete?: () => void;
  adminPicUrl?: string;
  logoUrl?: string;
  durationMs?: number;
  showProgress?: boolean;
  title?: string;
  subtitle?: string;
}

export function AnimatedSplashScreen({
  onComplete,
  adminPicUrl,
  logoUrl = "https://lms.msns.edu.pk/api/images/gallery/about/Logo/1788011485277_1763247556141.jpg",
  durationMs = 3500,
  showProgress = true,
  title = "M.S. NAZ HIGH SCHOOL®",
  subtitle = "Learning Management System",
}: AnimatedSplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const displayLogo = adminPicUrl ?? logoUrl;

  useEffect(() => {
    // Stage: Complete splash screen after duration
    const timer = setTimeout(() => {
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
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [durationMs, onComplete]);

  const getStatusText = () => {
    if (progress < 35) return "Connecting to LMS Portal...";
    if (progress < 75) return "Authenticating Session...";
    if (progress < 100) return "Preparing Dashboard...";
    return "Ready!";
  };

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
        {/* Animated Logo Frame with Glowing Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Dashed Glowing Orbit */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-6 rounded-full border-2 border-dashed border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          />

          {/* Inner Accent Ring */}
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 0.96, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-3 rounded-full border border-teal-300/40 shadow-[0_0_20px_rgba(20,184,166,0.25)]"
          />

          {/* Center Logo Circle Frame */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: [
                "0 0 35px rgba(16,185,129,0.4)",
                "0 0 55px rgba(52,211,153,0.65)",
                "0 0 35px rgba(16,185,129,0.4)",
              ],
            }}
            transition={{
              scale: { duration: 0.6, ease: "easeOut" },
              opacity: { duration: 0.5 },
              boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-full border-2 border-emerald-400/70 bg-slate-900/90 p-4 backdrop-blur-2xl"
          >
            {/* School Logo */}
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src={displayLogo}
                alt="School Logo"
                fill
                className="object-contain p-3 drop-shadow-[0_0_25px_rgba(52,211,153,0.85)]"
                priority
                unoptimized
              />

              {/* Light Sweep Highlight */}
              <motion.div
                initial={{ x: "-120%" }}
                animate={{ x: "220%" }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 1.6,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
              />
            </div>
          </motion.div>
        </div>

        {/* Dynamic Title / Subtitle Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col items-center text-center space-y-2 max-w-sm"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_15px_rgba(16,185,129,0.6)]">
              {title}
            </h1>
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300/90">
            {subtitle}
          </p>

          <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
            Pursuit of Excellence
          </span>

          {/* Progress Bar & Status */}
          {showProgress && (
            <div className="mt-6 w-64 space-y-2">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/90 border border-emerald-500/30 p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-emerald-400/90 px-1">
                <span>{getStatusText()}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
