// lib/notifyNewOrder.ts
// Yeni sipariş için ntfy.sh üzerinden delivery ekibine bildirim gönderir

import MenuItem from "@/models/MenuItem";

const NTFY_SERVER = process.env.NTFY_SERVER || "https://ntfy.sh";
const NTFY_DELIVERY_TOPIC = process.env.NTFY_DELIVERY_TOPIC; // örn: "elfida-delivery"
const NTFY_TOKEN = process.env.NTFY_TOKEN; // gerekiyorsa auth token

type OrderItemForNotification = {
  menuItemId: string;
  quantity: number;
};

export interface NewOrderNotificationPayload {
  orderNumber: number;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemForNotification[];
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

export async function notifyNewOrder(order: NewOrderNotificationPayload) {
  if (!NTFY_DELIVERY_TOPIC) {
    console.warn(
      "NTFY_DELIVERY_TOPIC env değişkeni tanımlı değil, bildirim atlanıyor"
    );
    return;
  }

  const baseUrl = NTFY_SERVER.replace(/\/$/, "");
  const url = `${baseUrl}/${NTFY_DELIVERY_TOPIC}`;

  const title = "Yeni Teslimat Siparisi"; // ASCII only for HTTP header

  // Menü item isimlerini gerçek DB'den çek
  const ids = order.items.map((i) => i.menuItemId);
  const nameMap = await getMenuItemNamesMap(ids);

  const lines: string[] = [];
  lines.push(`Sipariş #${order.orderNumber} - ${order.totalAmount} ₺`);
  lines.push("");
  lines.push(`Müşteri: ${order.customerName}`);
  lines.push(`Tel: ${order.customerPhone}`);
  lines.push(`Adres: ${order.customerAddress}`);
  lines.push("");
  lines.push("Ürünler:");
  for (const item of order.items) {
    const name = nameMap.get(item.menuItemId) ?? "Bilinmeyen ürün";
    lines.push(`- ${item.quantity}x ${name}`);
  }

  const message = lines.join("\n");

  const headers: Record<string, string> = {
    Title: title,
    Tags: "package",
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
    console.error("ntfy bildirim hatası:", err);
  }
}
