import { isNative } from "./native-service";

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  category: "BROADCAST" | "DAILY_TASK" | "SYSTEM" | "FEATURE_EXPLORE";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_KEY = "msns_notifications_v1";

export const getStoredNotifications = (): StoredNotification[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : getSampleInitialNotifications();
  } catch {
    return getSampleInitialNotifications();
  }
};

export const saveStoredNotifications = (notifications: StoredNotification[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent("msns_notifications_updated"));
  } catch (err) {
    console.error("Failed to save notifications:", err);
  }
};

export const addStoredNotification = (notif: Omit<StoredNotification, "id" | "timestamp" | "read">): StoredNotification => {
  const current = getStoredNotifications();
  const newNotif: StoredNotification = {
    ...notif,
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    read: false,
  };
  const updated = [newNotif, ...current].slice(0, 50); // keep last 50
  saveStoredNotifications(updated);
  return newNotif;
};

export const markNotificationAsRead = (id: string): void => {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStoredNotifications(updated);
};

export const markAllNotificationsAsRead = (): void => {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveStoredNotifications(updated);
};

export const clearAllNotifications = (): void => {
  saveStoredNotifications([]);
};

function getSampleInitialNotifications(): StoredNotification[] {
  return [
    {
      id: "init-1",
      title: "🎉 Welcome to MSNS LMS Mobile!",
      body: "Your digital learning & management workspace is fully operational.",
      category: "SYSTEM",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false,
      actionUrl: "/admin",
    },
    {
      id: "init-2",
      title: "📢 Official Broadcast: Academic Session 2026-27",
      body: "All department heads and teachers: Please review class rosters and timetable allocations.",
      category: "BROADCAST",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      actionUrl: "/admin/events",
    },
    {
      id: "init-3",
      title: "💡 Feature Highlight: Biometric Attendance",
      body: "Explore the new Biometric Register for instant fingerprint verification & offline sync.",
      category: "FEATURE_EXPLORE",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: false,
      actionUrl: "/admin/attendance",
    },
  ];
}
