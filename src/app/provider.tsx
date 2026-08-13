"use client";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

import { useSyncEngine } from "~/hooks/useSyncEngine";
import { useDeviceRegistration } from "~/hooks/useDeviceRegistration";
import { useDeepLinks } from "~/hooks/useDeepLinks";

function SyncEngineWrapper({ children }: { children: React.ReactNode }) {
  useSyncEngine();
  useDeviceRegistration();
  useDeepLinks();
  return <>{children}</>;
}

export function Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registered successfully with scope:", registration.scope);
          },
          (err) => {
            console.error("ServiceWorker registration failed:", err);
          }
        );
      });
    }
  }, []);

  return (
    <TRPCReactProvider>
      <SyncEngineWrapper>
        <SessionProvider>
          <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </NextThemesProvider>
        </SessionProvider>
      </SyncEngineWrapper>
    </TRPCReactProvider>
  );
}
