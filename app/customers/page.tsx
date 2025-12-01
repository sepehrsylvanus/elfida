"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { getCustomers, saveCustomer, deleteCustomer } from "@/lib/store"
import type { Customer } from "@/lib/db"

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    addressLabel: "Ev",
  })

  useEffect(() => {
    loadCustomers()
    const handleStorageChange = () => loadCustomers()
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  function loadCustomers() {
    setCustomers(getCustomers())
  }

  function handleAddCustomer() {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Lütfen tüm alanları doldurun")
      return
    }

    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      addresses: [
        {
          id: `a${Date.now()}`,
          label: formData.addressLabel,
          address: formData.address,
          location: undefined, // In production, use geocoding API
        },
      ],
    }

    saveCustomer(newCustomer)
    setIsAddDialogOpen(false)
    resetForm()
    loadCustomers()
  }

  function handleEditCustomer() {
    if (!editingCustomer) return
    if (!formData.name || !formData.phone) {
      alert("Lütfen tüm alanları doldurun")
      return
    }

    const updatedCustomer: Customer = {
      ...editingCustomer,
      name: formData.name,
      phone: formData.phone,
    }

    saveCustomer(updatedCustomer)
    setIsEditDialogOpen(false)
    setEditingCustomer(null)
    resetForm()
    loadCustomers()
  }

  function openEditDialog(customer: Customer) {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: "",
      addressLabel: "Ev",
    })
    setIsEditDialogOpen(true)
  }

  function handleDeleteCustomer() {
    if (deleteCustomerId) {
      deleteCustomer(deleteCustomerId)
      setDeleteCustomerId(null)
      loadCustomers()
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      phone: "",
      address: "",
      addressLabel: "Ev",
    })
  }

  function openAddDialog() {
    resetForm()
    setIsAddDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
              <p className="text-gray-600">Müşteri bilgilerini yönetin</p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-5 w-5" />
            Yeni Müşteri Ekle
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <span className="text-lg">{customer.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => setDeleteCustomerId(customer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{customer.phone}</span>
                </div>
                <div className="space-y-2">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="rounded-lg bg-gray-50 p-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700">{address.label}</p>
                          <p className="text-xs text-gray-600">{address.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {customers.length === 0 && (
          <Card className="p-12 text-center">
            <User className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Henüz müşteri yok</h3>
            <p className="mb-4 text-gray-600">Yeni müşteri eklemek için yukarıdaki butonu kullanın</p>
          </Card>
        )}
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            <DialogDescription>Yeni bir müşteri kaydı oluşturun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Müşteri Adı</Label>
              <Input
                id="name"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="+90 555 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLabel">Adres Etiketi</Label>
              <Input
                id="addressLabel"
                placeholder="Örn: Ev, İş, Ofis"
                value={formData.addressLabel}
                onChange={(e) => setFormData({ ...formData, addressLabel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                placeholder="Tam adres yazın"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddCustomer}>Müşteri Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Müşteri Düzenle</DialogTitle>
            <DialogDescription>Müşteri bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Müşteri Adı</Label>
              <Input
                id="edit-name"
                placeholder="Örn: Ahmet Yılmaz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                placeholder="+90 555 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditCustomer}>Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteCustomerId !== null} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>Bu işlem geri alınamaz. Müşteri kalıcı olarak silinecektir.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
