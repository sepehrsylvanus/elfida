"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BellOff,
  Trash2,
  Plus,
  Send,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { KitchenMessage, KitchenNotification } from "@/lib/db";

export default function KitchenDashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<KitchenMessage[]>([]);
  const [notifications, setNotifications] = useState<KitchenNotification[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [messageToDelete, setMessageToDelete] = useState<KitchenMessage | null>(
    null
  );

  const loadData = async () => {
    try {
      const [messagesRes, notificationsRes] = await Promise.all([
        fetch("/api/kitchen-messages"),
        fetch("/api/kitchen-notifications"),
      ]);

      if (messagesRes.ok) {
        const data = await messagesRes.json();
        const apiMessages = (data.messages || []) as any[];
        const mappedMessages: KitchenMessage[] = apiMessages.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }));
        setMessages(mappedMessages);
      }

      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        const apiNotifications = (data.notifications || []) as any[];
        const mappedNotifications: KitchenNotification[] = apiNotifications.map(
          (n) => ({
            ...n,
            sentAt: new Date(n.sentAt),
          })
        );
        setNotifications(mappedNotifications);
      }
    } catch (err) {
      console.error("Mutfak verileri yüklenirken hata oluştu", err);
    }
  };

  useEffect(() => {
    void loadData();

    const interval = setInterval(() => {
      void loadData();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleAddMessage = async () => {
    if (!newMessageText.trim()) return;

    try {
      const res = await fetch("/api/kitchen-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessageText.trim() }),
      });
      if (!res.ok) {
        console.error("Mesaj kaydedilemedi", await res.text());
        return;
      }
      setNewMessageText("");
      await loadData();
    } catch (err) {
      console.error("Mesaj eklenirken hata oluştu", err);
    }
  };

  const handleSendNotification = async (message: KitchenMessage) => {
    try {
      const res = await fetch("/api/kitchen-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, text: message.text }),
      });
      if (!res.ok) {
        console.error("Bildirim gönderilemedi", await res.text());
        return;
      }
      await loadData();
    } catch (err) {
      console.error("Bildirim gönderilirken hata oluştu", err);
    }
  };

  const handleDeleteMessage = (message: KitchenMessage) => {
    setMessageToDelete(message);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const res = await fetch(`/api/kitchen-messages/${messageToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Mesaj silinemedi", await res.text());
        // 404 durumunda da listeyi tazeleyelim (zaten yok demektir)
      }
      setMessageToDelete(null);
      await loadData();
    } catch (err) {
      console.error("Mesaj silinirken hata oluştu", err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/kitchen-notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) {
        console.error("Bildirim okundu işaretlenemedi", await res.text());
        return;
      }
      await loadData();
    } catch (err) {
      console.error("Bildirim güncellenirken hata oluştu", err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Tüm bildirimleri temizlemek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch("/api/kitchen-notifications", {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Bildirimler temizlenemedi", await res.text());
        return;
      }
      await loadData();
    } catch (err) {
      console.error("Bildirimler temizlenirken hata oluştu", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mutfak Bildirim Sistemi
            </h1>
            <p className="text-gray-600">Kitchen Notification System</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              Ana Sayfa
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Message Management */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Mesaj Yönetimi
              </h2>
            </div>

            {/* Add New Message */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Yeni Mesaj Ekle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Mutfağa göndermek istediğiniz mesajı yazın..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddMessage}
                    disabled={!newMessageText.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Messages */}
            <div className="space-y-3">
              {messages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Henüz kayıtlı mesaj yok
                  </CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card key={message.id} className="border-2 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex-1 text-gray-900">{message.text}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendNotification(message)}
                          >
                            <Send className="mr-1 h-4 w-4" />
                            Gönder
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteMessage(message)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Notification History */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Gönderilen Bildirimler
                </h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-lg">
                    {unreadCount} Yeni
                  </Badge>
                )}
              </div>
              {notifications.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleClearAll}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Temizle
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Henüz bildirim gönderilmedi
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-2 ${
                      notification.read
                        ? "border-gray-200 bg-gray-50"
                        : "border-orange-300 bg-orange-50/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {notification.text}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.sentAt.toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <BellOff className="mr-1 h-4 w-4" />
                            Okundu
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mesaj silme onayı için modal */}
      <AlertDialog
        open={messageToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setMessageToDelete(null);
        }}
     >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mesajı silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              {messageToDelete
                ? `"${messageToDelete.text}" kalıcı olarak silinecek.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteMessage}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
