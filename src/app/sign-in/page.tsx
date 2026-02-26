"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LoginForm } from "~/components/forms/auth/LoginForm";

export default function SignInPage() {
  return (
    // h-dvh ensures full screen on mobile (ignoring address bar resizing)
    <main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-card">
      {/* --- LAYER 1: Background Image --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267627/FrontView1_alaabu.jpg"
          alt="School Campus Background"
          fill
          priority
          className="object-cover opacity-90"
          quality={90}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-emerald-950/40 mix-blend-multiply" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* --- LAYER 2: Animated Ambient Glow --- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -left-[10%] -top-[20%] h-[70vh] w-[70vh] rounded-full bg-emerald-500/20 blur-[100px]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-blue-500/20 blur-[100px]"
        />
      </div>

      {/* --- LAYER 3: Main Content Card --- */}
      <div className="relative z-10 w-full px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-[450px] overflow-hidden rounded-3xl border border-border bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
        >
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            {/* ⚡️ LOGO ANIMATION RESTORED HERE ⚡️ */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="relative mb-4 h-28 w-28 sm:h-32 sm:w-32"
            >
              {/* Inner wrapper handles the infinite jump loop */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative h-full w-full"
              >
                <Image
                  src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground drop-shadow-md sm:text-4xl">
              MSNS-LMS
            </h1>
            <p className="mt-2 text-base font-medium text-emerald-100/80">
              Welcome back, Chief!
            </p>
          </div>

          {/* Form Container */}
          <div className="w-full">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-foreground/40">
            <Link
              href="https://msns.edu.pk/terms"
              className="transition-colors hover:text-emerald-300"
            >
              Terms
            </Link>
            <span>•</span>
            <Link
              href="https://msns.edu.pk/privacy"
              className="transition-colors hover:text-emerald-300"
            >
              Privacy
            </Link>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute -bottom-16 left-0 right-0 text-center text-xs text-foreground/30"
        >
          © {new Date().getFullYear()} MSNS-DEV™. All rights reserved.
        </motion.p>
      </div>
    </main>
  );
}
