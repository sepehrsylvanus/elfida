const STORAGE_KEYS = {
  ORDER_COUNTER: "tabldot_order_counter",
};

// Order counter sadece frontend için kullanılıyor
export function getNextOrderNumber(): number {
  if (typeof window === "undefined") return 1;
  const raw = localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER);
  const counter = Number.parseInt(raw || "1");
  localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, String(counter + 1));
  return counter;
}

