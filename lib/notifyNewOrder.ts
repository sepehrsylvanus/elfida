// lib/notifyNewOrder.ts
import PushSubscription from "@/models/PushSubscription";
import { webPush } from "./webpush";

export async function notifyNewOrder(orderNumber: number) {
  const subscriptions = await PushSubscription.find({}); // فعلاً به همه بفرست

  if (!subscriptions.length) return;

  const payload = JSON.stringify({
    title: "Yeni Teslimat Siparişi",
    body: `Yeni sipariş #${orderNumber} oluşturuldu`,
    url: "/kurye", // صفحه‌ای که Kurye ekranı توشه
  });

  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh,
          },
        } as any,
        payload
      );
    } catch (err: any) {
      console.error("Push error:", err.statusCode, err.body);
      // اگر subscription مرده باشه → پاکش کن
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
    }
  }
}
