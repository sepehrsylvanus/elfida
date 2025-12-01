import type { Order, MenuItem, Driver, Customer, KitchenMessage, KitchenNotification } from "./db"
import { MOCK_ORDERS, MOCK_MENU, MOCK_DRIVERS, MOCK_CUSTOMERS, MOCK_KITCHEN_MESSAGES } from "./db"

const STORAGE_KEYS = {
  ORDERS: "tabldot_orders",
  MENU: "tabldot_menu",
  DRIVERS: "tabldot_drivers",
  CUSTOMERS: "tabldot_customers",
  ORDER_COUNTER: "tabldot_order_counter",
  KITCHEN_MESSAGES: "tabldot_kitchen_messages",
  KITCHEN_NOTIFICATIONS: "tabldot_kitchen_notifications",
}

// Initialize store with mock data if empty
function initializeStore() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(MOCK_ORDERS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(MOCK_MENU))
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(MOCK_DRIVERS))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER)) {
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, "7")
  }
  if (!localStorage.getItem(STORAGE_KEYS.KITCHEN_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.KITCHEN_MESSAGES, JSON.stringify(MOCK_KITCHEN_MESSAGES))
  }
  if (!localStorage.getItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS, JSON.stringify([]))
  }
}

// Orders
export function getOrders(): Order[] {
  if (typeof window === "undefined") return MOCK_ORDERS
  initializeStore()
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
  return data
    ? JSON.parse(data, (key, value) => {
        // Convert date strings back to Date objects
        if (key === "createdAt" || key === "updatedAt" || key === "readyAt" || key === "deliveredAt") {
          return value ? new Date(value) : value
        }
        return value
      })
    : []
}

export function saveOrder(order: Order) {
  const orders = getOrders()
  const index = orders.findIndex((o) => o.id === order.id)
  if (index >= 0) {
    orders[index] = order
  } else {
    orders.push(order)
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))

  // Trigger storage event for cross-tab updates
  window.dispatchEvent(new Event("storage"))
}

export function deleteOrder(orderId: string) {
  const orders = getOrders().filter((o) => o.id !== orderId)
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  window.dispatchEvent(new Event("storage"))
}

// Menu
export function getMenu(): MenuItem[] {
  if (typeof window === "undefined") return MOCK_MENU
  initializeStore()
  const data = localStorage.getItem(STORAGE_KEYS.MENU)
  return data ? JSON.parse(data) : []
}

export function saveMenuItem(item: MenuItem) {
  const menu = getMenu()
  const index = menu.findIndex((m) => m.id === item.id)
  if (index >= 0) {
    menu[index] = item
  } else {
    menu.push(item)
  }
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu))
  window.dispatchEvent(new Event("storage"))
}

export function deleteMenuItem(itemId: string) {
  const menu = getMenu().filter((m) => m.id !== itemId)
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu))
  window.dispatchEvent(new Event("storage"))
}

// Drivers
export function getDrivers(): Driver[] {
  if (typeof window === "undefined") return MOCK_DRIVERS
  initializeStore()
  const data = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  return data ? JSON.parse(data) : []
}

export function saveDriver(driver: Driver) {
  const drivers = getDrivers()
  const index = drivers.findIndex((d) => d.id === driver.id)
  if (index >= 0) {
    drivers[index] = driver
  } else {
    drivers.push(driver)
  }
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers))
  window.dispatchEvent(new Event("storage"))
}

// Order counter
export function getNextOrderNumber(): number {
  if (typeof window === "undefined") return 1
  initializeStore()
  const counter = Number.parseInt(localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER) || "1")
  localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, String(counter + 1))
  return counter
}

// Kitchen messages
export function getKitchenMessages(): KitchenMessage[] {
  if (typeof window === "undefined") return MOCK_KITCHEN_MESSAGES
  initializeStore()
  const data = localStorage.getItem(STORAGE_KEYS.KITCHEN_MESSAGES)
  return data
    ? JSON.parse(data, (key, value) => {
        if (key === "createdAt") {
          return value ? new Date(value) : value
        }
        return value
      })
    : []
}

export function saveKitchenMessage(message: KitchenMessage) {
  const messages = getKitchenMessages()
  const index = messages.findIndex((m) => m.id === message.id)
  if (index >= 0) {
    messages[index] = message
  } else {
    messages.push(message)
  }
  localStorage.setItem(STORAGE_KEYS.KITCHEN_MESSAGES, JSON.stringify(messages))
  window.dispatchEvent(new Event("storage"))
}

export function deleteKitchenMessage(messageId: string) {
  const messages = getKitchenMessages().filter((m) => m.id !== messageId)
  localStorage.setItem(STORAGE_KEYS.KITCHEN_MESSAGES, JSON.stringify(messages))
  window.dispatchEvent(new Event("storage"))
}

// Kitchen notifications
export function getKitchenNotifications(): KitchenNotification[] {
  if (typeof window === "undefined") return []
  initializeStore()
  const data = localStorage.getItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS)
  return data
    ? JSON.parse(data, (key, value) => {
        if (key === "sentAt") {
          return value ? new Date(value) : value
        }
        return value
      })
    : []
}

export function sendKitchenNotification(messageId: string, text: string) {
  const notifications = getKitchenNotifications()
  const newNotification: KitchenNotification = {
    id: `kn${Date.now()}`,
    messageId,
    text,
    sentAt: new Date(),
    read: false,
  }
  notifications.unshift(newNotification)
  localStorage.setItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS, JSON.stringify(notifications))
  window.dispatchEvent(new Event("storage"))

  // Browser notification if supported
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Mutfak Bildirimi", {
      body: text,
      icon: "/modern-minimalist-kitchen.png",
    })
  }
}

export function markNotificationAsRead(notificationId: string) {
  const notifications = getKitchenNotifications()
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
    localStorage.setItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS, JSON.stringify(notifications))
    window.dispatchEvent(new Event("storage"))
  }
}

export function clearAllNotifications() {
  localStorage.setItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS, JSON.stringify([]))
  window.dispatchEvent(new Event("storage"))
}

// Reset all data to mock data
export function resetToMockData() {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(MOCK_ORDERS))
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(MOCK_MENU))
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(MOCK_DRIVERS))
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]))
  localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, "7")
  localStorage.setItem(STORAGE_KEYS.KITCHEN_MESSAGES, JSON.stringify(MOCK_KITCHEN_MESSAGES))
  localStorage.setItem(STORAGE_KEYS.KITCHEN_NOTIFICATIONS, JSON.stringify([]))
  window.dispatchEvent(new Event("storage"))
}
