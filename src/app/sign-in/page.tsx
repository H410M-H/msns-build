"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from '~/components/forms/auth/LoginForm';
import { Skeleton } from '~/components/ui/skeleton';

export default function SignInPage() {
  const [, setError] = useState('');
  const searchParams = useSearchParams();
  
  // Check for error message in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password');
    } else if (errorParam) {
      setError('An authentication error occurred');
    }
  }, [searchParams, setError]);


  return (
    <main className="relative min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="min-h-screen flex flex-col justify-center items-center bg-[url('https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267627/FrontView1_alaabu.jpg')] bg-cover bg-center px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-800 shadow-xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-80 transition duration-700 ease-in-out hover:rotate-0 hover:skew-y-0 hover:scale-105"></div>
          <div className="relative bg-white/30 backdrop-blur-lg shadow-lg rounded-3xl p-6 sm:p-10 animate-fade-in-up">
            <div className="flex flex-col items-center mb-6">
              <Image
                src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267533/Official_LOGO_grn_ic9ldd.png"
                alt="logo"
                width={200}
                height={200}
                className="animate-bounce"
              />
              <h1 className="text-5xl font-serif font-semibold text-amber-600 mt-4 transition duration-300 transform hover:scale-105">
                MSNS-LMS
              </h1>
              <h5 className="text-2xl font-serif font-medium text-emerald-600 mt-3 transition duration-300 transform hover:scale-105">
                Welcome Back Chief!
              </h5>
            </div>
          <Suspense fallback={<Skeleton />}>
          <LoginForm />
          </Suspense>

          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full py-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm font-text">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-primary">
            <p>© {new Date().getFullYear()} MSNS-DEV™  All rights reserved.</p>
            <div className="flex gap-6 mt-2 md:mt-0">
              <Link href="/terms" className="hover:text-secondary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
              <Link href="/help" className="hover:text-secondary transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}