"use client";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

import { isNative } from "~/lib/mobile/native-service";
import { useSyncEngine } from "~/hooks/useSyncEngine";
import { useDeviceRegistration } from "~/hooks/useDeviceRegistration";
import { useDeepLinks } from "~/hooks/useDeepLinks";

function NativeHooksInner({ children }: { children: React.ReactNode }) {
  useSyncEngine();
  useDeviceRegistration();
  useDeepLinks();
  return <>{children}</>;
}

function MobileHooksWrapper({ children }: { children: React.ReactNode }) {
  const [mountedNative, setMountedNative] = useState(false);

  useEffect(() => {
    if (isNative()) {
      setMountedNative(true);
    }
  }, []);

  if (mountedNative) {
    return <NativeHooksInner>{children}</NativeHooksInner>;
  }

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
      <SessionProvider>
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
          <MobileHooksWrapper>
            {children}
          </MobileHooksWrapper>
        </NextThemesProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
