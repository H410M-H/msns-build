import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { registerPushNotifications, isNative } from "~/lib/mobile/native-service";
import { api } from "~/trpc/react";

export const useDeviceRegistration = () => {
  const session = useSession();
  const registerMutation = api.mobile.registerDevice.useMutation();

  useEffect(() => {
    if (session.status !== "authenticated" || !isNative()) return;

    const initPush = async () => {
      await registerPushNotifications(
        (token) => {
          console.log("[PushNotifications] Registered FCM token:", token);
          void registerMutation.mutateAsync({
            token,
            platform: "android",
          }).then(() => {
            console.log("[PushNotifications] Device registered with server successfully.");
          }).catch((err) => {
            console.error("[PushNotifications] Failed to register device with server:", err);
          });
        },
        (notification) => {
          console.log("[PushNotifications] Received notification:", notification);
          if (notification.title && notification.body) {
            alert(`${notification.title}\n${notification.body}`);
          }
        }
      );
    };

    void initPush();
  }, [session.status, registerMutation]);
};
