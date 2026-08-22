import { isNative } from "./native-service";
import { sendLocalNotification } from "./notification-service";

interface RoleNotificationTemplate {
  title: string;
  body: string;
  category: "DAILY_TASK" | "FEATURE_EXPLORE";
  actionUrl: string;
  hour: number; // 9 = Morning, 14 = Afternoon, 19 = Evening
}

const ROLE_NOTIFICATIONS: Record<string, RoleNotificationTemplate[]> = {
  ADMIN: [
    {
      title: "📋 Morning Admin Briefing",
      body: "Check today's staff attendance & verify live campus biometric registers.",
      category: "DAILY_TASK",
      actionUrl: "/admin/attendance",
      hour: 9,
    },
    {
      title: "💡 Feature Highlight: Fee Defaulters & Analytics",
      body: "Unexplored Module: Use Fee Defaulters List & Analytics to issue reminders and track revenue.",
      category: "FEATURE_EXPLORE",
      actionUrl: "/admin/erp",
      hour: 14,
    },
    {
      title: "📅 Evening Schedule & Calendar Check",
      body: "Review upcoming school events, exam dates, and annual session milestones.",
      category: "DAILY_TASK",
      actionUrl: "/admin/events",
      hour: 19,
    },
  ],
  TEACHER: [
    {
      title: "📝 Classroom Checklist: Morning Attendance",
      body: "Remember to record today's student attendance and log the subject diary.",
      category: "DAILY_TASK",
      actionUrl: "/teacher",
      hour: 9,
    },
    {
      title: "💡 Feature Highlight: Biometric Fingerprint Register",
      body: "Unexplored Module: Register student fingerprints for automatic biometric verification.",
      category: "FEATURE_EXPLORE",
      actionUrl: "/teacher",
      hour: 14,
    },
    {
      title: "📚 Evening Grading & Exam Marks Entry",
      body: "Submit today's test scores in the Marking Centre to update student report cards.",
      category: "DAILY_TASK",
      actionUrl: "/teacher/exams",
      hour: 19,
    },
  ],
  STUDENT: [
    {
      title: "🎒 Morning Learning Schedule",
      body: "Check today's class timetable, room numbers, and subject assignments.",
      category: "DAILY_TASK",
      actionUrl: "/student",
      hour: 9,
    },
    {
      title: "💡 Feature Highlight: Digital Report Card",
      body: "Unexplored Module: Inspect your exam performance analytics and term report cards.",
      category: "FEATURE_EXPLORE",
      actionUrl: "/student",
      hour: 14,
    },
    {
      title: "📖 Study & Homework Reminder",
      body: "Review today's subject diary entries and prepare for upcoming assessments.",
      category: "DAILY_TASK",
      actionUrl: "/student",
      hour: 19,
    },
  ],
  CLERK: [
    {
      title: "💵 Daily Financial Operations",
      body: "Verify morning fee collections and log campus operational expenses.",
      category: "DAILY_TASK",
      actionUrl: "/clerk",
      hour: 9,
    },
    {
      title: "💡 Feature Highlight: Class Fee Vouchers",
      body: "Unexplored Module: Generate and export PDF fee vouchers in bulk for all classes.",
      category: "FEATURE_EXPLORE",
      actionUrl: "/clerk",
      hour: 14,
    },
    {
      title: "🔄 End-of-Day Offline Sync Check",
      body: "Ensure all fee ledger updates and expense receipts are fully synced to cloud.",
      category: "DAILY_TASK",
      actionUrl: "/clerk",
      hour: 19,
    },
  ],
  PARENT: [
    {
      title: "🏫 Morning School Update",
      body: "Check your child's attendance status and today's homework assignments.",
      category: "DAILY_TASK",
      actionUrl: "/parent",
      hour: 9,
    },
    {
      title: "💡 Feature Highlight: Online Fee Receipts",
      body: "Unexplored Module: View and download official digital fee payment receipts anytime.",
      category: "FEATURE_EXPLORE",
      actionUrl: "/parent",
      hour: 14,
    },
    {
      title: "📊 Evening Progress Report",
      body: "Review your child's academic performance summary and upcoming school calendar.",
      category: "DAILY_TASK",
      actionUrl: "/parent",
      hour: 19,
    },
  ],
};

export const initDailyRoleNotifications = async (role = "ADMIN"): Promise<void> => {
  if (typeof window === "undefined") return;

  const normalizedRole = role.toUpperCase();
  const templates: RoleNotificationTemplate[] = ROLE_NOTIFICATIONS[normalizedRole] ?? ROLE_NOTIFICATIONS.ADMIN ?? [];
  const todayStr = new Date().toISOString().split("T")[0];
  const lastKey = `msns_daily_notif_date_${normalizedRole}`;
  const lastDate = localStorage.getItem(lastKey);

  // If daily notifications have already been triggered for today, return
  if (lastDate === todayStr) return;

  localStorage.setItem(lastKey, todayStr ?? "");

  console.log(`[DailyNotifications] Scheduling 2-3 daily notifications for role: ${normalizedRole}`);

  if (isNative()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const notifs = templates.map((tpl, index) => {
        const scheduledTime = new Date();
        scheduledTime.setHours(tpl.hour, 0, 0, 0);
        // If scheduled time has already passed today, trigger in 1 minute increments for testing
        if (scheduledTime.getTime() <= Date.now()) {
          scheduledTime.setTime(Date.now() + (index + 1) * 30000);
        }

        return {
          id: 9000 + index + Math.floor(Math.random() * 100),
          title: tpl.title,
          body: tpl.body,
          schedule: { at: scheduledTime },
          sound: undefined,
          actionTypeId: "",
          extra: { actionUrl: tpl.actionUrl, category: tpl.category },
        };
      });

      await LocalNotifications.schedule({ notifications: notifs });
    } catch (err) {
      console.error("[DailyNotifications] Native schedule error:", err);
    }
  }

  // Inject notifications into local store & trigger one immediate recommendation
  for (const tpl of templates) {
    void sendLocalNotification({
      title: tpl.title,
      body: tpl.body,
      category: tpl.category,
      actionUrl: tpl.actionUrl,
    });
  }
};
