import { db } from "~/server/db";

export const sendPushNotification = async (
  userIds: string[],
  parentGuardianIds: string[],
  title: string,
  body: string,
  _data?: Record<string, string>
) => {
  console.log(`[FCM Push] Triggered alert: "${title}" - "${body}" for Users:`, userIds, "Parents:", parentGuardianIds);

  try {
    const prismaDb = db as unknown as { deviceRegistration: { findMany: (args: any) => Promise<{ token: string }[]> } };
    const registrations = await prismaDb.deviceRegistration.findMany({
      where: {
        OR: [
          { userId: { in: userIds.filter(Boolean) } },
          { parentGuardianId: { in: parentGuardianIds.filter(Boolean) } }
        ]
      },
      select: { token: true }
    });

    const tokens = registrations.map((r: { token: string }) => r.token);
    if (tokens.length === 0) {
      console.log("[FCM Push] No registered device tokens found for target recipients.");
      return;
    }

    console.log(`[FCM Push] Mock sending push payload to ${tokens.length} tokens:`, tokens);
  } catch (error) {
    console.error("[FCM Push] Error fetching tokens / sending notification:", error);
  }
};
