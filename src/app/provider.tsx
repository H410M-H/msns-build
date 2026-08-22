"use client";
import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

import { isNative } from "~/lib/mobile/native-service";
import { sendWelcomeNotification, triggerTestWelcomeNotification } from "~/lib/mobile/notification-service";
import { useSyncEngine } from "~/hooks/useSyncEngine";
import { useDeviceRegistration } from "~/hooks/useDeviceRegistration";
import { useDeepLinks } from "~/hooks/useDeepLinks";
import { Toaster } from "sonner";

function WelcomeNotificationListener() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const user = session.user;
      const sessionKey = `msns_welcome_notified_${user.id || user.email}`;
      if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        void sendWelcomeNotification(user.name ?? user.email ?? "User", user.accountType);
      }
      void import("~/lib/mobile/daily-notifications").then(({ initDailyRoleNotifications }) => {
        void initDailyRoleNotifications(user.accountType ?? "ADMIN");
      });
    }
  }, [session]);

  return null;
}

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
    if (typeof window !== "undefined") {
      // Expose test notification trigger on window object for easy manual testing
      (window as unknown as Record<string, unknown>).triggerTestWelcomeNotification = triggerTestWelcomeNotification;
    }

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
            <WelcomeNotificationListener />
            {children}
            <Toaster position="top-right" richColors />
          </MobileHooksWrapper>
        </NextThemesProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
