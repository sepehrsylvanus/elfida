"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, Edit, ToggleLeft, ToggleRight, Package, AlertTriangle, Plus, Save, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "react-toastify"
import type { MenuItem } from "@/lib/db"

export default function MenuManagement() {
  const router = useRouter()
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editStock, setEditStock] = useState<number>(0)
  const [editName, setEditName] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  const loadMenu = async () => {
    try {
      const res = await fetch("/api/menu")
      if (!res.ok) {
        const message = await res.text()
        toast.error(message || "Menü verileri yüklenemedi")
        return
      }
      const data: MenuItem[] = await res.json()
      setMenu(data)
    } catch (error) {
      console.error("Menü verileri alınırken hata oluştu", error)
      toast.error("Menü verileri alınırken bir hata oluştu")
    }
  }

  useEffect(() => {
    loadMenu()
  }, [])

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      })
      if (!res.ok) {
        console.error("Ürün durumu güncellenemedi", await res.text())
        return
      }
      await loadMenu()
    } catch (error) {
      console.error("Ürün durumu güncellenirken hata oluştu", error)
    }
  }

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditStock(item.estimatedStock)
    setIsAddingNew(false)
    setIsDialogOpen(true)
  }

  const openAddNew = () => {
    setEditingItem(null)
    setEditName("")
    setEditStock(10)
    setIsAddingNew(true)
    setIsDialogOpen(true)
  }

  const saveItem = async () => {
    if (!editName.trim()) {
      toast.warn("Lütfen ürün adı girin!")
      return
    }

    try {
      let res: Response | null = null

      if (isAddingNew) {
        res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName.trim(),
            estimatedStock: editStock,
            available: editStock > 0,
          }),
        })
      } else if (editingItem) {
        res = await fetch(`/api/menu/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName.trim(),
            estimatedStock: editStock,
            available: editStock > 0,
          }),
        })
      }

      if (!res || !res.ok) {
        const message = res ? await res.text() : "Bilinmeyen hata"
        toast.error(message || "Ürün kaydedilemedi")
        return
      }

      toast.success(isAddingNew ? "Ürün eklendi" : "Ürün güncellendi")

      await loadMenu()
      setIsDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Ürün kaydedilirken hata oluştu", error)
      toast.error("Ürün kaydedilirken bir hata oluştu")
    }
  }

  const requestDeleteItem = (item: MenuItem) => {
    setItemToDelete(item)
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      const res = await fetch(`/api/menu/${itemToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const message = await res.text()
        console.error("Ürün silinemedi", message)
        toast.error(message || "Ürün silinemedi")
        return
      }

      toast.success("Ürün başarıyla silindi")
      await loadMenu()
      setItemToDelete(null)
    } catch (error) {
      console.error("Ürün silinirken hata oluştu", error)
      toast.error("Ürün silinirken bir hata oluştu")
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Tükendi", color: "bg-red-100 text-red-700" }
    if (stock <= 5) return { label: "Az", color: "bg-yellow-100 text-yellow-700" }
    if (stock <= 10) return { label: "Orta", color: "bg-blue-100 text-blue-700" }
    return { label: "Mevcut", color: "bg-green-100 text-green-700" }
  }

  const filteredMenu = menu.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menü ve Stok Yönetimi</h1>
            <p className="text-gray-600">Menu & Inventory Management</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-gray-900">{menu.length}</p>
                </div>
                <Package className="h-10 w-10 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mevcut</p>
                  <p className="text-3xl font-bold text-green-600">{menu.filter((item) => item.available).length}</p>
                </div>
                <ToggleRight className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tükendi</p>
                  <p className="text-3xl font-bold text-red-600">{menu.filter((item) => !item.available).length}</p>
                </div>
                <ToggleLeft className="h-10 w-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stok Az</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {menu.filter((item) => item.estimatedStock <= 5 && item.estimatedStock > 0).length}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={openAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün Ekle
          </Button>
        </div>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMenu.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">Hiç ürün bulunamadı (No items found).</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMenu.map((item) => {
                  const stockStatus = getStockStatus(item.estimatedStock)
                  return (
                    <Card key={item.id} className={item.available ? "" : "opacity-60"}>
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                        </div>

                      <div className="mb-3 flex items-center gap-2">
                          <Badge className={stockStatus.color}>
                            {item.estimatedStock} porsiyon - {stockStatus.label}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditItem(item)}>
                            <Edit className="mr-1 h-4 w-4" /> Düzenle
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => requestDeleteItem(item)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Sil
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ürünü silmek istediğinize emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                {itemToDelete ? `"${itemToDelete.name}" kalıcı olarak silinecek.` : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit/Add Item Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isAddingNew ? "Yeni Ürün Ekle" : "Ürünü Düzenle"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ürün Adı</Label>
                <Input placeholder="Örn: Adana Kebap" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Stok (Porsiyon Sayısı)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(Number.parseInt(e.target.value) || 0)}
                />
              </div>

              {editStock === 0 && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Dikkat: Stok 0 olarak kaydedilirse, ürün otomatik olarak pasif hale gelir.
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={saveItem} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  <X className="mr-2 h-4 w-4" />
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
