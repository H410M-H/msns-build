import { getSecureItem, setSecureItem, removeSecureItem, isNative } from "./native-service";

export interface DeviceAuthSessionData {
  userId: string;
  email: string;
  username: string;
  accountType: string;
  accountId: string;
  token?: string;
  deviceId: string;
  lastLoginAt: string;
  keepLoggedIn: boolean;
}

const DEVICE_ID_KEY = "msns_device_id";
const DEVICE_AUTH_SESSION_KEY = "msns_device_auth_session";

/**
 * Gets or generates a persistent unique Device ID for this physical device.
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await getSecureItem(DEVICE_ID_KEY);
    if (!deviceId) {
      const cryptoRandom = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : null;
      deviceId = cryptoRandom || `device_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
      await setSecureItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("Failed to get/generate device ID:", error);
    return `device_fallback_${Date.now()}`;
  }
};

/**
 * Saves in-device auth session for the current user so they remain logged in continuously after exiting app.
 */
export const saveDeviceAuthSession = async (user: {
  id?: string;
  email?: string | null;
  username?: string | null;
  accountType?: string | null;
  accountId?: string | null;
}): Promise<DeviceAuthSessionData | null> => {
  try {
    const deviceId = await getDeviceId();
    const sessionData: DeviceAuthSessionData = {
      userId: user.id || "",
      email: user.email || "",
      username: user.username || user.email || "User",
      accountType: user.accountType || "ADMIN",
      accountId: user.accountId || user.id || "",
      deviceId,
      lastLoginAt: new Date().toISOString(),
      keepLoggedIn: true,
    };

    await setSecureItem(DEVICE_AUTH_SESSION_KEY, JSON.stringify(sessionData));
    console.log("[DeviceAuthSession] Saved persistent device auth session for user:", sessionData.email);
    return sessionData;
  } catch (error) {
    console.error("[DeviceAuthSession] Failed to save device auth session:", error);
    return null;
  }
};

/**
 * Retrieves the stored in-device auth session.
 */
export const getDeviceAuthSession = async (): Promise<DeviceAuthSessionData | null> => {
  try {
    const raw = await getSecureItem(DEVICE_AUTH_SESSION_KEY);
    if (!raw) return null;
    const data: DeviceAuthSessionData = JSON.parse(raw);
    return data;
  } catch (error) {
    console.error("[DeviceAuthSession] Failed to parse device auth session:", error);
    return null;
  }
};

/**
 * Clears the stored device auth session upon manual logout.
 */
export const clearDeviceAuthSession = async (): Promise<void> => {
  try {
    await removeSecureItem(DEVICE_AUTH_SESSION_KEY);
    console.log("[DeviceAuthSession] Device auth session cleared successfully.");
  } catch (error) {
    console.error("[DeviceAuthSession] Failed to clear device auth session:", error);
  }
};
