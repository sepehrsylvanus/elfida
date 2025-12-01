// lib/webPush.ts
import webPush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails(
  "mailto:mr.forte.world@gmail.com", // ایمیل خودت یا ساپورت سیستم
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export { webPush };
