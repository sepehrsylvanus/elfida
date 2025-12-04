import type { KitchenMessage, KitchenNotification } from "./db";

const STORAGE_KEYS = {
  ORDER_COUNTER: "tabldot_order_counter",
  KITCHEN_MESSAGES: "tabldot_kitchen_messages",
  KITCHEN_NOTIFICATIONS: "tabldot_kitchen_notifications",
};

// Order counter sadece frontend için kullanılıyor
export function getNextOrderNumber(): number {
  if (typeof window === "undefined") return 1;
  const raw = localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER);
  const counter = Number.parseInt(raw || "1");
  localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, String(counter + 1));
  return counter;
}

// Kitchen messages
export function getKitchenMessages(): KitchenMessage[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.KITCHEN_MESSAGES);
  return data
    ? JSON.parse(data, (key, value) => {
        if (key === "createdAt") {
          return value ? new Date(value) : value;
        }
        return value;
      })
    : [];
}

export function saveKitchenMessage(message: KitchenMessage) {
  const messages = getKitchenMessages();
  const index = messages.findIndex((m) => m.id === message.id);
  if (index >= 0) {
    messages[index] = message;
  } else {
    messages.push(message);
  }
  localStorage.setItem(STORAGE_KEYS.KITCHEN_MESSAGES, JSON.stringify(messages));
  window.dispatchEvent(new Event("storage"));
}

export function deleteKitchenMessage(messageId: string) {
  const messages = getKitchenMessages().filter((m) => m.id !== messageId);
  localStorage.setItem(STORAGE_KEYS.KITCHEN_MESSAGES, JSON.stringify(messages));
  window.dispatchEvent(new Event("storage"));
}

// Kitchen notifications
export function getKitchenNotifications(): KitchenNotification[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS);
  return data
    ? JSON.parse(data, (key, value) => {
        if (key === "sentAt") {
          return value ? new Date(value) : value;
        }
        return value;
      })
    : [];
}

export function sendKitchenNotification(messageId: string, text: string) {
  const notifications = getKitchenNotifications();
  const newNotification: KitchenNotification = {
    id: `kn${Date.now()}`,
    messageId,
    text,
    sentAt: new Date(),
    read: false,
  };
  notifications.unshift(newNotification);
  localStorage.setItem(
    STORAGE_KEYS.KITCHEN_NOTIFICATIONS,
    JSON.stringify(notifications)
  );
  window.dispatchEvent(new Event("storage"));

  // Ayrıca backend üzerinden ntfy.sh'a mutfak mesajı gönder
  // Hata olsa bile UI'yi bozmasın diye fire-and-forget şeklinde kullanıyoruz.
  try {
    fetch("/api/kitchen-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("/api/kitchen-notify çağrısı başarısız:", err);
  }
}

export function markNotificationAsRead(notificationId: string) {
  const notifications = getKitchenNotifications();
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
    localStorage.setItem(
      STORAGE_KEYS.KITCHEN_NOTIFICATIONS,
      JSON.stringify(notifications)
    );
    window.dispatchEvent(new Event("storage"));
  }
}

export function clearAllNotifications() {
  localStorage.setItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS, JSON.stringify([]));
  window.dispatchEvent(new Event("storage"));
}
