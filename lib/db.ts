export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";
export type OrderType = "dine-in" | "delivery";
export type OrderSource = "in-house" | "yemeksepeti" | "getir";

export interface MenuItem {
  id: string;
  name: string;
  available: boolean;
  estimatedStock: number;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  addressLocation?: {
    lat: number;
    lng: number;
  };
  driverId?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  active: boolean;
  currentDeliveries: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  addresses: {
    id: string;
    label: string;
    address: string;
    location?: {
      lat: number;
      lng: number;
    };
  }[];
}

// Kitchen message types
export interface KitchenMessage {
  id: string;
  text: string;
  createdAt: Date;
}

export interface KitchenNotification {
  id: string;
  messageId: string;
  text: string;
  sentAt: Date;
  read: boolean;
}

// Demo/mock data kaldırıldı. Artık tüm gerçek veriler MongoDB üzerinden geliyor.

export function getNextOrderNumber(): number {
  // Sadece frontend için artan sipariş numarası üretimi
  // (sunucu tarafındaki Order modeli kendi numaralandırma stratejisine taşınabilir)
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem("tabldot_order_counter");
  const current = raw ? Number.parseInt(raw, 10) || 1 : 1;
  window.localStorage.setItem("tabldot_order_counter", String(current + 1));
  return current;
}
