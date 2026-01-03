// File: src/app/page.tsx
"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Zap, ArrowRight, Shield, GraduationCap, LogIn } from "lucide-react"

// 🌀 Tilt 3D Card Component
const TiltCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / rect.width - 0.5
    const yPct = mouseY / rect.height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`transition-transform duration-500 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  return (
    // 🌗 Container with Light/Dark Theme Support
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-emerald-50 via-white to-cyan-50 dark:from-[#344a3f] dark:via-[#12251b] dark:to-[#02131b] text-slate-900 dark:text-white transition-colors duration-500">
      
      {/* 🌐 Animated Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(45,255,196,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.08)_1px,transparent_1px)] bg-size-[3rem_3rem] sm:bg-size-[4rem_4rem]" />
        <div className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-transparent dark:from-emerald-900/30 dark:via-cyan-900/10 dark:to-transparent" />
      </div>

      {/* 💫 Floating Orbs (Adjusted for both themes) */}
      <motion.div
        className="absolute left-1/4 h-140 w-140 rounded-full bg-emerald-400/20 dark:bg-emerald-500/20 blur-[90px] sm:h-100 sm:w-100 sm:blur-[120px]"
        animate={{ y: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-cyan-400/20 dark:bg-cyan-500/20 blur-[90px] sm:h-100 sm:w-100 sm:blur-[120px]"
        animate={{ y: [0, -40, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🧭 Top Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl tracking-tight text-emerald-950 dark:text-emerald-100">
          <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span>MSNS-LMS</span>
        </div>
        
        <Link
          href="/sign-in"
          className="group flex items-center gap-2 rounded-full bg-white/50 dark:bg-white/10 px-5 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 backdrop-blur-md border border-emerald-200/50 dark:border-white/10 hover:bg-emerald-100/50 dark:hover:bg-white/20 transition-all hover:scale-105"
        >
          <LogIn className="h-4 w-4" />
          <span>Portal Login</span>
        </Link>
      </nav>

      {/* 🏫 Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-4 pb-20 text-center sm:px-6 lg:pt-14">
        
        {/* 🔰 Animated Tilted School Logo */}
        <TiltCard className="mb-10 sm:mb-16 cursor-pointer">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-400/30 dark:bg-emerald-400/30 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative h-full w-full drop-shadow-2xl">
              <Image
                src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267508/logo-w_wt5wq6.png"
                alt="M.S. Naz High School Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </TiltCard>

        {/* 📝 Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight">
            <span className="bg-linear-to-r from-emerald-600 via-cyan-600 to-emerald-600 dark:from-emerald-300 dark:via-cyan-300 dark:to-emerald-300 bg-clip-text text-transparent drop-shadow-xs dark:drop-shadow-[0_0_20px_rgba(45,255,196,0.4)]">
              M.S. NAZ HIGH SCHOOL
            </span>
          </h1>

          <p className="mx-auto max-w-2xl px-4 text-base sm:text-lg md:text-xl text-slate-600 dark:text-gray-300 leading-relaxed">
            Experience the{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Next-Gen LMS</span>
            — modern, smart, and immersive learning for{" "}
            <span className="font-semibold text-cyan-600 dark:text-cyan-300">
              M.S. Naz High School®
            </span>{" "}
            students and educators.
          </p>
        </motion.div>

        {/* ⚡ CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
        >
          <Link
            href="/sign-in"
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-emerald-600 to-cyan-600 dark:from-emerald-500 dark:to-cyan-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 dark:shadow-[0_0_20px_#10b98180] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="h-5 w-5 fill-current" />
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          
          <Link
             href="https://msns.edu.pk/about"
             className="group flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-8 py-4 text-lg font-semibold text-slate-700 dark:text-gray-200 backdrop-blur-xs transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105"
          >
            <Shield className="h-5 w-5" />
            About School
          </Link>
        </motion.div>
      </section>

      {/* 🛡️ Footer CTA (Floating Glass Card) */}
      <div className="absolute bottom-6 left-0 right-0 z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-3xl border border-white/40 dark:border-emerald-400/20 bg-white/60 dark:bg-white/5 p-6 shadow-xl ring-1 ring-black/5 dark:shadow-[0_0_40px_rgba(45,255,196,0.15)] backdrop-blur-xl sm:flex-row sm:px-8 sm:py-6"
        >
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-800 dark:text-emerald-100">
              Ready to transform your learning?
            </h2>
            <p className="text-sm text-slate-600 dark:text-emerald-200/70">
              Join thousands of students exploring the new era.
            </p>
          </div>

          <Link
            href="https://msns.edu.pk"
            target="_blank"
            className="shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 px-5 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
          >
            Visit Official Website
          </Link>
        </motion.div>
      </div>
    </div>
  )
}