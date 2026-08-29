"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface AnimatedSplashScreenProps {
  logoUrl?: string;
  onComplete?: () => void;
  durationMs?: number;
  showProgress?: boolean;
}

export function AnimatedSplashScreen({
  logoUrl = "https://lms.msns.edu.pk/api/images/gallery/about/Logo/1787988154262_193989.png",
}: AnimatedSplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-slate-950 p-6 select-none"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/20 blur-[120px]"
        />
      </div>

      {/* Centered Logo Image Only */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{
            scale: [0.92, 1.02, 1],
            opacity: 1,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72"
        >
          <Image
            src={logoUrl}
            alt="M.S. NAZ High School Logo"
            fill
            className="object-contain drop-shadow-[0_0_40px_rgba(16,185,129,0.35)]"
            priority
            unoptimized
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
