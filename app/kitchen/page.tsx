"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, BellOff, Trash2, Plus, Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  getKitchenMessages,
  saveKitchenMessage,
  deleteKitchenMessage,
  getKitchenNotifications,
  sendKitchenNotification,
  markNotificationAsRead,
  clearAllNotifications,
} from "@/lib/store"
import type { KitchenMessage, KitchenNotification } from "@/lib/db"

declare global {
  // Basit tip tanımı: tarayıcı ortamında zaten var, Node tarafında kullanılmıyor
  type NotificationPermission = "default" | "denied" | "granted";
}

export default function KitchenDashboard() {
  const router = useRouter()
  const [messages, setMessages] = useState<KitchenMessage[]>([])
  const [notifications, setNotifications] = useState<KitchenNotification[]>([])
  const [newMessageText, setNewMessageText] = useState("")

  const loadData = () => {
    setMessages(getKitchenMessages())
    setNotifications(getKitchenNotifications())
  }

  useEffect(() => {
    loadData()

    const interval = setInterval(loadData, 3000)
    const handleStorage = () => loadData()
    window.addEventListener("storage", handleStorage)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const handleAddMessage = () => {
    if (!newMessageText.trim()) return

    const newMessage: KitchenMessage = {
      id: `km${Date.now()}`,
      text: newMessageText.trim(),
      createdAt: new Date(),
    }

    saveKitchenMessage(newMessage)
    setNewMessageText("")
    loadData()
  }

  const handleSendNotification = (message: KitchenMessage) => {
    sendKitchenNotification(message.id, message.text)
    loadData()
  }

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
      deleteKitchenMessage(messageId)
      loadData()
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    loadData()
  }

  const handleClearAll = () => {
    if (confirm("Tüm bildirimleri temizlemek istediğinize emin misiniz?")) {
      clearAllNotifications()
      loadData()
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mutfak Bildirim Sistemi</h1>
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
              <h2 className="text-2xl font-bold text-gray-900">Mesaj Yönetimi</h2>
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
                        handleAddMessage()
                      }
                    }}
                  />
                  <Button onClick={handleAddMessage} disabled={!newMessageText.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Messages */}
            <div className="space-y-3">
              {messages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">Henüz kayıtlı mesaj yok</CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card key={message.id} className="border-2 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex-1 text-gray-900">{message.text}</p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSendNotification(message)}>
                            <Send className="mr-1 h-4 w-4" />
                            Gönder
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMessage(message.id)}>
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
                <h2 className="text-2xl font-bold text-gray-900">Gönderilen Bildirimler</h2>
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
                  <CardContent className="p-8 text-center text-gray-500">Henüz bildirim gönderilmedi</CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-2 ${
                      notification.read ? "border-gray-200 bg-gray-50" : "border-orange-300 bg-orange-50/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{notification.text}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.sentAt.toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(notification.id)}>
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
    </div>
  )
}
