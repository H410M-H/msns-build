import { db } from "~/server/db";

export const sendPushNotification = async (
  userIds: string[],
  parentGuardianIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  console.log(`[FCM Push] Triggered alert: "${title}" - "${body}" for Users:`, userIds, "Parents:", parentGuardianIds);

  try {
    const registrations = await db.deviceRegistration.findMany({
      where: {
        OR: [
          { userId: { in: userIds.filter(Boolean) } },
          { parentGuardianId: { in: parentGuardianIds.filter(Boolean) } }
        ]
      },
      select: { token: true }
    });

    const tokens = registrations.map((r) => r.token);
    if (tokens.length === 0) {
      console.log("[FCM Push] No registered device tokens found for target recipients.");
      return;
    }

    console.log(`[FCM Push] Mock sending push payload to ${tokens.length} tokens:`, tokens);
  } catch (error) {
    console.error("[FCM Push] Error fetching tokens / sending notification:", error);
  }
};
