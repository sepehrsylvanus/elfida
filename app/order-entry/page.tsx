"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingCart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { MenuItem, OrderItem, OrderSource, Customer } from "@/lib/db";
import { getNextOrderNumber } from "@/lib/store";

export default function OrderEntryPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderSource, setOrderSource] = useState<OrderSource>("in-house");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) {
          console.error("Menü verileri yüklenemedi", await res.text());
          return;
        }
        const data: MenuItem[] = await res.json();
        setMenu(data);
      } catch (error) {
        console.error("Menü verileri alınırken hata oluştu", error);
      }
    };

    const loadCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) {
          console.error("Müşteri verileri yüklenemedi", await res.text());
          return;
        }
        const data: Customer[] = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error("Müşteri verileri alınırken hata oluştu", error);
      }
    };

    loadMenu();
    loadCustomers();
  }, []);

  const filteredMenu = menu.filter(
    (item) =>
      item.available &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItem.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { menuItemId: menuItem.id, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId));
  };

  const getMenuItem = (id: string) => menu.find((item) => item.id === id);

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      if (customer.addresses.length > 0) {
        setCustomerAddress(customer.addresses[0].address);
      }
    }
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      setAlertMessage("Sepet boş!");
      return;
    }

    if (!customerName || !customerPhone || !customerAddress) {
      setAlertMessage("Lütfen müşteri bilgilerini doldurun!");
      return;
    }

    const priceValue = Number.parseFloat(manualPrice);
    if (!manualPrice || Number.isNaN(priceValue) || priceValue <= 0) {
      setAlertMessage("Lütfen geçerli bir toplam fiyat girin!");
      return;
    }

    const orderPayload = {
      // id لازم نیست، Mongo خودش _id تولید می‌کنه
      orderNumber: getNextOrderNumber(), // فعلاً همون تابع قبلی‌ات
      type: "delivery" as const,
      source: orderSource,
      status: "pending" as const,
      items: cart,
      customerName,
      customerPhone,
      customerAddress,
      addressLocation: selectedCustomer?.addresses[0]?.location ?? null,
      totalAmount: priceValue,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error("Sipariş kaydedilemedi:", data);
        setAlertMessage(data.message || "Sipariş kaydedilemedi");
        return;
      }

      const savedOrder = data.order;

      // Reset form
      setCart([]);
      setOrderSource("in-house");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setSelectedCustomer(null);
      setManualPrice("");
      setSearchTerm("");

      setAlertMessage(
        `Sipariş #${savedOrder.orderNumber} başarıyla kaydedildi!`
      );
    } catch (error) {
      console.error("Sipariş kaydedilirken hata:", error);
      setAlertMessage("Sunucu hatası, lütfen tekrar deneyin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Yeni Sipariş Girişi
            </h1>
            <p className="text-gray-600">Order Entry System</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Menü</CardTitle>
                {/* Search */}
                <Input
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                {/* Menu Items Grid */}
                {filteredMenu.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Hiç ürün bulunamadı (No items found).
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredMenu.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer transition-all hover:shadow-lg"
                        onClick={() => addToCart(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {item.name}
                              </h3>
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {item.estimatedStock} porsiyon
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Sipariş Sepeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Source */}
                <div className="space-y-2">
                  <Label>Sipariş Kaynağı</Label>
                  <Select
                    value={orderSource}
                    onValueChange={(v) => setOrderSource(v as OrderSource)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-house">Doğrudan</SelectItem>
                      <SelectItem value="yemeksepeti">Yemek Sepeti</SelectItem>
                      <SelectItem value="getir">Getir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer fields */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Müşteri Seç (İsteğe Bağlı)</Label>
                    <Select
                      value={selectedCustomer?.id ?? ""}
                      onValueChange={handleCustomerSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yeni müşteri" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Müşteri Adı *</Label>
                    <Input
                      placeholder="Ad Soyad"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefon *</Label>
                    <Input
                      placeholder="+90 555 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Adres *</Label>
                    <Textarea
                      placeholder="Tam adres"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Cart Items */}
                <div className="border-t pt-4">
                  <h4 className="mb-3 font-semibold">Sipariş Ürünleri:</h4>
                  {cart.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">
                      Sepet boş
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => {
                        const menuItem = getMenuItem(item.menuItemId);
                        if (!menuItem) return null;
                        return (
                          <div
                            key={item.menuItemId}
                            className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {menuItem.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(item.menuItemId, -1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(item.menuItemId, 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFromCart(item.menuItemId)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Manual Price Input */}
                <div className="border-t pt-4 space-y-2">
                  <Label>Toplam Fiyat (₺) *</Label>
                  <Input
                    type="number"
                    placeholder="Örn: 250"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">
                    Sipariş için toplam tutarı manuel olarak girin
                  </p>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={submitOrder}
                    disabled={cart.length === 0}
                  >
                    Siparişi Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Global alert modal for this page */}
      <AlertDialog
        open={alertMessage !== null}
        onOpenChange={(open) => !open && setAlertMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bilgi</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertMessage(null)}>
              Tamam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
