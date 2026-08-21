"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search, Users, Calendar, BarChart3, HelpCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#020806] text-slate-100 selection:bg-emerald-500/30 p-4">
      {/* Cyber Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-black to-slate-950/90" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-950/30 shadow-2xl backdrop-blur-xl"
        >
          <Image
            src="/api/images/logos/Official_LOGO_grn_ic9ldd.png"
            alt="MSNS Logo"
            width={52}
            height={52}
            className="object-contain drop-shadow-md"
          />
        </motion.div>

        {/* 404 Badge & Error Code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Route Not Found
          </div>
          <h1 className="bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-200 bg-clip-text font-serif text-6xl font-black tracking-tight text-transparent sm:text-8xl">
            404
          </h1>
          <p className="text-xl font-bold text-slate-100 sm:text-2xl">
            This page could not be found
          </p>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Quick Nav Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 text-left"
        >
          <Link
            href="/admin"
            className="group flex flex-col gap-1.5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30"
          >
            <Home className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Dashboard</span>
            <span className="text-[10px] text-slate-500">Main hub</span>
          </Link>

          <Link
            href="/admin/users/faculty/view"
            className="group flex flex-col gap-1.5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30"
          >
            <Users className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Faculty</span>
            <span className="text-[10px] text-slate-500">Staff records</span>
          </Link>

          <Link
            href="/admin/sessions"
            className="group flex flex-col gap-1.5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30"
          >
            <Calendar className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">Sessions</span>
            <span className="text-[10px] text-slate-500">Academic terms</span>
          </Link>

          <Link
            href="/admin/erp"
            className="group flex flex-col gap-1.5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-emerald-950/30"
          >
            <BarChart3 className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-200">ERP</span>
            <span className="text-[10px] text-slate-500">Finance & assets</span>
          </Link>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full sm:w-auto rounded-xl border-emerald-500/30 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500"
          >
            <Link href="/admin">
              <Home className="mr-2 h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
