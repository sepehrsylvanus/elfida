"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, Truck, RotateCcw, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Driver, Customer } from "@/lib/db"
import { getDrivers, getCustomers, resetToMockData } from "@/lib/store"

export default function SettingsPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const loadData = () => {
    setDrivers(getDrivers())
    setCustomers(getCustomers())
  }

  useEffect(() => {
    loadData()

    const handleStorage = () => loadData()
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const handleReset = () => {
    if (confirm("Emin misiniz? Tüm veriler başlangıç haline dönecek.")) {
      resetToMockData()
      loadData()
      alert("Veriler başarıyla sıfırlandı!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
            <p className="text-gray-600">Settings & Management</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Drivers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-blue-600" />
                <CardTitle>Kuryeler</CardTitle>
              </div>
              <CardDescription>Restoran kurye bilgileri yönetimi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <Card key={driver.id} className={driver.active ? "" : "opacity-60"}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{driver.name}</h3>
                            <Badge variant={driver.active ? "default" : "secondary"}>
                              {driver.active ? "Aktif" : "Pasif"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{driver.phone}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">{driver.vehicleType}</Badge>
                            <Badge variant="outline">{driver.currentDeliveries} aktif sipariş</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle>Müşteriler</CardTitle>
              </div>
              <CardDescription>Kayıtlı müşteri listesi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers.map((customer) => (
                  <Card key={customer.id}>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-bold">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      </div>
                      <div className="space-y-1">
                        {customer.addresses.map((addr) => (
                          <div key={addr.id} className="rounded bg-gray-50 p-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {addr.label}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-gray-600">{addr.address}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reset Data Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-6 w-6 text-red-600" />
              <CardTitle>Verileri Sıfırla</CardTitle>
            </div>
            <CardDescription>Tüm verileri başlangıç haline döndür (demo veriler)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Başlangıç Verilerine Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
