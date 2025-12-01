import Link from "next/link"
import { Package, ChefHat, Truck, Menu, Settings, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">Tabldot Restoran Yönetim Sistemi</h1>
          <p className="text-xl text-gray-600">İstanbul - Türkiye</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/order-entry">
            <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <Package className="h-16 w-16 text-orange-600" />
                </div>
                <CardTitle className="text-center text-2xl">Sipariş Girişi</CardTitle>
                <CardDescription className="text-center text-base">Order Entry System</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-600">Yerinde ve telefonla sipariş kaydetme</CardContent>
            </Card>
          </Link>

          <Link href="/kitchen">
            <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <ChefHat className="h-16 w-16 text-red-600" />
                </div>
                <CardTitle className="text-center text-2xl">Mutfak Ekranı</CardTitle>
                <CardDescription className="text-center text-base">Kitchen Display</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-600">Mutfak için sipariş gösterimi</CardContent>
            </Card>
          </Link>

          <Link href="/delivery">
            <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <Truck className="h-16 w-16 text-blue-600" />
                </div>
                <CardTitle className="text-center text-2xl">Kurye Ekranı</CardTitle>
                <CardDescription className="text-center text-base">Delivery Dashboard</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-600">Teslim edilecek siparişler</CardContent>
            </Card>
          </Link>

          <Link href="/menu">
            <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <Menu className="h-16 w-16 text-green-600" />
                </div>
                <CardTitle className="text-center text-2xl">Menü Yönetimi</CardTitle>
                <CardDescription className="text-center text-base">Menu & Inventory</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-600">Menü ve stok yönetimi</CardContent>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <Users className="h-16 w-16 text-indigo-600" />
                </div>
                <CardTitle className="text-center text-2xl">Müşteri Yönetimi</CardTitle>
                <CardDescription className="text-center text-base">Customer Management</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-600">Müşteri kayıtları ve adresleri</CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <Settings className="h-16 w-16 text-purple-600" />
                </div>
                <CardTitle className="text-center text-2xl">Ayarlar</CardTitle>
                <CardDescription className="text-center text-base">Settings</CardDescription>
              </CardHeader>
              <CardContent className="text-center text-gray-600">Kurye, müşteri ve ayar yönetimi</CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">Demo Sürümü - Test için örnek veriler</p>
        </div>
      </div>
    </div>
  )
}
