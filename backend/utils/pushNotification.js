import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

// Prefer an explicit subject. Accept either `VAPID_SUBJECT` or `VAPID_EMAIL` (plain email),
// and fall back to a safe `mailto:` address so the server can start without throwing.
const vapidSubjectEnv =
  process.env.VAPID_SUBJECT || process.env.VAPID_EMAIL || "";
let vapidSubject = vapidSubjectEnv;
if (
  vapidSubject &&
  !vapidSubject.startsWith("mailto:") &&
  vapidSubject.includes("@")
) {
  vapidSubject = `mailto:${vapidSubject}`;
}

if (!vapidSubject) {
  console.warn(
    "Warning: VAPID subject is not set. Set VAPID_SUBJECT (or VAPID_EMAIL) in environment to a mailto: or url. Falling back to mailto:no-reply@samvaad.local",
  );
  vapidSubject = "mailto:no-reply@samvaad.local";
}

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn(
    "Warning: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY not set. Push notifications may fail.",
  );
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

export const sendPushNotification = async (subscription, payload) => {
  try {
    const stringifiedPayload = JSON.stringify(payload);
    await webpush.sendNotification(subscription, stringifiedPayload);
    return { success: true };
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      // Subscription has expired or is no longer valid
      return { success: false, error: "GONE", statusCode: error.statusCode };
    }
    console.error("Error sending push notification:", error);
    return { success: false, error: error.message };
  }
};

export const sendToUser = async (user, payload) => {
  if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
    return;
  }

  const notifications = user.pushSubscriptions.map(async (subscription) => {
    const result = await sendPushNotification(subscription, payload);
    if (result.error === "GONE") {
      // Should remove this subscription from user in the future
      return { expired: true, subscription };
    }
    return result;
  });

  const results = await Promise.all(notifications);

  // Optionally filter out expired subscriptions
  const expiredSubs = results
    .filter((r) => r && r.expired)
    .map((r) => r.subscription);
  if (expiredSubs.length > 0) {
    // We could trigger a user update here to remove these subs
    // user.pushSubscriptions = user.pushSubscriptions.filter(s => !expiredSubs.includes(s));
    // await user.save();
    // But we don't have access to the model here easily without import recursion or passing it in
  }
};
