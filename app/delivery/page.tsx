"use client";

import { useState, useEffect } from "react";
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
import type { Order, MenuItem } from "@/lib/db";

export default function DeliveryDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders?scope=delivery-dashboard");
      if (!res.ok) {
        console.error("Siparişler yüklenemedi", await res.text());
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        console.error("Siparişler yüklenemedi", data);
        return;
      }

      const apiOrders = (data.orders || []) as any[];
      const mapped: Order[] = apiOrders.map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
        readyAt: o.readyAt ? new Date(o.readyAt) : undefined,
        deliveredAt: o.deliveredAt ? new Date(o.deliveredAt) : undefined,
      }));

      setOrders(mapped);
    } catch (err) {
      console.error("Siparişler alınırken hata oluştu", err);
    }
  };

  const loadMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (!res.ok) return;
      const data: MenuItem[] = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Menü alınırken hata oluştu", err);
    }
  };

  useEffect(() => {
    void loadMenu();
    void loadOrders();

    const interval = setInterval(() => {
      void loadOrders();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getMenuItem = (id: string) => menu.find((item) => item.id === id);

  const markAsDelivered = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered", orderNumber: order.orderNumber }),
      });
      if (!res.ok) {
        console.error("Sipariş teslim edilemedi", await res.text());
        return;
      }
      // Son durum daima veritabanından gelsin
      await loadOrders();
    } catch (err) {
      console.error("Sipariş teslim edilirken hata oluştu", err);
    }
  };

  const clearAllOrders = async () => {
    if (!orders.length) return;

    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Tüm siparişler silinemedi", await res.text());
        return;
      }
      // Verileri tekrar veritabanından oku (muhtemelen boş olacak)
      await loadOrders();
    } catch (err) {
      console.error("Tüm siparişler temizlenirken hata oluştu", err);
    }
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
                {orders.filter((o) => o.status !== "delivered").length}
              </p>
            </div>
            <Button variant="outline" onClick={clearAllOrders} disabled={orders.length === 0}>
              Tümünü Temizle
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
              const isDelivered = order.status === "delivered";
              return (
                <Card
                  key={order.id}
                  className={`border-2 border-blue-300 bg-blue-50/50 ${
                    isDelivered ? "opacity-50" : ""
                  }`}
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

                    {/* Actions */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => markAsDelivered(order)}
                      disabled={order.status === "delivered"}
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
