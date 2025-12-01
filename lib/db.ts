export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled"
export type OrderType = "dine-in" | "delivery"
export type OrderSource = "in-house" | "yemeksepeti" | "getir"

export interface MenuItem {
  id: string
  name: string
  available: boolean
  estimatedStock: number
}

export interface OrderItem {
  menuItemId: string
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  orderNumber: number
  type: OrderType
  source: OrderSource
  status: OrderStatus
  items: OrderItem[]
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  addressLocation?: {
    lat: number
    lng: number
  }
  driverId?: string
  totalAmount: number
  createdAt: Date
  updatedAt: Date
  readyAt?: Date
  deliveredAt?: Date
  notes?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  vehicleType: string
  active: boolean
  currentDeliveries: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  addresses: {
    id: string
    label: string
    address: string
    location?: {
      lat: number
      lng: number
    }
  }[]
}

// Kitchen message types
export interface KitchenMessage {
  id: string
  text: string
  createdAt: Date
}

export interface KitchenNotification {
  id: string
  messageId: string
  text: string
  sentAt: Date
  read: boolean
}

// Mock data
export const MOCK_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "Adana Kebap",
    available: true,
    estimatedStock: 25,
  },
  {
    id: "m2",
    name: "İskender Kebap",
    available: true,
    estimatedStock: 20,
  },
  {
    id: "m3",
    name: "Tavuk Şiş",
    available: true,
    estimatedStock: 30,
  },
  {
    id: "m4",
    name: "Köfte",
    available: true,
    estimatedStock: 35,
  },
  {
    id: "m5",
    name: "Lahmacun",
    available: true,
    estimatedStock: 40,
  },
  {
    id: "m6",
    name: "Pide",
    available: true,
    estimatedStock: 25,
  },
  {
    id: "m7",
    name: "Mercimek Çorbası",
    available: true,
    estimatedStock: 50,
  },
  {
    id: "m8",
    name: "Kuru Fasulye",
    available: true,
    estimatedStock: 30,
  },
  {
    id: "m9",
    name: "Pilav",
    available: true,
    estimatedStock: 60,
  },
  {
    id: "m10",
    name: "Makarna",
    available: true,
    estimatedStock: 45,
  },
  {
    id: "m11",
    name: "Çoban Salatası",
    available: true,
    estimatedStock: 40,
  },
  {
    id: "m12",
    name: "Cacık",
    available: true,
    estimatedStock: 35,
  },
  {
    id: "m13",
    name: "Patlıcan Kızartması",
    available: true,
    estimatedStock: 25,
  },
  {
    id: "m14",
    name: "Sigara Böreği",
    available: true,
    estimatedStock: 30,
  },
  {
    id: "m15",
    name: "Baklava",
    available: true,
    estimatedStock: 40,
  },
  {
    id: "m16",
    name: "Künefe",
    available: true,
    estimatedStock: 20,
  },
  {
    id: "m17",
    name: "Sütlaç",
    available: true,
    estimatedStock: 30,
  },
  {
    id: "m18",
    name: "Ayran",
    available: true,
    estimatedStock: 100,
  },
  {
    id: "m19",
    name: "Çay",
    available: true,
    estimatedStock: 200,
  },
  {
    id: "m20",
    name: "Türk Kahvesi",
    available: true,
    estimatedStock: 80,
  },
  {
    id: "m21",
    name: "Kola",
    available: true,
    estimatedStock: 60,
  },
  {
    id: "m22",
    name: "Su",
    available: true,
    estimatedStock: 150,
  },
  {
    id: "m23",
    name: "Şalgam Suyu",
    available: true,
    estimatedStock: 40,
  },
]

export const MOCK_DRIVERS: Driver[] = [
  {
    id: "dr1",
    name: "Mehmet Yılmaz",
    phone: "+90 555 123 4567",
    vehicleType: "Motosiklet",
    active: true,
    currentDeliveries: 2,
  },
  {
    id: "dr2",
    name: "Ali Demir",
    phone: "+90 555 234 5678",
    vehicleType: "Motosiklet",
    active: true,
    currentDeliveries: 1,
  },
  {
    id: "dr3",
    name: "Hasan Kaya",
    phone: "+90 555 345 6789",
    vehicleType: "Araba",
    active: true,
    currentDeliveries: 0,
  },
  {
    id: "dr4",
    name: "Mustafa Çelik",
    phone: "+90 555 456 7890",
    vehicleType: "Motosiklet",
    active: false,
    currentDeliveries: 0,
  },
]

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Ayşe Yılmaz",
    phone: "+90 555 111 2222",
    addresses: [
      {
        id: "a1",
        label: "Ev",
        address: "Beyoğlu, İstiklal Caddesi No: 125, Istanbul",
        location: { lat: 41.0369, lng: 28.9784 },
      },
      {
        id: "a2",
        label: "İş",
        address: "Şişli, Halaskargazi Caddesi No: 47, Istanbul",
        location: { lat: 41.0503, lng: 28.9869 },
      },
    ],
  },
  {
    id: "c2",
    name: "Ahmet Kaya",
    phone: "+90 555 222 3333",
    addresses: [
      {
        id: "a3",
        label: "Ev",
        address: "Kadıköy, Moda Caddesi No: 89, Istanbul",
        location: { lat: 40.9871, lng: 29.0256 },
      },
    ],
  },
  {
    id: "c3",
    name: "Zeynep Demir",
    phone: "+90 555 333 4444",
    addresses: [
      {
        id: "a4",
        label: "Ev",
        address: "Beşiktaş, Barbaros Bulvarı No: 56, Istanbul",
        location: { lat: 41.0422, lng: 29.007 },
      },
    ],
  },
  {
    id: "c4",
    name: "Fatma Öztürk",
    phone: "+90 555 444 5555",
    addresses: [
      {
        id: "a5",
        label: "Ev",
        address: "Fatih, Vatan Caddesi No: 234, Istanbul",
        location: { lat: 41.0082, lng: 28.9497 },
      },
      {
        id: "a6",
        label: "Ofis",
        address: "Ataşehir, Atatürk Mahallesi No: 12, Istanbul",
        location: { lat: 40.9827, lng: 29.1235 },
      },
    ],
  },
]

