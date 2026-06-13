"use client";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <SessionProvider>
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </NextThemesProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
