"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Phone, Mail, ShieldAlert } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-card p-4">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/api/images/resolve/FrontView1_alaabu.jpg"
          alt="Campus Background"
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-emerald-950/60 mix-blend-multiply" />
        <div className="absolute inset-0 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-border bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
              <KeyRound className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Password Recovery
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              For security compliance, employee and student portal credentials are managed by the institution administration.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-slate-200">Official Portal Policy</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Please reach out to the IT Helpdesk or School Administrative Office to request an official password reset for your account.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <a
                href="tel:+923187625415"
                className="flex items-center gap-3 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>Helpline: +92 318 7625415</span>
              </a>

              <a
                href="mailto:info@msns.edu.pk"
                className="flex items-center gap-3 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
              >
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>Email: info@msns.edu.pk</span>
              </a>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="w-full border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700">
              <Link href="/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
