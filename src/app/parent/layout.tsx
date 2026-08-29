"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, GraduationCap, User } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-emerald-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="font-medium text-slate-300">Loading Parent Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
      
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                MSNS Parent Portal
              </h1>
              <p className="text-xs text-emerald-400 font-medium">M.S. Naz High School®</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              <span>{session?.user?.username ?? "Parent"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { clearAllMobileState } = await import("~/lib/mobile/native-service");
                const { clearDeviceAuthSession } = await import("~/lib/mobile/device-auth");
                await clearDeviceAuthSession();
                await clearAllMobileState();
                await signOut({ redirect: true, callbackUrl: "/" });
              }}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-1.5 text-rose-400" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
