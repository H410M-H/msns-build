"use client";

import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "~/components/forms/auth/LoginForm";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Background Section */}
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[url('https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267627/FrontView1_alaabu.jpg')] bg-cover bg-center bg-no-repeat px-6 py-16 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          {/* Decorative Skewed Background */}
          <div className="absolute inset-0 -skew-y-6 transform bg-gradient-to-r from-emerald-400 to-emerald-800 opacity-80 shadow-xl transition-all duration-700 ease-in-out hover:rotate-0 hover:skew-y-0 hover:scale-105 sm:-rotate-6 sm:rounded-3xl" />

          {/* Main Card */}
          <div className="relative z-10 rounded-3xl bg-white/30 p-6 shadow-lg backdrop-blur-md transition-all duration-500 sm:p-8 md:p-10">
            {/* Logo + Title */}
            <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
              <Image
                src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
                alt="M.S. Naz High School Logo"
                width={160}
                height={160}
                priority
                className="animate-bounce sm:w-44 sm:h-44"
              />
              <h1 className="mt-4 font-serif text-4xl font-semibold text-amber-600 transition-transform duration-300 hover:scale-105 sm:text-5xl">
                MSNS-LMS
              </h1>
              <h5 className="mt-2 font-serif text-xl font-medium text-emerald-600 transition-transform duration-300 hover:scale-105 sm:text-2xl">
                Welcome Back, Chief!
              </h5>
            </div>

            {/* Login Form */}
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full bg-white/40 py-4 text-center backdrop-blur-sm dark:bg-slate-900/40">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-sm text-primary md:flex-row">
          <p>© {new Date().getFullYear()} MSNS-DEV™ All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="https://msns.edu.pk/terms-of-service"
              className="transition-colors duration-200 hover:text-emerald-500"
            >
              Terms
            </Link>
            <Link
              href="https://msns.edu.pk/privacy-policy"
              className="transition-colors duration-200 hover:text-emerald-500"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