let orderCounter = 1

export const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    orderNumber: orderCounter++,
    type: "dine-in",
    source: "in-house",
    status: "preparing",
    items: [
      { menuItemId: "m1", quantity: 2, notes: "Az acılı olsun" },
      { menuItemId: "m11", quantity: 2 },
      { menuItemId: "m19", quantity: 2 },
    ],
    totalAmount: 420,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    notes: "Masa 5",
  },
  {
    id: "o2",
    orderNumber: orderCounter++,
    type: "delivery",
    source: "yemeksepeti",
    status: "preparing",
    items: [
      { menuItemId: "m3", quantity: 1 },
      { menuItemId: "m4", quantity: 1 },
      { menuItemId: "m12", quantity: 2 },
      { menuItemId: "m15", quantity: 2 },
    ],
    customerName: "Ayşe Yılmaz",
    customerPhone: "+90 555 111 2222",
    customerAddress: "Beyoğlu, İstiklal Caddesi No: 125, Istanbul",
    addressLocation: { lat: 41.0369, lng: 28.9784 },
    totalAmount: 350,
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: "o3",
    orderNumber: orderCounter++,
    type: "dine-in",
    source: "in-house",
    status: "ready",
    items: [
      { menuItemId: "m5", quantity: 3 },
      { menuItemId: "m18", quantity: 3 },
    ],
    totalAmount: 180,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    readyAt: new Date(Date.now() - 5 * 60 * 1000),
    notes: "Masa 8",
  },
  {
    id: "o4",
    orderNumber: orderCounter++,
    type: "delivery",
    source: "in-house",
    status: "ready",
    items: [
      { menuItemId: "m2", quantity: 2 },
      { menuItemId: "m11", quantity: 2 },
      { menuItemId: "m17", quantity: 2 },
    ],
    customerName: "Ahmet Kaya",
    customerPhone: "+90 555 222 3333",
    customerAddress: "Kadıköy, Moda Caddesi No: 89, Istanbul",
    addressLocation: { lat: 40.9871, lng: 29.0256 },
    driverId: "dr1",
    totalAmount: 480,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000),
    readyAt: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: "o5",
    orderNumber: orderCounter++,
    type: "delivery",
    source: "getir",
    status: "pending",
    items: [
      { menuItemId: "m6", quantity: 2 },
      { menuItemId: "m7", quantity: 2 },
      { menuItemId: "m21", quantity: 2 },
    ],
    customerName: "Zeynep Demir",
    customerPhone: "+90 555 333 4444",
    customerAddress: "Beşiktaş, Barbaros Bulvarı No: 56, Istanbul",
    addressLocation: { lat: 41.0422, lng: 29.007 },
    totalAmount: 220,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "o6",
    orderNumber: orderCounter++,
    type: "dine-in",
    source: "in-house",
    status: "pending",
    items: [
      { menuItemId: "m8", quantity: 1 },
      { menuItemId: "m9", quantity: 1 },
      { menuItemId: "m16", quantity: 1 },
      { menuItemId: "m19", quantity: 1 },
    ],
    totalAmount: 185,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
    notes: "Masa 12",
  },
]

export const MOCK_KITCHEN_MESSAGES: KitchenMessage[] = [
  {
    id: "km1",
    text: "Lütfen acele edin, sipariş yoğunluğu var!",
    createdAt: new Date(),
  },
  {
    id: "km2",
    text: "Adana kebap bitti, yenisi hazırlanıyor.",
    createdAt: new Date(),
  },
  {
    id: "km3",
    text: "Öğle yemeği molası 30 dakika sonra başlayacak.",
    createdAt: new Date(),
  },
  {
    id: "km4",
    text: "Yeni sipariş geldi, kontrol edin!",
    createdAt: new Date(),
  },
  {
    id: "km5",
    text: "Temizlik için 10 dakika ara verilecek.",
    createdAt: new Date(),
  },
]

export function getNextOrderNumber(): number {
  return orderCounter++
}
