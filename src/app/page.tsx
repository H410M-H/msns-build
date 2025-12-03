"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ArrowRight, Shield } from "lucide-react";

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
      className={`transition-transform duration-500 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b] text-white">
      {/* 🌐 Neon Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-cyan-900/10 to-transparent" />
      </div>

      {/* 💫 Floating Neon Orbs */}
      <motion.div
        className="absolute left-1/4 h-[35rem] w-[35rem] rounded-full bg-emerald-500/20 blur-[90px] sm:h-[25rem] sm:w-[25rem] sm:blur-[120px]"
        animate={{ y: [0, 40, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-[15rem] w-[15rem] rounded-full bg-cyan-500/20 blur-[90px] sm:h-[25rem] sm:w-[25rem] sm:blur-[120px]"
        animate={{ y: [0, -40, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🏫 Hero Section */}
      <section className="relative z-10 py-6 mx-auto flex flex-col items-center px-4 text-center sm:px-6 md:py-2 lg:py-8">
        {/* 🔰 Animated Tilted School Logo */}
        <TiltCard className="mb-8 sm:mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto h-30 w-30 sm:h-86 sm:w-86 md:h-94 md:w-94"
          >
            <motion.div
              className="absolute rounded-full bg-emerald-400/30 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <Image
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267508/logo-w_wt5wq6.png"
              alt="M.S. Naz High School Logo"
              width={430}
              height={430}
              className="relative z-10"
            />
          </motion.div>
        </TiltCard>

        {/* 🧭 Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 max-w-screen"
        >
          <h1 className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-3xl font-black text-transparent drop-shadow-[0_0_20px_rgba(45,255,196,0.4)] sm:text-5xl md:text-6xl lg:text-7xl">
            M.S. NAZ HIGH SCHOOL
          </h1>

          <p className="mx-auto max-w-screen px-2 text-sm leading-relaxed text-gray-300 sm:max-w-2xl sm:text-base md:text-lg lg:text-xl">
            Experience the{" "}
            <span className="font-semibold text-emerald-400">next-gen LMS</span>{" "}
            — modern, smart, and immersive learning for{" "}
            <span className="text-cyan-300 font-medium">M.S. Naz High School®{" "}</span> students and educators.
          </p>
        </motion.div>

        {/* ⚡ CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "easeOut" }}
          className="mt-4 flex flex-col items-center justify-center gap-5 sm:mt-8 sm:flex-row sm:gap-8"
        >
          <Link
            href="/sign-in"
            className="relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-3 text-base font-semibold text-white shadow-[0_0_20px_#10b98180] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_#10b981] sm:px-10 sm:py-4 sm:text-lg"
          >
            <Zap className="h-4 w-4" />
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* 🛡️ Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto mb-4 w-auto rounded-2xl border border-emerald-400/20 bg-white/5 p-4 text-center shadow-[0_0_40px_rgba(45,255,196,0.15)] backdrop-blur-xl sm:mb-24 sm:max-w-2xl sm:rounded-3xl sm:p-10"
      >
        <h2 className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-lg font-bold text-transparent sm:text-3xl md:text-4xl lg:text-4xl">
          Ready to transform your learning journey?
        </h2>
        <p className="mb-3 text-sm text-gray-300 sm:mb-4 sm:text-xs md:text-md">
          Join thousands of students exploring the new era of education.
        </p>

        <Link
          href="https://msns.edu.pk/about"
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-white/5 px-8 py-3 text-base font-semibold text-cyan-200 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white sm:px-10 sm:py-4 sm:text-lg"
        >
          <Shield className="h-5 w-5" />
          Learn More
        </Link>
      </motion.div>
    </div>
  );
}