"use client";

import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "~/components/forms/auth/LoginForm";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="animate-fade-in flex min-h-screen flex-col items-center justify-center bg-[url('https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267627/FrontView1_alaabu.jpg')] bg-cover bg-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="absolute inset-0 -skew-y-6 transform bg-gradient-to-r from-green-300 to-green-800 opacity-80 shadow-xl transition duration-700 ease-in-out hover:rotate-0 hover:skew-y-0 hover:scale-105 sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
          <div className="animate-fade-in-up relative rounded-3xl bg-white/30 p-6 shadow-lg backdrop-blur-lg sm:p-10">
            <div className="mb-6 flex flex-col items-center">
              <Image
                src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
                alt="logo"
                width={200}
                height={200}
                className="animate-bounce"
              />
              <h1 className="mt-4 transform font-serif text-5xl font-semibold text-amber-600 transition duration-300 hover:scale-105">
                MSNS-LMS
              </h1>
              <h5 className="mt-3 transform font-serif text-2xl font-medium text-emerald-600 transition duration-300 hover:scale-105">
                Welcome Back Chief!
              </h5>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>

      <div className="font-text absolute bottom-0 left-0 w-full bg-white/40 py-4 backdrop-blur-sm dark:bg-slate-900/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between text-sm text-primary md:flex-row">
            <p>© {new Date().getFullYear()} MSNS-DEV™ All rights reserved.</p>
            <div className="mt-2 flex gap-6 md:mt-0">
              <Link
                href="/terms"
                className="transition-colors hover:text-secondary"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-secondary"
              >
                Privacy
              </Link>
              <Link
                href="/help"
                className="transition-colors hover:text-secondary"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
