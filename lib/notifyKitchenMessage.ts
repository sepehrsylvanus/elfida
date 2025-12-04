// lib/notifyKitchenMessage.ts
// Serbest mutfak mesajlarını ("Gönder" butonu) ntfy.sh üzerinden mutfak ekibine iletir

const NTFY_SERVER = process.env.NTFY_SERVER || "https://ntfy.sh";
const NTFY_KITCHEN_TOPIC = process.env.NTFY_KITCHEN_TOPIC; // örn: "elfida-kitchen"
const NTFY_TOKEN = process.env.NTFY_TOKEN; // gerekiyorsa auth token

export async function notifyKitchenMessage(text: string) {
  if (!NTFY_KITCHEN_TOPIC) {
    console.warn(
      "NTFY_KITCHEN_TOPIC env değişkeni tanımlı değil, mutfak mesajı bildirimi atlanıyor"
    );
    return;
  }

  const baseUrl = NTFY_SERVER.replace(/\/$/, "");
  const url = `${baseUrl}/${NTFY_KITCHEN_TOPIC}`;

  const title = "Mutfak Mesaji"; // ASCII only

  const headers: Record<string, string> = {
    Title: title,
    Tags: "chef,alert",
  };

  if (NTFY_TOKEN) {
    headers["Authorization"] = `Bearer ${NTFY_TOKEN}`;
  }

  try {
    await fetch(url, {
      method: "POST",
      body: text,
      headers,
    });
  } catch (err) {
    console.error("ntfy mutfak MESAJ bildirim hatası:", err);
  }
}
