import { isNative } from "./native-service";
import { toast } from "sonner";
import { addStoredNotification } from "./notification-store";

export interface NotificationOptions {
  id?: number;
  title: string;
  body: string;
  category?: "BROADCAST" | "DAILY_TASK" | "SYSTEM" | "FEATURE_EXPLORE";
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  if (isNative()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== "granted") {
        perm = await LocalNotifications.requestPermissions();
      }
      return perm.display === "granted";
    } catch (err) {
      console.warn("LocalNotifications permission check failed:", err);
      return false;
    }
  } else if ("Notification" in window) {
    try {
      if (Notification.permission === "granted") return true;
      if (Notification.permission !== "denied") {
        const result = await Notification.requestPermission();
        return result === "granted";
      }
    } catch (err) {
      console.warn("Web Notification permission failed:", err);
    }
  }
  return false;
};

export const sendLocalNotification = async ({
  id,
  title,
  body,
  category = "SYSTEM",
  actionUrl,
  data,
}: NotificationOptions): Promise<void> => {
  const notifId = id ?? Math.floor(Math.random() * 1000000) + 1;

  // Add to persistent in-app notification center store
  addStoredNotification({
    title,
    body,
    category,
    actionUrl,
  });

  // Always show a toast feedback inside the app
  toast.success(title, {
    description: body,
  });

  if (isNative()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const granted = await requestNotificationPermissions();
      if (granted) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title,
              body,
              extra: data,
              schedule: { at: new Date(Date.now() + 150) },
              sound: undefined,
              actionTypeId: "",
            },
          ],
        });
      }
    } catch (err) {
      console.error("Failed to send native LocalNotification:", err);
    }
  } else if (typeof window !== "undefined" && "Notification" in window) {
    try {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon.png",
        });
      } else {
        void requestNotificationPermissions().then((granted) => {
          if (granted) {
            new Notification(title, {
              body,
              icon: "/icon.png",
            });
          }
        });
      }
    } catch (err) {
      console.warn("Failed to create browser Notification:", err);
    }
  }
};

export const sendWelcomeNotification = async (
  userName?: string,
  role?: string
): Promise<void> => {
  const title = "🎉 Welcome to MSNS LMS!";
  const body = `Hello ${userName ?? "User"}${
    role ? ` (${role})` : ""
  }! You have successfully logged in. All modules & features are ready.`;

  await sendLocalNotification({
    title,
    body,
    category: "SYSTEM",
    actionUrl: "/admin",
    data: { type: "WELCOME", userName, role },
  });
};

export const sendBroadcastNotification = async (
  broadcastTitle: string,
  message: string,
  targetAudience?: string
): Promise<void> => {
  const title = `📢 Broadcast Announcement: ${broadcastTitle}`;
  const body = `${targetAudience ? `[${targetAudience}] ` : ""}${message}`;

  await sendLocalNotification({
    title,
    body,
    category: "BROADCAST",
    actionUrl: "/admin/events",
    data: { type: "BROADCAST", broadcastTitle, targetAudience },
  });
};

export const sendModuleActionNotification = async (
  moduleName: string,
  actionName: string,
  details?: string
): Promise<void> => {
  const title = `⚡ MSNS [${moduleName.toUpperCase()}]`;
  const body = `${actionName}${details ? `: ${details}` : ""}`;

  await sendLocalNotification({
    title,
    body,
    category: "SYSTEM",
    data: { type: "MODULE_ACTION", moduleName, actionName },
  });
};

export const sendExamDatesheetNotification = async (
  examName: string,
  startDate: string,
  classGrade?: string
): Promise<void> => {
  const title = `📋 Exam Datesheet Published: ${examName}`;
  const body = `${classGrade ? `For Class ${classGrade} - ` : ""}Examinations start on ${startDate}. View your datesheet schedule in the portal.`;

  await sendLocalNotification({
    title,
    body,
    category: "SYSTEM",
    actionUrl: "/admin/exams",
    data: { type: "EXAM_DATESHEET", examName, startDate, classGrade },
  });
};

export const sendFeeReminderNotification = async (
  studentName: string,
  amount: number,
  dueDate: string
): Promise<void> => {
  const title = `💳 Fee Due Reminder`;
  const body = `Fee voucher for ${studentName} (Rs. ${amount.toLocaleString()}) is due on ${dueDate}. Please pay to avoid late fines.`;

  await sendLocalNotification({
    title,
    body,
    category: "SYSTEM",
    actionUrl: "/admin/sessions/fee",
    data: { type: "FEE_REMINDER", studentName, amount, dueDate },
  });
};

export const sendAttendanceAlertNotification = async (
  studentName: string,
  status: string,
  date: string
): Promise<void> => {
  const title = `🚨 Attendance Alert`;
  const body = `${studentName} was marked as [${status.toUpperCase()}] on ${date}.`;

  await sendLocalNotification({
    title,
    body,
    category: "SYSTEM",
    actionUrl: "/admin/attendance",
    data: { type: "ATTENDANCE_ALERT", studentName, status, date },
  });
};

export const triggerTestWelcomeNotification = async (): Promise<void> => {
  console.log("Triggering test welcome notification...");
  await sendWelcomeNotification("Test User / Administrator", "ADMIN");
};
