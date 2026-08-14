"use client";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

import { isNative } from "~/lib/mobile/native-service";
import { useSyncEngine } from "~/hooks/useSyncEngine";
import { useDeviceRegistration } from "~/hooks/useDeviceRegistration";
import { useDeepLinks } from "~/hooks/useDeepLinks";

function MobileHooksWrapper({ children }: { children: React.ReactNode }) {
  // These hooks all guard internally with isNative() checks,
  // so they are safe no-ops on the desktop web dashboard.
  useSyncEngine();
  useDeviceRegistration();
  useDeepLinks();
  return <>{children}</>;
}

export function Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && isNative()) {
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
      <MobileHooksWrapper>
        <SessionProvider>
          <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </NextThemesProvider>
        </SessionProvider>
      </MobileHooksWrapper>
    </TRPCReactProvider>
  );
}
