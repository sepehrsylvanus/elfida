// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import { notifyNewOrder } from "@/lib/notifyNewOrder";
import { notifyKitchenNewOrder } from "@/lib/notifyKitchenNewOrder";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    // می‌تونی ولیدیشن قوی‌تر هم اضافه کنی
    if (!body.items?.length) {
      return NextResponse.json(
        { ok: false, message: "Sepet boş" },
        { status: 400 }
      );
    }

    if (!body.customerName || !body.customerPhone || !body.customerAddress) {
      return NextResponse.json(
        { ok: false, message: "Müşteri bilgileri eksik" },
        { status: 400 }
      );
    }

    if (!body.totalAmount || body.totalAmount <= 0) {
      return NextResponse.json(
        { ok: false, message: "Toplam fiyat geçersiz" },
        { status: 400 }
      );
    }

    // orderNumber را فعلاً از body می‌گیریم (فرانت با getNextOrderNumber تولید می‌کند)
    const order = await Order.create({
      orderNumber: body.orderNumber,
      type: body.type ?? "delivery",
      source: body.source,
      status: body.status ?? "pending",
      items: body.items,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      addressLocation: body.addressLocation || undefined,
      totalAmount: body.totalAmount,
    });

    // Sadece delivery siparişleri için delivery ekibine ntfy bildirimi gönder
    if (order.type === "delivery") {
      await notifyNewOrder({
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        items: order.items,
      });
    }

    // Tüm siparişler için (delivery + pickup) mutfak ekibine ntfy bildirimi gönder
    await notifyKitchenNewOrder({
      orderNumber: order.orderNumber,
      type: order.type,
      source: order.source,
      totalAmount: order.totalAmount,
      items: order.items,
      customerName: order.customerName,
    });

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (err) {
    console.error("create order error:", err);
    return NextResponse.json(
      { ok: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
