import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  saveDeviceAuthSession,
  getDeviceAuthSession,
  clearDeviceAuthSession,
  type DeviceAuthSessionData,
} from "~/lib/mobile/device-auth";

export function usePersistentAuthSession() {
  const { data: session, status } = useSession();
  const [deviceSession, setDeviceSession] = useState<DeviceAuthSessionData | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // 1. Sync active NextAuth session to in-device storage
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      void saveDeviceAuthSession({
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        accountType: session.user.accountType,
        accountId: session.user.accountId,
      }).then((saved) => {
        if (saved) setDeviceSession(saved);
        setIsRestoring(false);
      });
    } else if (status === "unauthenticated") {
      // Check if we have an in-device session saved on this device
      void getDeviceAuthSession().then((stored) => {
        if (stored) {
          setDeviceSession(stored);
          console.log("[usePersistentAuthSession] Active in-device auth session found for device:", stored.deviceId);
        }
        setIsRestoring(false);
      });
    } else {
      setIsRestoring(false);
    }
  }, [status, session]);

  return {
    session,
    status,
    deviceSession,
    isRestoring,
    clearDeviceAuthSession,
  };
}
