"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from "~/components/ui/alert";

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check for error message in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password');
    } else if (errorParam) {
      setError('An authentication error occurred');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* Login Form */}
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-800">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-white/70 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-800">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white/70 backdrop-blur-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>Signing In...</>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
              
              <div className="text-center pt-4 border-t border-white/30">
                <p className="text-sm text-slate-700">
                  Forgot your password?{" "}
                  <Link href="/forgot-password" className="text-emerald-700 hover:underline font-medium">
                    Reset it here
                  </Link>
                </p>
              </div>
            </div>
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