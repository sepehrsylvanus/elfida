"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  MapPin,
  Phone,
  User,
  CheckCircle,
  Package,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, MenuItem, Driver } from "@/lib/db";
import { getOrders, saveOrder, getMenu, getDrivers } from "@/lib/store";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
console.log("🚀 ~ VAPID_PUBLIC_KEY:", VAPID_PUBLIC_KEY);

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
export default function DeliveryDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const seenDeliveryOrderIdsRef = useRef<Set<string> | null>(null);

  const loadOrders = () => {
    const allOrders = getOrders();
    const readyOrders = allOrders.filter(
      (order) => order.type === "delivery" && order.status === "ready"
    );
    readyOrders.sort((a, b) => {
      if (!a.readyAt || !b.readyAt) return 0;
      return a.readyAt.getTime() - b.readyAt.getTime();
    });
    setOrders(readyOrders);

    // Detect newly created delivery orders and show a browser notification
    const deliveryOrders = allOrders.filter(
      (order) => order.type === "delivery"
    );
    if (!seenDeliveryOrderIdsRef.current) {
      // First load: just register existing orders without notifying
      seenDeliveryOrderIdsRef.current = new Set(
        deliveryOrders.map((o) => o.id)
      );
      return;
    }

    const seenIds = seenDeliveryOrderIdsRef.current;
    const newDeliveryOrders = deliveryOrders.filter(
      (order) => !seenIds.has(order.id)
    );

    if (newDeliveryOrders.length > 0) {
      newDeliveryOrders.forEach((order) => seenIds.add(order.id));
    }
  };

  useEffect(() => {
    setMenu(getMenu());
    setDrivers(getDrivers());
    loadOrders();
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // 🔹 این قسمت جدید: ثبت Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service worker registered", reg);
        })
        .catch((err) => {
          console.error("Service worker registration failed", err);
        });
    }

    const interval = setInterval(loadOrders, 5000);
    const handleStorage = () => loadOrders();
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Bu tarayıcı bildirim özelliğini desteklemiyor");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== "granted") {
        alert("Bildirim izni verilmedi");
        return;
      }

      // Service worker hazır olana kadar bekle
      try {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log("SUBSCRIPTION SUCCESS:", subscription);
      } catch (err) {
        console.error("SUBSCRIPTION ERROR:", err);
        alert("Push subscribe hatası: " + (err as any)?.message);
      }

      // Bu subscription'ı backend'e gönder ve DB'de bu kullanıcı / cihaz için sakla
      await fetch("/api/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          // örn: kullanıcı tipi / kurye id'si vs.
          // courierId: "xxx"
        }),
      });

      // İstersen sadece bir info notifikasyonu gösterebilirsin (opsiyonel)
      new Notification("Bildirimler Aktif", {
        body: "Artık yeni siparişler için web push alacaksınız",
        icon: "/notification-bell.png",
      });
    } catch (error) {
      console.error("Bildirim izni alınamadı veya subscribe edilemedi:", error);
      alert("Bildirimler aktif edilirken bir hata oluştu");
    }
  };

  const getNotificationButtonText = () => {
    switch (notificationPermission) {
      case "granted":
        return "Bildirimler Aktif ✓";
      case "denied":
        return "Bildirimler Engellenmiş";
      default:
        return "Bildirimleri Aç";
    }
  };

  const getNotificationButtonVariant = () => {
    switch (notificationPermission) {
      case "granted":
        return "default" as const;
      case "denied":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getMenuItem = (id: string) => menu.find((item) => item.id === id);

  const assignDriver = (order: Order, driverId: string) => {
    const updatedOrder = {
      ...order,
      driverId,
      updatedAt: new Date(),
    };
    saveOrder(updatedOrder);
    loadOrders();
  };

  const markAsDelivered = (order: Order) => {
    const updatedOrder = {
      ...order,
      status: "delivered" as const,
      deliveredAt: new Date(),
      updatedAt: new Date(),
    };
    saveOrder(updatedOrder);
    loadOrders();
  };

  const getTimeSinceReady = (readyAt?: Date) => {
    if (!readyAt) return "Bilinmiyor";
    const minutes = Math.floor((Date.now() - readyAt.getTime()) / 60000);
    if (minutes < 1) return "Şimdi";
    if (minutes === 1) return "1 dakika";
    return `${minutes} dakika`;
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "in-house":
        return "Doğrudan";
      case "yemeksepeti":
        return "Yemek Sepeti";
      case "getir":
        return "Getir";
      default:
        return source;
    }
  };

  const openInMaps = (order: Order) => {
    if (order.addressLocation) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${order.addressLocation.lat},${order.addressLocation.lng}`,
        "_blank"
      );
    } else if (order.customerAddress) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          order.customerAddress
        )}`,
        "_blank"
      );
    }
  };

  const getDriver = (driverId?: string) => {
    if (!driverId) return null;
    return drivers.find((d) => d.id === driverId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kurye Ekranı</h1>
            <p className="text-gray-600">Delivery Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Hazır Siparişler</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.length}
              </p>
            </div>
            <Button
              variant={getNotificationButtonVariant()}
              onClick={requestNotificationPermission}
              disabled={notificationPermission === "granted"}
            >
              {getNotificationButtonText()}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg">Teslim için hazır sipariş yok</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const assignedDriver = getDriver(order.driverId);
              return (
                <Card
                  key={order.id}
                  className="border-2 border-blue-300 bg-blue-50/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-2xl">
                        Sipariş #{order.orderNumber}
                      </CardTitle>
                      <Badge variant="outline" className="bg-white">
                        {getSourceLabel(order.source)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {getTimeSinceReady(order.readyAt)} önce hazır
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="space-y-2 rounded-lg bg-white p-3">
                      <div className="flex items-start gap-2">
                        <User className="mt-1 h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Müşteri</p>
                          <p className="font-semibold">{order.customerName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="mt-1 h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Telefon</p>
                          <p className="font-semibold text-blue-600">
                            <a href={`tel:${order.customerPhone}`}>
                              {order.customerPhone}
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Adres</p>
                          <p className="text-sm leading-relaxed">
                            {order.customerAddress}
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-blue-600"
                            onClick={() => openInMaps(order)}
                          >
                            Haritada Aç
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Sipariş Ürünleri:
                      </p>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => {
                          const menuItem = getMenuItem(item.menuItemId);
                          if (!menuItem) return null;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm"
                            >
                              <span>{menuItem.name}</span>
                              <span className="font-bold text-blue-600">
                                {item.quantity}x
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-blue-100 px-3 py-2">
                        <span className="font-semibold">Toplam:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {order.totalAmount} ₺
                        </span>
                      </div>
                    </div>

                    {/* Driver Assignment */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Kurye Seç:
                      </p>
                      <Select
                        value={order.driverId || ""}
                        onValueChange={(value) => assignDriver(order, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kurye seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers
                            .filter((d) => d.active)
                            .map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name} - {driver.vehicleType} (
                                {driver.currentDeliveries} sipariş)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {assignedDriver && (
                        <div className="rounded bg-green-50 p-2 text-sm">
                          <p className="font-semibold text-green-700">
                            Kurye: {assignedDriver.name}
                          </p>
                          <p className="text-green-600">
                            Tel: {assignedDriver.phone}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => markAsDelivered(order)}
                      disabled={!order.driverId}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Teslim Edildi
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
