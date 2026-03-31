"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, Shield, GraduationCap, LogIn } from "lucide-react";

// 🌀 Tilt 3D Card Component
const TiltCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`transition-transform duration-500 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  return (
    // 🌗 Container with h-dvh for full screen feel without scroll on load
    <div className="relative min-h-dvh w-full overflow-hidden bg-white text-slate-900 transition-colors duration-500 dark:bg-[#02131b] dark:text-foreground">
      {/* 🌐 Background System */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-cyan-50/50 dark:from-emerald-950/20 dark:via-[#02131b] dark:to-cyan-950/20" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(45,255,196,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.04)_1px,transparent_1px)]" />
      </div>

      {/* 💫 Animated Orbs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute -top-[10%] left-[10%] h-[30rem] w-[30rem] rounded-full bg-emerald-400/20 blur-[100px] dark:bg-emerald-500/10"
          animate={{ y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[10%] top-[20%] h-[25rem] w-[25rem] rounded-full bg-cyan-400/20 blur-[100px] dark:bg-cyan-500/10"
          animate={{ y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 🧭 Top Navigation */}
      <nav className="relative z-50 flex w-full items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-foreground shadow-lg shadow-emerald-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 sm:block">
            MSNS-LMS
          </span>
        </div>

        <Link
          href="/sign-in"
          className="group flex items-center gap-2 rounded-full border border-emerald-100 bg-white/60 px-5 py-2.5 text-sm font-bold text-emerald-700 backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:shadow-lg dark:border-border dark:bg-white/5 dark:text-emerald-300 dark:hover:bg-white/10"
        >
          <LogIn className="h-4 w-4" />
          <span>Portal Login</span>
        </Link>
      </nav>

      {/* 🏫 Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pb-20 pt-10 text-center sm:px-6 lg:pt-20">
        {/* 🔰 Logo Card */}
        <TiltCard className="relative z-20 mb-10 cursor-pointer sm:mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto h-40 w-40 sm:h-56 sm:w-56"
          >
            {/* Glow behind logo */}
            <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-400/30 blur-3xl" />
            <Image
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267508/logo-w_wt5wq6.png"
              alt="M.S. Naz High School Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </TiltCard>

        {/* 📝 Typography */}
        <div className="mx-auto max-w-4xl space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl"
          >
            <span className="block text-slate-900 dark:text-foreground">
              Pursuit of
            </span>
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text pb-2 text-transparent dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-400">
              Excellence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-600 dark:text-foreground sm:text-xl"
          >
            Welcome to the{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Next-Gen LMS
            </span>{" "}
            for M.S. Naz High School. Empowering students and educators with
            seamless digital learning.
          </motion.p>
        </div>

        {/* ⚡ CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
        >
          <Link
            href="/sign-in"
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-foreground shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/40 sm:w-auto"
          >
            <Zap className="h-5 w-5 fill-white/20" />
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="https://msns.edu.pk/about"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-sm transition-all hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10 sm:w-auto"
          >
            <Shield className="h-5 w-5" />
            <span>School Info</span>
          </Link>
        </motion.div>
      </main>

      {/* 🛡️ Footer CTA */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="fixed bottom-6 left-4 right-4 z-40 mx-auto hidden max-w-5xl md:block"
      >
        <div className="flex items-center justify-between rounded-2xl border border-border bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-border dark:bg-black/40">
          <div className="flex items-center gap-3 px-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-sm font-medium text-slate-600 dark:text-foreground">
              Admissions open for {new Date().getFullYear()} session
            </p>
          </div>
          <Link
            href="https://msns.edu.pk"
            target="_blank"
            className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Visit Website →
          </Link>
        </div>
      </motion.footer>
    </div>
  );
}
