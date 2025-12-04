// lib/notifyKitchenNewOrder.ts
// Yeni sipariş için ntfy.sh üzerinden MUTFAK ekibine bildirim gönderir

import MenuItem from "@/models/MenuItem";

const NTFY_SERVER = process.env.NTFY_SERVER || "https://ntfy.sh";
const NTFY_KITCHEN_TOPIC = process.env.NTFY_KITCHEN_TOPIC; // örn: "elfida-kitchen"
const NTFY_TOKEN = process.env.NTFY_TOKEN; // gerekiyorsa auth token (aynı token'ı reuse edebilirsin)

type OrderItemForNotification = {
  menuItemId: string;
  quantity: number;
};

export interface KitchenOrderNotificationPayload {
  orderNumber: number;
  type: string; // delivery / pickup
  source: string; // in-house / yemeksepeti / getir
  totalAmount: number;
  items: OrderItemForNotification[];
  customerName?: string;
}

async function getMenuItemNamesMap(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();

  const uniqueIds = Array.from(new Set(ids));
  const docs = await MenuItem.find({ _id: { $in: uniqueIds } }).lean();
  const map = new Map<string, string>();

  for (const doc of docs) {
    map.set(doc._id.toString(), doc.name as string);
  }

  return map;
}

export async function notifyKitchenNewOrder(order: KitchenOrderNotificationPayload) {
  if (!NTFY_KITCHEN_TOPIC) {
    console.warn(
      "NTFY_KITCHEN_TOPIC env değişkeni tanımlı değil, mutfak bildirimi atlanıyor"
    );
    return;
  }

  const baseUrl = NTFY_SERVER.replace(/\/$/, "");
  const url = `${baseUrl}/${NTFY_KITCHEN_TOPIC}`;

  const title = "Yeni Mutfak Siparisi"; // ASCII only for HTTP header

  // Menü item isimlerini gerçek DB'den çek
  const ids = order.items.map((i) => i.menuItemId);
  const nameMap = await getMenuItemNamesMap(ids);

  const lines: string[] = [];
  lines.push(
    `Sipariş #${order.orderNumber} - ${order.type.toUpperCase()} - ${order.source}`
  );
  lines.push(`Toplam: ${order.totalAmount} ₺`);
  if (order.customerName) {
    lines.push(`Müşteri: ${order.customerName}`);
  }
  lines.push("");
  lines.push("Ürünler:");
  for (const item of order.items) {
    const name = nameMap.get(item.menuItemId) ?? "Bilinmeyen ürün";
    lines.push(`- ${item.quantity}x ${name}`);
  }

  const message = lines.join("\n");

  const headers: Record<string, string> = {
    Title: title,
    Tags: "chef,restaurant",
  };

  if (NTFY_TOKEN) {
    headers["Authorization"] = `Bearer ${NTFY_TOKEN}`;
  }

  try {
    await fetch(url, {
      method: "POST",
      body: message,
      headers,
    });
  } catch (err) {
    console.error("ntfy mutfak bildirim hatası:", err);
  }
}
